/**
 * History Store - Verwaltet den Scan-Verlauf
 * Verwendet Zustand mit AsyncStorage Persistenz
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { HistoryState } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cacheImage, removeCachedImage, clearImageCache } from '../services/imageCacheService';
import { syncNewItem, syncPrices, syncMarketValue, syncDeleteItem, syncItemUpdate } from '../services/syncService';
import { createHistoryStoreState } from './state';
export type { HistoryItem, HistoryItemDraft, HistoryItemUpdateFields } from './types';
export type { HistoryStoreDependencies } from './state';

const historyStoreDependencies = {
  cacheImage,
  removeCachedImage,
  clearImageCache,
  syncNewItem,
  syncPrices,
  syncMarketValue,
  syncDeleteItem,
  syncItemUpdate,
};

/**
 * History Store mit AsyncStorage Persistenz
 */
export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => createHistoryStoreState(set, get, historyStoreDependencies),
    {
      name: 'scan-history',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
