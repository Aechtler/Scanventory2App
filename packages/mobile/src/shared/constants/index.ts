// App-weite Konstanten

/**
 * API Konfiguration
 */
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
} as const;

/**
 * Bild-Konfiguration
 */
export const IMAGE_CONFIG = {
  MAX_SIZE_MB: 1,
  MAX_SIZE_BYTES: 1 * 1024 * 1024,
  QUALITY: 0.8,
  ASPECT_RATIO: [4, 3] as [number, number],
} as const;

/**
 * Marktplatz-Plattformen
 */
export const MARKET_PLATFORMS = {
  EBAY: 'ebay',
  AMAZON: 'amazon',
  IDEALO: 'idealo',
} as const;

export type MarketPlatform = typeof MARKET_PLATFORMS[keyof typeof MARKET_PLATFORMS];

/**
 * App Farben (für programmatische Verwendung)
 */
export const COLORS = {
  primary: '#6366f1',
  background: '#1a1a2e',
  backgroundCard: '#16213e',
  backgroundElevated: '#0f3460',
  accent: '#e94560',
  textPrimary: '#ffffff',
  textSecondary: '#9ca3af',
} as const;
