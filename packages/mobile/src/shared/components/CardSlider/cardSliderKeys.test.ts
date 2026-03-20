import test from 'node:test';
import assert from 'node:assert/strict';

import { getCardSliderItemKey } from './cardSliderKeys.ts';

test('getCardSliderItemKey prefers an existing child key over index-based fallbacks', () => {
  const keyedChild = { key: '.$listing-42' };

  assert.equal(getCardSliderItemKey(keyedChild), '.$listing-42');
});

test('getCardSliderItemKey creates a deterministic non-index fallback for primitive children', () => {
  assert.equal(getCardSliderItemKey('empty-state'), 'card-slider-item:string:empty-state');
  assert.equal(getCardSliderItemKey(0), 'card-slider-item:number:0');
});
