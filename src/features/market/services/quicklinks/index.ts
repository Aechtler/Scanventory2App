/**
 * Platform Quicklinks Service
 * 
 * Generates search URLs for various marketplaces.
 */

import { Linking } from 'react-native';
import { PlatformQueries, PlatformLink, PLATFORM_CONFIGS } from './types';

export type { PlatformQueries, PlatformLink } from './types';
export { PLATFORM_CONFIGS } from './types';

/**
 * Generates search URLs for all platforms
 * @param searchQuery - Either a string or an object with platform-specific queries
 */
export function generatePlatformLinks(
  searchQuery: string | PlatformQueries
): PlatformLink[] {
  let queries: PlatformQueries;

  if (typeof searchQuery === 'string') {
    queries = {
      ebay: searchQuery,
      kleinanzeigen: searchQuery,
      amazon: searchQuery,
      idealo: searchQuery,
      generic: searchQuery,
    };
  } else {
    queries = searchQuery;
  }

  return [
    {
      platform: 'ebay',
      name: PLATFORM_CONFIGS.ebay.name,
      icon: PLATFORM_CONFIGS.ebay.icon,
      color: PLATFORM_CONFIGS.ebay.color,
      url: `${PLATFORM_CONFIGS.ebay.urlTemplate}${encodeURIComponent(queries.ebay || queries.generic || '')}`,
    },
    {
      platform: 'kleinanzeigen',
      name: PLATFORM_CONFIGS.kleinanzeigen.name,
      icon: PLATFORM_CONFIGS.kleinanzeigen.icon,
      color: PLATFORM_CONFIGS.kleinanzeigen.color,
      url: `${PLATFORM_CONFIGS.kleinanzeigen.urlTemplate}${encodeURIComponent(queries.kleinanzeigen || queries.generic || '')}`,
    },
    {
      platform: 'amazon',
      name: PLATFORM_CONFIGS.amazon.name,
      icon: PLATFORM_CONFIGS.amazon.icon,
      color: PLATFORM_CONFIGS.amazon.color,
      url: `${PLATFORM_CONFIGS.amazon.urlTemplate}${encodeURIComponent(queries.amazon || queries.generic || '')}`,
    },
    {
      platform: 'idealo',
      name: PLATFORM_CONFIGS.idealo.name,
      icon: PLATFORM_CONFIGS.idealo.icon,
      color: PLATFORM_CONFIGS.idealo.color,
      url: `${PLATFORM_CONFIGS.idealo.urlTemplate}${encodeURIComponent(queries.idealo || queries.generic || '')}`,
    },
  ];
}

/**
 * Opens a platform link in the browser
 */
export async function openPlatformLink(url: string): Promise<void> {
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  }
}

/**
 * Generates a Google search as fallback
 */
export function generateGoogleSearchUrl(searchQuery: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(searchQuery + ' Preis')}`;
}
