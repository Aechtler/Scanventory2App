import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { listingService } from '../services/listingService';
import { apiPost } from '@/shared/services/apiClient';
import type { Listing, CreateListingInput } from '../types/listing.types';

const createLocalId = () => `listing-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

interface SyncResult {
  synced: { orderId: string; listingId: string; productName: string }[];
  totalOrders: number;
}

interface ListingState {
  listings: Listing[];
  isSyncing: boolean;
  isSyncingOrders: boolean;
  fetchListings: () => Promise<void>;
  syncEbayOrders: () => Promise<SyncResult | null>;
  createListing: (input: CreateListingInput) => Promise<Listing>;
  updateListing: (id: string, patch: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  markAsSold: (id: string, soldPrice: number) => Promise<void>;
}

export const useListingStore = create<ListingState>()(
  persist(
    (set, get) => ({
      listings: [],
      isSyncing: false,
      isSyncingOrders: false,

      fetchListings: async () => {
        set({ isSyncing: true });
        try {
          const res = await listingService.fetchAll();
          if (res.success && res.data) {
            const serverData = res.data.map((l) => ({ ...l, syncStatus: 'synced' as const }));
            const serverIds = new Set(serverData.map((l) => l.id));
            const pending = get().listings.filter(
              (l) => l.syncStatus === 'pending' && !serverIds.has(l.id),
            );
            set({ listings: [...serverData, ...pending] });

            // Pending-Listings nachsynchronisieren (fire-and-forget)
            for (const p of pending) {
              listingService
                .create({
                  itemId: p.itemId,
                  platform: p.platform,
                  listingType: p.listingType,
                  startingPrice: p.startingPrice,
                  fixedPrice: p.fixedPrice,
                  status: p.status,
                  externalUrl: p.externalUrl,
                })
                .then((res) => {
                  if (res.success && res.data) {
                    set((state) => ({
                      listings: state.listings.map((l) =>
                        l.id === p.id ? { ...res.data!, syncStatus: 'synced' as const } : l,
                      ),
                    }));
                  }
                })
                .catch(() => {});
            }
          }
        } catch {
          // Offline — lokaler Cache bleibt
        } finally {
          set({ isSyncing: false });
        }
      },

      syncEbayOrders: async () => {
        set({ isSyncingOrders: true });
        try {
          const res = await apiPost<SyncResult>('/api/ebay/sync-orders', {});
          if (res.success && res.data) {
            // Listings neu laden wenn Verkäufe gefunden wurden
            if (res.data.synced.length > 0) {
              await get().fetchListings();
            }
            return res.data;
          }
          return null;
        } catch {
          return null;
        } finally {
          set({ isSyncingOrders: false });
        }
      },

      createListing: async (input) => {
        const localId = createLocalId();
        const optimistic: Listing = {
          id: localId,
          itemId: input.itemId,
          platform: input.platform,
          listingType: input.listingType,
          startingPrice: input.startingPrice ?? null,
          fixedPrice: input.fixedPrice ?? null,
          status: input.status,
          soldPrice: null,
          soldAt: null,
          externalUrl: input.externalUrl ?? null,
          createdAt: new Date().toISOString(),
          syncStatus: 'pending',
          productName: input.productName,
          imageFilename: input.imageFilename,
        };

        set((state) => ({ listings: [optimistic, ...state.listings] }));

        try {
          const res = await listingService.create({
            itemId: input.itemId,
            platform: input.platform,
            listingType: input.listingType,
            startingPrice: input.startingPrice,
            fixedPrice: input.fixedPrice,
            status: input.status,
            externalUrl: input.externalUrl,
          });
          if (res.success && res.data) {
            const synced: Listing = {
              ...res.data,
              syncStatus: 'synced',
              productName: input.productName,
              imageFilename: input.imageFilename,
            };
            set((state) => ({
              listings: state.listings.map((l) => (l.id === localId ? synced : l)),
            }));
            return synced;
          }
        } catch {
          // Offline — bleibt pending
        }

        return optimistic;
      },

      updateListing: async (id, patch) => {
        set((state) => ({
          listings: state.listings.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        }));

        try {
          await listingService.update(id, {
            status: patch.status,
            soldPrice: patch.soldPrice,
            soldAt: patch.soldAt,
            fixedPrice: patch.fixedPrice,
            startingPrice: patch.startingPrice,
            listingType: patch.listingType,
            externalUrl: patch.externalUrl,
          });
        } catch {
          // fire-and-forget
        }
      },

      deleteListing: async (id) => {
        set((state) => ({ listings: state.listings.filter((l) => l.id !== id) }));
        listingService.delete(id).catch(() => {});
      },

      markAsSold: async (id, soldPrice) => {
        const now = new Date().toISOString();
        get().updateListing(id, { status: 'sold', soldPrice, soldAt: now });
      },
    }),
    {
      name: 'listings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
