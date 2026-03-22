import test from 'node:test';
import assert from 'node:assert/strict';

import { getHistoryItemById } from './selectors.ts';

// Minimaler HistoryItem-Stub (nur Pflichtfelder für den Selector)
function makeItem(id: string, productName = 'Test Item') {
  return {
    id,
    imageUri: '',
    productName,
    category: 'Elektronik',
    brand: null,
    condition: 'Gut',
    confidence: 0.9,
    searchQuery: productName,
    priceStats: {
      minPrice: 0,
      maxPrice: 0,
      avgPrice: 0,
      medianPrice: 0,
      totalListings: 0,
      soldListings: 0,
    },
    scannedAt: new Date().toISOString(),
  };
}

// ─── getHistoryItemById ────────────────────────────────────────────────────────

test('getHistoryItemById findet ein Item anhand seiner ID', () => {
  const items = [makeItem('abc'), makeItem('def'), makeItem('xyz')];
  const found = getHistoryItemById(items, 'def');
  assert.ok(found !== undefined, 'Erwartet ein gefundenes Item');
  assert.equal(found!.id, 'def');
});

test('getHistoryItemById gibt undefined zurück wenn ID nicht existiert', () => {
  const items = [makeItem('abc'), makeItem('def')];
  const found = getHistoryItemById(items, 'does-not-exist');
  assert.equal(found, undefined);
});

test('getHistoryItemById gibt undefined zurück bei leerer Liste', () => {
  const found = getHistoryItemById([], 'abc');
  assert.equal(found, undefined);
});

test('getHistoryItemById findet das erste Element der Liste', () => {
  const items = [makeItem('first'), makeItem('second'), makeItem('third')];
  const found = getHistoryItemById(items, 'first');
  assert.ok(found !== undefined);
  assert.equal(found!.id, 'first');
});

test('getHistoryItemById findet das letzte Element der Liste', () => {
  const items = [makeItem('first'), makeItem('second'), makeItem('last')];
  const found = getHistoryItemById(items, 'last');
  assert.ok(found !== undefined);
  assert.equal(found!.id, 'last');
});

test('getHistoryItemById gibt das vollständige Item-Objekt zurück', () => {
  const item = makeItem('my-id', 'Nintendo Switch');
  const found = getHistoryItemById([item], 'my-id');
  assert.deepEqual(found, item);
});

test('getHistoryItemById ist case-sensitive bei der ID', () => {
  const items = [makeItem('Item-001')];
  assert.equal(getHistoryItemById(items, 'item-001'), undefined);
  assert.equal(getHistoryItemById(items, 'ITEM-001'), undefined);
  assert.ok(getHistoryItemById(items, 'Item-001') !== undefined);
});

test('getHistoryItemById funktioniert mit einer Liste mit einem einzigen Item', () => {
  const items = [makeItem('solo')];
  const found = getHistoryItemById(items, 'solo');
  assert.ok(found !== undefined);
  assert.equal(found!.id, 'solo');
});

test('getHistoryItemById gibt immer das erste Treffer zurück (bei hypothetischen Duplikaten)', () => {
  // Duplikate sollten nicht vorkommen, aber der Selector nutzt .find() → gibt das erste zurück
  const items = [
    makeItem('dup', 'First'),
    makeItem('dup', 'Second'),
  ];
  const found = getHistoryItemById(items, 'dup');
  assert.ok(found !== undefined);
  assert.equal(found!.productName, 'First');
});
