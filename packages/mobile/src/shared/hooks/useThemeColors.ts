/**
 * useThemeColors - Theme-abhängige Farben für programmatische Verwendung
 * (StyleSheet, inline styles, Icon-Props etc.)
 * Palette: iOS Human Interface Guidelines System Colors
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

/** iOS Light Mode – systemGroupedBackground + Apple Blue */
const LIGHT_COLORS: ThemeColors = {
  background: '#F2F2F7',          // iOS systemGroupedBackground
  backgroundCard: '#FFFFFF',      // iOS secondarySystemGroupedBackground
  backgroundElevated: '#E5E5EA',  // iOS systemGray5
  textPrimary: '#000000',
  textSecondary: '#8E8E93',       // iOS systemGray
  border: '#C6C6C8',              // iOS separator
  primary: '#007AFF',             // iOS systemBlue
  primaryLight: '#409CFF',
  accent: '#FF2D55',              // iOS systemPink
  surfaceOverlay: 'rgba(242, 242, 247, 0.92)',
  tabBarBackground: 'rgba(255, 255, 255, 0.88)',
};

/** iOS Dark Mode – True Black (OLED) + Apple Blue */
const DARK_COLORS: ThemeColors = {
  background: '#000000',          // iOS true black
  backgroundCard: '#1C1C1E',      // iOS systemGray6 dark
  backgroundElevated: '#2C2C2E',  // iOS systemGray5 dark
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',       // iOS systemGray
  border: '#38383A',              // iOS separator dark
  primary: '#0A84FF',             // iOS systemBlue dark
  primaryLight: '#409CFF',
  accent: '#FF375F',              // iOS systemPink dark
  surfaceOverlay: 'rgba(28, 28, 30, 0.92)',
  tabBarBackground: 'rgba(28, 28, 30, 0.92)',
};

export function useThemeColors(): ThemeColors {
  const scheme = useResolvedColorScheme();
  return scheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}

/** Nicht-reaktive Variante für Stellen ohne Hook-Zugriff */
export function getThemeColors(scheme: 'light' | 'dark'): ThemeColors {
  return scheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}
