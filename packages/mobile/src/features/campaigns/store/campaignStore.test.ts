import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const featureRoot = path.resolve(dir, '..', '..');

const store = readFileSync(path.join(dir, 'campaignStore.ts'), 'utf8');
const types = readFileSync(path.join(path.resolve(dir, '..'), 'types', 'campaign.types.ts'), 'utf8');
const index = readFileSync(path.join(path.resolve(dir, '..'), 'index.ts'), 'utf8');

// ─── Store-Struktur ───────────────────────────────────────────────────────────

test('useCampaignStore ist als benannter Export vorhanden', () => {
  assert.match(store, /export\s+const\s+useCampaignStore/);
});

test('useCampaignStore verwendet Zustand persist-Middleware', () => {
  assert.ok(store.includes('persist('), 'persist-Middleware fehlt');
  assert.ok(store.includes('createJSONStorage'), 'createJSONStorage fehlt');
  assert.ok(store.includes('AsyncStorage'), 'AsyncStorage fehlt');
});

test('useCampaignStore hat campaigns-Array im State', () => {
  assert.ok(store.includes('campaigns:'), 'campaigns-Feld fehlt');
});

test('useCampaignStore hat isSyncing-Flag', () => {
  assert.ok(store.includes('isSyncing'), 'isSyncing fehlt');
});

// ─── Optimistisches Offline-Pattern ──────────────────────────────────────────

test('createCampaign setzt syncStatus auf "pending" beim optimistischen Eintrag', () => {
  assert.ok(store.includes("syncStatus: 'pending'"), 'optimistisches pending fehlt');
});

test('createCampaign aktualisiert syncStatus auf "synced" nach erfolgreichem Backend-Call', () => {
  assert.ok(store.includes("syncStatus: 'synced' as const"), 'synced-Update fehlt');
});

test('fetchCampaigns behält pending-Kampagnen die nicht im Backend sind', () => {
  assert.ok(
    store.includes("syncStatus === 'pending'"),
    'Pending-Filter in fetchCampaigns fehlt',
  );
});

test('fetchCampaigns synchronisiert pending-Kampagnen nach (fire-and-forget)', () => {
  assert.ok(store.includes('.catch(() => {})'), 'fire-and-forget catch fehlt');
});

// ─── Aktionen ─────────────────────────────────────────────────────────────────

test('useCampaignStore hat createCampaign-Aktion', () => {
  assert.ok(store.includes('createCampaign:'), 'createCampaign fehlt');
});

test('useCampaignStore hat deleteCampaign-Aktion', () => {
  assert.ok(store.includes('deleteCampaign:'), 'deleteCampaign fehlt');
});

test('useCampaignStore hat fetchCampaigns-Aktion', () => {
  assert.ok(store.includes('fetchCampaigns:'), 'fetchCampaigns fehlt');
});

test('useCampaignStore hat getCampaignById-Selektor', () => {
  assert.ok(store.includes('getCampaignById:'), 'getCampaignById fehlt');
});

// ─── Campaign-Typen ───────────────────────────────────────────────────────────

test('Campaign-Interface hat syncStatus-Feld', () => {
  assert.ok(types.includes('syncStatus'), 'syncStatus fehlt in Campaign');
});

test('Campaign syncStatus unterscheidet synced und pending', () => {
  assert.ok(types.includes("'synced'"), 'synced fehlt in syncStatus');
  assert.ok(types.includes("'pending'"), 'pending fehlt in syncStatus');
});

test('CampaignDraft-Interface ist exportiert', () => {
  assert.match(types, /export\s+interface\s+CampaignDraft\b/);
});

// ─── Public API (index.ts) ────────────────────────────────────────────────────

test('campaigns/index.ts exportiert useCampaignStore', () => {
  assert.ok(index.includes('useCampaignStore'), 'useCampaignStore fehlt im Index');
});

test('campaigns/index.ts exportiert Campaign und CampaignDraft', () => {
  assert.ok(index.includes('Campaign'), 'Campaign fehlt im Index');
  assert.ok(index.includes('CampaignDraft'), 'CampaignDraft fehlt im Index');
});

test('campaigns/index.ts exportiert campaignService', () => {
  assert.ok(index.includes('campaignService'), 'campaignService fehlt im Index');
});
