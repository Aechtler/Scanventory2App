import type { MarketResult, PriceStats } from './ebay/types';

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function calculateMedian(prices: number[]): number {
  if (prices.length === 0) {
    return 0;
  }

  const sortedPrices = [...prices].sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedPrices.length / 2);

  return sortedPrices.length % 2 === 0
    ? (sortedPrices[middleIndex - 1] + sortedPrices[middleIndex]) / 2
    : sortedPrices[middleIndex];
}

export function aggregatePlatformPriceStats(platforms: MarketResult[]): PriceStats {
  if (platforms.length === 0) {
    return {
      minPrice: 0,
      maxPrice: 0,
      avgPrice: 0,
      medianPrice: 0,
      totalListings: 0,
      soldListings: 0,
    };
  }

  const medianSamples: number[] = [];
  let weightedPriceSum = 0;
  let totalListings = 0;
  let soldListings = 0;

  for (const platform of platforms) {
    const listingPrices = platform.listings
      .map((listing) => listing.price)
      .filter((price) => Number.isFinite(price) && price > 0);

    if (listingPrices.length > 0) {
      medianSamples.push(...listingPrices);
      weightedPriceSum += listingPrices.reduce((sum, price) => sum + price, 0);
    } else if (platform.priceStats.totalListings > 0) {
      medianSamples.push(...Array.from(
        { length: platform.priceStats.totalListings },
        () => platform.priceStats.medianPrice,
      ));
      weightedPriceSum += platform.priceStats.avgPrice * platform.priceStats.totalListings;
    }

    totalListings += platform.priceStats.totalListings;
    soldListings += platform.priceStats.soldListings;
  }

  return {
    minPrice: Math.min(...platforms.map((platform) => platform.priceStats.minPrice)),
    maxPrice: Math.max(...platforms.map((platform) => platform.priceStats.maxPrice)),
    avgPrice: totalListings > 0 ? roundToCents(weightedPriceSum / totalListings) : 0,
    medianPrice: calculateMedian(medianSamples),
    totalListings,
    soldListings,
  };
}
