/**
 * Kleinanzeigen Service
 * 
 * Searches for products on Kleinanzeigen (formerly eBay Kleinanzeigen)
 */

import { MarketResult } from '../ebay/types';
import { searchKleinanzeigenReal } from './api';
import { searchKleinanzeigenMock } from './mock';

export type { KleinanzeigenConfig } from './types';
export { KLEINANZEIGEN_CONFIG } from './types';

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
