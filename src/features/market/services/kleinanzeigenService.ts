/**
 * Kleinanzeigen Market Service (Mock)
 * Simuliert Suchergebnisse von eBay Kleinanzeigen
 */

import { PriceStats, MarketResult, MarketListing } from './ebayService';

// Kleinanzeigen hat tendenziell niedrigere Preise (Privatverkauf)
const PRICE_MODIFIER = 0.85;

const MOCK_PRICE_RANGES: Record<string, { min: number; max: number }> = {
  Elektronik: { min: 40, max: 1000 },
  Kleidung: { min: 5, max: 150 },
  Möbel: { min: 20, max: 600 },
  Spielzeug: { min: 3, max: 100 },
  Sammlerstück: { min: 15, max: 400 },
  Sonstiges: { min: 5, max: 200 },
};

export async function searchKleinanzeigen(
  query: string,
  category: string = 'Sonstiges'
): Promise<MarketResult> {
  // Simuliere API-Latenz
  await new Promise((resolve) => setTimeout(resolve, 600));

  const priceRange = MOCK_PRICE_RANGES[category] || MOCK_PRICE_RANGES['Sonstiges'];
  
  const prices: number[] = [];
  const listingCount = 5 + Math.floor(Math.random() * 8);
  
  for (let i = 0; i < listingCount; i++) {
    const price = (priceRange.min + Math.random() * (priceRange.max - priceRange.min)) * PRICE_MODIFIER;
    prices.push(Math.round(price * 100) / 100);
  }
  
  prices.sort((a, b) => a - b);

  const listings: MarketListing[] = prices.map((price, index) => ({
    id: `ka-${index}`,
    title: `${query} - Privatverkauf ${index + 1}`,
    price,
    currency: 'EUR',
    condition: ['Wie neu', 'Gut', 'Akzeptabel'][Math.floor(Math.random() * 3)],
    imageUrl: '',
    itemUrl: `https://www.kleinanzeigen.de/s-${encodeURIComponent(query)}`,
    sold: Math.random() > 0.6,
  }));

  const soldPrices = listings.filter((l) => l.sold).map((l) => l.price);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

  return {
    query,
    platform: 'kleinanzeigen',
    priceStats: {
      minPrice: prices[0],
      maxPrice: prices[prices.length - 1],
      avgPrice: Math.round(avgPrice * 100) / 100,
      medianPrice: prices[Math.floor(prices.length / 2)],
      totalListings: listings.length,
      soldListings: soldPrices.length,
    },
    listings,
    fetchedAt: new Date(),
  };
}
