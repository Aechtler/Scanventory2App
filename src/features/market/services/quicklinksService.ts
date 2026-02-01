/**
 * Platform Quicklinks Service
 * Generiert Such-URLs für verschiedene Marktplätze
 */

import { Linking } from 'react-native';

export interface PlatformLink {
  platform: 'ebay' | 'kleinanzeigen' | 'amazon' | 'idealo';
  name: string;
  icon: string;
  color: string;
  url: string;
}

/**
 * Generiert Such-URLs für alle Plattformen
 */
export function generatePlatformLinks(searchQuery: string): PlatformLink[] {
  const encodedQuery = encodeURIComponent(searchQuery);
  
  return [
    {
      platform: 'ebay',
      name: 'eBay',
      icon: '🛒',
      color: '#e53238',
      url: `https://www.ebay.de/sch/i.html?_nkw=${encodedQuery}`,
    },
    {
      platform: 'kleinanzeigen',
      name: 'Kleinanzeigen',
      icon: '📦',
      color: '#86b817',
      url: `https://www.kleinanzeigen.de/s-suche/${encodedQuery}`,
    },
    {
      platform: 'amazon',
      name: 'Amazon',
      icon: '📱',
      color: '#ff9900',
      url: `https://www.amazon.de/s?k=${encodedQuery}`,
    },
    {
      platform: 'idealo',
      name: 'Idealo',
      icon: '🔍',
      color: '#ff6600',
      url: `https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=${encodedQuery}`,
    },
  ];
}

/**
 * Öffnet einen Plattform-Link im Browser
 */
export async function openPlatformLink(url: string): Promise<void> {
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  }
}

/**
 * Generiert eine Google-Suche als Fallback
 */
export function generateGoogleSearchUrl(searchQuery: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(searchQuery + ' Preis')}`;
}
