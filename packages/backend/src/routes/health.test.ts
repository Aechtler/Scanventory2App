import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildHealthResponse,
  type HealthDependencies,
} from './healthResponse.ts';

function createDependencies(
  overrides: Partial<HealthDependencies> = {}
): HealthDependencies {
  return {
    now: () => new Date('2026-03-20T00:00:00.000Z'),
    checkDatabase: async () => undefined,
    checkUploadDirWritable: async () => undefined,
    getDiskSpace: async () => ({
      freeBytes: 2_000,
      totalBytes: 10_000,
    }),
    minFreeDiskBytes: 1_000,
    ...overrides,
  };
}

test('buildHealthResponse returns ok when database, upload dir, and disk checks pass', async () => {
  const response = await buildHealthResponse(createDependencies());

  assert.equal(response.success, true);
  assert.equal(response.data.status, 'ok');
  assert.equal(response.data.timestamp, '2026-03-20T00:00:00.000Z');
  assert.deepEqual(response.data.checks, {
    server: { status: 'ok' },
    database: { status: 'ok' },
    uploadDir: { status: 'ok' },
    diskSpace: {
      status: 'ok',
      freeBytes: 2_000,
      totalBytes: 10_000,
      minFreeBytes: 1_000,
    },
  });
});

test('buildHealthResponse degrades when disk free space is below the minimum threshold', async () => {
  const response = await buildHealthResponse(
    createDependencies({
      getDiskSpace: async () => ({
        freeBytes: 500,
        totalBytes: 10_000,
      }),
    })
  );

  assert.equal(response.success, false);
  assert.equal(response.data.status, 'degraded');
  assert.deepEqual(response.data.checks.diskSpace, {
    status: 'error',
    freeBytes: 500,
    totalBytes: 10_000,
    minFreeBytes: 1_000,
    message: 'Free disk space below configured threshold',
  });
});

test('buildHealthResponse reports individual dependency failures', async () => {
  const response = await buildHealthResponse(
    createDependencies({
      checkDatabase: async () => {
        throw new Error('database down');
      },
      checkUploadDirWritable: async () => {
        throw new Error('permission denied');
      },
    })
  );

  assert.equal(response.success, false);
  assert.equal(response.data.status, 'degraded');
  assert.deepEqual(response.data.checks.database, {
    status: 'error',
    message: 'database down',
  });
  assert.deepEqual(response.data.checks.uploadDir, {
    status: 'error',
    message: 'permission denied',
  });
});
