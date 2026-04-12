import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createHistoryItem,
  createHistoryItemId,
  markHistoryItemSynced,
  markHistoryItemSyncFailed,
  removeHistoryItemById,
  updateHistoryItemFields,
  updateHistoryItemPrices,
  updateHistoryItemMarketValue,
  buildHistorySyncPayload,
} from './actions.ts';
import type { HistoryItem, HistoryItemDraft } from './types.ts';

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function makeDraft(overrides: Partial<HistoryItemDraft> = {}): HistoryItemDraft {
  return {
    imageUri: 'https://example.com/image.jpg',
    productName: 'Test-Produkt',
    category: 'Elektronik',
    brand: 'Sony',
    condition: 'Used',
    confidence: 0.9,
    searchQuery: 'test produkt',
    priceStats: null,
    ...overrides,
  } as HistoryItemDraft;
}

function makeItem(id: string, overrides: Partial<HistoryItem> = {}): HistoryItem {
  return {
    id,
    imageUri: 'https://example.com/image.jpg',
    productName: 'Test-Produkt',
    category: 'Elektronik',
    brand: null,
    condition: 'Used',
    confidence: 0.9,
    searchQuery: '',
    priceStats: null,
    scannedAt: '2026-01-01T00:00:00.000Z',
    syncStatus: 'pending',
    ...overrides,
  } as HistoryItem;
}

// ─── createHistoryItemId ──────────────────────────────────────────────────────

test('createHistoryItemId erstellt eine eindeutige ID mit scan-Präfix', () => {
  const id = createHistoryItemId();

  assert.ok(id.startsWith('scan-'), `erwartet scan-Präfix, erhalten: ${id}`);
});

test('createHistoryItemId erstellt keine doppelten IDs', () => {
  const ids = Array.from({ length: 50 }, () => createHistoryItemId());
  const unique = new Set(ids);

  assert.equal(unique.size, 50, 'Duplikate in generierten IDs gefunden');
});

// ─── createHistoryItem ────────────────────────────────────────────────────────

test('createHistoryItem setzt syncStatus auf "pending"', () => {
  const item = createHistoryItem(makeDraft());

  assert.equal(item.syncStatus, 'pending');
});

test('createHistoryItem übernimmt alle Draft-Felder', () => {
  const draft = makeDraft({ productName: 'PlayStation 5', category: 'Konsolen' });
  const item = createHistoryItem(draft);

  assert.equal(item.productName, 'PlayStation 5');
  assert.equal(item.category, 'Konsolen');
});

test('createHistoryItem erzeugt eine ID', () => {
  const item = createHistoryItem(makeDraft());

  assert.ok(item.id.length > 0, 'id darf nicht leer sein');
});

test('createHistoryItem verwendet createId-Option wenn übergeben', () => {
  const item = createHistoryItem(makeDraft(), { createId: () => 'custom-id-123' });

  assert.equal(item.id, 'custom-id-123');
});

test('createHistoryItem setzt cachedImageUri aus Options', () => {
  const item = createHistoryItem(makeDraft(), {
    cachedImageUri: '/local/cache/img.jpg',
  });

  assert.equal(item.cachedImageUri, '/local/cache/img.jpg');
});

test('createHistoryItem verwendet now-Option für scannedAt', () => {
  const fixedTime = '2026-04-12T10:00:00.000Z';
  const item = createHistoryItem(makeDraft(), { now: fixedTime });

  assert.equal(item.scannedAt, fixedTime);
});

test('createHistoryItem setzt scannedAt automatisch wenn now fehlt', () => {
  const before = new Date().toISOString();
  const item = createHistoryItem(makeDraft());
  const after = new Date().toISOString();

  assert.ok(item.scannedAt >= before, 'scannedAt liegt vor dem Test');
  assert.ok(item.scannedAt <= after, 'scannedAt liegt nach dem Test');
});

// ─── markHistoryItemSynced ────────────────────────────────────────────────────

test('markHistoryItemSynced setzt syncStatus auf "synced"', () => {
  const items = [makeItem('a'), makeItem('b')];
  const result = markHistoryItemSynced(items, 'a', 'server-123');

  assert.equal(result.find((i) => i.id === 'a')?.syncStatus, 'synced');
});

test('markHistoryItemSynced setzt serverId', () => {
  const items = [makeItem('a')];
  const result = markHistoryItemSynced(items, 'a', 'server-xyz');

  assert.equal(result[0].serverId, 'server-xyz');
});

test('markHistoryItemSynced lässt andere Items unverändert', () => {
  const items = [makeItem('a', { syncStatus: 'pending' }), makeItem('b', { syncStatus: 'pending' })];
  const result = markHistoryItemSynced(items, 'a', 'server-123');

  assert.equal(result.find((i) => i.id === 'b')?.syncStatus, 'pending');
});

test('markHistoryItemSynced tut nichts wenn ID nicht existiert', () => {
  const items = [makeItem('a')];
  const result = markHistoryItemSynced(items, 'unbekannt', 'server-123');

  assert.equal(result[0].syncStatus, 'pending');
  assert.equal(result[0].serverId, undefined);
});

// ─── markHistoryItemSyncFailed ────────────────────────────────────────────────

test('markHistoryItemSyncFailed setzt syncStatus auf "failed"', () => {
  const items = [makeItem('a')];
  const result = markHistoryItemSyncFailed(items, 'a');

  assert.equal(result[0].syncStatus, 'failed');
});

test('markHistoryItemSyncFailed lässt andere Items unverändert', () => {
  const items = [makeItem('a'), makeItem('b', { syncStatus: 'synced' })];
  const result = markHistoryItemSyncFailed(items, 'a');

  assert.equal(result.find((i) => i.id === 'b')?.syncStatus, 'synced');
});

// ─── removeHistoryItemById ────────────────────────────────────────────────────

test('removeHistoryItemById entfernt das Item mit der gegebenen ID', () => {
  const items = [makeItem('a'), makeItem('b'), makeItem('c')];
  const result = removeHistoryItemById(items, 'b');

  assert.equal(result.length, 2);
  assert.ok(!result.find((i) => i.id === 'b'), 'b sollte entfernt sein');
});

test('removeHistoryItemById behält alle anderen Items', () => {
  const items = [makeItem('a'), makeItem('b')];
  const result = removeHistoryItemById(items, 'a');

  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'b');
});

test('removeHistoryItemById gibt leeres Array zurück wenn letztes Item entfernt wird', () => {
  const result = removeHistoryItemById([makeItem('solo')], 'solo');

  assert.deepEqual(result, []);
});

test('removeHistoryItemById gibt unverändertes Array zurück wenn ID nicht existiert', () => {
  const items = [makeItem('a'), makeItem('b')];
  const result = removeHistoryItemById(items, 'unbekannt');

  assert.equal(result.length, 2);
});

// ─── updateHistoryItemFields ──────────────────────────────────────────────────

test('updateHistoryItemFields aktualisiert gegebene Felder', () => {
  const items = [makeItem('a', { productName: 'Alt' })];
  const result = updateHistoryItemFields(items, 'a', { productName: 'Neu' });

  assert.equal(result[0].productName, 'Neu');
});

test('updateHistoryItemFields überschreibt nur die angegebenen Felder', () => {
  const items = [makeItem('a', { productName: 'Original', category: 'Elektronik' })];
  const result = updateHistoryItemFields(items, 'a', { productName: 'Geändert' });

  assert.equal(result[0].productName, 'Geändert');
  assert.equal(result[0].category, 'Elektronik');
});

test('updateHistoryItemFields lässt andere Items unverändert', () => {
  const items = [makeItem('a', { productName: 'A' }), makeItem('b', { productName: 'B' })];
  const result = updateHistoryItemFields(items, 'a', { productName: 'A-Neu' });

  assert.equal(result.find((i) => i.id === 'b')?.productName, 'B');
});

// ─── updateHistoryItemPrices ──────────────────────────────────────────────────

test('updateHistoryItemPrices aktualisiert priceStats für das gegebene Item', () => {
  const items = [makeItem('a')];
  const stats = { minPrice: 10, maxPrice: 50, avgPrice: 30, medianPrice: 28, totalListings: 5, soldListings: 2 };
  const result = updateHistoryItemPrices(items, 'a', stats);

  assert.deepEqual(result[0].priceStats, stats);
});

test('updateHistoryItemPrices setzt ebayListingsFetchedAt', () => {
  const items = [makeItem('a')];
  const stats = { minPrice: 0, maxPrice: 0, avgPrice: 0, medianPrice: 0, totalListings: 0, soldListings: 0 };
  const result = updateHistoryItemPrices(items, 'a', stats, undefined, '2026-04-12T10:00:00.000Z');

  assert.equal(result[0].ebayListingsFetchedAt, '2026-04-12T10:00:00.000Z');
});

// ─── updateHistoryItemMarketValue ─────────────────────────────────────────────

test('updateHistoryItemMarketValue setzt marketValue für das gegebene Item', () => {
  const items = [makeItem('a')];
  const mv = { summary: 'stabil', estimatedValue: 150 } as HistoryItem['marketValue'];
  const result = updateHistoryItemMarketValue(items, 'a', mv!);

  assert.deepEqual(result[0].marketValue, mv);
});

// ─── buildHistorySyncPayload ──────────────────────────────────────────────────

test('buildHistorySyncPayload enthält alle nötigen Felder', () => {
  const draft = makeDraft({ productName: 'Kamera', category: 'Foto', brand: 'Canon' });
  const payload = buildHistorySyncPayload(draft, '2026-04-12T10:00:00.000Z');

  assert.equal(payload.productName, 'Kamera');
  assert.equal(payload.category, 'Foto');
  assert.equal(payload.brand, 'Canon');
  assert.equal(payload.scannedAt, '2026-04-12T10:00:00.000Z');
});

test('buildHistorySyncPayload enthält kein id-Feld', () => {
  const payload = buildHistorySyncPayload(makeDraft(), '2026-04-12T10:00:00.000Z');

  assert.ok(!('id' in payload), 'id sollte nicht im Sync-Payload enthalten sein');
});
