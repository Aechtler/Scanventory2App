/**
 * Platform Quicklinks Service
 *
 * Generates search URLs for various marketplaces.
 */

import { Linking } from 'react-native';
import { PlatformQueries, PlatformLink, PLATFORM_CONFIGS } from './types';

export type { PlatformQueries, PlatformLink } from './types';
export { PLATFORM_CONFIGS } from './types';

/** Kleinanzeigen nutzt Pfad-basierte URLs: Leerzeichen → Bindestriche, Sonderzeichen weg */
function toKleinanzeigenSlug(query: string): string {
  return query
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Baut die Such-URL fuer eine Plattform */
function buildPlatformUrl(platform: keyof typeof PLATFORM_CONFIGS, query: string): string {
  const template = PLATFORM_CONFIGS[platform].urlTemplate;

  if (platform === 'kleinanzeigen') {
    return template.replace('{query}', toKleinanzeigenSlug(query));
  }

  // eBay, Amazon, Idealo nutzen Query-Parameter
  return `${template}${encodeURIComponent(query)}`;
}

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

  const platforms: (keyof typeof PLATFORM_CONFIGS)[] = ['ebay', 'kleinanzeigen', 'amazon', 'idealo'];

  return platforms.map((platform) => ({
    platform,
    name: PLATFORM_CONFIGS[platform].name,
    icon: PLATFORM_CONFIGS[platform].icon,
    color: PLATFORM_CONFIGS[platform].color,
    url: buildPlatformUrl(platform, queries[platform] || queries.generic || ''),
  }));
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
