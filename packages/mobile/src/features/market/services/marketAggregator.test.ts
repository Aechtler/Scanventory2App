import test from 'node:test';
import assert from 'node:assert/strict';

type AggregateStatsModule = {
  aggregatePlatformPriceStats?: (platforms: Array<{
    priceStats: {
      minPrice: number;
      maxPrice: number;
      avgPrice: number;
      medianPrice: number;
      totalListings: number;
      soldListings: number;
    };
    listings: Array<{ price: number }>;
  }>) => {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    medianPrice: number;
    totalListings: number;
    soldListings: number;
  };
};

test('aggregatePlatformPriceStats uses real listing prices instead of linear interpolation', async () => {
  const module = (await import('./marketAggregatorStats.ts').catch(() => ({}))) as AggregateStatsModule;

  assert.equal(typeof module.aggregatePlatformPriceStats, 'function');

  const combined = module.aggregatePlatformPriceStats?.([
    {
      priceStats: {
        minPrice: 10,
        maxPrice: 100,
        avgPrice: 43.33,
        medianPrice: 20,
        totalListings: 3,
        soldListings: 1,
      },
      listings: [{ price: 10 }, { price: 20 }, { price: 100 }],
    },
    {
      priceStats: {
        minPrice: 25,
        maxPrice: 60,
        avgPrice: 42.5,
        medianPrice: 42.5,
        totalListings: 2,
        soldListings: 0,
      },
      listings: [{ price: 25 }, { price: 60 }],
    },
  ]);

  assert.deepEqual(combined, {
    minPrice: 10,
    maxPrice: 100,
    avgPrice: 43,
    medianPrice: 25,
    totalListings: 5,
    soldListings: 1,
  });
});

test('aggregatePlatformPriceStats falls back to platform medians when listings are unavailable', async () => {
  const module = (await import('./marketAggregatorStats.ts').catch(() => ({}))) as AggregateStatsModule;

  assert.equal(typeof module.aggregatePlatformPriceStats, 'function');

  const combined = module.aggregatePlatformPriceStats?.([
    {
      priceStats: {
        minPrice: 80,
        maxPrice: 140,
        avgPrice: 110,
        medianPrice: 100,
        totalListings: 4,
        soldListings: 0,
      },
      listings: [],
    },
    {
      priceStats: {
        minPrice: 20,
        maxPrice: 30,
        avgPrice: 25,
        medianPrice: 25,
        totalListings: 1,
        soldListings: 1,
      },
      listings: [],
    },
  ]);

  assert.deepEqual(combined, {
    minPrice: 20,
    maxPrice: 140,
    avgPrice: 93,
    medianPrice: 100,
    totalListings: 5,
    soldListings: 1,
  });
});
