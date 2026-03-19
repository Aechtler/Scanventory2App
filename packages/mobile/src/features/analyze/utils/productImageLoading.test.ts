import test from 'node:test';
import assert from 'node:assert/strict';

import { loadMatchImages, withTimeout } from './productImageLoading.ts';
import type { VisionMatch } from '@/features/scan/services/visionService';

const baseMatch: VisionMatch = {
  productName: 'Test Product',
  category: 'Sonstiges',
  brand: null,
  condition: 'Gut',
  description: 'Test',
  confidence: 0.5,
  searchQuery: 'test product',
};

test('withTimeout resolves successful work before the timeout', async () => {
  const result = await withTimeout(Promise.resolve('ok'), 20, 'test');
  assert.equal(result, 'ok');
});

test('withTimeout rejects when the work exceeds the timeout', async () => {
  await assert.rejects(
    withTimeout(new Promise((resolve) => setTimeout(() => resolve('late'), 30)), 5, 'lookup'),
    /lookup timed out after 5ms/
  );
});

test('loadMatchImages preserves matches whose image lookup times out', async () => {
  const matches: VisionMatch[] = [
    { ...baseMatch, productName: 'Fast', searchQuery: 'fast' },
    { ...baseMatch, productName: 'Slow', searchQuery: 'slow' },
  ];

  const resolved = await loadMatchImages(
    matches,
    async (query) => {
      if (query === 'fast') {
        return 'https://example.com/fast.jpg';
      }

      return new Promise((resolve) => setTimeout(() => resolve('https://example.com/slow.jpg'), 30));
    },
    5
  );

  assert.equal(resolved[0].imageUrl, 'https://example.com/fast.jpg');
  assert.equal(resolved[1].imageUrl, undefined);
  assert.equal(resolved[1].productName, 'Slow');
});
