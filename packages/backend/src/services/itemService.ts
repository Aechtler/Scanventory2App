import { Prisma } from '@prisma/client';
import { CreateItemBody, PaginatedResponse, PriceStats, MarketListing, MarketValueResult } from '../types';
import { createItemService as createItemServiceFactory } from './itemServiceFactory';
import { prisma } from './prismaClient';

function toJsonOrNull(value: unknown): Prisma.InputJsonValue | typeof Prisma.DbNull {
  if (value === undefined || value === null) return Prisma.DbNull;
  return value as Prisma.InputJsonValue;
}

export { prisma };
export const createItemService = createItemServiceFactory;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const itemService = createItemServiceFactory(prisma as any, {
  toJsonOrNull,
  isRecordNotFoundError: (error: any) =>
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025',
});

export async function getItems(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Prisma.ScannedItemGetPayload<object>>> {
  return itemService.getItems(userId, page, limit) as Promise<PaginatedResponse<Prisma.ScannedItemGetPayload<object>>>;
}

export async function getItemById(id: string, userId: string) {
  return itemService.getItemById(id, userId);
}

export async function createItem(userId: string, data: CreateItemBody, imageFilename: string) {
  return itemService.createItem(userId, data, imageFilename);
}

export async function updateItem(id: string, userId: string, data: Prisma.ScannedItemUpdateInput) {
  return itemService.updateItem(id, userId, data);
}

export async function updatePrices(
  id: string,
  userId: string,
  priceStats: PriceStats,
  ebayListings?: MarketListing[]
) {
  return itemService.updatePrices(id, userId, priceStats, ebayListings);
}

export async function updateKleinanzeigenPrices(
  id: string,
  userId: string,
  kleinanzeigenListings: MarketListing[]
) {
  return itemService.updateKleinanzeigenPrices(id, userId, kleinanzeigenListings);
}

export async function updateMarketValue(
  id: string,
  userId: string,
  marketValue: MarketValueResult
) {
  return itemService.updateMarketValue(id, userId, marketValue);
}

export async function deleteItem(id: string, userId: string) {
  return itemService.deleteItem(id, userId);
}
