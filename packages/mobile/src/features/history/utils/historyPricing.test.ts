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
