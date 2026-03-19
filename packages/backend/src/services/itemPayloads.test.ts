import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildCreateItemData,
  buildKleinanzeigenPriceUpdateData,
  buildMarketValueUpdateData,
  buildPriceUpdateData,
} from './itemPayloads.ts';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

test('item service split helper file exists', () => {
  assert.equal(existsSync(path.join(currentDir, 'itemService.ts')), true);
  assert.equal(existsSync(path.join(currentDir, 'itemPayloads.ts')), true);
});

test('buildCreateItemData normalizes optional fields and timestamps', () => {
  const created = buildCreateItemData(
    'user-1',
    {
      productName: 'Nintendo Switch',
      category: 'Console',
      condition: 'Used',
      confidence: 0.94,
      searchQuery: 'nintendo switch used',
      scannedAt: '2026-03-19T10:00:00.000Z',
      searchQueries: { ebay: 'switch', generic: 'nintendo switch' },
      priceStats: {
        minPrice: 100,
        maxPrice: 200,
        avgPrice: 150,
        medianPrice: 155,
        totalListings: 8,
        soldListings: 3,
      },
      ebayListingsFetchedAt: '2026-03-19T10:05:00.000Z',
      marketValueFetchedAt: undefined,
    },
    'switch.jpg'
  );

  assert.equal(created.userId, 'user-1');
  assert.equal(created.imageFilename, 'switch.jpg');
  assert.equal(created.brand, null);
  assert.equal(created.gtin, null);
  assert.equal(created.originalUri, null);
  assert.equal(created.kleinanzeigenListings, null);
  assert.equal(created.marketValue, null);
  assert.equal(created.ebayListingsFetchedAt?.toISOString(), '2026-03-19T10:05:00.000Z');
  assert.equal(created.marketValueFetchedAt, null);
  assert.equal(created.scannedAt.toISOString(), '2026-03-19T10:00:00.000Z');
});

test('buildPriceUpdateData only changes ebay listings when they are supplied', () => {
  const updated = buildPriceUpdateData(
    {
      minPrice: 10,
      maxPrice: 20,
      avgPrice: 15,
      medianPrice: 15,
      totalListings: 4,
      soldListings: 1,
    },
    undefined
  );

  assert.equal(updated.priceStats?.avgPrice, 15);
  assert.equal(updated.ebayListings, undefined);
  assert.ok(updated.ebayListingsFetchedAt instanceof Date);
});

test('buildKleinanzeigenPriceUpdateData and buildMarketValueUpdateData stamp fetch times', () => {
  const kleinanzeigenUpdate = buildKleinanzeigenPriceUpdateData([
    {
      id: 'ka-1',
      title: 'Nintendo Switch',
      price: 180,
      currency: 'EUR',
      condition: 'Used',
      imageUrl: 'https://example.com/image.jpg',
      itemUrl: 'https://example.com/item',
      sold: false,
    },
  ]);
  const marketValueUpdate = buildMarketValueUpdateData({
    estimatedPrice: '180 EUR',
    priceRange: '160-200 EUR',
    confidence: 'mittel',
    sources: ['ebay'],
    summary: 'Stable resale demand',
    rawResponse: 'raw',
  });

  assert.equal(kleinanzeigenUpdate.kleinanzeigenListings?.length, 1);
  assert.ok(kleinanzeigenUpdate.kleinanzeigenListingsFetchedAt instanceof Date);
  assert.equal(marketValueUpdate.marketValue?.estimatedPrice, '180 EUR');
  assert.ok(marketValueUpdate.marketValueFetchedAt instanceof Date);
});
