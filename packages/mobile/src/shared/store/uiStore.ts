/**
 * UI Store - Globaler UI-State (Tab Bar Sichtbarkeit etc.)
 */

import { create } from 'zustand';

interface UIState {
  tabBarHidden: boolean;
  setTabBarHidden: (hidden: boolean) => void;
  scanMenuVisible: boolean;
  setScanMenuVisible: (visible: boolean) => void;
  campaignSheetVisible: boolean;
  setCampaignSheetVisible: (visible: boolean) => void;
  campaignSelectionRequested: boolean;
  setCampaignSelectionRequested: (v: boolean) => void;
  itemNavigationIds: string[];
  setItemNavigationIds: (ids: string[]) => void;
}

export const useUIStore = create<UIState>((set) => ({
  tabBarHidden: false,
  setTabBarHidden: (hidden) => set({ tabBarHidden: hidden }),
  scanMenuVisible: false,
  setScanMenuVisible: (visible) => set({ scanMenuVisible: visible }),
  campaignSheetVisible: false,
  setCampaignSheetVisible: (visible) => set({ campaignSheetVisible: visible }),
  campaignSelectionRequested: false,
  setCampaignSelectionRequested: (v) => set({ campaignSelectionRequested: v }),
  itemNavigationIds: [],
  setItemNavigationIds: (ids) => set({ itemNavigationIds: ids }),
}));
