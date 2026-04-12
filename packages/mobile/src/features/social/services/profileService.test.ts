import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const featureRoot = path.resolve(dir, '..');

const profileService = readFileSync(path.join(dir, 'profileService.ts'), 'utf8');
const followService = readFileSync(path.join(dir, 'followService.ts'), 'utf8');
const types = readFileSync(path.join(featureRoot, 'types', 'profile.types.ts'), 'utf8');
const index = readFileSync(path.join(featureRoot, 'index.ts'), 'utf8');

// ─── profileService ───────────────────────────────────────────────────────────

test('profileService exportiert updateProfile', () => {
  assert.match(profileService, /export\s+async\s+function\s+updateProfile\b/);
});

test('profileService exportiert checkUsernameAvailability', () => {
  assert.match(profileService, /export\s+async\s+function\s+checkUsernameAvailability\b/);
});

test('profileService exportiert getPublicProfile', () => {
  assert.match(profileService, /export\s+async\s+function\s+getPublicProfile\b/);
});

test('profileService exportiert searchUsers', () => {
  assert.match(profileService, /export\s+async\s+function\s+searchUsers\b/);
});

// ─── followService ────────────────────────────────────────────────────────────

test('followService exportiert followUser', () => {
  assert.match(followService, /export\s+async\s+function\s+followUser\b/);
});

test('followService exportiert unfollowUser', () => {
  assert.match(followService, /export\s+async\s+function\s+unfollowUser\b/);
});

test('followService exportiert getFollowers und getFollowing', () => {
  assert.match(followService, /export\s+async\s+function\s+getFollowers\b/);
  assert.match(followService, /export\s+async\s+function\s+getFollowing\b/);
});

// ─── Typen ────────────────────────────────────────────────────────────────────

test('PublicProfile-Interface ist exportiert', () => {
  assert.match(types, /export\s+interface\s+PublicProfile\b/);
});

test('PublicProfile hat followerCount und followingCount', () => {
  assert.ok(types.includes('followerCount'), 'followerCount fehlt');
  assert.ok(types.includes('followingCount'), 'followingCount fehlt');
});

test('ProfileUpdatePayload-Interface ist exportiert', () => {
  assert.match(types, /export\s+interface\s+ProfileUpdatePayload\b/);
});

test('UsernameCheckResult hat available-Feld', () => {
  assert.match(types, /export\s+interface\s+UsernameCheckResult\b/);
  assert.ok(types.includes('available:'), 'available fehlt in UsernameCheckResult');
});

// ─── Public API (index.ts) ────────────────────────────────────────────────────

test('social/index.ts exportiert alle Profil-Typen', () => {
  assert.ok(index.includes('PublicProfile'), 'PublicProfile fehlt im Index');
  assert.ok(index.includes('ProfileUpdatePayload'), 'ProfileUpdatePayload fehlt im Index');
  assert.ok(index.includes('UsernameCheckResult'), 'UsernameCheckResult fehlt im Index');
});

test('social/index.ts exportiert Hooks', () => {
  assert.ok(index.includes('useProfile'), 'useProfile fehlt im Index');
  assert.ok(index.includes('usePublicProfile'), 'usePublicProfile fehlt im Index');
  assert.ok(index.includes('useUsernameCheck'), 'useUsernameCheck fehlt im Index');
  assert.ok(index.includes('useFollow'), 'useFollow fehlt im Index');
  assert.ok(index.includes('useSearch'), 'useSearch fehlt im Index');
});
