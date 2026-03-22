/**
 * followService.ts — Follow/Unfollow, Follower- und Following-Listen
 *
 * HINWEIS: Typ-Assertions bis `prisma generate` nach Migration läuft.
 */
import { prisma } from './itemService';
import type { PublicProfile } from './userService';

type FollowDb = {
  follow: {
    create: (args: unknown) => Promise<unknown>;
    delete: (args: unknown) => Promise<unknown>;
    findUnique: (args: unknown) => Promise<unknown>;
  };
  user: {
    findUnique: (args: unknown) => Promise<unknown>;
    findMany: (args: unknown) => Promise<UserRow[]>;
  };
};

type UserRow = {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isPublic: boolean;
  _count: { followers: number; following: number };
};

function db(): FollowDb {
  return prisma as unknown as FollowDb;
}

const USER_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  bio: true,
  isPublic: true,
  _count: { select: { followers: true, following: true } },
};

function toProfile(u: UserRow): PublicProfile {
  return {
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    bio: u.bio,
    isPublic: u.isPublic,
    followerCount: u._count.followers,
    followingCount: u._count.following,
  };
}

/** followerId folgt followingId */
export async function followUser(followerId: string, followingId: string): Promise<void> {
  if (followerId === followingId) throw new Error('Cannot follow yourself');

  // Prüfen ob Ziel-User existiert und öffentlich ist
  const target = await db().user.findUnique({
    where: { id: followingId },
    select: { id: true, isPublic: true },
  });
  if (!target || !(target as { id: string; isPublic: boolean }).isPublic) {
    throw new Error('User not found');
  }

  // Idempotent: bereits gefolgt → kein Fehler
  try {
    await db().follow.create({
      data: { followerId, followingId },
    });
  } catch {
    // Unique-Constraint verletzt = bereits gefolgt, ignorieren
  }
}

/** followerId entfolgt followingId */
export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  try {
    await db().follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
  } catch {
    // Nicht gefunden = war nicht gefolgt, kein Fehler
  }
}

/** Holt die Follower-Liste eines Users */
export async function getFollowers(
  userId: string,
  limit = 30,
  offset = 0
): Promise<PublicProfile[]> {
  const users = await db().user.findMany({
    where: { following: { some: { followingId: userId } } },
    select: USER_SELECT,
    take: limit,
    skip: offset,
    orderBy: { username: 'asc' },
  });
  return users.map(toProfile);
}

/** Holt die Following-Liste eines Users */
export async function getFollowing(
  userId: string,
  limit = 30,
  offset = 0
): Promise<PublicProfile[]> {
  const users = await db().user.findMany({
    where: { followers: { some: { followerId: userId } } },
    select: USER_SELECT,
    take: limit,
    skip: offset,
    orderBy: { username: 'asc' },
  });
  return users.map(toProfile);
}
