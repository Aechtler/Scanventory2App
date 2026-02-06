/**
 * Item Service - Prisma CRUD-Logik fuer ScannedItems
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { CreateItemBody, PaginatedResponse } from '../types';

const prisma = new PrismaClient();

/** Konvertiert einen Wert sicher zu Prisma JSON oder DbNull */
function toJsonOrNull(value: unknown): Prisma.InputJsonValue | typeof Prisma.DbNull {
  if (value === undefined || value === null) return Prisma.DbNull;
  return value as Prisma.InputJsonValue;
}

export { prisma };

/** Alle Items eines Users paginiert abrufen */
export async function getItems(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Prisma.ScannedItemGetPayload<object>>> {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.scannedItem.findMany({
      where: { userId },
      orderBy: { scannedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.scannedItem.count({ where: { userId } }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/** Einzelnes Item abrufen */
export async function getItemById(id: string, userId: string) {
  return prisma.scannedItem.findFirst({
    where: { id, userId },
  });
}

/** Neues Item anlegen */
export async function createItem(
  userId: string,
  data: CreateItemBody,
  imageFilename: string
) {
  return prisma.scannedItem.create({
    data: {
      userId,
      productName: data.productName,
      category: data.category,
      brand: data.brand ?? null,
      condition: data.condition,
      confidence: data.confidence,
      gtin: data.gtin ?? null,
      searchQuery: data.searchQuery,
      searchQueries: toJsonOrNull(data.searchQueries),
      imageFilename,
      originalUri: data.originalUri ?? null,
      priceStats: toJsonOrNull(data.priceStats),
      ebayListings: toJsonOrNull(data.ebayListings),
      ebayListingsFetchedAt: data.ebayListingsFetchedAt
        ? new Date(data.ebayListingsFetchedAt)
        : null,
      kleinanzeigenListings: toJsonOrNull(data.kleinanzeigenListings),
      kleinanzeigenListingsFetchedAt: data.kleinanzeigenListingsFetchedAt
        ? new Date(data.kleinanzeigenListingsFetchedAt)
        : null,
      marketValue: toJsonOrNull(data.marketValue),
      marketValueFetchedAt: data.marketValueFetchedAt
        ? new Date(data.marketValueFetchedAt)
        : null,
      finalPrice: data.finalPrice ?? null,
      finalPriceNote: data.finalPriceNote ?? null,
      scannedAt: new Date(data.scannedAt),
    },
  });
}

/** Item aktualisieren */
export async function updateItem(
  id: string,
  userId: string,
  data: Prisma.ScannedItemUpdateInput
) {
  return prisma.scannedItem.updateMany({
    where: { id, userId },
    data,
  });
}

/** Preisdaten aktualisieren */
export async function updatePrices(
  id: string,
  userId: string,
  priceStats: Record<string, unknown>,
  ebayListings?: unknown[]
) {
  return prisma.scannedItem.updateMany({
    where: { id, userId },
    data: {
      priceStats: toJsonOrNull(priceStats),
      ebayListings: ebayListings ? toJsonOrNull(ebayListings) : undefined,
      ebayListingsFetchedAt: new Date(),
    },
  });
}

/** Kleinanzeigen-Preisdaten aktualisieren */
export async function updateKleinanzeigenPrices(
  id: string,
  userId: string,
  kleinanzeigenListings: unknown[]
) {
  return prisma.scannedItem.updateMany({
    where: { id, userId },
    data: {
      kleinanzeigenListings: toJsonOrNull(kleinanzeigenListings),
      kleinanzeigenListingsFetchedAt: new Date(),
    },
  });
}

/** Marktwert aktualisieren */
export async function updateMarketValue(
  id: string,
  userId: string,
  marketValue: Record<string, unknown>
) {
  return prisma.scannedItem.updateMany({
    where: { id, userId },
    data: {
      marketValue: toJsonOrNull(marketValue),
      marketValueFetchedAt: new Date(),
    },
  });
}

/** Item loeschen */
export async function deleteItem(id: string, userId: string) {
  const item = await prisma.scannedItem.findFirst({
    where: { id, userId },
    select: { imageFilename: true },
  });

  if (!item) return null;

  await prisma.scannedItem.deleteMany({
    where: { id, userId },
  });

  return item;
}
