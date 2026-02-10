/**
 * UI Store - Globaler UI-State (Tab Bar Sichtbarkeit etc.)
 */

import { create } from 'zustand';

interface UIState {
  tabBarHidden: boolean;
  setTabBarHidden: (hidden: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  tabBarHidden: false,
  setTabBarHidden: (hidden) => set({ tabBarHidden: hidden }),
}));
