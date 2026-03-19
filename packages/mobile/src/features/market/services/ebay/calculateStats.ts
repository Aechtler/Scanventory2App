import type { MarketListing, PriceStats } from './types';

type SearchPriceStats = Omit<PriceStats, 'totalListings' | 'soldListings'>;

export function calculatePriceStats(listings: MarketListing[]): SearchPriceStats {
  const prices = listings.map((listing) => listing.price).sort((a, b) => a - b);

  if (prices.length === 0) {
    return { minPrice: 0, maxPrice: 0, avgPrice: 0, medianPrice: 0 };
  }

  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const middleIndex = Math.floor(prices.length / 2);
  const medianPrice = prices.length % 2 !== 0
    ? prices[middleIndex]
    : (prices[middleIndex - 1] + prices[middleIndex]) / 2;

  return {
    minPrice: prices[0],
    maxPrice: prices[prices.length - 1],
    avgPrice: Math.round(avgPrice * 100) / 100,
    medianPrice,
  };
}

export function recalculatePriceStats(listings: MarketListing[]): PriceStats {
  const selectedListings = listings.filter((listing) => listing.selected);
  const stats = calculatePriceStats(selectedListings);

  return {
    ...stats,
    totalListings: selectedListings.length,
    soldListings: 0,
  };
}
