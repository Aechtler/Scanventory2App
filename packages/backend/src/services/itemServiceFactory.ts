import type {
  CreateItemBody,
  MarketListing,
  MarketValueResult,
  PaginatedResponse,
  PriceStats,
} from '../types/index';
import {
  buildCreateItemData,
  buildKleinanzeigenPriceUpdateData,
  buildMarketValueUpdateData,
  buildPriceUpdateData,
} from './itemPayloads';

type DeleteLookupResult = { imageFilename: string; userId: string } | null;
type DeleteResult = { imageFilename: string } | null;

type PaginationArgs = {
  where: { userId: string };
  orderBy: { scannedAt: 'desc' };
  skip: number;
  take: number;
};

type FindByIdArgs = { where: { id: string; userId: string } };
type UpdateArgs = { where: { id: string; userId: string }; data: unknown };

export interface ItemTransactionClient {
  scannedItem: {
    findUnique(args: {
      where: { id: string };
      select: { imageFilename: true; userId: true };
    }): Promise<DeleteLookupResult>;
    delete(args: { where: { id: string } }): Promise<unknown>;
  };
}

export interface ItemServiceDatabase<
  ItemRecord = unknown,
  FindResult = ItemRecord | null,
  CreateResult = ItemRecord,
  UpdateResult extends { count: number } = { count: number },
> {
  scannedItem: {
    findMany(args: PaginationArgs): Promise<ItemRecord[]>;
    count(args: { where: { userId: string } }): Promise<number>;
    findFirst(args: FindByIdArgs): Promise<FindResult>;
    create(args: { data: Record<string, unknown> }): Promise<CreateResult>;
    updateMany(args: UpdateArgs): Promise<UpdateResult>;
  };
  $transaction<T>(callback: (tx: ItemTransactionClient) => Promise<T>): Promise<T>;
}

export interface ItemServiceFactoryOptions {
  toJsonOrNull(value: unknown): unknown;
  isRecordNotFoundError?(error: unknown): boolean;
}

export interface ItemService<
  ItemRecord = unknown,
  FindResult = ItemRecord | null,
  CreateResult = ItemRecord,
  UpdateResult extends { count: number } = { count: number },
> {
  getItems(userId: string, page?: number, limit?: number): Promise<PaginatedResponse<ItemRecord>>;
  getItemById(id: string, userId: string): Promise<FindResult>;
  createItem(userId: string, data: CreateItemBody, imageFilename: string): Promise<CreateResult>;
  updateItem(id: string, userId: string, data: unknown): Promise<UpdateResult>;
  updatePrices(
    id: string,
    userId: string,
    priceStats: PriceStats,
    ebayListings?: MarketListing[]
  ): Promise<UpdateResult>;
  updateKleinanzeigenPrices(
    id: string,
    userId: string,
    kleinanzeigenListings: MarketListing[]
  ): Promise<UpdateResult>;
  updateMarketValue(
    id: string,
    userId: string,
    marketValue: MarketValueResult
  ): Promise<UpdateResult>;
  deleteItem(id: string, userId: string): Promise<DeleteResult>;
}

export function createItemService<
  ItemRecord = unknown,
  FindResult = ItemRecord | null,
  CreateResult = ItemRecord,
  UpdateResult extends { count: number } = { count: number },
>(
  db: ItemServiceDatabase<ItemRecord, FindResult, CreateResult, UpdateResult>,
  options: ItemServiceFactoryOptions
): ItemService<ItemRecord, FindResult, CreateResult, UpdateResult> {
  const toJsonOrNull = (value: unknown) => options.toJsonOrNull(value);

  return {
    async getItems(userId, page = 1, limit = 20) {
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        db.scannedItem.findMany({
          where: { userId },
          orderBy: { scannedAt: 'desc' },
          skip,
          take: limit,
        }),
        db.scannedItem.count({ where: { userId } }),
      ]);

      return {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    },

    async getItemById(id, userId) {
      return db.scannedItem.findFirst({ where: { id, userId } });
    },

    async createItem(userId, data, imageFilename) {
      const createData = buildCreateItemData(userId, data, imageFilename);

      return db.scannedItem.create({
        data: {
          ...createData,
          searchQueries: toJsonOrNull(createData.searchQueries),
          priceStats: toJsonOrNull(createData.priceStats),
          ebayListings: toJsonOrNull(createData.ebayListings),
          kleinanzeigenListings: toJsonOrNull(createData.kleinanzeigenListings),
          marketValue: toJsonOrNull(createData.marketValue),
        },
      });
    },

    async updateItem(id, userId, data) {
      return db.scannedItem.updateMany({ where: { id, userId }, data });
    },

    async updatePrices(id, userId, priceStats, ebayListings) {
      const updateData = buildPriceUpdateData(priceStats, ebayListings);

      return db.scannedItem.updateMany({
        where: { id, userId },
        data: {
          priceStats: toJsonOrNull(updateData.priceStats),
          ebayListings:
            updateData.ebayListings === undefined
              ? undefined
              : toJsonOrNull(updateData.ebayListings),
          ebayListingsFetchedAt: updateData.ebayListingsFetchedAt,
        },
      });
    },

    async updateKleinanzeigenPrices(id, userId, kleinanzeigenListings) {
      const updateData = buildKleinanzeigenPriceUpdateData(kleinanzeigenListings);

      return db.scannedItem.updateMany({
        where: { id, userId },
        data: {
          kleinanzeigenListings: toJsonOrNull(updateData.kleinanzeigenListings),
          kleinanzeigenListingsFetchedAt: updateData.kleinanzeigenListingsFetchedAt,
        },
      });
    },

    async updateMarketValue(id, userId, marketValue) {
      const updateData = buildMarketValueUpdateData(marketValue);

      return db.scannedItem.updateMany({
        where: { id, userId },
        data: {
          marketValue: toJsonOrNull(updateData.marketValue),
          marketValueFetchedAt: updateData.marketValueFetchedAt,
        },
      });
    },

    async deleteItem(id, userId) {
      try {
        return await db.$transaction(async (tx) => {
          const item = await tx.scannedItem.findUnique({
            where: { id },
            select: { imageFilename: true, userId: true },
          });

          if (!item || item.userId !== userId) {
            return null;
          }

          await tx.scannedItem.delete({ where: { id } });

          return { imageFilename: item.imageFilename };
        });
      } catch (error) {
        if (options.isRecordNotFoundError?.(error)) {
          return null;
        }

        throw error;
      }
    },
  };
}
