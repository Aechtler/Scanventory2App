/**
 * sharingService.ts — Library-Items mit Usern und Gruppen teilen
 *
 * Typ-Assertions bis `prisma generate` nach Migration läuft.
 */
import { prisma } from './itemService';
import { getImageUrl } from './imageService';

export type SharePermission = 'VIEW' | 'COMMENT';
export type ShareTargetType = 'user' | 'group';

export interface SharePayload {
  targetType: ShareTargetType;
  targetId: string;
  permission?: SharePermission;
}

export interface SharedItemResult {
  shareId: string;
  itemId: string;
  sharedById: string;
  targetType: ShareTargetType;
  targetId: string;
  permission: SharePermission;
  sharedAt: Date;
}

export interface ReceivedItem {
  shareId: string;
  itemId: string;
  sharedById: string;
  sharedByUsername: string | null;
  sharedByDisplayName: string | null;
  sharedByAvatarUrl: string | null;
  permission: SharePermission;
  sharedAt: Date;
  // Item-Felder
  productName: string;
  category: string;
  brand: string | null;
  condition: string;
  imageFilename: string;
  imageUrl: string;           // Supabase Storage CDN URL
  priceStats: unknown;
  scannedAt: Date;
}

type Db = {
  sharedItem: {
    create: (a: unknown) => Promise<SharedRow>;
    findUnique: (a: unknown) => Promise<SharedRow | null>;
    findFirst: (a: unknown) => Promise<SharedRow | null>;
    findMany: (a: unknown) => Promise<SharedRow[]>;
    delete: (a: unknown) => Promise<unknown>;
  };
  scannedItem: {
    findUnique: (a: unknown) => Promise<{ userId: string | null } | null>;
    findMany: (a: unknown) => Promise<ItemRow[]>;
  };
  groupMember: {
    findUnique: (a: unknown) => Promise<{ role: string } | null>;
  };
  follow: {
    findUnique: (a: unknown) => Promise<unknown>;
  };
};

type SharedRow = {
  id: string;
  itemId: string;
  sharedById: string;
  sharedWithUserId: string | null;
  sharedWithGroupId: string | null;
  permission: SharePermission;
  sharedAt: Date;
  sharedBy?: { id: string; username: string | null; displayName: string | null; avatarUrl: string | null };
  item?: ItemRow;
};

type ItemRow = {
  id: string;
  userId: string | null;
  productName: string;
  category: string;
  brand: string | null;
  condition: string;
  imageFilename: string;
  priceStats: unknown;
  scannedAt: Date;
};

function d(): Db {
  return prisma as unknown as Db;
}

/** Item mit einem User oder einer Gruppe teilen */
export async function shareItem(
  itemId: string,
  sharedById: string,
  payload: SharePayload
): Promise<SharedItemResult> {
  // Nur eigene Items teilen
  const item = await d().scannedItem.findUnique({
    where: { id: itemId },
    select: { userId: true },
  });
  if (!item || item.userId !== sharedById) throw new Error('Item not found or not yours');

  // Prüfen ob Ziel existiert + Berechtigung
  if (payload.targetType === 'user') {
    // Nur mit gegenseitigen Followees teilen
    const follow1 = await d().follow.findUnique({
      where: { followerId_followingId: { followerId: sharedById, followingId: payload.targetId } },
    });
    const follow2 = await d().follow.findUnique({
      where: { followerId_followingId: { followerId: payload.targetId, followingId: sharedById } },
    });
    if (!follow1 || !follow2) throw new Error('Can only share with mutual followers');
  } else {
    // Gruppen: muss Mitglied sein
    const member = await d().groupMember.findUnique({
      where: { groupId_userId: { groupId: payload.targetId, userId: sharedById } } as unknown,
    });
    if (!member) throw new Error('You are not a member of this group');
  }

  // Bereits geteilt? Idempotent
  const existing = await d().sharedItem.findFirst({
    where: {
      itemId,
      sharedById,
      ...(payload.targetType === 'user'
        ? { sharedWithUserId: payload.targetId }
        : { sharedWithGroupId: payload.targetId }),
    },
  });
  if (existing) {
    return toResult(existing, payload.targetType);
  }

  const created = await d().sharedItem.create({
    data: {
      itemId,
      sharedById,
      ...(payload.targetType === 'user'
        ? { sharedWithUserId: payload.targetId }
        : { sharedWithGroupId: payload.targetId }),
      permission: payload.permission ?? 'VIEW',
    },
  });

  return toResult(created, payload.targetType);
}

/** Sharing aufheben */
export async function unshareItem(shareId: string, requestingUserId: string): Promise<void> {
  const share = await d().sharedItem.findUnique({ where: { id: shareId } } as unknown);
  if (!share || (share as SharedRow).sharedById !== requestingUserId) {
    throw new Error('Share not found');
  }
  await d().sharedItem.delete({ where: { id: shareId } } as unknown);
}

/** Items die mit MIR geteilt wurden (direkt oder über Gruppen) */
export async function getSharedWithMe(userId: string): Promise<ReceivedItem[]> {
  const shared = await d().sharedItem.findMany({
    where: { sharedWithUserId: userId },
    include: {
      sharedBy: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      item: { select: { id: true, userId: true, productName: true, category: true, brand: true, condition: true, imageFilename: true, priceStats: true, scannedAt: true } },
    } as unknown,
    orderBy: { sharedAt: 'desc' } as unknown,
  });

  return (shared as SharedRow[])
    .filter((s) => s.item)
    .map((s) => ({
      shareId: s.id,
      itemId: s.itemId,
      sharedById: s.sharedById,
      sharedByUsername: s.sharedBy?.username ?? null,
      sharedByDisplayName: s.sharedBy?.displayName ?? null,
      sharedByAvatarUrl: s.sharedBy?.avatarUrl ?? null,
      permission: s.permission,
      sharedAt: s.sharedAt,
      productName: s.item!.productName,
      category: s.item!.category,
      brand: s.item!.brand,
      condition: s.item!.condition,
      imageFilename: s.item!.imageFilename,
      imageUrl: getImageUrl(s.item!.imageFilename),
      priceStats: s.item!.priceStats,
      scannedAt: s.item!.scannedAt,
    }));
}

/** Items die in einer Gruppe geteilt wurden */
export async function getGroupLibrary(groupId: string, requestingUserId: string): Promise<ReceivedItem[]> {
  // Muss Mitglied sein
  const member = await d().groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: requestingUserId } } as unknown,
  });
  if (!member) throw new Error('Not a group member');

  const shared = await d().sharedItem.findMany({
    where: { sharedWithGroupId: groupId },
    include: {
      sharedBy: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      item: { select: { id: true, userId: true, productName: true, category: true, brand: true, condition: true, imageFilename: true, priceStats: true, scannedAt: true } },
    } as unknown,
    orderBy: { sharedAt: 'desc' } as unknown,
  });

  return (shared as SharedRow[])
    .filter((s) => s.item)
    .map((s) => ({
      shareId: s.id,
      itemId: s.itemId,
      sharedById: s.sharedById,
      sharedByUsername: s.sharedBy?.username ?? null,
      sharedByDisplayName: s.sharedBy?.displayName ?? null,
      sharedByAvatarUrl: s.sharedBy?.avatarUrl ?? null,
      permission: s.permission,
      sharedAt: s.sharedAt,
      productName: s.item!.productName,
      category: s.item!.category,
      brand: s.item!.brand,
      condition: s.item!.condition,
      imageFilename: s.item!.imageFilename,
      imageUrl: getImageUrl(s.item!.imageFilename),
      priceStats: s.item!.priceStats,
      scannedAt: s.item!.scannedAt,
    }));
}

/** Wer hat Zugriff auf ein Item (als Owner abrufen) */
export async function getItemShares(itemId: string, ownerId: string): Promise<SharedRow[]> {
  return d().sharedItem.findMany({
    where: { itemId, sharedById: ownerId },
    include: {
      sharedBy: { select: { id: true, username: true, displayName: true } },
    } as unknown,
  }) as unknown as SharedRow[];
}

function toResult(row: SharedRow, targetType: ShareTargetType): SharedItemResult {
  return {
    shareId: row.id,
    itemId: row.itemId,
    sharedById: row.sharedById,
    targetType,
    targetId: (targetType === 'user' ? row.sharedWithUserId : row.sharedWithGroupId) ?? '',
    permission: row.permission,
    sharedAt: row.sharedAt,
  };
}
