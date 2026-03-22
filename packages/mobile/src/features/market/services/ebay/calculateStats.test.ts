import test from 'node:test';
import assert from 'node:assert/strict';

import { calculatePriceStats, recalculatePriceStats } from './calculateStats.ts';
import type { MarketListing } from './types';

// Hilfsfunktion: Erstellt ein MarketListing mit Standardwerten
function makeListing(price: number, selected = true): MarketListing {
  return {
    id: `listing-${price}`,
    title: `Item ${price}`,
    price,
    currency: 'EUR',
    condition: 'Gebraucht',
    imageUrl: '',
    itemUrl: '',
    sold: false,
    selected,
  };
}

// ─── calculatePriceStats ──────────────────────────────────────────────────────

test('calculatePriceStats gibt Nullwerte für leere Listings zurück', () => {
  const stats = calculatePriceStats([]);
  assert.deepEqual(stats, {
    minPrice: 0,
    maxPrice: 0,
    avgPrice: 0,
    medianPrice: 0,
  });
});

test('calculatePriceStats für ein einzelnes Listing', () => {
  const stats = calculatePriceStats([makeListing(50)]);
  assert.equal(stats.minPrice, 50);
  assert.equal(stats.maxPrice, 50);
  assert.equal(stats.avgPrice, 50);
  assert.equal(stats.medianPrice, 50);
});

test('calculatePriceStats berechnet min, max, avg, median korrekt (ungerade Anzahl)', () => {
  // Sortiert: [10, 20, 100] → Median = 20
  const listings = [makeListing(100), makeListing(10), makeListing(20)];
  const stats = calculatePriceStats(listings);

  assert.equal(stats.minPrice, 10);
  assert.equal(stats.maxPrice, 100);
  assert.equal(stats.avgPrice, Math.round(((10 + 20 + 100) / 3) * 100) / 100);
  assert.equal(stats.medianPrice, 20);
});

test('calculatePriceStats berechnet Median als Mittelwert der beiden mittleren Werte (gerade Anzahl)', () => {
  // Sortiert: [10, 20, 30, 40] → Median = (20 + 30) / 2 = 25
  const listings = [makeListing(40), makeListing(10), makeListing(30), makeListing(20)];
  const stats = calculatePriceStats(listings);

  assert.equal(stats.minPrice, 10);
  assert.equal(stats.maxPrice, 40);
  assert.equal(stats.medianPrice, 25);
});

test('calculatePriceStats rundet avgPrice auf 2 Dezimalstellen', () => {
  // 1/3 ≈ 0.333..., also 10/3 + 10/3 + 10/3 = 10
  const listings = [makeListing(10), makeListing(20), makeListing(33)];
  const stats = calculatePriceStats(listings);

  // Stellt sicher, dass keine mehr als 2 Dezimalstellen vorhanden sind
  const decimalPart = String(stats.avgPrice).split('.')[1] || '';
  assert.ok(decimalPart.length <= 2, `avgPrice hat zu viele Dezimalstellen: ${stats.avgPrice}`);
});

test('calculatePriceStats mutiert die Eingabeliste nicht', () => {
  const listings = [makeListing(30), makeListing(10), makeListing(20)];
  const originalOrder = listings.map((l) => l.price);
  calculatePriceStats(listings);
  assert.deepEqual(
    listings.map((l) => l.price),
    originalOrder,
    'Die Eingabeliste darf nicht verändert werden',
  );
});

test('calculatePriceStats verarbeitet identische Preise korrekt', () => {
  const listings = [makeListing(50), makeListing(50), makeListing(50)];
  const stats = calculatePriceStats(listings);
  assert.equal(stats.minPrice, 50);
  assert.equal(stats.maxPrice, 50);
  assert.equal(stats.avgPrice, 50);
  assert.equal(stats.medianPrice, 50);
});

// ─── recalculatePriceStats ────────────────────────────────────────────────────

test('recalculatePriceStats berücksichtigt nur ausgewählte Listings', () => {
  const listings = [
    makeListing(100, true),  // ausgewählt
    makeListing(200, false), // NICHT ausgewählt
    makeListing(300, true),  // ausgewählt
  ];
  const stats = recalculatePriceStats(listings);

  // Nur 100 und 300 sind ausgewählt
  assert.equal(stats.minPrice, 100);
  assert.equal(stats.maxPrice, 300);
  assert.equal(stats.totalListings, 2);
});

test('recalculatePriceStats gibt Nullwerte zurück wenn keine Listings ausgewählt', () => {
  const listings = [
    makeListing(100, false),
    makeListing(200, false),
  ];
  const stats = recalculatePriceStats(listings);

  assert.equal(stats.minPrice, 0);
  assert.equal(stats.maxPrice, 0);
  assert.equal(stats.avgPrice, 0);
  assert.equal(stats.medianPrice, 0);
  assert.equal(stats.totalListings, 0);
});

test('recalculatePriceStats setzt totalListings korrekt auf Anzahl der ausgewählten', () => {
  const listings = [
    makeListing(50, true),
    makeListing(60, true),
    makeListing(70, false),
  ];
  const stats = recalculatePriceStats(listings);
  assert.equal(stats.totalListings, 2);
});

test('recalculatePriceStats setzt soldListings immer auf 0', () => {
  const listings = [makeListing(100, true)];
  const stats = recalculatePriceStats(listings);
  assert.equal(stats.soldListings, 0);
});

test('recalculatePriceStats berechnet korrekte Statistiken für alle ausgewählten Listings', () => {
  const listings = [
    makeListing(10, true),
    makeListing(50, true),
    makeListing(90, true),
  ];
  const stats = recalculatePriceStats(listings);

  assert.equal(stats.minPrice, 10);
  assert.equal(stats.maxPrice, 90);
  assert.equal(stats.medianPrice, 50); // Median von [10, 50, 90]
  assert.equal(stats.totalListings, 3);
});
