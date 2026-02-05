/**
 * Amazon Market Service
 * 
 * Mock service simulating Amazon new price searches.
 * TODO: Integrate with Amazon Product Advertising API for real data.
 */

import { MarketResult, MarketListing } from '@/features/market/services/ebay/types';

// Amazon has higher prices (new items)
const PRICE_MODIFIER = 1.25;

const MOCK_PRICE_RANGES: Record<string, { min: number; max: number }> = {
  Elektronik: { min: 80, max: 1500 },
  Kleidung: { min: 20, max: 300 },
  Möbel: { min: 50, max: 1200 },
  Spielzeug: { min: 10, max: 200 },
  Sammlerstück: { min: 30, max: 800 },
  Sonstiges: { min: 15, max: 400 },
};

/**
 * Searches for products on Amazon (mock implementation)
 */
export async function searchAmazon(
  query: string,
  category: string = 'Sonstiges'
): Promise<MarketResult> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const priceRange = MOCK_PRICE_RANGES[category] || MOCK_PRICE_RANGES['Sonstiges'];
  
  const prices: number[] = [];
  const listingCount = 3 + Math.floor(Math.random() * 5);
  
  for (let i = 0; i < listingCount; i++) {
    const price = (priceRange.min + Math.random() * (priceRange.max - priceRange.min)) * PRICE_MODIFIER;
    prices.push(Math.round(price * 100) / 100);
  }
  
  prices.sort((a, b) => a - b);

  const listings: MarketListing[] = prices.map((price, index) => ({
    id: `amz-${index}`,
    title: `${query} - Neu`,
    price,
    currency: 'EUR',
    condition: 'Neu',
    imageUrl: '',
    itemUrl: `https://www.amazon.de/s?k=${encodeURIComponent(query)}`,
    sold: false,
  }));

  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

  return {
    query,
    platform: 'amazon',
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
