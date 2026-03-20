import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

test('useAsync exposes an explicit exported return type', () => {
  const hookSource = readFileSync(path.join(currentDir, 'useAsync.ts'), 'utf8');

  assert.match(
    hookSource,
    /export\s+(?:interface|type)\s+UseAsyncResult<[\s\S]*?execute:\s*\(\.\.\.args:\s*Args\)\s*=>\s*Promise<T\s*\|\s*null>[\s\S]*?reset:\s*\(\)\s*=>\s*void/,
  );

  assert.match(
    hookSource,
    /export\s+function\s+useAsync<T,\s*Args extends unknown\[\]\s*=\s*\[\]>\([\s\S]*?\):\s*UseAsyncResult<T,\s*Args>/,
  );
});
