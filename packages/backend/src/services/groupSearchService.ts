import { prisma } from './itemService';
import type { GroupSummary } from './groupService';

type GroupRow = {
  id: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  inviteCode: string;
  isPublic: boolean;
  ownerId: string;
  _count: { members: number };
};

/** Öffentliche Gruppen suchen */
export async function searchGroups(
  query: string,
  limit = 20,
  offset = 0
): Promise<GroupSummary[]> {
  const db = prisma as unknown as {
    group: { findMany: (a: unknown) => Promise<GroupRow[]> };
  };

  const groups = await db.group.findMany({
    where: {
      isPublic: true,
      name: { contains: query, mode: 'insensitive' },
    },
    select: {
      id: true,
      name: true,
      description: true,
      avatarUrl: true,
      inviteCode: true,
      isPublic: true,
      ownerId: true,
      _count: { select: { members: true } },
    },
    take: limit,
    skip: offset,
    orderBy: { name: 'asc' },
  });

  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    avatarUrl: g.avatarUrl,
    inviteCode: g.inviteCode,
    isPublic: g.isPublic,
    memberCount: g._count.members,
    ownerId: g.ownerId,
  }));
}
