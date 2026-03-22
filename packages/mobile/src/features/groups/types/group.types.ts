export type GroupRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface GroupSummary {
  id: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  inviteCode: string;
  isPublic: boolean;
  memberCount: number;
  ownerId: string;
  myRole?: GroupRole;
}

export interface GroupMember {
  userId: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  role: GroupRole;
  joinedAt: string;
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  group: {
    id: string;
    name: string;
    avatarUrl: string | null;
    _count: { members: number };
  };
  invitedBy: {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  };
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}

export interface CreateGroupPayload {
  name: string;
  description?: string;
  avatarUrl?: string;
  isPublic?: boolean;
}
