/**
 * Kleinanzeigen Service
 * 
 * Searches for products on Kleinanzeigen (formerly eBay Kleinanzeigen)
 */

import { MarketResult } from '@/features/market/services/ebay/types';
import { searchKleinanzeigenReal } from '@/features/market/services/kleinanzeigen/api';
import { searchKleinanzeigenMock } from '@/features/market/services/kleinanzeigen/mock';

export type { KleinanzeigenConfig } from '@/features/market/services/kleinanzeigen/types';
export { KLEINANZEIGEN_CONFIG } from '@/features/market/services/kleinanzeigen/types';

/**
 * Searches for products on Kleinanzeigen
 * Tries the real API first, falls back to mock data on error
 */
export async function searchKleinanzeigen(
  query: string,
  category: string = 'Sonstiges'
): Promise<MarketResult> {
  const realResult = await searchKleinanzeigenReal(query);

  if (realResult) {
    return realResult;
  }

  return searchKleinanzeigenMock(query, category);
}
