/**
 * useThemeColors - Theme-abhängige Farben für programmatische Verwendung
 * (StyleSheet, inline styles, Icon-Props etc.)
 */

import { useResolvedColorScheme } from '../store/themeStore';

export interface ThemeColors {
  background: string;
  backgroundCard: string;
  backgroundElevated: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryLight: string;
  accent: string;
  surfaceOverlay: string;
  /** Tab-Bar / Header Hintergrund mit Transparenz */
  tabBarBackground: string;
}

const LIGHT_COLORS: ThemeColors = {
  background: '#f8f8fc',
  backgroundCard: '#ffffff',
  backgroundElevated: '#f0f0f8',
  textPrimary: '#1a1a2e',
  textSecondary: '#6b6b8a',
  border: '#e2e2ef',
  primary: '#6366f1',
  primaryLight: '#818cf8',
  accent: '#e94560',
  surfaceOverlay: 'rgba(248, 248, 252, 0.85)',
  tabBarBackground: 'rgba(255, 255, 255, 0.85)',
};

const DARK_COLORS: ThemeColors = {
  background: '#0f0f1a',
  backgroundCard: '#1a1a2e',
  backgroundElevated: '#252547',
  textPrimary: '#f0f0f5',
  textSecondary: '#8b8ba3',
  border: '#2a2a45',
  primary: '#818cf8',
  primaryLight: '#a5b4fc',
  accent: '#e94560',
  surfaceOverlay: 'rgba(26, 26, 46, 0.85)',
  tabBarBackground: 'rgba(26, 26, 46, 0.85)',
};

export function useThemeColors(): ThemeColors {
  const scheme = useResolvedColorScheme();
  return scheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}

/** Nicht-reaktive Variante für Stellen ohne Hook-Zugriff */
export function getThemeColors(scheme: 'light' | 'dark'): ThemeColors {
  return scheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}
