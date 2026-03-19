import { PrismaClient, Prisma } from '@prisma/client';
import { CreateItemBody, PaginatedResponse, PriceStats, MarketListing, MarketValueResult } from '../types';
import {
  buildCreateItemData,
  buildKleinanzeigenPriceUpdateData,
  buildMarketValueUpdateData,
  buildPriceUpdateData,
} from './itemPayloads';

const prisma = new PrismaClient();

function toJsonOrNull(value: unknown): Prisma.InputJsonValue | typeof Prisma.DbNull {
  if (value === undefined || value === null) return Prisma.DbNull;
  return value as Prisma.InputJsonValue;
}

export { prisma };

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

export async function getItemById(id: string, userId: string) {
  return prisma.scannedItem.findFirst({ where: { id, userId } });
}

export async function createItem(userId: string, data: CreateItemBody, imageFilename: string) {
  const createData = buildCreateItemData(userId, data, imageFilename);

  return prisma.scannedItem.create({
    data: {
      ...createData,
      searchQueries: toJsonOrNull(createData.searchQueries),
      priceStats: toJsonOrNull(createData.priceStats),
      ebayListings: toJsonOrNull(createData.ebayListings),
      kleinanzeigenListings: toJsonOrNull(createData.kleinanzeigenListings),
      marketValue: toJsonOrNull(createData.marketValue),
    },
  });
}

export async function updateItem(id: string, userId: string, data: Prisma.ScannedItemUpdateInput) {
  return prisma.scannedItem.updateMany({ where: { id, userId }, data });
}

export async function updatePrices(
  id: string,
  userId: string,
  priceStats: PriceStats,
  ebayListings?: MarketListing[]
) {
  const updateData = buildPriceUpdateData(priceStats, ebayListings);

  return prisma.scannedItem.updateMany({
    where: { id, userId },
    data: {
      priceStats: toJsonOrNull(updateData.priceStats),
      ebayListings:
        updateData.ebayListings === undefined ? undefined : toJsonOrNull(updateData.ebayListings),
      ebayListingsFetchedAt: updateData.ebayListingsFetchedAt,
    },
  });
}

export async function updateKleinanzeigenPrices(
  id: string,
  userId: string,
  kleinanzeigenListings: MarketListing[]
) {
  const updateData = buildKleinanzeigenPriceUpdateData(kleinanzeigenListings);

  return prisma.scannedItem.updateMany({
    where: { id, userId },
    data: {
      kleinanzeigenListings: toJsonOrNull(updateData.kleinanzeigenListings),
      kleinanzeigenListingsFetchedAt: updateData.kleinanzeigenListingsFetchedAt,
    },
  });
}

export async function updateMarketValue(
  id: string,
  userId: string,
  marketValue: MarketValueResult
) {
  const updateData = buildMarketValueUpdateData(marketValue);

  return prisma.scannedItem.updateMany({
    where: { id, userId },
    data: {
      marketValue: toJsonOrNull(updateData.marketValue),
      marketValueFetchedAt: updateData.marketValueFetchedAt,
    },
  });
}

export async function deleteItem(id: string, userId: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      const item = await tx.scannedItem.findUnique({ where: { id }, select: { imageFilename: true, userId: true } });

      if (!item || item.userId !== userId) {
        return null;
      }

      await tx.scannedItem.delete({ where: { id } });

      return { imageFilename: item.imageFilename };
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return null;
    }

    throw error;
  }
}
