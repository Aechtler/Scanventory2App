import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildHistorySyncPayload,
  createHistoryItem,
  updateHistoryItemPrices,
} from './actions.ts';
import { getHistoryItemById } from './selectors.ts';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

test('history store split helpers live in focused files', () => {
  assert.equal(existsSync(path.join(currentDir, 'actions.ts')), true);
  assert.equal(existsSync(path.join(currentDir, 'selectors.ts')), true);
});

test('createHistoryItem builds a pending history item and sync payload excludes local-only fields', () => {
  const baseItem = {
    imageUri: 'file:///tmp/item.jpg',
    productName: 'Nintendo Switch',
    category: 'Console',
    brand: 'Nintendo',
    condition: 'Used',
    confidence: 0.82,
    searchQuery: 'nintendo switch',
    searchQueries: { ebay: 'nintendo switch console' },
    gtin: '0045496596782',
    priceStats: { minPrice: 100, maxPrice: 150, avgPrice: 125, medianPrice: 127 },
    ebayListings: [],
    ebayListingsFetchedAt: '2026-03-18T12:00:00.000Z',
    marketValue: { summary: 'Stable resale demand' },
    marketValueFetchedAt: '2026-03-18T12:05:00.000Z',
  };

  const historyItem = createHistoryItem(baseItem, {
    cachedImageUri: 'file:///cache/item.jpg',
    now: '2026-03-19T10:00:00.000Z',
    createId: () => 'scan-fixed-id',
  });

  assert.deepEqual(historyItem, {
    ...baseItem,
    id: 'scan-fixed-id',
    cachedImageUri: 'file:///cache/item.jpg',
    syncStatus: 'pending',
    scannedAt: '2026-03-19T10:00:00.000Z',
  });

  assert.deepEqual(buildHistorySyncPayload(baseItem, historyItem.scannedAt), {
    productName: 'Nintendo Switch',
    category: 'Console',
    brand: 'Nintendo',
    condition: 'Used',
    confidence: 0.82,
    gtin: '0045496596782',
    searchQuery: 'nintendo switch',
    searchQueries: { ebay: 'nintendo switch console' },
    priceStats: { minPrice: 100, maxPrice: 150, avgPrice: 125, medianPrice: 127 },
    ebayListings: [],
    ebayListingsFetchedAt: '2026-03-18T12:00:00.000Z',
    marketValue: { summary: 'Stable resale demand' },
    marketValueFetchedAt: '2026-03-18T12:05:00.000Z',
    scannedAt: '2026-03-19T10:00:00.000Z',
  });
});

test('updateHistoryItemPrices updates the matching item and selectors find it by id', () => {
  const items = [
    {
      id: 'keep',
      imageUri: 'file:///tmp/keep.jpg',
      productName: 'Keep',
      category: 'A',
      brand: null,
      condition: 'Used',
      confidence: 0.5,
      searchQuery: 'keep',
      priceStats: { minPrice: 1, maxPrice: 2, avgPrice: 1.5, medianPrice: 1.5 },
      scannedAt: '2026-03-19T09:00:00.000Z',
      syncStatus: 'pending' as const,
    },
    {
      id: 'target',
      imageUri: 'file:///tmp/target.jpg',
      productName: 'Target',
      category: 'B',
      brand: 'Brand',
      condition: 'New',
      confidence: 0.9,
      searchQuery: 'target',
      priceStats: { minPrice: 10, maxPrice: 20, avgPrice: 15, medianPrice: 15 },
      scannedAt: '2026-03-19T09:05:00.000Z',
      syncStatus: 'synced' as const,
      serverId: 'server-1',
    },
  ];

  const updatedItems = updateHistoryItemPrices(
    items,
    'target',
    { minPrice: 11, maxPrice: 19, avgPrice: 15, medianPrice: 15 },
    [{ id: 'listing-1', title: 'Listing', price: 15, currency: 'EUR', condition: 'Used', imageUrl: '', itemUrl: '', sold: false, selected: true }],
    '2026-03-19T10:30:00.000Z',
  );

  assert.deepEqual(getHistoryItemById(updatedItems, 'target'), {
    id: 'target',
    imageUri: 'file:///tmp/target.jpg',
    productName: 'Target',
    category: 'B',
    brand: 'Brand',
    condition: 'New',
    confidence: 0.9,
    searchQuery: 'target',
    priceStats: { minPrice: 11, maxPrice: 19, avgPrice: 15, medianPrice: 15 },
    scannedAt: '2026-03-19T09:05:00.000Z',
    syncStatus: 'synced',
    serverId: 'server-1',
    ebayListings: [
      {
        id: 'listing-1',
        title: 'Listing',
        price: 15,
        currency: 'EUR',
        condition: 'Used',
        imageUrl: '',
        itemUrl: '',
        sold: false,
        selected: true,
      },
    ],
    ebayListingsFetchedAt: '2026-03-19T10:30:00.000Z',
  });

  assert.equal(getHistoryItemById(updatedItems, 'keep')?.priceStats.avgPrice, 1.5);
});
