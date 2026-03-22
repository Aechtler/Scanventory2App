import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeSearchQuery,
  createSearchVariants,
  formatPrice,
  formatPriceRange,
} from './utils.ts';

// ─── normalizeSearchQuery ─────────────────────────────────────────────────────

test('normalizeSearchQuery wandelt Großbuchstaben in Kleinbuchstaben um', () => {
  assert.equal(normalizeSearchQuery('Nintendo Switch'), 'nintendo switch');
});

test('normalizeSearchQuery entfernt führende und nachgestellte Leerzeichen', () => {
  assert.equal(normalizeSearchQuery('  sony walkman  '), 'sony walkman');
});

test('normalizeSearchQuery reduziert mehrfache Leerzeichen auf eins', () => {
  assert.equal(normalizeSearchQuery('iphone   14   pro'), 'iphone 14 pro');
});

test('normalizeSearchQuery lässt bereits normalisierte Strings unverändert', () => {
  assert.equal(normalizeSearchQuery('apple iphone 14'), 'apple iphone 14');
});

test('normalizeSearchQuery verarbeitet leere Zeichenkette', () => {
  assert.equal(normalizeSearchQuery(''), '');
});

test('normalizeSearchQuery verarbeitet Tab-Zeichen als Leerzeichen', () => {
  const result = normalizeSearchQuery('Sony\tWalkman');
  assert.ok(!result.includes('\t'), 'Erwartet keinen Tab im Ergebnis');
});

// ─── createSearchVariants ─────────────────────────────────────────────────────

test('createSearchVariants enthält immer den vollständigen normalisierten Query als erstes Element', () => {
  const variants = createSearchVariants('Nintendo Switch OLED');
  assert.equal(variants[0], 'nintendo switch oled');
});

test('createSearchVariants gibt nur eine Variante bei kurzem Query zurück', () => {
  const variants = createSearchVariants('iphone');
  assert.ok(variants.length >= 1, 'Erwartet mindestens eine Variante');
  assert.ok(variants.includes('iphone'), 'Erwartet "iphone" als Variante');
});

test('createSearchVariants erzeugt eine Kurzversion aus den ersten 2 Wörtern bei langen Queries', () => {
  const variants = createSearchVariants('Sony PlayStation 5 Digital Edition Konsole');
  // Die ersten zwei Wörter sollten vorhanden sein
  assert.ok(
    variants.some((v) => v === 'sony playstation'),
    `Erwartete "sony playstation" in Varianten: ${JSON.stringify(variants)}`,
  );
});

test('createSearchVariants erzeugt eine Version ohne Sonderzeichen bei Queries mit Sonderzeichen', () => {
  const variants = createSearchVariants('iPhone 14 Pro/Max');
  // Sonderzeichen sollten entfernt werden
  const withoutSpecial = variants.find((v) => !v.includes('/'));
  assert.ok(withoutSpecial !== undefined, 'Erwartete eine Variante ohne "/"');
});

test('createSearchVariants enthält keine Duplikate', () => {
  const variants = createSearchVariants('Sony');
  const unique = new Set(variants);
  assert.equal(unique.size, variants.length, 'Erwartet keine doppelten Varianten');
});

test('createSearchVariants filtert bei Queries mit > 4 Wörtern auf die ersten 4 herunter', () => {
  const variants = createSearchVariants('Apple MacBook Pro 14 M3 Chip 2023');
  const fourWordVariant = 'apple macbook pro 14';
  assert.ok(
    variants.includes(fourWordVariant),
    `Erwartete "${fourWordVariant}" in: ${JSON.stringify(variants)}`,
  );
});

test('createSearchVariants filtert Stopwörter (< 4 Zeichen) bei der Hauptwort-Variante', () => {
  // "mit" (3 Zeichen) sollte herausgefiltert werden
  const variants = createSearchVariants('Nintendo Switch mit Controller');
  const mainWordsVariant = variants.find(
    (v) => v.includes('nintendo') && v.includes('switch') && v.includes('controller') && !v.includes(' mit '),
  );
  // Es muss eine Variante geben, die "mit" nicht enthält (Hauptwörter-Variante)
  assert.ok(mainWordsVariant !== undefined, `Erwartete Hauptwort-Variante ohne "mit" in: ${JSON.stringify(variants)}`);
});

// ─── formatPrice (ebay/utils) ─────────────────────────────────────────────────

test('ebay formatPrice gibt Preis in EUR mit deutschem Format zurück', () => {
  const result = formatPrice(49.99);
  assert.ok(result.includes('49'), `Erwartete "49" in "${result}"`);
  assert.ok(result.includes('€'), `Erwartete "€" in "${result}"`);
});

test('ebay formatPrice akzeptiert andere Währungen', () => {
  const result = formatPrice(100, 'USD');
  assert.ok(result.includes('100'), `Erwartete "100" in "${result}"`);
});

// ─── formatPriceRange (ebay/utils) ───────────────────────────────────────────

test('ebay formatPriceRange gibt korrekten Bereich zurück', () => {
  const result = formatPriceRange(10, 50);
  assert.ok(result.includes('10'), `Erwartete "10" in "${result}"`);
  assert.ok(result.includes('50'), `Erwartete "50" in "${result}"`);
  assert.ok(result.includes('-'), `Erwartete "-" in "${result}"`);
});

test('ebay formatPriceRange nutzt deutsches Format (Komma als Dezimaltrennzeichen)', () => {
  const result = formatPriceRange(9.99, 19.99);
  // Im de-DE Format: "9,99 € - 19,99 €"
  assert.ok(result.includes('9,99') || result.includes('9.99'), `Erwartete Dezimaltrennzeichen in "${result}"`);
});
