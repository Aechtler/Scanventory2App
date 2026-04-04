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
import { createHistoryStoreState } from './state.ts';

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
    priceStats: { minPrice: 100, maxPrice: 150, avgPrice: 125, medianPrice: 127, totalListings: 10, soldListings: 4 },
    ebayListings: [],
    ebayListingsFetchedAt: '2026-03-18T12:00:00.000Z',
    marketValue: { estimatedPrice: '125 €', priceRange: '100–150 €', confidence: 'mittel' as const, sources: [], summary: 'Stable resale demand', rawResponse: '' },
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
    priceStats: { minPrice: 100, maxPrice: 150, avgPrice: 125, medianPrice: 127, totalListings: 10, soldListings: 4 },
    ebayListings: [],
    ebayListingsFetchedAt: '2026-03-18T12:00:00.000Z',
    marketValue: { estimatedPrice: '125 €', priceRange: '100–150 €', confidence: 'mittel' as const, sources: [], summary: 'Stable resale demand', rawResponse: '' },
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
      priceStats: { minPrice: 1, maxPrice: 2, avgPrice: 1.5, medianPrice: 1.5, totalListings: 0, soldListings: 0 },
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
      priceStats: { minPrice: 10, maxPrice: 20, avgPrice: 15, medianPrice: 15, totalListings: 0, soldListings: 0 },
      scannedAt: '2026-03-19T09:05:00.000Z',
      syncStatus: 'synced' as const,
      serverId: 'server-1',
    },
  ];

  const updatedItems = updateHistoryItemPrices(
    items,
    'target',
    { minPrice: 11, maxPrice: 19, avgPrice: 15, medianPrice: 15, totalListings: 0, soldListings: 0 },
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

test('createHistoryStoreState uses injected cache and sync dependencies', async () => {
  const calls: string[] = [];
  let currentState: ReturnType<typeof createHistoryStoreState>;

  const setState = (
    update:
      | Partial<ReturnType<typeof createHistoryStoreState>>
      | ((state: ReturnType<typeof createHistoryStoreState>) => Partial<ReturnType<typeof createHistoryStoreState>>),
  ) => {
    const nextPartial = typeof update === 'function' ? update(currentState) : update;
    currentState = { ...currentState, ...nextPartial };
  };

  const getState = () => currentState;

  currentState = createHistoryStoreState(setState, getState, {
    cacheImage: async (uri) => {
      calls.push(`cache:${uri}`);
      return `cached:${uri}`;
    },
    removeCachedImage: async (uri) => {
      calls.push(`remove-cache:${uri}`);
    },
    clearImageCache: async () => {
      calls.push('clear-cache');
    },
    syncNewItem: async (imageUri) => {
      calls.push(`sync-new:${imageUri}`);
      return 'server-item-1';
    },
    syncPrices: async (serverId) => {
      calls.push(`sync-prices:${serverId}`);
      return true;
    },
    syncMarketValue: async (serverId) => {
      calls.push(`sync-market-value:${serverId}`);
      return true;
    },
    syncItemUpdate: async (serverId) => {
      calls.push(`sync-update:${serverId}`);
      return true;
    },
    syncDeleteItem: async (serverId) => {
      calls.push(`sync-delete:${serverId}`);
      return true;
    },
    createId: () => 'scan-di-test',
    now: () => '2026-03-20T08:00:00.000Z',
  });

  const itemId = await currentState.addItem({
    imageUri: 'file:///tmp/injected.jpg',
    productName: 'Injected Item',
    category: 'Console',
    brand: 'Nintendo',
    condition: 'Used',
    confidence: 0.7,
    searchQuery: 'injected item',
    priceStats: { minPrice: 50, maxPrice: 70, avgPrice: 60, medianPrice: 60, totalListings: 0, soldListings: 0 },
  });

  assert.equal(itemId, 'scan-di-test');
  assert.equal(currentState.items[0]?.cachedImageUri, 'cached:file:///tmp/injected.jpg');
  assert.equal(currentState.items[0]?.serverId, 'server-item-1');
  assert.equal(currentState.items[0]?.syncStatus, 'synced');

  currentState.updateItemPrices(
    itemId,
    { minPrice: 55, maxPrice: 75, avgPrice: 65, medianPrice: 65, totalListings: 0, soldListings: 0 },
    [],
  );
  currentState.updateMarketValue(itemId, { estimatedPrice: '65 €', priceRange: '55–75 €', confidence: 'mittel', sources: [], summary: 'Growing demand', rawResponse: '' });
  currentState.updateItem(itemId, { productName: 'Injected Item Updated' });
  currentState.removeItem(itemId);
  currentState.clearHistory();

  assert.deepEqual(calls, [
    'cache:file:///tmp/injected.jpg',
    'sync-new:file:///tmp/injected.jpg',
    'sync-prices:server-item-1',
    'sync-market-value:server-item-1',
    'sync-update:server-item-1',
    'remove-cache:cached:file:///tmp/injected.jpg',
    'sync-delete:server-item-1',
    'clear-cache',
  ]);
  assert.equal(currentState.items.length, 0);
});
