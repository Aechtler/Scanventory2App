/**
 * History Store - Verwaltet den Scan-Verlauf
 * Verwendet Zustand mit AsyncStorage Persistenz
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VisionResult } from '@/features/scan/services/visionService';
import { PriceStats } from '@/features/market/services/ebayService';

export interface HistoryItem {
  id: string;
  imageUri: string;
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
  addItem: (item: Omit<HistoryItem, 'id' | 'scannedAt'>) => void;
  removeItem: (id: string) => void;
  clearHistory: () => void;
  getItemById: (id: string) => HistoryItem | undefined;
}

/**
 * History Store mit AsyncStorage Persistenz
 */
export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const newItem: HistoryItem = {
          ...item,
          id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          scannedAt: new Date().toISOString(),
        };
        set((state) => ({
          items: [newItem, ...state.items],
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      clearHistory: () => {
        set({ items: [] });
      },

      getItemById: (id) => {
        return get().items.find((item) => item.id === id);
      },
    }),
    {
      name: 'scan-history',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
