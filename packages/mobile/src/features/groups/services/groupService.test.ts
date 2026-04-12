import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const featureRoot = path.resolve(dir, '..');

const service = readFileSync(path.join(dir, 'groupService.ts'), 'utf8');
const types = readFileSync(path.join(featureRoot, 'types', 'group.types.ts'), 'utf8');
const index = readFileSync(path.join(featureRoot, 'index.ts'), 'utf8');

// ─── groupService ─────────────────────────────────────────────────────────────

test('groupService ist als benannter Export vorhanden', () => {
  assert.match(service, /export\s+const\s+groupService/);
});

test('groupService hat CRUD-Methoden', () => {
  assert.ok(service.includes('create:'), 'create fehlt');
  assert.ok(service.includes('getById:'), 'getById fehlt');
  assert.ok(service.includes('getMine:'), 'getMine fehlt');
});

test('groupService hat Mitglieder-Methoden', () => {
  assert.ok(service.includes('getMembers:'), 'getMembers fehlt');
  assert.ok(service.includes('invite:') || service.includes('invite('), 'invite fehlt');
});

test('groupService unterstützt Beitritt per Invite-Code', () => {
  assert.ok(service.includes('joinByCode:'), 'joinByCode fehlt');
  assert.ok(service.includes('getByInviteCode:'), 'getByInviteCode fehlt');
});

// ─── Typen ────────────────────────────────────────────────────────────────────

test('GroupSummary-Interface ist exportiert', () => {
  assert.match(types, /export\s+interface\s+GroupSummary\b/);
});

test('GroupSummary hat inviteCode-Feld', () => {
  assert.ok(types.includes('inviteCode:'), 'inviteCode fehlt in GroupSummary');
});

test('GroupMember-Interface ist exportiert', () => {
  assert.match(types, /export\s+interface\s+GroupMember\b/);
});

test('GroupRole-Typ enthält OWNER, ADMIN und MEMBER', () => {
  assert.match(types, /export\s+type\s+GroupRole/);
  assert.ok(types.includes("'OWNER'"), 'OWNER fehlt in GroupRole');
  assert.ok(types.includes("'ADMIN'"), 'ADMIN fehlt in GroupRole');
  assert.ok(types.includes("'MEMBER'"), 'MEMBER fehlt in GroupRole');
});

test('GroupInvitation-Interface ist exportiert', () => {
  assert.match(types, /export\s+interface\s+GroupInvitation\b/);
});

test('GroupInvitation hat status mit PENDING, ACCEPTED, DECLINED', () => {
  assert.ok(types.includes("'PENDING'"), 'PENDING fehlt');
  assert.ok(types.includes("'ACCEPTED'"), 'ACCEPTED fehlt');
  assert.ok(types.includes("'DECLINED'"), 'DECLINED fehlt');
});

// ─── Public API (index.ts) ────────────────────────────────────────────────────

test('groups/index.ts exportiert groupService', () => {
  assert.ok(index.includes('groupService'), 'groupService fehlt im Index');
});

test('groups/index.ts exportiert alle Typen', () => {
  assert.ok(index.includes('GroupSummary'), 'GroupSummary fehlt im Index');
  assert.ok(index.includes('GroupMember'), 'GroupMember fehlt im Index');
  assert.ok(index.includes('GroupRole'), 'GroupRole fehlt im Index');
  assert.ok(index.includes('GroupInvitation'), 'GroupInvitation fehlt im Index');
  assert.ok(index.includes('CreateGroupPayload'), 'CreateGroupPayload fehlt im Index');
});

test('groups/index.ts exportiert Hooks', () => {
  assert.ok(index.includes('useGroup'), 'useGroup fehlt im Index');
  assert.ok(index.includes('useGroupList'), 'useGroupList fehlt im Index');
  assert.ok(index.includes('useCreateGroup'), 'useCreateGroup fehlt im Index');
});
