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
import {
  buildHistorySyncPayload,
  createHistoryItem,
  markHistoryItemSyncFailed,
  markHistoryItemSynced,
  removeHistoryItemById,
  updateHistoryItemFields,
  updateHistoryItemMarketValue,
  updateHistoryItemPrices,
} from './actions';
import { getHistoryItemById } from './selectors';
export type { HistoryItem, HistoryItemDraft, HistoryItemUpdateFields } from './types';

/**
 * History Store mit AsyncStorage Persistenz
 */
export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      items: [],
      isOffline: false,

      addItem: async (item) => {
        const cachedImageUri = await cacheImage(item.imageUri);
        const newItem = createHistoryItem(item, { cachedImageUri });
        set((state) => ({
          items: [newItem, ...state.items],
        }));

        syncNewItem(item.imageUri, buildHistorySyncPayload(item, newItem.scannedAt)).then((serverId) => {
          if (serverId) {
            set((state) => ({
              items: markHistoryItemSynced(state.items, newItem.id, serverId),
            }));
          } else {
            set((state) => ({
              items: markHistoryItemSyncFailed(state.items, newItem.id),
            }));
          }
        });

        return newItem.id;
      },

      removeItem: (id) => {
        const item = getHistoryItemById(get().items, id);
        if (item?.cachedImageUri) {
          removeCachedImage(item.cachedImageUri);
        }
        if (item?.serverId) {
          syncDeleteItem(item.serverId);
        }
        set((state) => ({
          items: removeHistoryItemById(state.items, id),
        }));
      },

      clearHistory: () => {
        clearImageCache();
        set({ items: [] });
      },

      getItemById: (id) => {
        return getHistoryItemById(get().items, id);
      },

      setOffline: (offline) => {
        set({ isOffline: offline });
      },

      updateItemPrices: (id, priceStats, listings) => {
        set((state) => ({
          items: updateHistoryItemPrices(state.items, id, priceStats, listings),
        }));
        const item = getHistoryItemById(get().items, id);
        if (item?.serverId) {
          syncPrices(item.serverId, priceStats, listings);
        }
      },

      updateMarketValue: (id, marketValue) => {
        set((state) => ({
          items: updateHistoryItemMarketValue(state.items, id, marketValue),
        }));
        const item = getHistoryItemById(get().items, id);
        if (item?.serverId) {
          syncMarketValue(item.serverId, marketValue);
        }
      },

      updateItem: (id, fields) => {
        set((state) => ({
          items: updateHistoryItemFields(state.items, id, fields),
        }));
        const item = getHistoryItemById(get().items, id);
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
