import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { campaignService } from '../services/campaignService';
import type { Campaign, CampaignDraft } from '../types/campaign.types';

const createCampaignId = () => `campaign-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

interface CampaignState {
  campaigns: Campaign[];
  isSyncing: boolean;
  lastCreated: Campaign | null;
  clearLastCreated: () => void;
  createCampaign: (draft: CampaignDraft) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  fetchCampaigns: () => Promise<void>;
  getCampaignById: (id: string) => Campaign | undefined;
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => ({
      campaigns: [],
      isSyncing: false,
      lastCreated: null,

      clearLastCreated: () => set({ lastCreated: null }),

      createCampaign: async (draft) => {
        // Optimistisch lokal anlegen
        const localId = createCampaignId();
        const optimistic: Campaign = {
          id: localId,
          name: draft.name,
          itemIds: draft.itemIds,
          startsAt: draft.startsAt,
          endsAt: draft.endsAt,
          createdAt: new Date().toISOString(),
          syncStatus: 'pending',
        };
        set((state) => ({ campaigns: [optimistic, ...state.campaigns], lastCreated: optimistic }));

        // Im Backend speichern
        try {
          const res = await campaignService.create(draft);
          if (res.success && res.data) {
            set((state) => ({
              campaigns: state.campaigns.map((c) =>
                c.id === localId ? { ...res.data!, syncStatus: 'synced' as const } : c
              ),
              lastCreated: { ...res.data!, syncStatus: 'synced' as const },
            }));
          }
        } catch {
          // Offline — bleibt pending, wird bei fetchCampaigns nachsynchronisiert
        }
      },

      deleteCampaign: async (id) => {
        // Optimistisch lokal löschen
        set((state) => ({ campaigns: state.campaigns.filter((c) => c.id !== id) }));

        // Im Backend löschen (fire-and-forget)
        campaignService.delete(id).catch(() => {});
      },

      fetchCampaigns: async () => {
        set({ isSyncing: true });
        try {
          const res = await campaignService.fetchAll();
          if (res.success && res.data) {
            const serverData = res.data.map((c) => ({ ...c, syncStatus: 'synced' as const }));
            const serverIds = new Set(serverData.map((c) => c.id));

            // Lokale pending-Kampagnen behalten, die noch nicht im Backend sind
            const pending = get().campaigns.filter(
              (c) => c.syncStatus === 'pending' && !serverIds.has(c.id),
            );

            set({ campaigns: [...serverData, ...pending] });

            // Pending-Kampagnen nachsynchronisieren (fire-and-forget)
            for (const p of pending) {
              campaignService
                .create({ name: p.name, itemIds: p.itemIds, startsAt: p.startsAt, endsAt: p.endsAt })
                .then((createRes) => {
                  if (createRes.success && createRes.data) {
                    set((state) => ({
                      campaigns: state.campaigns.map((c) =>
                        c.id === p.id ? { ...createRes.data!, syncStatus: 'synced' as const } : c,
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

      getCampaignById: (id) => get().campaigns.find((c) => c.id === id),
    }),
    {
      name: 'campaigns',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
