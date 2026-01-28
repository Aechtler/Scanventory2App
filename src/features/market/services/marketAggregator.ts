/**
 * Market Aggregator Service
 * Fasst Ergebnisse von allen Plattformen zusammen
 */

import { searchMarket, formatPrice, MarketResult, PriceStats } from './ebayService';
import { searchKleinanzeigen } from './kleinanzeigenService';
import { searchAmazon } from './amazonService';
import { searchIdealo } from './idealoService';

export { formatPrice };

export interface AggregatedMarketResult {
  query: string;
  platforms: MarketResult[];
  combined: PriceStats;
  fetchedAt: Date;
}

/**
 * Sucht auf allen verfügbaren Plattformen und aggregiert die Ergebnisse
 */
export async function searchAllMarkets(
  query: string,
  category: string = 'Sonstiges'
): Promise<AggregatedMarketResult> {
  // Parallele Suche auf allen Plattformen
  const [ebay, kleinanzeigen, amazon, idealo] = await Promise.all([
    searchMarket(query, category),
    searchKleinanzeigen(query, category),
    searchAmazon(query, category),
    searchIdealo(query, category),
  ]);

  const platforms = [ebay, kleinanzeigen, amazon, idealo];

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
    query,
    platforms,
    combined,
    fetchedAt: new Date(),
  };
}
