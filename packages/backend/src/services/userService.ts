/**
 * userService.ts — User-Profile, Search, Follow
 *
 * HINWEIS: Dieser Service nutzt Typ-Assertions (as unknown as ...) weil der
 * Prisma-Client noch nicht neu generiert wurde (Schema wurde erweitert).
 * Nach `prisma migrate dev && prisma generate` können die Assertions entfernt werden.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { prisma } from './itemService';

export interface PublicProfile {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isPublic: boolean;
  followerCount: number;
  followingCount: number;
  /** Nur gesetzt wenn der anfragende User eingeloggt ist */
  isFollowing?: boolean;
}

export interface ProfileUpdatePayload {
  username?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  isPublic?: boolean;
}

const USERNAME_REGEX = /^[a-z0-9_]{3,30}$/;

/** Validiert den Username-Format */
export function validateUsername(username: string): string | null {
  if (!USERNAME_REGEX.test(username)) {
    return 'Username must be 3-30 characters and only contain lowercase letters, numbers, and underscores';
  }
  return null;
}

/** Prüft ob ein Username bereits vergeben ist */
export async function isUsernameTaken(username: string, excludeUserId?: string): Promise<boolean> {
  // Type-Assertion nötig bis prisma generate nach Migration läuft
  const db = prisma as unknown as {
    user: {
      findFirst: (args: unknown) => Promise<{ id: string } | null>;
    };
  };

  const user = await db.user.findFirst({
    where: { username },
    select: { id: true },
  });

  if (!user) return false;
  if (excludeUserId && user.id === excludeUserId) return false;
  return true;
}

/** Aktualisiert das öffentliche Profil eines Users */
export async function updateUserProfile(
  userId: string,
  payload: ProfileUpdatePayload
): Promise<PublicProfile> {
  if (payload.username !== undefined) {
    const error = validateUsername(payload.username);
    if (error) throw new Error(error);

    const taken = await isUsernameTaken(payload.username, userId);
    if (taken) throw new Error('Username is already taken');
  }

  type UserWithProfile = {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    isPublic: boolean;
    _count: { followers: number; following: number };
  };

  const db = prisma as unknown as {
    user: {
      update: (args: unknown) => Promise<UserWithProfile>;
    };
  };

  const updated = await db.user.update({
    where: { id: userId },
    data: {
      ...(payload.username !== undefined && { username: payload.username }),
      ...(payload.displayName !== undefined && { displayName: payload.displayName }),
      ...(payload.bio !== undefined && { bio: payload.bio }),
      ...(payload.avatarUrl !== undefined && { avatarUrl: payload.avatarUrl }),
      ...(payload.isPublic !== undefined && { isPublic: payload.isPublic }),
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      isPublic: true,
      _count: {
        select: { followers: true, following: true },
      },
    },
  });

  return {
    id: updated.id,
    username: updated.username,
    displayName: updated.displayName,
    avatarUrl: updated.avatarUrl,
    bio: updated.bio,
    isPublic: updated.isPublic,
    followerCount: updated._count.followers,
    followingCount: updated._count.following,
  };
}

/** Lädt ein öffentliches Profil per ID oder Username */
export async function getPublicProfile(
  idOrUsername: string,
  requestingUserId?: string
): Promise<PublicProfile | null> {
  const isUuid = /^[0-9a-f-]{36}$/i.test(idOrUsername);

  type UserWithProfile = {
    id: string;
    name: string | null;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    isPublic: boolean;
    _count: { followers: number; following: number };
  };

  type FollowRecord = { followerId: string; followingId: string } | null;

  const db = prisma as unknown as {
    user: {
      findFirst: (args: unknown) => Promise<UserWithProfile | null>;
    };
    follow: {
      findUnique: (args: unknown) => Promise<FollowRecord>;
    };
  };

  const where = isUuid ? { id: idOrUsername } : { username: idOrUsername };
  const user = await db.user.findFirst({
    where,
    select: {
      id: true,
      name: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      isPublic: true,
      _count: {
        select: { followers: true, following: true },
      },
    },
  });

  if (!user) return null;

  // Privates Profil: nur eigenes Profil sichtbar
  if (!user.isPublic && user.id !== requestingUserId) return null;

  let isFollowing: boolean | undefined;
  if (requestingUserId && requestingUserId !== user.id) {
    const follow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: requestingUserId,
          followingId: user.id,
        },
      },
    });
    isFollowing = !!follow;
  }

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName ?? user.name,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    isPublic: user.isPublic,
    followerCount: user._count.followers,
    followingCount: user._count.following,
    isFollowing,
  };
}

/** Sucht öffentliche User-Profile */
export async function searchUsers(
  query: string,
  requestingUserId?: string,
  limit = 20,
  offset = 0
): Promise<PublicProfile[]> {
  type UserWithProfile = {
    id: string;
    name: string | null;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    isPublic: boolean;
    _count: { followers: number; following: number };
  };

  const db2 = prisma as unknown as {
    user: {
      findMany: (args: unknown) => Promise<UserWithProfile[]>;
    };
    follow: {
      findMany: (args: unknown) => Promise<{ followingId: string }[]>;
    };
  };

  const users = await db2.user.findMany({
    where: {
      isPublic: true,
      ...(requestingUserId && { id: { not: requestingUserId } }),
      OR: [
        { username: { contains: query, mode: 'insensitive' } },
        { displayName: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      isPublic: true,
      _count: {
        select: { followers: true, following: true },
      },
    },
    take: limit,
    skip: offset,
    orderBy: { username: 'asc' },
  });

  // isFollowing für alle Suchergebnisse in einer Query
  let followingSet = new Set<string>();
  if (requestingUserId && users.length > 0) {
    const follows = await db2.follow.findMany({
      where: {
        followerId: requestingUserId,
        followingId: { in: users.map((u) => u.id) },
      },
      select: { followingId: true },
    });
    followingSet = new Set(follows.map((f) => f.followingId));
  }

  return users.map((u) => ({
    id: u.id,
    username: u.username,
    displayName: u.displayName ?? u.name,
    avatarUrl: u.avatarUrl,
    bio: u.bio,
    isPublic: u.isPublic,
    followerCount: u._count.followers,
    followingCount: u._count.following,
    ...(requestingUserId && { isFollowing: followingSet.has(u.id) }),
  }));
}

export interface FollowingItemOwner {
  id: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
}

export interface FollowingItem {
  id: string;
  imageFilename: string;
  productName: string;
  category: string;
  brand: string | null;
  condition: string;
  confidence: number;
  priceStats: unknown;
  scannedAt: Date;
  owner: FollowingItemOwner;
}

/** Gibt Items aller Nutzer zurück, denen userId folgt */
export async function getFollowingItems(userId: string): Promise<FollowingItem[]> {
  type FollowRow = { followingId: string };
  type ItemRow = {
    id: string;
    imageFilename: string;
    productName: string;
    category: string;
    brand: string | null;
    condition: string;
    confidence: number;
    priceStats: unknown;
    scannedAt: Date;
    user: { id: string; displayName: string | null; username: string | null; avatarUrl: string | null };
  };

  const db = prisma as unknown as {
    follow: { findMany: (args: unknown) => Promise<FollowRow[]> };
    scannedItem: { findMany: (args: unknown) => Promise<ItemRow[]> };
  };

  const follows = await db.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followingIds = follows.map((f) => f.followingId);
  if (followingIds.length === 0) return [];

  const items = await db.scannedItem.findMany({
    where: { userId: { in: followingIds } },
    select: {
      id: true,
      imageFilename: true,
      productName: true,
      category: true,
      brand: true,
      condition: true,
      confidence: true,
      priceStats: true,
      scannedAt: true,
      user: {
        select: { id: true, displayName: true, username: true, avatarUrl: true },
      },
    },
    orderBy: { scannedAt: 'desc' },
    take: 100,
  });

  return items.map((item) => ({
    id: item.id,
    imageFilename: item.imageFilename,
    productName: item.productName,
    category: item.category,
    brand: item.brand,
    condition: item.condition,
    confidence: item.confidence,
    priceStats: item.priceStats,
    scannedAt: item.scannedAt,
    owner: item.user,
  }));
}
