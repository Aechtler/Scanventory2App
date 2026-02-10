/**
 * Kleinanzeigen Service
 * 
 * Searches for products on Kleinanzeigen (formerly eBay Kleinanzeigen)
 */

import { MarketResult } from '@/features/market/services/ebay/types';
import { searchKleinanzeigenReal } from '@/features/market/services/kleinanzeigen/api';
import { searchKleinanzeigenMock, getKleinanzeigenSearchUrl } from '@/features/market/services/kleinanzeigen/mock';

export type { KleinanzeigenConfig } from '@/features/market/services/kleinanzeigen/types';
export { KLEINANZEIGEN_CONFIG } from '@/features/market/services/kleinanzeigen/types';
export { getKleinanzeigenSearchUrl };

/**
 * Searches for products on Kleinanzeigen
 * Returns null if no results found, throws on network/API errors
 */
export async function searchKleinanzeigen(
  query: string,
  category: string = 'Sonstiges'
): Promise<MarketResult | null> {
  const realResult = await searchKleinanzeigenReal(query);

  if (realResult) {
    return realResult;
  }

  // Mock also returns null now - no fake data
  return searchKleinanzeigenMock(query, category);
}
