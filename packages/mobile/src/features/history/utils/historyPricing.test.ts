import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getLibraryDisplayPrice,
  hasLibraryDisplayPrice,
  parseLocalizedPriceInput,
} from './historyPricing.ts';

test('hasLibraryDisplayPrice treats a final price of 0 as a present value', () => {
  const item = {
    finalPrice: 0,
    priceStats: { avgPrice: 19.99 },
  };

  assert.equal(hasLibraryDisplayPrice(item), true);
  assert.equal(getLibraryDisplayPrice(item), 0);
});

test('hasLibraryDisplayPrice treats an average price of 0 as a present value', () => {
  const item = {
    priceStats: { avgPrice: 0 },
  };

  assert.equal(hasLibraryDisplayPrice(item), true);
  assert.equal(getLibraryDisplayPrice(item), 0);
});

test('parseLocalizedPriceInput parses German thousands and decimal separators', () => {
  assert.equal(parseLocalizedPriceInput('1.234,56'), 1234.56);
});

test('parseLocalizedPriceInput returns undefined for blank input', () => {
  assert.equal(parseLocalizedPriceInput('   '), undefined);
});

// ─── getLibraryDisplayPrice (weitere Edge Cases) ──────────────────────────────

test('getLibraryDisplayPrice bevorzugt finalPrice gegenüber priceStats.avgPrice', () => {
  const item = { finalPrice: 99, priceStats: { avgPrice: 50 } };
  assert.equal(getLibraryDisplayPrice(item), 99);
});

test('getLibraryDisplayPrice gibt avgPrice zurück wenn finalPrice nicht gesetzt', () => {
  const item = { finalPrice: undefined, priceStats: { avgPrice: 42 } };
  assert.equal(getLibraryDisplayPrice(item), 42);
});

test('getLibraryDisplayPrice gibt undefined zurück wenn weder finalPrice noch avgPrice vorhanden', () => {
  const item = { finalPrice: undefined, priceStats: undefined };
  assert.equal(getLibraryDisplayPrice(item), undefined);
});

test('getLibraryDisplayPrice gibt undefined zurück wenn priceStats null ist', () => {
  const item = { finalPrice: undefined, priceStats: null };
  assert.equal(getLibraryDisplayPrice(item), undefined);
});

// ─── hasLibraryDisplayPrice (weitere Edge Cases) ─────────────────────────────

test('hasLibraryDisplayPrice gibt false zurück wenn kein Preis vorhanden', () => {
  const item = { finalPrice: undefined, priceStats: undefined };
  assert.equal(hasLibraryDisplayPrice(item), false);
});

test('hasLibraryDisplayPrice gibt true zurück wenn finalPrice gesetzt ist (auch negativ)', () => {
  // Negativer Preis ist technisch "vorhanden" – nur 0 und undefined sind Grenzfälle
  const item = { finalPrice: -1, priceStats: undefined };
  assert.equal(hasLibraryDisplayPrice(item), true);
});

// ─── parseLocalizedPriceInput (weitere Edge Cases) ───────────────────────────

test('parseLocalizedPriceInput parst einfache Ganzzahl', () => {
  assert.equal(parseLocalizedPriceInput('42'), 42);
});

test('parseLocalizedPriceInput parst Komma-Dezimalzahl (deutsches Format)', () => {
  assert.equal(parseLocalizedPriceInput('19,99'), 19.99);
});

test('parseLocalizedPriceInput behandelt Punkt als Tausender-Trennzeichen (deutsches Format)', () => {
  // Im deutschen Format ist "." der Tausender-Trenner → wird entfernt
  // "19.99" → entferne "." → "1999" → 1999
  assert.equal(parseLocalizedPriceInput('19.99'), 1999);
});

test('parseLocalizedPriceInput gibt undefined für negative Zahlen zurück', () => {
  assert.equal(parseLocalizedPriceInput('-5'), undefined);
});

test('parseLocalizedPriceInput gibt undefined für nicht-numerischen Input zurück', () => {
  assert.equal(parseLocalizedPriceInput('abc'), undefined);
  assert.equal(parseLocalizedPriceInput('€50'), undefined);
});

test('parseLocalizedPriceInput parst 0 korrekt (kein undefined)', () => {
  assert.equal(parseLocalizedPriceInput('0'), 0);
});

test('parseLocalizedPriceInput verarbeitet führende und nachgestellte Leerzeichen', () => {
  assert.equal(parseLocalizedPriceInput('  99,00  '), 99.00);
});
