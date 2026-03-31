import type { MarketListing, PriceStats } from '@/features/market/services/ebay';
import type { MarketValueResult } from '@/features/market/services/perplexity';

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
import type { HistoryItem, HistoryItemDraft, HistoryItemUpdateFields, HistoryState } from './types';

export interface HistoryStoreDependencies {
  cacheImage: (uri: string) => Promise<string>;
  removeCachedImage: (uri: string) => Promise<void>;
  clearImageCache: () => Promise<void>;
  syncNewItem: (
    imageUri: string,
    data: ReturnType<typeof buildHistorySyncPayload>,
  ) => Promise<string | null>;
  syncPrices: (
    serverId: string,
    priceStats: PriceStats,
    listings?: MarketListing[],
  ) => Promise<boolean>;
  syncMarketValue: (
    serverId: string,
    marketValue: MarketValueResult,
  ) => Promise<boolean>;
  syncItemUpdate: (
    serverId: string,
    fields: Record<string, unknown>,
  ) => Promise<boolean>;
  syncDeleteItem: (serverId: string) => Promise<boolean>;
  syncFetchHistory?: (page?: number, limit?: number) => Promise<HistoryItem[] | null>;
  now?: () => string;
  createId?: () => string;
}

type HistoryStateSetter = (
  update: Partial<HistoryState> | ((state: HistoryState) => Partial<HistoryState>),
) => void;

type HistoryStateGetter = () => HistoryState;

export const createHistoryStoreState = (
  set: HistoryStateSetter,
  get: HistoryStateGetter,
  dependencies: HistoryStoreDependencies,
): HistoryState => ({
  items: [],
  isOffline: false,
  isLoading: false,

  fetchHistory: async () => {
    if (!dependencies.syncFetchHistory) return;

    set({ isLoading: true });
    try {
      const serverItems = await dependencies.syncFetchHistory();

      if (serverItems !== null) {
        const serverIds = new Set(
          serverItems.map((i) => i.serverId).filter((id): id is string => Boolean(id)),
        );

        // Zeige Server-Items + lokale Drafts die noch nicht auf dem Server sind
        set((state) => {
          const localDrafts = state.items.filter(
            (item) =>
              (item.syncStatus === 'pending' || item.syncStatus === 'failed') &&
              (!item.serverId || !serverIds.has(item.serverId)),
          );
          return { items: [...localDrafts, ...serverItems], isOffline: false };
        });

        // Failed-Items nachträglich hochladen, da der Server jetzt erreichbar ist
        const failedItems = get().items.filter(
          (item) =>
            item.syncStatus === 'failed' && (!item.serverId || !serverIds.has(item.serverId)),
        );

        for (const failedItem of failedItems) {
          const uploadUri = failedItem.cachedImageUri ?? failedItem.imageUri;
          if (!uploadUri) continue;

          // Als pending markieren während der Upload läuft
          set((state) => ({
            items: state.items.map((i) =>
              i.id === failedItem.id ? { ...i, syncStatus: 'pending' as const } : i,
            ),
          }));

          void dependencies
            .syncNewItem(uploadUri, buildHistorySyncPayload(failedItem, failedItem.scannedAt))
            .then((serverId) => {
              set((state) => ({
                items: serverId
                  ? markHistoryItemSynced(state.items, failedItem.id, serverId)
                  : markHistoryItemSyncFailed(state.items, failedItem.id),
              }));
            });
        }
      }
    } catch (e) {
      console.warn('[Store] fetchHistory failed', e);
      set({ isOffline: true });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (item: HistoryItemDraft) => {
    const cachedImageUri = await dependencies.cacheImage(item.imageUri);
    const newItem = createHistoryItem(item, {
      cachedImageUri,
      now: dependencies.now?.(),
      createId: dependencies.createId,
    });

    set((state) => ({
      items: [newItem, ...state.items],
    }));

    void dependencies
      .syncNewItem(item.imageUri, buildHistorySyncPayload(item, newItem.scannedAt))
      .then((serverId) => {
        set((state) => ({
          items: serverId
            ? markHistoryItemSynced(state.items, newItem.id, serverId)
            : markHistoryItemSyncFailed(state.items, newItem.id),
        }));
      });

    return newItem.id;
  },

  removeItem: (id: string) => {
    const item = getHistoryItemById(get().items, id);
    if (item?.cachedImageUri) {
      void dependencies.removeCachedImage(item.cachedImageUri);
    }
    if (item?.serverId) {
      void dependencies.syncDeleteItem(item.serverId);
    }

    set((state) => ({
      items: removeHistoryItemById(state.items, id),
    }));
  },

  clearHistory: () => {
    void dependencies.clearImageCache();
    set({ items: [] });
  },

  getItemById: (id: string) => getHistoryItemById(get().items, id),

  setOffline: (offline: boolean) => {
    set({ isOffline: offline });
  },

  updateItemPrices: (id: string, priceStats: PriceStats, listings?: MarketListing[]) => {
    set((state) => ({
      items: updateHistoryItemPrices(
        state.items,
        id,
        priceStats,
        listings,
        dependencies.now?.(),
      ),
    }));

    const item = getHistoryItemById(get().items, id);
    if (item?.serverId) {
      void dependencies.syncPrices(item.serverId, priceStats, listings);
    }
  },

  updateMarketValue: (id: string, marketValue: MarketValueResult) => {
    set((state) => ({
      items: updateHistoryItemMarketValue(
        state.items,
        id,
        marketValue,
        dependencies.now?.(),
      ),
    }));

    const item = getHistoryItemById(get().items, id);
    if (item?.serverId) {
      void dependencies.syncMarketValue(item.serverId, marketValue);
    }
  },

  updateItem: (id: string, fields: HistoryItemUpdateFields) => {
    set((state) => ({
      items: updateHistoryItemFields(state.items, id, fields),
    }));

    const item = getHistoryItemById(get().items, id);
    if (item?.serverId) {
      void dependencies.syncItemUpdate(item.serverId, { ...fields });
    }
  },
});
