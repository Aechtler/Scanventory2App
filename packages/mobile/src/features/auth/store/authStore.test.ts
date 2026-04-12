import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const source = readFileSync(path.join(dir, 'authStore.ts'), 'utf8');

// ─── Exports ──────────────────────────────────────────────────────────────────

test('useAuthStore ist als benannter Export vorhanden', () => {
  assert.match(source, /export\s+const\s+useAuthStore/);
});

test('User-Interface ist exportiert', () => {
  assert.match(source, /export\s+interface\s+User\b/);
});

// ─── User-Shape ───────────────────────────────────────────────────────────────

test('User hat Pflichtfelder id, email, name, isAdmin', () => {
  assert.ok(source.includes('id:'), 'id fehlt in User');
  assert.ok(source.includes('email:'), 'email fehlt in User');
  assert.ok(source.includes('name:'), 'name fehlt in User');
  assert.ok(source.includes('isAdmin:'), 'isAdmin fehlt in User');
});

test('User hat optionale Profilfelder für Social-Feature', () => {
  assert.ok(source.includes('username'), 'username fehlt in User');
  assert.ok(source.includes('displayName'), 'displayName fehlt in User');
  assert.ok(source.includes('avatarUrl'), 'avatarUrl fehlt in User');
});

// ─── Auth-State ───────────────────────────────────────────────────────────────

test('AuthState hat user, token, isAuthenticated und isLoading', () => {
  assert.ok(source.includes('user:'), 'user fehlt in AuthState');
  assert.ok(source.includes('token:'), 'token fehlt in AuthState');
  assert.ok(source.includes('isAuthenticated:'), 'isAuthenticated fehlt in AuthState');
  assert.ok(source.includes('isLoading:'), 'isLoading fehlt in AuthState');
});

// ─── Auth-Aktionen ────────────────────────────────────────────────────────────

test('AuthState hat login-Aktion', () => {
  assert.ok(source.includes('login:'), 'login fehlt in AuthState');
});

test('AuthState hat logout-Aktion', () => {
  assert.ok(source.includes('logout:'), 'logout fehlt in AuthState');
});

test('AuthState hat register-Aktion', () => {
  assert.ok(source.includes('register:'), 'register fehlt in AuthState');
});

test('AuthState hat loadUser-Aktion für Session-Wiederherstellung', () => {
  assert.ok(source.includes('loadUser:'), 'loadUser fehlt in AuthState');
});

// ─── Sicherheits-Mechanismen ──────────────────────────────────────────────────

test('authStore verwendet Request-Timeout', () => {
  assert.ok(
    source.includes('REQUEST_TIMEOUT_MS') || source.includes('withTimeout'),
    'Kein Timeout-Mechanismus gefunden',
  );
});

test('authStore löscht Session bei Logout', () => {
  assert.ok(source.includes('clearAuthSession'), 'clearAuthSession fehlt');
});

test('authStore unterstützt Token-Refresh', () => {
  assert.ok(
    source.includes('refresh') || source.includes('refreshToken'),
    'Kein Token-Refresh gefunden',
  );
});
