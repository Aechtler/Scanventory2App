import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const featureRoot = path.resolve(dir, '..');

const service = readFileSync(path.join(dir, 'sharingService.ts'), 'utf8');
const types = readFileSync(path.join(featureRoot, 'types', 'sharing.types.ts'), 'utf8');
const index = readFileSync(path.join(featureRoot, 'index.ts'), 'utf8');

// ─── sharingService ───────────────────────────────────────────────────────────

test('sharingService ist als benannter Export vorhanden', () => {
  assert.match(service, /export\s+const\s+sharingService/);
});

test('sharingService hat share-Methode', () => {
  assert.ok(service.includes('share:'), 'share fehlt in sharingService');
});

test('sharingService hat unshare-Methode', () => {
  assert.ok(service.includes('unshare:'), 'unshare fehlt in sharingService');
});

test('sharingService hat getSharedWithMe-Methode', () => {
  assert.ok(service.includes('getSharedWithMe:'), 'getSharedWithMe fehlt in sharingService');
});

// ─── Typen ────────────────────────────────────────────────────────────────────

test('ShareTargetType unterscheidet user und group', () => {
  assert.match(types, /export\s+type\s+ShareTargetType/);
  assert.ok(types.includes("'user'"), 'user fehlt in ShareTargetType');
  assert.ok(types.includes("'group'"), 'group fehlt in ShareTargetType');
});

test('SharePermission unterscheidet VIEW und COMMENT', () => {
  assert.match(types, /export\s+type\s+SharePermission/);
  assert.ok(types.includes("'VIEW'"), 'VIEW fehlt in SharePermission');
  assert.ok(types.includes("'COMMENT'"), 'COMMENT fehlt in SharePermission');
});

test('ShareTarget-Interface ist exportiert', () => {
  assert.match(types, /export\s+interface\s+ShareTarget\b/);
});

test('SharedItemResult-Interface ist exportiert', () => {
  assert.match(types, /export\s+interface\s+SharedItemResult\b/);
});

test('ReceivedItem enthält Felder für geteilte Items', () => {
  assert.match(types, /export\s+interface\s+ReceivedItem\b/);
  assert.ok(types.includes('itemId:'), 'itemId fehlt in ReceivedItem');
  assert.ok(types.includes('productName:'), 'productName fehlt in ReceivedItem');
  assert.ok(types.includes('sharedAt:'), 'sharedAt fehlt in ReceivedItem');
});

// ─── Public API (index.ts) ────────────────────────────────────────────────────

test('sharing/index.ts exportiert sharingService', () => {
  assert.ok(index.includes('sharingService'), 'sharingService fehlt im Index');
});

test('sharing/index.ts exportiert alle Typen', () => {
  assert.ok(index.includes('ShareTargetType'), 'ShareTargetType fehlt im Index');
  assert.ok(index.includes('SharePermission'), 'SharePermission fehlt im Index');
  assert.ok(index.includes('ShareTarget'), 'ShareTarget fehlt im Index');
  assert.ok(index.includes('SharedItemResult'), 'SharedItemResult fehlt im Index');
  assert.ok(index.includes('ReceivedItem'), 'ReceivedItem fehlt im Index');
});

test('sharing/index.ts exportiert Hooks', () => {
  assert.ok(index.includes('useShareItem'), 'useShareItem fehlt im Index');
  assert.ok(index.includes('useSharedWithMe'), 'useSharedWithMe fehlt im Index');
});
