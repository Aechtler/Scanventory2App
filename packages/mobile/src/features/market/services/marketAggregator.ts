/**
 * Market Aggregator Service
 * Fasst Ergebnisse von allen Plattformen zusammen
 */

import { searchMarket, formatPrice, MarketResult, PriceStats } from '@/features/market/services/ebay';
import { searchAmazon } from '@/features/market/services/amazon';
import { searchIdealo } from '@/features/market/services/idealo';

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

  // Kombinierte Statistiken berechnen
  const allPrices: number[] = [];
  let totalListings = 0;
  let soldListings = 0;

  for (const platform of platforms) {
    // Approximiere Preisliste aus Statistiken
    for (let i = 0; i < platform.priceStats.totalListings; i++) {
      // Generiere Preise zwischen min und max
      const range = platform.priceStats.maxPrice - platform.priceStats.minPrice;
      const price = platform.priceStats.minPrice + (range * (i / platform.priceStats.totalListings));
      allPrices.push(price);
    }
    totalListings += platform.priceStats.totalListings;
    soldListings += platform.priceStats.soldListings;
  }

  allPrices.sort((a, b) => a - b);

  const avgPrice = allPrices.length > 0
    ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length
    : 0;

  const combined: PriceStats = {
    minPrice: Math.min(...platforms.map(p => p.priceStats.minPrice)),
    maxPrice: Math.max(...platforms.map(p => p.priceStats.maxPrice)),
    avgPrice: Math.round(avgPrice * 100) / 100,
    medianPrice: allPrices.length > 0 ? allPrices[Math.floor(allPrices.length / 2)] : 0,
    totalListings,
    soldListings,
  };

  return {
    query: displayQuery,
    platforms,
    combined,
    fetchedAt: new Date(),
  };
}
