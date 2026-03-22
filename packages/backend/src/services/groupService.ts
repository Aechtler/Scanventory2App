/**
 * groupService.ts — Gruppen erstellen, verwalten, beitreten, einladen
 *
 * Typ-Assertions bis `prisma generate` nach Migration läuft.
 */
import { prisma } from './itemService';

export interface GroupSummary {
  id: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  inviteCode: string;
  isPublic: boolean;
  memberCount: number;
  ownerId: string;
  /** Eigene Rolle — nur gesetzt wenn anfragender User Mitglied ist */
  myRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export interface GroupMemberRow {
  userId: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: Date;
}

type Db = {
  group: {
    create: (a: unknown) => Promise<GroupRow>;
    findFirst: (a: unknown) => Promise<GroupRow | null>;
    findMany: (a: unknown) => Promise<GroupRow[]>;
    update: (a: unknown) => Promise<GroupRow>;
    delete: (a: unknown) => Promise<unknown>;
  };
  groupMember: {
    create: (a: unknown) => Promise<unknown>;
    findUnique: (a: unknown) => Promise<MemberRow | null>;
    findMany: (a: unknown) => Promise<MemberRow[]>;
    update: (a: unknown) => Promise<unknown>;
    delete: (a: unknown) => Promise<unknown>;
    count: (a: unknown) => Promise<number>;
  };
  groupInvitation: {
    create: (a: unknown) => Promise<unknown>;
    findFirst: (a: unknown) => Promise<InviteRow | null>;
    findMany: (a: unknown) => Promise<InviteRow[]>;
    update: (a: unknown) => Promise<unknown>;
  };
  user: {
    findUnique: (a: unknown) => Promise<{ id: string } | null>;
  };
};

type GroupRow = {
  id: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  inviteCode: string;
  isPublic: boolean;
  ownerId: string;
  _count?: { members: number };
};

type MemberRow = {
  groupId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: Date;
  user?: { id: string; username: string | null; displayName: string | null; avatarUrl: string | null };
};

type InviteRow = {
  id: string;
  groupId: string;
  invitedById: string;
  invitedUserId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
};

function db(): Db {
  return prisma as unknown as Db;
}

function toSummary(g: GroupRow, myRole?: 'OWNER' | 'ADMIN' | 'MEMBER'): GroupSummary {
  return {
    id: g.id,
    name: g.name,
    description: g.description,
    avatarUrl: g.avatarUrl,
    inviteCode: g.inviteCode,
    isPublic: g.isPublic,
    memberCount: g._count?.members ?? 0,
    ownerId: g.ownerId,
    myRole,
  };
}

const GROUP_SELECT = {
  id: true,
  name: true,
  description: true,
  avatarUrl: true,
  inviteCode: true,
  isPublic: true,
  ownerId: true,
  _count: { select: { members: true } },
};

/** Gruppe erstellen */
export async function createGroup(
  ownerId: string,
  data: { name: string; description?: string; avatarUrl?: string; isPublic?: boolean }
): Promise<GroupSummary> {
  const group = await db().group.create({
    data: {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      avatarUrl: data.avatarUrl || null,
      isPublic: data.isPublic ?? false,
      ownerId,
      members: {
        create: { userId: ownerId, role: 'OWNER' },
      },
    },
    select: GROUP_SELECT,
  });
  return toSummary(group, 'OWNER');
}

/** Gruppe per ID laden */
export async function getGroup(
  groupId: string,
  requestingUserId?: string
): Promise<GroupSummary | null> {
  const group = await db().group.findFirst({
    where: { id: groupId },
    select: GROUP_SELECT,
  });
  if (!group) return null;

  let myRole: 'OWNER' | 'ADMIN' | 'MEMBER' | undefined;
  if (requestingUserId) {
    const member = await db().groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: requestingUserId } } as unknown,
      select: { role: true },
    });
    myRole = (member as { role: 'OWNER' | 'ADMIN' | 'MEMBER' } | null)?.role;
  }
  return toSummary(group, myRole);
}

/** Gruppen-Info per Invite-Code (vor Beitritt) */
export async function getGroupByInviteCode(inviteCode: string): Promise<GroupSummary | null> {
  const group = await db().group.findFirst({
    where: { inviteCode },
    select: GROUP_SELECT,
  });
  return group ? toSummary(group) : null;
}

/** Eigene Gruppen eines Users laden */
export async function getUserGroups(userId: string): Promise<GroupSummary[]> {
  const groups = await db().group.findMany({
    where: { members: { some: { userId } } },
    select: GROUP_SELECT,
    orderBy: { name: 'asc' } as unknown,
  });

  const memberships = await db().groupMember.findMany({
    where: { userId, groupId: { in: groups.map((g) => g.id) } } as unknown,
    select: { groupId: true, role: true },
  });

  const roleMap: Record<string, 'OWNER' | 'ADMIN' | 'MEMBER'> = {};
  for (const m of memberships) {
    roleMap[m.groupId] = m.role;
  }

  return groups.map((g) => toSummary(g, roleMap[g.id]));
}

/** Mitgliederliste einer Gruppe */
export async function getGroupMembers(groupId: string): Promise<GroupMemberRow[]> {
  const members = await db().groupMember.findMany({
    where: { groupId },
    include: {
      user: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
    },
    orderBy: { role: 'asc' } as unknown,
  });

  return (members as MemberRow[]).map((m) => ({
    userId: m.userId,
    username: m.user?.username ?? null,
    displayName: m.user?.displayName ?? null,
    avatarUrl: m.user?.avatarUrl ?? null,
    role: m.role,
    joinedAt: m.joinedAt,
  }));
}

/** Per Invite-Code beitreten */
export async function joinGroupByCode(
  userId: string,
  inviteCode: string
): Promise<GroupSummary> {
  const group = await db().group.findFirst({
    where: { inviteCode },
    select: GROUP_SELECT,
  });
  if (!group) throw new Error('Invalid invite code');

  // Bereits Mitglied?
  const existing = await db().groupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId } } as unknown,
  });
  if (existing) return toSummary(group, (existing as MemberRow).role);

  await db().groupMember.create({
    data: { groupId: group.id, userId, role: 'MEMBER' },
  });

  return toSummary({ ...group, _count: { members: (group._count?.members ?? 0) + 1 } }, 'MEMBER');
}

/** User direkt einladen (per User-ID) */
export async function inviteUserToGroup(
  groupId: string,
  invitedById: string,
  invitedUserId: string
): Promise<void> {
  if (invitedById === invitedUserId) throw new Error('Cannot invite yourself');

  // Einladender muss Mitglied sein
  const inviter = await db().groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: invitedById } } as unknown,
  });
  if (!inviter) throw new Error('Not a group member');

  // Ziel-User existiert?
  const target = await db().user.findUnique({ where: { id: invitedUserId }, select: { id: true } });
  if (!target) throw new Error('User not found');

  // Bereits Mitglied?
  const alreadyMember = await db().groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: invitedUserId } } as unknown,
  });
  if (alreadyMember) throw new Error('User is already a member');

  // Offene Einladung vorhanden?
  const existing = await db().groupInvitation.findFirst({
    where: { groupId, invitedUserId, status: 'PENDING' } as unknown,
  });
  if (existing) return; // Idempotent

  await db().groupInvitation.create({
    data: { groupId, invitedById, invitedUserId, status: 'PENDING' },
  });
}

/** Einladung annehmen */
export async function acceptInvitation(invitationId: string, userId: string): Promise<void> {
  const inv = await db().groupInvitation.findFirst({
    where: { id: invitationId, invitedUserId: userId, status: 'PENDING' } as unknown,
  });
  if (!inv) throw new Error('Invitation not found');

  await db().groupMember.create({
    data: { groupId: (inv as InviteRow).groupId, userId, role: 'MEMBER' },
  });
  await db().groupInvitation.update({
    where: { id: invitationId } as unknown,
    data: { status: 'ACCEPTED' },
  });
}

/** Einladung ablehnen */
export async function declineInvitation(invitationId: string, userId: string): Promise<void> {
  await db().groupInvitation.update({
    where: { id: invitationId, invitedUserId: userId } as unknown,
    data: { status: 'DECLINED' },
  });
}

/** Offene Einladungen für einen User */
export async function getPendingInvitations(userId: string) {
  return db().groupInvitation.findMany({
    where: { invitedUserId: userId, status: 'PENDING' } as unknown,
    include: {
      group: { select: { id: true, name: true, avatarUrl: true, _count: { select: { members: true } } } },
      invitedBy: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    } as unknown,
    orderBy: { createdAt: 'desc' } as unknown,
  });
}

/** Gruppe verlassen */
export async function leaveGroup(groupId: string, userId: string): Promise<void> {
  const member = await db().groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } } as unknown,
  });
  if (!member) throw new Error('Not a member');
  if ((member as MemberRow).role === 'OWNER') throw new Error('Owner cannot leave — transfer ownership first');

  await db().groupMember.delete({
    where: { groupId_userId: { groupId, userId } } as unknown,
  });
}

/** Mitglied entfernen (nur Owner/Admin) */
export async function removeMember(
  groupId: string,
  actorId: string,
  targetUserId: string
): Promise<void> {
  const actor = await db().groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: actorId } } as unknown,
  });
  if (!actor || !(['OWNER', 'ADMIN'] as string[]).includes((actor as MemberRow).role)) {
    throw new Error('Insufficient permissions');
  }
  const target = await db().groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: targetUserId } } as unknown,
  });
  if (!target) throw new Error('Member not found');
  if ((target as MemberRow).role === 'OWNER') throw new Error('Cannot remove owner');

  await db().groupMember.delete({
    where: { groupId_userId: { groupId, userId: targetUserId } } as unknown,
  });
}
