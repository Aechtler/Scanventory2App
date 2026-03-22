import test from 'node:test';
import assert from 'node:assert/strict';

import { isManualSearchResult } from './analysisSource.ts';

// ─── isManualSearchResult ─────────────────────────────────────────────────────

test('isManualSearchResult gibt true zurück wenn category exakt "Gefunden via Suche" ist', () => {
  assert.equal(isManualSearchResult({ category: 'Gefunden via Suche' }), true);
});

test('isManualSearchResult gibt false zurück wenn category ein anderer Wert ist', () => {
  assert.equal(isManualSearchResult({ category: 'Elektronik' }), false);
  assert.equal(isManualSearchResult({ category: 'Spielzeug' }), false);
  assert.equal(isManualSearchResult({ category: 'Console' }), false);
});

test('isManualSearchResult gibt false zurück wenn category null ist', () => {
  assert.equal(isManualSearchResult({ category: null }), false);
});

test('isManualSearchResult gibt false zurück wenn category undefined ist', () => {
  assert.equal(isManualSearchResult({ category: undefined }), false);
  assert.equal(isManualSearchResult({}), false);
});

test('isManualSearchResult gibt false zurück wenn der Wert null ist', () => {
  assert.equal(isManualSearchResult(null), false);
});

test('isManualSearchResult gibt false zurück wenn der Wert undefined ist', () => {
  assert.equal(isManualSearchResult(undefined), false);
});

test('isManualSearchResult ist case-sensitive (Großschreibung zählt)', () => {
  assert.equal(isManualSearchResult({ category: 'gefunden via suche' }), false);
  assert.equal(isManualSearchResult({ category: 'GEFUNDEN VIA SUCHE' }), false);
});

test('isManualSearchResult gibt false bei leerem String zurück', () => {
  assert.equal(isManualSearchResult({ category: '' }), false);
});

test('isManualSearchResult gibt false bei ähnlichem aber nicht exaktem Wert zurück', () => {
  assert.equal(isManualSearchResult({ category: 'Gefunden via Suche ' }), false); // trailing space
  assert.equal(isManualSearchResult({ category: ' Gefunden via Suche' }), false); // leading space
});
