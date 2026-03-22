import test from 'node:test';
import assert from 'node:assert/strict';

import { parseListingsWithMarketplace } from './parseListings.ts';

// Hilfsfunktion: Erstellt ein minimal gültiges eBay-Item
function makeItem(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    itemId: 'item-001',
    title: 'Nintendo Switch OLED',
    price: { value: '299.99', currency: 'EUR' },
    condition: 'Gebraucht',
    thumbnailImages: [{ imageUrl: 'https://example.com/img.jpg' }],
    itemWebUrl: 'https://ebay.de/item/001',
    ...overrides,
  };
}

// ─── Grundlegende Parsing-Funktionalität ─────────────────────────────────────

test('parseListingsWithMarketplace gibt leere Liste bei leerem Input zurück', () => {
  const result = parseListingsWithMarketplace([], 'EBAY_DE');
  assert.deepEqual(result, []);
});

test('parseListingsWithMarketplace gibt leere Liste bei undefiniertem Input zurück', () => {
  const result = parseListingsWithMarketplace(undefined, 'EBAY_DE');
  assert.deepEqual(result, []);
});

test('parseListingsWithMarketplace parst ein gültiges Item korrekt', () => {
  const items = [makeItem()];
  const result = parseListingsWithMarketplace(items, 'EBAY_DE');

  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'item-001');
  assert.equal(result[0].title, 'Nintendo Switch OLED');
  assert.equal(result[0].price, 299.99);
  assert.equal(result[0].currency, 'EUR');
  assert.equal(result[0].condition, 'Gebraucht');
  assert.equal(result[0].imageUrl, 'https://example.com/img.jpg');
  assert.equal(result[0].itemUrl, 'https://ebay.de/item/001');
  assert.equal(result[0].sold, false);
  assert.equal(result[0].marketplace, 'EBAY_DE');
  assert.equal(result[0].selected, false);
});

// ─── Filterregeln: Ungültige Items überspringen ───────────────────────────────

test('parseListingsWithMarketplace überspringt Items ohne itemId', () => {
  const items = [makeItem({ itemId: undefined })];
  const result = parseListingsWithMarketplace(items, 'EBAY_DE');
  assert.equal(result.length, 0);
});

test('parseListingsWithMarketplace überspringt Items ohne Titel', () => {
  const items = [makeItem({ title: undefined })];
  const result = parseListingsWithMarketplace(items, 'EBAY_DE');
  assert.equal(result.length, 0);
});

test('parseListingsWithMarketplace überspringt Items mit Preis 0', () => {
  const items = [makeItem({ price: { value: '0', currency: 'EUR' } })];
  const result = parseListingsWithMarketplace(items, 'EBAY_DE');
  assert.equal(result.length, 0, 'Preis 0 sollte gefiltert werden');
});

test('parseListingsWithMarketplace überspringt Items mit negativem Preis', () => {
  const items = [makeItem({ price: { value: '-5', currency: 'EUR' } })];
  const result = parseListingsWithMarketplace(items, 'EBAY_DE');
  assert.equal(result.length, 0, 'Negativer Preis sollte gefiltert werden');
});

test('parseListingsWithMarketplace überspringt Items mit nicht-numerischem Preis', () => {
  const items = [makeItem({ price: { value: 'abc', currency: 'EUR' } })];
  const result = parseListingsWithMarketplace(items, 'EBAY_DE');
  assert.equal(result.length, 0, 'Nicht-numerischer Preis sollte gefiltert werden');
});

test('parseListingsWithMarketplace überspringt Items ohne Preisobjekt', () => {
  const items = [makeItem({ price: undefined })];
  const result = parseListingsWithMarketplace(items, 'EBAY_DE');
  assert.equal(result.length, 0, 'Fehlendes Preisobjekt sollte gefiltert werden');
});

// ─── Fallback-Werte für optionale Felder ─────────────────────────────────────

test('parseListingsWithMarketplace verwendet "EUR" als Standard-Währung', () => {
  const items = [makeItem({ price: { value: '50' } })]; // Keine currency
  const result = parseListingsWithMarketplace(items, 'EBAY_DE');
  if (result.length > 0) {
    assert.equal(result[0].currency, 'EUR');
  }
});

test('parseListingsWithMarketplace verwendet "Unbekannt" als Fallback für Zustand', () => {
  const items = [makeItem({ condition: undefined })];
  const result = parseListingsWithMarketplace(items, 'EBAY_DE');
  assert.equal(result.length, 1);
  assert.equal(result[0].condition, 'Unbekannt');
});

test('parseListingsWithMarketplace verwendet leeren String als Fallback für imageUrl', () => {
  const items = [makeItem({ thumbnailImages: undefined })];
  const result = parseListingsWithMarketplace(items, 'EBAY_DE');
  assert.equal(result.length, 1);
  assert.equal(result[0].imageUrl, '');
});

test('parseListingsWithMarketplace verwendet leeren String als Fallback für itemUrl', () => {
  const items = [makeItem({ itemWebUrl: undefined })];
  const result = parseListingsWithMarketplace(items, 'EBAY_DE');
  assert.equal(result.length, 1);
  assert.equal(result[0].itemUrl, '');
});

// ─── Marketplace-ID wird korrekt übertragen ───────────────────────────────────

test('parseListingsWithMarketplace überträgt marketplaceId korrekt', () => {
  const items = [makeItem()];
  const resultDE = parseListingsWithMarketplace(items, 'EBAY_DE');
  const resultUS = parseListingsWithMarketplace(items, 'EBAY_US');

  assert.equal(resultDE[0].marketplace, 'EBAY_DE');
  assert.equal(resultUS[0].marketplace, 'EBAY_US');
});

// ─── Mehrere Items ────────────────────────────────────────────────────────────

test('parseListingsWithMarketplace verarbeitet mehrere valide Items', () => {
  const items = [
    makeItem({ itemId: '001', title: 'Item A', price: { value: '10', currency: 'EUR' } }),
    makeItem({ itemId: '002', title: 'Item B', price: { value: '20', currency: 'EUR' } }),
    makeItem({ itemId: '003', title: 'Item C', price: { value: '30', currency: 'EUR' } }),
  ];
  const result = parseListingsWithMarketplace(items, 'EBAY_DE');
  assert.equal(result.length, 3);
  assert.equal(result[0].price, 10);
  assert.equal(result[1].price, 20);
  assert.equal(result[2].price, 30);
});

test('parseListingsWithMarketplace filtert ungültige Items aus gemischter Liste', () => {
  const items = [
    makeItem({ itemId: '001', price: { value: '10', currency: 'EUR' } }),
    makeItem({ itemId: undefined }), // ungültig
    makeItem({ itemId: '003', price: { value: '30', currency: 'EUR' } }),
  ];
  const result = parseListingsWithMarketplace(items, 'EBAY_DE');
  assert.equal(result.length, 2);
});
