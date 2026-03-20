import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildRequestLogLine } from './requestLogging.ts';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

test('buildRequestLogLine includes request id, method, path, status, timing, and user id', () => {
  const line = buildRequestLogLine({
    requestId: 'req-123',
    method: 'GET',
    path: '/api/items?page=1',
    statusCode: 200,
    durationMs: 18,
    userId: 'user-123',
  });

  assert.equal(
    line,
    '[Request] req=req-123 GET /api/items?page=1 status=200 durationMs=18 user=user-123'
  );
});

test('buildRequestLogLine falls back to anonymous when no user id exists', () => {
  const line = buildRequestLogLine({
    requestId: 'req-456',
    method: 'POST',
    path: '/api/auth/login',
    statusCode: 401,
    durationMs: 7,
  });

  assert.equal(
    line,
    '[Request] req=req-456 POST /api/auth/login status=401 durationMs=7 user=anonymous'
  );
});

test('express app registers request id middleware before request logging and api routes', () => {
  const appSource = readFileSync(path.join(currentDir, '..', 'app.ts'), 'utf8');

  assert.match(appSource, /import\s+\{\s*requestIdMiddleware\s*\}\s+from\s+'\.\/middleware\/requestId'/);
  assert.match(appSource, /import\s+\{\s*requestLoggingMiddleware\s*\}\s+from\s+'\.\/middleware\/requestLogging'/);
  assert.match(
    appSource,
    /app\.use\(requestIdMiddleware\);\s*[\s\S]*app\.use\(requestLoggingMiddleware\);\s*[\s\S]*app\.use\('\/api',\s*apiRoutes\);/
  );
});
