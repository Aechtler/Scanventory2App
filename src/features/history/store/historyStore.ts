/**
 * History Store - Verwaltet den Scan-Verlauf
 * Verwendet Zustand mit AsyncStorage Persistenz
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PriceStats } from '@/features/market/services/ebayService';
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
  priceStats: PriceStats;
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
  updateItemPrices: (id: string, priceStats: PriceStats) => void;
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

      updateItemPrices: (id, priceStats) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, priceStats } : item
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
