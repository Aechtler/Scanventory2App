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
  marketValue?: MarketValueResult;   // Cached Perplexity AI market analysis
  marketValueFetchedAt?: string;     // When market value was last fetched
  scannedAt: string; // ISO Date string
}

interface HistoryState {
  items: HistoryItem[];
  isOffline: boolean;
  addItem: (item: Omit<HistoryItem, 'id' | 'scannedAt' | 'cachedImageUri'>) => Promise<void>;
  removeItem: (id: string) => void;
  clearHistory: () => void;
  getItemById: (id: string) => HistoryItem | undefined;
  setOffline: (offline: boolean) => void;
  updateItemPrices: (id: string, priceStats: PriceStats, listings?: MarketListing[]) => void;
  updateMarketValue: (id: string, marketValue: MarketValueResult) => void;
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
          scannedAt: new Date().toISOString(),
        };
        set((state) => ({
          items: [newItem, ...state.items],
        }));
      },

      removeItem: (id) => {
        const item = get().items.find(i => i.id === id);
        if (item?.cachedImageUri) {
          removeCachedImage(item.imageUri);
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
      },

      updateMarketValue: (id, marketValue) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id 
              ? { ...item, marketValue, marketValueFetchedAt: new Date().toISOString() } 
              : item
          ),
        }));
      },
    }),
    {
      name: 'scan-history',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
