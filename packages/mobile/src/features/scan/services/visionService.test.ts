import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const featureRoot = path.resolve(dir, '..');

const service = readFileSync(path.join(dir, 'visionService.ts'), 'utf8');
const index = readFileSync(path.join(featureRoot, 'index.ts'), 'utf8');

// ─── Typen ────────────────────────────────────────────────────────────────────

test('VisionMatch-Interface ist exportiert', () => {
  assert.match(service, /export\s+interface\s+VisionMatch\b/);
});

test('VisionResult-Interface ist exportiert', () => {
  assert.match(service, /export\s+interface\s+VisionResult\b/);
});

test('VisionError-Interface ist exportiert', () => {
  assert.match(service, /export\s+interface\s+VisionError\b/);
});

// ─── Funktionen ───────────────────────────────────────────────────────────────

test('analyzeImage ist als async-Funktion exportiert', () => {
  assert.match(service, /export\s+async\s+function\s+analyzeImage\b/);
});

test('analyzeImageMock ist als Entwicklungs-Fallback exportiert', () => {
  assert.match(service, /export\s+async\s+function\s+analyzeImageMock\b/);
});

test('identifyProductIdentifier ist exportiert', () => {
  assert.match(service, /export\s+async\s+function\s+identifyProductIdentifier\b/);
});

// ─── Signatur ─────────────────────────────────────────────────────────────────

test('analyzeImage nimmt imageUri als Parameter entgegen', () => {
  assert.ok(
    service.includes('analyzeImage(imageUri:') || service.includes('analyzeImage(imageUri '),
    'imageUri-Parameter fehlt in analyzeImage',
  );
});

test('analyzeImage gibt VisionResult zurück', () => {
  assert.ok(
    service.includes('Promise<VisionResult>'),
    'Rückgabetyp Promise<VisionResult> fehlt',
  );
});

// ─── Public API (index.ts) ────────────────────────────────────────────────────

test('scan/index.ts exportiert analyzeImage', () => {
  assert.ok(index.includes('analyzeImage'), 'analyzeImage fehlt im scan/index.ts');
});

test('scan/index.ts exportiert Vision-Typen', () => {
  assert.ok(index.includes('VisionMatch'), 'VisionMatch fehlt im Index');
  assert.ok(index.includes('VisionResult'), 'VisionResult fehlt im Index');
  assert.ok(index.includes('VisionError'), 'VisionError fehlt im Index');
});

test('scan/index.ts exportiert QRScannerOverlay und MatchSelectionSheet', () => {
  assert.ok(index.includes('QRScannerOverlay'), 'QRScannerOverlay fehlt im Index');
  assert.ok(index.includes('MatchSelectionSheet'), 'MatchSelectionSheet fehlt im Index');
});
