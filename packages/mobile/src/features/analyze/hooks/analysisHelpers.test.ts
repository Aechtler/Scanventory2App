import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createManualVisionMatch,
  getAutoSelectMatchIndex,
  buildPlatformQueryInput,
} from './analysisHelpers.ts';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

test('analysis hook split files exist', () => {
  assert.equal(existsSync(path.join(currentDir, 'useVisionAnalysis.ts')), true);
  assert.equal(existsSync(path.join(currentDir, 'useProductImages.ts')), true);
  assert.equal(existsSync(path.join(currentDir, 'usePlatformLinks.ts')), true);
});

test('createManualVisionMatch creates a manual result without misleading confidence', () => {
  assert.deepEqual(createManualVisionMatch('sony walkman'), {
    productName: 'sony walkman',
    category: 'Gefunden via Suche',
    brand: null,
    condition: 'Gut',
    description: 'Manuelle Suche nach: sony walkman',
    confidence: 0,
    isManual: true,
    searchQuery: 'sony walkman',
    searchQueries: {
      ebay: 'sony walkman',
      generic: 'sony walkman',
    },
  });
});

test('buildPlatformQueryInput falls back to the generic search query', () => {
  assert.deepEqual(
    buildPlatformQueryInput({
      productName: 'Nintendo Switch',
      category: 'Console',
      brand: 'Nintendo',
      condition: 'Used',
      description: 'Console',
      confidence: 0.9,
      searchQuery: 'nintendo switch',
      searchQueries: {
        amazon: 'nintendo switch amazon',
      },
    }),
    {
      ebay: 'nintendo switch',
      amazon: 'nintendo switch amazon',
      idealo: 'nintendo switch',
      generic: 'nintendo switch',
    },
  );
});

test('getAutoSelectMatchIndex only auto-selects a single high-confidence match', () => {
  assert.equal(
    getAutoSelectMatchIndex({
      matches: [
        {
          productName: 'Single',
          category: 'Test',
          brand: null,
          condition: 'Gut',
          description: 'Single',
          confidence: 0.95,
          searchQuery: 'single',
        },
      ],
      selectedIndex: null,
    }),
    0,
  );

  assert.equal(
    getAutoSelectMatchIndex({
      matches: [
        {
          productName: 'Low confidence',
          category: 'Test',
          brand: null,
          condition: 'Gut',
          description: 'Low confidence',
          confidence: 0.94,
          searchQuery: 'single',
        },
      ],
      selectedIndex: null,
    }),
    null,
  );

  assert.equal(
    getAutoSelectMatchIndex({
      matches: [
        {
          productName: 'First',
          category: 'Test',
          brand: null,
          condition: 'Gut',
          description: 'First',
          confidence: 0.99,
          searchQuery: 'first',
        },
        {
          productName: 'Second',
          category: 'Test',
          brand: null,
          condition: 'Gut',
          description: 'Second',
          confidence: 0.6,
          searchQuery: 'second',
        },
      ],
      selectedIndex: null,
    }),
    null,
  );
});
