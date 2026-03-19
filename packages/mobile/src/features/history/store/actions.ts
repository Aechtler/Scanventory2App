import type { MarketListing, PriceStats } from '@/features/market/services/ebay';
import type { MarketValueResult } from '@/features/market/services/perplexity';

import type { HistoryItem, HistoryItemDraft, HistoryItemUpdateFields } from './types';

interface CreateHistoryItemOptions {
  cachedImageUri?: string;
  now?: string;
  createId?: () => string;
}

export const createHistoryItemId = () =>
  `scan-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export const createHistoryItem = (
  item: HistoryItemDraft,
  options: CreateHistoryItemOptions = {},
): HistoryItem => ({
  ...item,
  id: options.createId?.() ?? createHistoryItemId(),
  cachedImageUri: options.cachedImageUri,
  syncStatus: 'pending',
  scannedAt: options.now ?? new Date().toISOString(),
});

export const buildHistorySyncPayload = (
  item: HistoryItemDraft,
  scannedAt: string,
) => ({
  productName: item.productName,
  category: item.category,
  brand: item.brand,
  condition: item.condition,
  confidence: item.confidence,
  gtin: item.gtin,
  searchQuery: item.searchQuery,
  searchQueries: item.searchQueries,
  priceStats: item.priceStats,
  ebayListings: item.ebayListings,
  ebayListingsFetchedAt: item.ebayListingsFetchedAt,
  marketValue: item.marketValue,
  marketValueFetchedAt: item.marketValueFetchedAt,
  scannedAt,
});

export const markHistoryItemSynced = (
  items: HistoryItem[],
  id: string,
  serverId: string,
): HistoryItem[] =>
  items.map((item) =>
    item.id === id ? { ...item, serverId, syncStatus: 'synced' as const } : item,
  );

export const markHistoryItemSyncFailed = (
  items: HistoryItem[],
  id: string,
): HistoryItem[] =>
  items.map((item) =>
    item.id === id ? { ...item, syncStatus: 'failed' as const } : item,
  );

export const removeHistoryItemById = (
  items: HistoryItem[],
  id: string,
): HistoryItem[] => items.filter((item) => item.id !== id);

export const updateHistoryItemPrices = (
  items: HistoryItem[],
  id: string,
  priceStats: PriceStats,
  listings?: MarketListing[],
  fetchedAt: string = new Date().toISOString(),
): HistoryItem[] =>
  items.map((item) =>
    item.id === id
      ? {
          ...item,
          priceStats,
          ebayListings: listings,
          ebayListingsFetchedAt: fetchedAt,
        }
      : item,
  );

export const updateHistoryItemMarketValue = (
  items: HistoryItem[],
  id: string,
  marketValue: MarketValueResult,
  fetchedAt: string = new Date().toISOString(),
): HistoryItem[] =>
  items.map((item) =>
    item.id === id
      ? {
          ...item,
          marketValue,
          marketValueFetchedAt: fetchedAt,
        }
      : item,
  );

export const updateHistoryItemFields = (
  items: HistoryItem[],
  id: string,
  fields: HistoryItemUpdateFields,
): HistoryItem[] =>
  items.map((item) => (item.id === id ? { ...item, ...fields } : item));
