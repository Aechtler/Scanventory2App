/**
 * Idealo Market Service (Mock)
 * Simuliert Preisvergleich-Ergebnisse von Idealo
 */

import { PriceStats, MarketResult, MarketListing } from './ebayService';

// Idealo zeigt beste Angebote verschiedener Händler
const RETAILERS = [
  'MediaMarkt', 'Saturn', 'Amazon', 'Otto', 'Alternate', 
  'Notebooksbilliger', 'Cyberport', 'Expert'
];

const MOCK_PRICE_RANGES: Record<string, { min: number; max: number }> = {
  Elektronik: { min: 60, max: 1300 },
  Kleidung: { min: 15, max: 250 },
  Möbel: { min: 40, max: 1000 },
  Spielzeug: { min: 8, max: 180 },
  Sammlerstück: { min: 25, max: 600 },
  Sonstiges: { min: 12, max: 350 },
};

export async function searchIdealo(
  query: string,
  category: string = 'Sonstiges'
): Promise<MarketResult> {
  // Simuliere API-Latenz
  await new Promise((resolve) => setTimeout(resolve, 700));

  const priceRange = MOCK_PRICE_RANGES[category] || MOCK_PRICE_RANGES['Sonstiges'];
  
  const prices: number[] = [];
  const listingCount = 4 + Math.floor(Math.random() * 6);
  
  for (let i = 0; i < listingCount; i++) {
    const price = priceRange.min + Math.random() * (priceRange.max - priceRange.min);
    prices.push(Math.round(price * 100) / 100);
  }
  
  prices.sort((a, b) => a - b);

  const listings: MarketListing[] = prices.map((price, index) => {
    const retailer = RETAILERS[Math.floor(Math.random() * RETAILERS.length)];
    return {
      id: `idealo-${index}`,
      title: `${query} bei ${retailer}`,
      price,
      currency: 'EUR',
      condition: 'Neu',
      imageUrl: '',
      itemUrl: `https://www.idealo.de/preisvergleich/ProductCategory/${encodeURIComponent(query)}.html`,
      sold: false,
    };
  });

  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

  return {
    query,
    platform: 'idealo' as const,
    priceStats: {
      minPrice: prices[0],
      maxPrice: prices[prices.length - 1],
      avgPrice: Math.round(avgPrice * 100) / 100,
      medianPrice: prices[Math.floor(prices.length / 2)],
      totalListings: listings.length,
      soldListings: 0,
    },
    listings,
    fetchedAt: new Date(),
  };
}
