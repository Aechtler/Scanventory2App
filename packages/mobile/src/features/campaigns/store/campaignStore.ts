import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { campaignService } from '../services/campaignService';
import type { Campaign, CampaignDraft } from '../types/campaign.types';

const createCampaignId = () => `campaign-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

interface CampaignState {
  campaigns: Campaign[];
  isSyncing: boolean;
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
        };
        set((state) => ({ campaigns: [optimistic, ...state.campaigns] }));

        // Im Backend speichern
        try {
          const res = await campaignService.create(draft);
          if (res.success && res.data) {
            // Lokale ID durch Server-ID ersetzen
            set((state) => ({
              campaigns: state.campaigns.map((c) =>
                c.id === localId ? { ...res.data! } : c
              ),
            }));
          }
        } catch {
          // Offline — bleibt lokal, kein Retry nötig für v1
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
            set({ campaigns: res.data });
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
