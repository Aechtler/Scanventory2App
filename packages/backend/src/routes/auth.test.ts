import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildAuthErrorResponse,
  normalizeAuthCredentials,
  validatePassword,
} from './auth/shared.ts';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

test('normalizeAuthCredentials trims email, lowercases it, and normalizes optional names', () => {
  const result = normalizeAuthCredentials({
    email: '  USER@Example.COM ',
    password: 'Secret123',
    name: '  Scan User  ',
  });

  assert.deepEqual(result, {
    email: 'user@example.com',
    password: 'Secret123',
    name: 'Scan User',
  });
});

test('normalizeAuthCredentials rejects missing string credentials', () => {
  assert.equal(normalizeAuthCredentials({ email: 'user@example.com' }), null);
  assert.equal(normalizeAuthCredentials({ email: 123, password: 'Secret123' }), null);
  assert.equal(normalizeAuthCredentials(null), null);
});

test('validatePassword enforces the current complexity rules', () => {
  assert.equal(validatePassword('short'), 'Password must be at least 8 characters long');
  assert.equal(
    validatePassword('PASSWORD123'),
    'Password must include at least one lowercase letter'
  );
  assert.equal(
    validatePassword('password123'),
    'Password must include at least one uppercase letter'
  );
  assert.equal(
    validatePassword('PasswordOnly'),
    'Password must include at least one number'
  );
  assert.equal(validatePassword('Password123'), null);
});

test('buildAuthErrorResponse returns the normalized API error envelope', () => {
  assert.deepEqual(
    buildAuthErrorResponse('BAD_REQUEST', 'Email and password are required'),
    {
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Email and password are required',
      },
    }
  );
});

test('auth route stays reviewable and delegates auth helper logic', () => {
  const routeSource = readFileSync(path.join(currentDir, 'auth.ts'), 'utf8');
  const routeLineCount = routeSource.trimEnd().split('\n').length;

  assert.ok(
    routeLineCount <= 150,
    `expected auth.ts to stay reviewable, got ${routeLineCount} lines`
  );
  assert.match(routeSource, /from '\.\/auth\/shared(?:\.ts)?'/);
  assert.match(routeSource, /normalizeAuthCredentials/);
  assert.match(routeSource, /buildAuthErrorResponse/);
});
