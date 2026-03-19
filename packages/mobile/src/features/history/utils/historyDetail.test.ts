import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const componentsDir = path.resolve(currentDir, '../components');
const helperPath = path.join(currentDir, 'historyDetail.ts');

test('history detail screen helpers live in focused files', () => {
  assert.equal(existsSync(helperPath), true);
  assert.equal(existsSync(path.join(componentsDir, 'HistoryDetailHeaderActions.tsx')), true);
  assert.equal(existsSync(path.join(componentsDir, 'HistoryDetailMarketSection.tsx')), true);
  assert.equal(existsSync(path.join(componentsDir, 'HistoryDetailNotFound.tsx')), true);
});

test('buildHistoryDetailState derives platform links and search fallback values', async () => {
  assert.equal(existsSync(helperPath), true);

  const { buildHistoryDetailState } = await import(pathToFileURL(helperPath).href);

  const state = buildHistoryDetailState({
    productName: 'Switch OLED',
    category: 'Console',
    brand: 'Nintendo',
    searchQuery: '',
    searchQueries: {
      ebay: 'switch oled gebraucht',
      generic: 'switch oled console',
    },
    marketValue: { summary: 'stable' },
    priceStats: { minPrice: 200, maxPrice: 320, avgPrice: 260, medianPrice: 255 },
    ebayListings: [{ id: 'a', title: 'A', price: 250, currency: 'EUR', condition: 'Used', imageUrl: '', itemUrl: '', sold: false, selected: true }],
  });

  assert.equal(state.searchQuery, 'switch oled console');
  assert.equal(state.shouldLoadMarketValue, false);
  assert.equal(state.shouldLoadEbayData, false);
  assert.deepEqual(state.platformQueries, {
    ebay: 'switch oled gebraucht',
    amazon: 'switch oled console',
    idealo: 'switch oled console',
    generic: 'switch oled console',
  });
});

test('buildHistoryDetailState falls back to product name when no generic query exists', async () => {
  assert.equal(existsSync(helperPath), true);

  const { buildHistoryDetailState } = await import(pathToFileURL(helperPath).href);

  const state = buildHistoryDetailState({
    productName: 'Pokemon Rot',
    category: 'Game',
    brand: null,
    condition: 'Used',
    confidence: 0.8,
    searchQuery: 'pokemon rot modul',
    priceStats: { minPrice: 30, maxPrice: 60, avgPrice: 45, medianPrice: 45 },
  });

  assert.equal(state.searchQuery, 'Pokemon Rot');
  assert.equal(state.shouldLoadMarketValue, true);
  assert.equal(state.shouldLoadEbayData, true);
  assert.deepEqual(state.platformQueries, {
    ebay: 'pokemon rot modul',
    amazon: 'pokemon rot modul',
    idealo: 'pokemon rot modul',
    generic: 'pokemon rot modul',
  });
});
