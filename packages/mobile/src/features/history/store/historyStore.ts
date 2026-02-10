/**
 * History Store - Verwaltet den Scan-Verlauf
 * Verwendet Zustand mit AsyncStorage Persistenz
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PriceStats, MarketListing } from '@/features/market/services/ebay';
import { MarketValueResult } from '@/features/market/services/perplexity';
import { cacheImage, removeCachedImage } from '../services/imageCacheService';
import { syncNewItem, syncPrices, syncKleinanzeigenPrices, syncMarketValue, syncDeleteItem, syncItemUpdate } from '../services/syncService';

export interface HistoryItem {
  id: string;
  imageUri: string;
  cachedImageUri?: string; // Lokaler Cache-Pfad für Offline-Zugriff
  productName: string;
  category: string;
  brand: string | null;
  condition: string;
  confidence: number;
  searchQuery: string; // Allgemeiner Suchbegriff für Quicklinks
  searchQueries?: {    // Plattformspezifische Suchbegriffe
    ebay?: string;
    kleinanzeigen?: string;
    amazon?: string;
    idealo?: string;
    generic?: string;
  };
  gtin?: string | null;  // EAN, GTIN oder ISBN
  priceStats: PriceStats;
  ebayListings?: MarketListing[];    // Cached eBay listings for detail view
  ebayListingsFetchedAt?: string;    // When listings were last fetched
  kleinanzeigenListings?: MarketListing[];  // Cached Kleinanzeigen listings
  kleinanzeigenListingsFetchedAt?: string;  // When KA listings were last fetched
  marketValue?: MarketValueResult;   // Cached Perplexity AI market analysis
  marketValueFetchedAt?: string;     // When market value was last fetched
  finalPrice?: number;               // Manuell gesetzter Verkaufspreis
  finalPriceNote?: string;           // Notiz zum finalen Preis
  scannedAt: string; // ISO Date string
  serverId?: string;                 // Backend DB ID (nach erfolgreichem Sync)
  syncStatus?: 'synced' | 'pending' | 'failed'; // Sync-Status
}

interface HistoryState {
  items: HistoryItem[];
  isOffline: boolean;
  addItem: (item: Omit<HistoryItem, 'id' | 'scannedAt' | 'cachedImageUri' | 'serverId' | 'syncStatus'>) => Promise<string>;
  removeItem: (id: string) => void;
  clearHistory: () => void;
  getItemById: (id: string) => HistoryItem | undefined;
  setOffline: (offline: boolean) => void;
  updateItemPrices: (id: string, priceStats: PriceStats, listings?: MarketListing[]) => void;
  updateItemKleinanzeigenPrices: (id: string, listings: MarketListing[]) => void;
  updateMarketValue: (id: string, marketValue: MarketValueResult) => void;
  updateItem: (id: string, fields: Partial<Pick<HistoryItem,
    'productName' | 'category' | 'brand' | 'condition' | 'gtin' |
    'searchQuery' | 'searchQueries' | 'finalPrice' | 'finalPriceNote'
  >>) => void;
}

/**
 * History Store mit AsyncStorage Persistenz
 */
export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      items: [],
      isOffline: false,

      addItem: async (item) => {
        // Cache das Bild für Offline-Zugriff
        const cachedImageUri = await cacheImage(item.imageUri);

        const newItem: HistoryItem = {
          ...item,
          id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          cachedImageUri,
          syncStatus: 'pending',
          scannedAt: new Date().toISOString(),
        };
        set((state) => ({
          items: [newItem, ...state.items],
        }));

        // Fire-and-forget: Sync zum Backend
        syncNewItem(item.imageUri, {
          productName: item.productName,
          category: item.category,
          brand: item.brand,
          condition: item.condition,
          confidence: item.confidence,
          gtin: item.gtin,
          searchQuery: item.searchQuery,
          searchQueries: item.searchQueries,
          priceStats: item.priceStats as unknown as Record<string, unknown>,
          ebayListings: item.ebayListings,
          ebayListingsFetchedAt: item.ebayListingsFetchedAt,
          kleinanzeigenListings: item.kleinanzeigenListings,
          kleinanzeigenListingsFetchedAt: item.kleinanzeigenListingsFetchedAt,
          marketValue: item.marketValue as unknown as Record<string, unknown>,
          marketValueFetchedAt: item.marketValueFetchedAt,
          scannedAt: newItem.scannedAt,
        }).then((serverId) => {
          if (serverId) {
            set((state) => ({
              items: state.items.map((i) =>
                i.id === newItem.id ? { ...i, serverId, syncStatus: 'synced' as const } : i
              ),
            }));
          } else {
            set((state) => ({
              items: state.items.map((i) =>
                i.id === newItem.id ? { ...i, syncStatus: 'failed' as const } : i
              ),
            }));
          }
        });

        return newItem.id;
      },

      removeItem: (id) => {
        const item = get().items.find(i => i.id === id);
        if (item?.cachedImageUri) {
          removeCachedImage(item.imageUri);
        }
        // Fire-and-forget: Backend sync
        if (item?.serverId) {
          syncDeleteItem(item.serverId);
        }
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      clearHistory: () => {
        // TODO: Clear all cached images
        set({ items: [] });
      },

      getItemById: (id) => {
        return get().items.find((item) => item.id === id);
      },

      setOffline: (offline) => {
        set({ isOffline: offline });
      },

      updateItemPrices: (id, priceStats, listings) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  priceStats,
                  ebayListings: listings,
                  ebayListingsFetchedAt: new Date().toISOString()
                }
              : item
          ),
        }));
        // Fire-and-forget: Backend sync
        const item = get().items.find(i => i.id === id);
        if (item?.serverId) {
          syncPrices(
            item.serverId,
            priceStats as unknown as Record<string, unknown>,
            listings
          );
        }
      },

      updateItemKleinanzeigenPrices: (id, listings) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  kleinanzeigenListings: listings,
                  kleinanzeigenListingsFetchedAt: new Date().toISOString()
                }
              : item
          ),
        }));
        // Fire-and-forget: Backend sync
        const item = get().items.find(i => i.id === id);
        if (item?.serverId) {
          syncKleinanzeigenPrices(item.serverId, listings);
        }
      },

      updateMarketValue: (id, marketValue) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, marketValue, marketValueFetchedAt: new Date().toISOString() }
              : item
          ),
        }));
        // Fire-and-forget: Backend sync
        const item = get().items.find(i => i.id === id);
        if (item?.serverId) {
          syncMarketValue(
            item.serverId,
            marketValue as unknown as Record<string, unknown>
          );
        }
      },

      updateItem: (id, fields) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...fields } : item
          ),
        }));
        // Fire-and-forget: Backend sync
        const item = get().items.find(i => i.id === id);
        if (item?.serverId) {
          syncItemUpdate(item.serverId, { ...fields });
        }
      },
    }),
    {
      name: 'scan-history',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
