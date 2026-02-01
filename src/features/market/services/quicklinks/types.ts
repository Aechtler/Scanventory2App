/**
 * Quicklinks Service Types
 */

export interface PlatformQueries {
  ebay?: string;
  kleinanzeigen?: string;
  amazon?: string;
  idealo?: string;
  generic?: string;
}

export interface PlatformLink {
  platform: 'ebay' | 'kleinanzeigen' | 'amazon' | 'idealo';
  name: string;
  icon: string;
  color: string;
  url: string;
}

export const PLATFORM_CONFIGS = {
  ebay: {
    name: 'eBay',
    icon: '🛒',
    color: '#e53238',
    urlTemplate: 'https://www.ebay.de/sch/i.html?_nkw=',
  },
  kleinanzeigen: {
    name: 'Kleinanzeigen',
    icon: '📦',
    color: '#86b817',
    urlTemplate: 'https://www.kleinanzeigen.de/s-suche/',
  },
  amazon: {
    name: 'Amazon',
    icon: '📱',
    color: '#ff9900',
    urlTemplate: 'https://www.amazon.de/s?k=',
  },
  idealo: {
    name: 'Idealo',
    icon: '🔍',
    color: '#ff6600',
    urlTemplate: 'https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=',
  },
} as const;
