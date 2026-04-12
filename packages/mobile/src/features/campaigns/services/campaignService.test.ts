import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const featureRoot = path.resolve(dir, '..');

const service = readFileSync(path.join(dir, 'campaignService.ts'), 'utf8');
const types = readFileSync(path.join(featureRoot, 'types', 'campaign.types.ts'), 'utf8');
const index = readFileSync(path.join(featureRoot, 'index.ts'), 'utf8');

// ─── campaignService ──────────────────────────────────────────────────────────

test('campaignService ist als benannter Export vorhanden', () => {
  assert.match(service, /export\s+const\s+campaignService/);
});

test('campaignService hat eine fetchAll-Methode', () => {
  assert.ok(service.includes('fetchAll'), 'fetchAll fehlt in campaignService');
});

test('campaignService hat eine create-Methode', () => {
  assert.ok(service.includes('create:'), 'create fehlt in campaignService');
});

test('campaignService hat eine delete-Methode', () => {
  assert.ok(service.includes('delete:'), 'delete fehlt in campaignService');
});

// ─── Typen ────────────────────────────────────────────────────────────────────

test('Campaign-Interface ist exportiert', () => {
  assert.match(types, /export\s+interface\s+Campaign\b/);
});

test('Campaign hat die Pflichtfelder id, name, itemIds, createdAt', () => {
  assert.ok(types.includes('id:'), 'id fehlt');
  assert.ok(types.includes('name:'), 'name fehlt');
  assert.ok(types.includes('itemIds:'), 'itemIds fehlt');
  assert.ok(types.includes('createdAt:'), 'createdAt fehlt');
});

test('Campaign hat syncStatus-Feld für Offline-Queue', () => {
  assert.ok(types.includes('syncStatus'), 'syncStatus fehlt in Campaign');
});

test('CampaignDraft-Interface ist exportiert', () => {
  assert.match(types, /export\s+interface\s+CampaignDraft\b/);
});

// ─── Public API (index.ts) ────────────────────────────────────────────────────

test('campaigns/index.ts exportiert useCampaignStore', () => {
  assert.ok(index.includes('useCampaignStore'), 'useCampaignStore fehlt im Index');
});

test('campaigns/index.ts exportiert campaignService', () => {
  assert.ok(index.includes('campaignService'), 'campaignService fehlt im Index');
});

test('campaigns/index.ts exportiert Campaign und CampaignDraft als Typen', () => {
  assert.ok(index.includes('Campaign'), 'Campaign fehlt im Index');
  assert.ok(index.includes('CampaignDraft'), 'CampaignDraft fehlt im Index');
});
