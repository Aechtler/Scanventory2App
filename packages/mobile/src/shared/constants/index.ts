// App-weite Konstanten

const DEFAULT_DEV_API_URL = 'http://localhost:3000';
const rawApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const resolvedApiUrl = rawApiUrl || (__DEV__ ? DEFAULT_DEV_API_URL : '');

if (!rawApiUrl && __DEV__) {
  console.warn('EXPO_PUBLIC_API_URL is not set — using local development fallback.');
}

if (!resolvedApiUrl) {
  throw new Error('EXPO_PUBLIC_API_URL must be configured for non-development builds.');
}

let normalizedApiUrl: string;
try {
  const parsedApiUrl = new URL(resolvedApiUrl);

  if (!__DEV__ && parsedApiUrl.protocol !== 'https:') {
    throw new Error('EXPO_PUBLIC_API_URL must use HTTPS in production.');
  }

  normalizedApiUrl = resolvedApiUrl.replace(/\/$/, '');
} catch (error) {
  console.error('Invalid EXPO_PUBLIC_API_URL:', resolvedApiUrl, error);
  throw new Error('EXPO_PUBLIC_API_URL is invalid. Please provide a valid absolute URL.');
}

/**
 * API Konfiguration
 */
export const API_CONFIG = {
  BASE_URL: normalizedApiUrl,
  TIMEOUT: 30000,
} as const;

/**
 * Upload-Konfiguration
 */
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'] as const,
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
 * @deprecated Verwende `useThemeColors()` aus `@/shared/hooks` stattdessen
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
