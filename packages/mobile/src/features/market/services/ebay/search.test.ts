import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { calculatePriceStats, recalculatePriceStats } from './calculateStats.ts';
import { parseListingsWithMarketplace } from './parseListings.ts';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

test('search helpers live in focused split files', () => {
  assert.equal(existsSync(path.join(currentDir, 'parseListings.ts')), true);
  assert.equal(existsSync(path.join(currentDir, 'calculateStats.ts')), true);
});

test('parseListingsWithMarketplace keeps only positive-price listings and adds marketplace metadata', () => {
  const listings = parseListingsWithMarketplace(
    [
      {
        itemId: 'keep-me',
        title: 'Nintendo Switch',
        price: { value: '129.99', currency: 'EUR' },
        condition: 'Gebraucht',
        thumbnailImages: [{ imageUrl: 'https://example.test/switch.jpg' }],
        itemWebUrl: 'https://example.test/item',
      },
      {
        itemId: 'drop-me',
        title: 'Broken listing',
        price: { value: '0', currency: 'EUR' },
      },
    ],
    'EBAY_DE',
  );

  assert.deepEqual(listings, [
    {
      id: 'keep-me',
      title: 'Nintendo Switch',
      price: 129.99,
      currency: 'EUR',
      condition: 'Gebraucht',
      imageUrl: 'https://example.test/switch.jpg',
      itemUrl: 'https://example.test/item',
      sold: false,
      marketplace: 'EBAY_DE',
      selected: false,
    },
  ]);
});

test('recalculatePriceStats uses selected listings only and keeps even-length median correct', () => {
  const listings = [
    { id: '1', title: 'A', price: 10, currency: 'EUR', condition: 'Used', imageUrl: '', itemUrl: '', sold: false, selected: true },
    { id: '2', title: 'B', price: 20, currency: 'EUR', condition: 'Used', imageUrl: '', itemUrl: '', sold: false, selected: true },
    { id: '3', title: 'C', price: 999, currency: 'EUR', condition: 'Used', imageUrl: '', itemUrl: '', sold: false, selected: false },
  ];

  assert.deepEqual(calculatePriceStats(listings.filter((listing) => listing.selected)), {
    minPrice: 10,
    maxPrice: 20,
    avgPrice: 15,
    medianPrice: 15,
  });

  assert.deepEqual(recalculatePriceStats(listings), {
    minPrice: 10,
    maxPrice: 20,
    avgPrice: 15,
    medianPrice: 15,
    totalListings: 2,
    soldListings: 0,
  });
});
