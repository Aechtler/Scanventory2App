import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  getCreateItemBodyValidationError,
  getPaginationParams,
  parseCreateItemData,
} from './shared.ts';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

test('items route split files exist', () => {
  assert.equal(existsSync(path.join(currentDir, 'create.ts')), true);
  assert.equal(existsSync(path.join(currentDir, 'delete.ts')), true);
  assert.equal(existsSync(path.join(currentDir, 'read.ts')), true);
  assert.equal(existsSync(path.join(currentDir, 'update.ts')), true);
});

test('getPaginationParams clamps invalid and oversized query values', () => {
  assert.deepEqual(getPaginationParams({ page: '0', limit: '999' }), {
    page: 1,
    limit: 100,
  });

  assert.deepEqual(getPaginationParams({ page: '3', limit: '5' }), {
    page: 3,
    limit: 5,
  });

  assert.deepEqual(getPaginationParams({}), {
    page: 1,
    limit: 20,
  });
});

test('parseCreateItemData rejects invalid JSON payloads', () => {
  assert.deepEqual(parseCreateItemData('{"productName":'), {
    error: 'Invalid JSON in data field',
  });
});

test('getCreateItemBodyValidationError validates required create-item fields', () => {
  assert.equal(getCreateItemBodyValidationError(null), 'Item payload is required');

  assert.equal(
    getCreateItemBodyValidationError({
      productName: 'Nintendo Switch',
      category: 'Console',
      condition: 'Used',
      searchQuery: 'switch console',
      confidence: 0.91,
      scannedAt: '2026-03-19T10:00:00.000Z',
    }),
    null
  );

  assert.equal(
    getCreateItemBodyValidationError({
      productName: 'Nintendo Switch',
      category: 'Console',
      condition: 'Used',
      searchQuery: 'switch console',
      confidence: '0.91',
      scannedAt: '2026-03-19T10:00:00.000Z',
    }),
    'confidence must be a valid number'
  );
});
