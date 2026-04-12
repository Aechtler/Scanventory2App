import test from 'node:test';
import assert from 'node:assert/strict';

import { generateSellUrl } from './sellUrlService.ts';

// ─── eBay ─────────────────────────────────────────────────────────────────────

test('generateSellUrl gibt korrekten eBay-Link zurück', () => {
  const url = generateSellUrl('ebay', 'PlayStation 5');

  assert.equal(url, 'https://www.ebay.de/sl/sell?searchPhrase=PlayStation%205');
});

// ─── Kleinanzeigen ────────────────────────────────────────────────────────────

test('generateSellUrl gibt korrekten Kleinanzeigen-Link zurück', () => {
  const url = generateSellUrl('kleinanzeigen', 'PlayStation 5');

  assert.equal(
    url,
    'https://www.kleinanzeigen.de/m-anzeige-aufgeben.html?title=PlayStation%205',
  );
});

// ─── Amazon ───────────────────────────────────────────────────────────────────

test('generateSellUrl gibt korrekten Amazon-Link zurück', () => {
  const url = generateSellUrl('amazon', 'PlayStation 5');

  assert.equal(
    url,
    'https://sellercentral.amazon.de/listing/product-classify?searchPhrase=PlayStation%205',
  );
});

// ─── URL-Kodierung ────────────────────────────────────────────────────────────

test('generateSellUrl kodiert Leerzeichen als %20', () => {
  const url = generateSellUrl('ebay', 'LEGO Star Wars');

  assert.ok(url.includes('LEGO%20Star%20Wars'), `erwartet %20 in: ${url}`);
});

test('generateSellUrl kodiert Sonderzeichen korrekt', () => {
  const url = generateSellUrl('ebay', 'USB-C Hub & Dock');

  assert.ok(url.includes('%26'), `erwartet kodiertes & in: ${url}`);
});

test('generateSellUrl kodiert deutsche Umlaute korrekt', () => {
  const url = generateSellUrl('ebay', 'Küchenmaschine');

  assert.ok(!url.includes('ü'), `erwartet kodierten Umlaut in: ${url}`);
  assert.ok(url.includes('%C3%BC'), `erwartet %C3%BC für ü in: ${url}`);
});

test('generateSellUrl gibt unveränderliche Basis-URL ohne Sonderzeichen zurück', () => {
  const url = generateSellUrl('ebay', 'Buch');

  assert.equal(url, 'https://www.ebay.de/sl/sell?searchPhrase=Buch');
});

// ─── Preisparameter ───────────────────────────────────────────────────────────

test('generateSellUrl ignoriert den optionalen Preis-Parameter', () => {
  const withPrice = generateSellUrl('ebay', 'Kamera', 99);
  const withoutPrice = generateSellUrl('ebay', 'Kamera');
  const withNull = generateSellUrl('ebay', 'Kamera', null);

  assert.equal(withPrice, withoutPrice);
  assert.equal(withNull, withoutPrice);
});
