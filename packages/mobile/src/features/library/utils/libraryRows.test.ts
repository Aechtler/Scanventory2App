import test from 'node:test';
import assert from 'node:assert/strict';

import { buildLibraryRows, type LibraryItem } from './libraryRows.ts';

function makeItem(id: string): LibraryItem {
  return { id } as LibraryItem;
}

// ─── Leere Liste ──────────────────────────────────────────────────────────────

test('buildLibraryRows gibt leeres Array zurück wenn items leer ist', () => {
  assert.deepEqual(buildLibraryRows([], 'list'), []);
  assert.deepEqual(buildLibraryRows([], 'grid'), []);
});

// ─── List-Modus ───────────────────────────────────────────────────────────────

test('buildLibraryRows list: gibt eine Zeile pro Item zurück', () => {
  const items = [makeItem('a'), makeItem('b'), makeItem('c')];
  const rows = buildLibraryRows(items, 'list');

  assert.equal(rows.length, 3);
  assert.ok(rows.every((r) => r.type === 'list'));
});

test('buildLibraryRows list: jede Zeile enthält das korrekte Item', () => {
  const items = [makeItem('x'), makeItem('y')];
  const rows = buildLibraryRows(items, 'list');

  assert.equal(rows[0].id, 'x');
  assert.equal(rows[1].id, 'y');
  assert.ok(rows[0].type === 'list' && rows[0].item.id === 'x');
  assert.ok(rows[1].type === 'list' && rows[1].item.id === 'y');
});

test('buildLibraryRows list: einzelnes Item ergibt eine Zeile', () => {
  const rows = buildLibraryRows([makeItem('solo')], 'list');

  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, 'solo');
});

// ─── Grid-Modus ───────────────────────────────────────────────────────────────

test('buildLibraryRows grid: paart Items in Zweiergruppen', () => {
  const items = [makeItem('a'), makeItem('b'), makeItem('c'), makeItem('d')];
  const rows = buildLibraryRows(items, 'grid');

  assert.equal(rows.length, 2);
  assert.ok(rows.every((r) => r.type === 'grid'));
});

test('buildLibraryRows grid: jede Zeile enthält linkes und rechtes Item', () => {
  const items = [makeItem('left'), makeItem('right')];
  const rows = buildLibraryRows(items, 'grid');

  assert.equal(rows.length, 1);
  assert.ok(rows[0].type === 'grid');
  if (rows[0].type === 'grid') {
    assert.equal(rows[0].items[0].id, 'left');
    assert.equal(rows[0].items[1]?.id, 'right');
  }
});

test('buildLibraryRows grid: letztes Item bei ungerader Anzahl hat keinen Partner', () => {
  const items = [makeItem('a'), makeItem('b'), makeItem('solo')];
  const rows = buildLibraryRows(items, 'grid');

  assert.equal(rows.length, 2);
  const lastRow = rows[1];
  assert.ok(lastRow.type === 'grid');
  if (lastRow.type === 'grid') {
    assert.equal(lastRow.items[0].id, 'solo');
    assert.equal(lastRow.items[1], undefined);
  }
});

test('buildLibraryRows grid: einzelnes Item ergibt eine Zeile ohne Partner', () => {
  const rows = buildLibraryRows([makeItem('einzel')], 'grid');

  assert.equal(rows.length, 1);
  assert.ok(rows[0].type === 'grid');
  if (rows[0].type === 'grid') {
    assert.equal(rows[0].items[0].id, 'einzel');
    assert.equal(rows[0].items[1], undefined);
  }
});

// ─── Grid-IDs ─────────────────────────────────────────────────────────────────

test('buildLibraryRows grid: Zeilen-ID ist Kombination aus linker und rechter ID', () => {
  const rows = buildLibraryRows([makeItem('links'), makeItem('rechts')], 'grid');

  assert.equal(rows[0].id, 'links-rechts');
});

test('buildLibraryRows grid: Zeilen-ID endet mit "empty" wenn kein rechter Partner', () => {
  const rows = buildLibraryRows([makeItem('allein')], 'grid');

  assert.equal(rows[0].id, 'allein-empty');
});

test('buildLibraryRows grid: IDs sind für alle Zeilen eindeutig', () => {
  const items = [makeItem('a'), makeItem('b'), makeItem('c'), makeItem('d')];
  const rows = buildLibraryRows(items, 'grid');
  const ids = rows.map((r) => r.id);

  assert.equal(new Set(ids).size, ids.length);
});
