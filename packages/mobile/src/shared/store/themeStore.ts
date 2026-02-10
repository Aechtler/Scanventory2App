/**
 * Theme Store - Verwaltet das aktive Farbschema (Light/Dark/System)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** Gibt das effektive Farbschema zurück ('light' | 'dark') */
export function useResolvedColorScheme(): 'light' | 'dark' {
  const theme = useThemeStore((s) => s.theme);
  if (theme !== 'system') return theme;
  return Appearance.getColorScheme() ?? 'dark';
}
