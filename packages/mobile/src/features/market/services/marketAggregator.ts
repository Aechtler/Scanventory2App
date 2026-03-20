/**
 * Market Aggregator Service
 * Fasst Ergebnisse von allen Plattformen zusammen
 */

import { searchMarket, formatPrice, MarketResult, PriceStats } from '@/features/market/services/ebay';
import { searchAmazon } from '@/features/market/services/amazon';
import { searchIdealo } from '@/features/market/services/idealo';
import { aggregatePlatformPriceStats } from '@/features/market/services/marketAggregatorStats';

export { formatPrice };

export interface PlatformQueries {
  ebay?: string;
  amazon?: string;
  idealo?: string;
  generic?: string;
}

export interface AggregatedMarketResult {
  query: string;
  platforms: MarketResult[];
  combined: PriceStats;
  fetchedAt: Date;
}

/**
 * Sucht auf allen verfügbaren Plattformen und aggregiert die Ergebnisse
 * @param query - Entweder ein String oder ein Objekt mit plattform-spezifischen Queries
 * @param category - Produktkategorie
 */
export async function searchAllMarkets(
  query: string | PlatformQueries,
  category: string = 'Sonstiges'
): Promise<AggregatedMarketResult> {
  // Extrahiere plattform-spezifische Queries
  let queries: PlatformQueries;
  let displayQuery: string;

  if (typeof query === 'string') {
    // Fallback: Verwende gleichen Query für alle Plattformen
    queries = {
      ebay: query,
      amazon: query,
      idealo: query,
      generic: query,
    };
    displayQuery = query;
  } else {
    queries = query;
    displayQuery = query.generic || query.ebay || query.amazon || query.idealo || '';
  }

  console.log('[MarketAggregator] Platform-specific queries:', queries);

  // Parallele Suche auf allen Plattformen mit spezifischen Queries
  const [ebay, amazon, idealo] = await Promise.all([
    searchMarket(queries.ebay || queries.generic || ''),
    searchAmazon(queries.amazon || queries.generic || '', category),
    searchIdealo(queries.idealo || queries.generic || '', category),
  ]);

  const platforms = [ebay, amazon, idealo].filter((p): p is MarketResult => p !== null);

  const combined: PriceStats = aggregatePlatformPriceStats(platforms);

  return {
    query: displayQuery,
    platforms,
    combined,
    fetchedAt: new Date(),
  };
}
