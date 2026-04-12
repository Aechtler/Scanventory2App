import test from 'node:test';
import assert from 'node:assert/strict';

import { resolvePathToNode } from './suggestCategory.ts';
import type { CategoryNode } from '../types/category.types.ts';

// ─── Hilfsfunktion ────────────────────────────────────────────────────────────

function makeNode(
  id: string,
  name: string,
  children: CategoryNode[] = [],
): CategoryNode {
  return { id, name, parentId: null, iconName: null, sortOrder: 0, children };
}

const tree: CategoryNode[] = [
  makeNode('1', 'Elektronik', [
    makeNode('1-1', 'Smartphones', [
      makeNode('1-1-1', 'Apple'),
      makeNode('1-1-2', 'Samsung'),
    ]),
    makeNode('1-2', 'Laptops'),
  ]),
  makeNode('2', 'Spielzeug', [
    makeNode('2-1', 'LEGO'),
  ]),
];

// ─── Leere Namen-Liste ────────────────────────────────────────────────────────

test('resolvePathToNode gibt null zurück wenn names leer ist', () => {
  assert.equal(resolvePathToNode(tree, []), null);
});

// ─── Kein Treffer ─────────────────────────────────────────────────────────────

test('resolvePathToNode gibt null zurück wenn erste Ebene nicht übereinstimmt', () => {
  assert.equal(resolvePathToNode(tree, ['Unbekannt']), null);
});

test('resolvePathToNode gibt null zurück bei leerem Baum', () => {
  assert.equal(resolvePathToNode([], ['Elektronik']), null);
});

// ─── Einfacher Treffer ────────────────────────────────────────────────────────

test('resolvePathToNode findet Node auf erster Ebene', () => {
  const result = resolvePathToNode(tree, ['Elektronik']);

  assert.ok(result !== null);
  assert.equal(result.node.id, '1');
  assert.equal(result.pathString, 'Elektronik');
});

test('resolvePathToNode findet Node auf zweiter Ebene', () => {
  const result = resolvePathToNode(tree, ['Elektronik', 'Smartphones']);

  assert.ok(result !== null);
  assert.equal(result.node.id, '1-1');
  assert.equal(result.pathString, 'Elektronik > Smartphones');
});

test('resolvePathToNode findet Node auf dritter Ebene', () => {
  const result = resolvePathToNode(tree, ['Elektronik', 'Smartphones', 'Apple']);

  assert.ok(result !== null);
  assert.equal(result.node.id, '1-1-1');
  assert.equal(result.pathString, 'Elektronik > Smartphones > Apple');
});

// ─── Groß-/Kleinschreibung ────────────────────────────────────────────────────

test('resolvePathToNode ist case-insensitive', () => {
  const lower = resolvePathToNode(tree, ['elektronik']);
  const upper = resolvePathToNode(tree, ['ELEKTRONIK']);
  const mixed = resolvePathToNode(tree, ['Elektronik']);

  assert.ok(lower !== null);
  assert.ok(upper !== null);
  assert.equal(lower?.node.id, mixed?.node.id);
  assert.equal(upper?.node.id, mixed?.node.id);
});

test('resolvePathToNode verwendet den Original-Namen im pathString (nicht den Suchbegriff)', () => {
  const result = resolvePathToNode(tree, ['elektronik', 'smartphones']);

  assert.ok(result !== null);
  assert.equal(result.pathString, 'Elektronik > Smartphones');
});

// ─── Teilweise Übereinstimmung ────────────────────────────────────────────────

test('resolvePathToNode gibt letzten gültigen Node zurück wenn Pfad abbricht', () => {
  const result = resolvePathToNode(tree, ['Elektronik', 'Unbekannt']);

  // Stoppt bei 'Unbekannt', gibt 'Elektronik' zurück
  assert.ok(result !== null);
  assert.equal(result.node.id, '1');
  assert.equal(result.pathString, 'Elektronik');
});

// ─── Geschwister-Nodes ────────────────────────────────────────────────────────

test('resolvePathToNode unterscheidet zwischen Geschwister-Nodes', () => {
  const apple = resolvePathToNode(tree, ['Elektronik', 'Smartphones', 'Apple']);
  const samsung = resolvePathToNode(tree, ['Elektronik', 'Smartphones', 'Samsung']);

  assert.ok(apple !== null);
  assert.ok(samsung !== null);
  assert.notEqual(apple.node.id, samsung.node.id);
});

test('resolvePathToNode findet Nodes in verschiedenen Zweigen', () => {
  const lego = resolvePathToNode(tree, ['Spielzeug', 'LEGO']);
  const laptops = resolvePathToNode(tree, ['Elektronik', 'Laptops']);

  assert.ok(lego !== null);
  assert.ok(laptops !== null);
  assert.equal(lego.node.id, '2-1');
  assert.equal(laptops.node.id, '1-2');
});
