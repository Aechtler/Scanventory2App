import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildRequestLogLine } from './requestLogging.ts';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

test('buildRequestLogLine includes method, path, status, timing, and user id', () => {
  const line = buildRequestLogLine({
    method: 'GET',
    path: '/api/items?page=1',
    statusCode: 200,
    durationMs: 18,
    userId: 'user-123',
  });

  assert.equal(
    line,
    '[Request] GET /api/items?page=1 status=200 durationMs=18 user=user-123'
  );
});

test('buildRequestLogLine falls back to anonymous when no user id exists', () => {
  const line = buildRequestLogLine({
    method: 'POST',
    path: '/api/auth/login',
    statusCode: 401,
    durationMs: 7,
  });

  assert.equal(
    line,
    '[Request] POST /api/auth/login status=401 durationMs=7 user=anonymous'
  );
});

test('express app registers the request logging middleware before api routes', () => {
  const appSource = readFileSync(path.join(currentDir, '..', 'app.ts'), 'utf8');

  assert.match(appSource, /import\s+\{\s*requestLoggingMiddleware\s*\}\s+from\s+'\.\/middleware\/requestLogging'/);
  assert.match(
    appSource,
    /app\.use\(requestLoggingMiddleware\);\s*[\s\S]*app\.use\('\/api',\s*apiRoutes\);/
  );
});
