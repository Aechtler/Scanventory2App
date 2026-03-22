import test from 'node:test';
import assert from 'node:assert/strict';

import {
  formatPrice,
  formatPriceRange,
  calculatePriceStats,
} from './formatPrice.ts';

// ─── formatPrice ─────────────────────────────────────────────────────────────

test('formatPrice formatiert einen Ganzzahl-Betrag in EUR mit deutschem Locale', () => {
  const result = formatPrice(100);
  // In de-DE: "100,00 €"
  assert.ok(result.includes('100'), `Erwartete "100" in "${result}"`);
  assert.ok(result.includes('€'), `Erwartete "€" in "${result}"`);
});

test('formatPrice formatiert Dezimalbeträge korrekt (Komma als Dezimaltrennzeichen)', () => {
  const result = formatPrice(1234.56);
  // In de-DE: "1.234,56 €"
  assert.ok(result.includes('1.234'), `Erwartete "1.234" in "${result}"`);
  assert.ok(result.includes('56'), `Erwartete "56" in "${result}"`);
});

test('formatPrice rundet auf 2 Dezimalstellen', () => {
  const result = formatPrice(9.999);
  // Sollte 10,00 € ergeben
  assert.ok(result.includes('10'), `Erwartete gerundeten Wert in "${result}"`);
});

test('formatPrice verwendet USD wenn angegeben', () => {
  const result = formatPrice(99.99, 'USD');
  assert.ok(result.includes('99'), `Erwartete "99" in "${result}"`);
  assert.ok(
    result.includes('$') || result.includes('USD'),
    `Erwartete USD-Symbol in "${result}"`,
  );
});

test('formatPrice gibt für 0 einen formatierten Nullwert zurück', () => {
  const result = formatPrice(0);
  assert.ok(result.includes('0'), `Erwartete "0" in "${result}"`);
  assert.ok(result.includes('€'), `Erwartete "€" in "${result}"`);
});

test('formatPrice verarbeitet sehr große Beträge', () => {
  const result = formatPrice(1_000_000);
  assert.ok(result.includes('000'), `Erwartete "000" in "${result}"`);
  assert.ok(result.includes('€'), `Erwartete "€" in "${result}"`);
});

// ─── formatPriceRange ────────────────────────────────────────────────────────

test('formatPriceRange gibt einen Bindestrich-getrennten Bereich zurück', () => {
  const result = formatPriceRange(50, 150);
  assert.ok(result.includes('-'), `Erwartete "-" in "${result}"`);
  assert.ok(result.includes('50'), `Erwartete "50" in "${result}"`);
  assert.ok(result.includes('150'), `Erwartete "150" in "${result}"`);
});

test('formatPriceRange bei gleichen Min- und Max-Werten zeigt denselben Preis zweimal', () => {
  const result = formatPriceRange(75, 75);
  const parts = result.split('-').map((s) => s.trim());
  assert.equal(parts.length, 2, 'Erwartet zwei Teile');
  assert.ok(parts[0].includes('75'));
  assert.ok(parts[1].includes('75'));
});

test('formatPriceRange unterstützt andere Währungen', () => {
  const result = formatPriceRange(10, 20, 'USD');
  assert.ok(result.includes('10'), `Erwartete "10" in "${result}"`);
  assert.ok(result.includes('20'), `Erwartete "20" in "${result}"`);
});

// ─── calculatePriceStats ─────────────────────────────────────────────────────

test('calculatePriceStats gibt Nullwerte für leere Liste zurück', () => {
  const stats = calculatePriceStats([]);
  assert.deepEqual(stats, { min: 0, max: 0, average: 0, median: 0 });
});

test('calculatePriceStats berechnet min, max, average und median für einen einzelnen Wert', () => {
  const stats = calculatePriceStats([42]);
  assert.equal(stats.min, 42);
  assert.equal(stats.max, 42);
  assert.equal(stats.average, 42);
  assert.equal(stats.median, 42);
});

test('calculatePriceStats berechnet Statistiken für eine ungerade Anzahl von Preisen', () => {
  // Sortiert: [10, 20, 100] → Median = 20
  const stats = calculatePriceStats([100, 10, 20]);
  assert.equal(stats.min, 10);
  assert.equal(stats.max, 100);
  assert.equal(stats.average, (10 + 20 + 100) / 3);
  assert.equal(stats.median, 20);
});

test('calculatePriceStats berechnet den Median für eine gerade Anzahl von Preisen als Durchschnitt der beiden mittleren', () => {
  // Sortiert: [10, 20, 30, 40] → Median = (20 + 30) / 2 = 25
  const stats = calculatePriceStats([40, 10, 30, 20]);
  assert.equal(stats.min, 10);
  assert.equal(stats.max, 40);
  assert.equal(stats.average, 25);
  assert.equal(stats.median, 25);
});

test('calculatePriceStats mutiert die Eingabeliste nicht', () => {
  const prices = [30, 10, 20];
  const original = [...prices];
  calculatePriceStats(prices);
  assert.deepEqual(prices, original, 'Die Eingabeliste darf nicht verändert werden');
});

test('calculatePriceStats berechnet den Durchschnitt korrekt mit Dezimalwerten', () => {
  const stats = calculatePriceStats([1.5, 2.5, 3.0]);
  assert.equal(stats.average, (1.5 + 2.5 + 3.0) / 3);
});
