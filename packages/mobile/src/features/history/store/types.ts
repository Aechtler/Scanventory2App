import type { MarketListing, PriceStats } from '@/features/market/services/ebay';
import type { MarketValueResult } from '@/features/market/services/perplexity';

export interface HistoryItem {
  id: string;
  imageUri: string;
  cachedImageUri?: string;
  productName: string;
  category: string;
  categoryId?: string | null;    // FK → Category (neu)
  categoryPath?: string | null;  // "Videospiele > Sony > PlayStation 5 > Games"
  brand: string | null;
  condition: string;
  confidence: number;
  searchQuery: string;
  searchQueries?: {
    ebay?: string;
    amazon?: string;
    idealo?: string;
    generic?: string;
  };
  gtin?: string | null;
  priceStats: PriceStats;
  ebayListings?: MarketListing[];
  ebayListingsFetchedAt?: string;
  marketValue?: MarketValueResult;
  marketValueFetchedAt?: string;
  finalPrice?: number;
  finalPriceNote?: string;
  scannedAt: string;
  serverId?: string;
  syncStatus?: 'synced' | 'pending' | 'failed';
}

export type HistoryItemDraft = Omit<
  HistoryItem,
  'id' | 'scannedAt' | 'cachedImageUri' | 'serverId' | 'syncStatus'
>;

export type HistoryItemUpdateFields = Partial<
  Pick<
    HistoryItem,
    | 'productName'
    | 'category'
    | 'categoryId'
    | 'categoryPath'
    | 'brand'
    | 'condition'
    | 'gtin'
    | 'searchQuery'
    | 'searchQueries'
    | 'finalPrice'
    | 'finalPriceNote'
  >
>;

export interface HistoryState {
  items: HistoryItem[];
  isOffline: boolean;
  isLoading: boolean;
  fetchHistory: () => Promise<void>;
  addItem: (item: HistoryItemDraft) => Promise<string>;
  removeItem: (id: string) => void;
  clearHistory: () => void;
  getItemById: (id: string) => HistoryItem | undefined;
  setOffline: (offline: boolean) => void;
  updateItemPrices: (id: string, priceStats: PriceStats, listings?: MarketListing[]) => void;
  updateMarketValue: (id: string, marketValue: MarketValueResult) => void;
  updateItem: (id: string, fields: HistoryItemUpdateFields) => void;
}
