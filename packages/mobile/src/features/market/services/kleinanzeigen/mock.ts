/**
 * Kleinanzeigen Mock Data
 * Used when the real API is not available
 * 
 * IMPORTANT: When mock data is used, we return null to indicate
 * no real results were found. The UI should then show a 
 * "Keine Ergebnisse" message with a link to search manually.
 */

import { MarketResult } from '../ebay/types';

/**
 * Returns null when real API fails - UI shows appropriate message
 * We no longer generate fake listings that mislead users
 */
export async function searchKleinanzeigenMock(
  query: string,
  _category: string = 'Sonstiges'
): Promise<MarketResult | null> {
  console.log('[Kleinanzeigen] API failed, returning null (no mock data)');
  
  // Return null instead of fake data
  // The UI component should handle this and show a "search manually" link
  return null;
}

/**
 * Generates a proper Kleinanzeigen search URL for manual searching
 */
export function getKleinanzeigenSearchUrl(query: string): string {
  return `https://www.kleinanzeigen.de/s-suchen/k0?keywords=${encodeURIComponent(query)}`;
}
