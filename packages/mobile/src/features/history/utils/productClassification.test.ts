import test from 'node:test';
import assert from 'node:assert/strict';

import { classifyProduct } from './productClassification.ts';
import type { HistoryItem } from '../store/types.ts';

// ─── Hilfsfunktion ────────────────────────────────────────────────────────────

/** Erstellt ein minimales HistoryItem mit gegebenem Preis */
function makeItem(finalPrice: number | null | undefined, avgPrice?: number): HistoryItem {
  return {
    finalPrice: finalPrice ?? undefined,
    priceStats: avgPrice != null
      ? { minPrice: 0, maxPrice: 0, avgPrice, medianPrice: 0, totalListings: 0, soldListings: 0 }
      : null,
  } as HistoryItem;
}

// ─── Kein Preis ───────────────────────────────────────────────────────────────

test('classifyProduct gibt "normal" zurück wenn kein Preis vorhanden', () => {
  assert.equal(classifyProduct(makeItem(null)), 'normal');
});

test('classifyProduct gibt "normal" zurück wenn Preis 0 ist', () => {
  assert.equal(classifyProduct(makeItem(0)), 'normal');
});

test('classifyProduct gibt "normal" zurück wenn Preis negativ ist', () => {
  assert.equal(classifyProduct(makeItem(-10)), 'normal');
});

// ─── Fast Seller (≤ 30 €) ─────────────────────────────────────────────────────

test('classifyProduct gibt "fast_seller" zurück für Preis unter 30 €', () => {
  assert.equal(classifyProduct(makeItem(15)), 'fast_seller');
});

test('classifyProduct gibt "fast_seller" zurück für Preis exakt 30 € (Grenzwert)', () => {
  assert.equal(classifyProduct(makeItem(30)), 'fast_seller');
});

test('classifyProduct gibt "fast_seller" zurück für Preis 1 €', () => {
  assert.equal(classifyProduct(makeItem(1)), 'fast_seller');
});

// ─── High Value (≥ 100 €) ─────────────────────────────────────────────────────

test('classifyProduct gibt "high_value" zurück für Preis über 100 €', () => {
  assert.equal(classifyProduct(makeItem(250)), 'high_value');
});

test('classifyProduct gibt "high_value" zurück für Preis exakt 100 € (Grenzwert)', () => {
  assert.equal(classifyProduct(makeItem(100)), 'high_value');
});

test('classifyProduct gibt "high_value" zurück für sehr hohe Preise', () => {
  assert.equal(classifyProduct(makeItem(9999)), 'high_value');
});

// ─── Normal (31–99 €) ─────────────────────────────────────────────────────────

test('classifyProduct gibt "normal" zurück für Preis in der Mitte (50 €)', () => {
  assert.equal(classifyProduct(makeItem(50)), 'normal');
});

test('classifyProduct gibt "normal" zurück für Preis knapp über fast_seller (31 €)', () => {
  assert.equal(classifyProduct(makeItem(31)), 'normal');
});

test('classifyProduct gibt "normal" zurück für Preis knapp unter high_value (99 €)', () => {
  assert.equal(classifyProduct(makeItem(99)), 'normal');
});

// ─── Preis aus priceStats (kein finalPrice) ────────────────────────────────────

test('classifyProduct nutzt avgPrice aus priceStats wenn kein finalPrice gesetzt', () => {
  assert.equal(classifyProduct(makeItem(null, 150)), 'high_value');
  assert.equal(classifyProduct(makeItem(null, 20)), 'fast_seller');
  assert.equal(classifyProduct(makeItem(null, 65)), 'normal');
});

// ─── finalPrice hat Vorrang ────────────────────────────────────────────────────

test('classifyProduct bevorzugt finalPrice gegenüber avgPrice', () => {
  // finalPrice = 200 (high_value), avgPrice = 10 (fast_seller)
  const item = makeItem(200, 10);
  assert.equal(classifyProduct(item), 'high_value');
});
