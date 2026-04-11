import { create } from 'zustand';
import { Linking } from 'react-native';
import { apiGet, apiDelete } from '@/shared/services/apiClient';

interface EbayConnectionState {
  connected: boolean;
  checking: boolean;
  check: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  setConnected: (value: boolean) => void;
}

export const useEbayConnectionStore = create<EbayConnectionState>()((set) => ({
  connected: false,
  checking: false,

  setConnected: (value) => set({ connected: value }),

  check: async () => {
    set({ checking: true });
    try {
      const res = await apiGet<{ connected: boolean }>('/api/ebay/status');
      if (res.success && res.data) {
        set({ connected: res.data.connected });
      }
    } catch {
      // Offline — Status bleibt unverändert
    } finally {
      set({ checking: false });
    }
  },

  connect: async () => {
    try {
      const res = await apiGet<{ authUrl: string }>('/api/ebay/connect');
      if (res.success && res.data?.authUrl) {
        await Linking.openURL(res.data.authUrl);
      }
    } catch (e) {
      console.error('[eBay] connect error:', e);
    }
  },

  disconnect: async () => {
    try {
      await apiDelete('/api/ebay/disconnect');
    } catch {
      // fire-and-forget
    } finally {
      set({ connected: false });
    }
  },
}));
