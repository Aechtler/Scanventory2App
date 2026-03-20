import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(currentDir, 'schema.prisma');
const migrationsDir = path.join(currentDir, 'migrations');

function getLatestMigrationSql(): string {
  const latestMigrationDir = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .at(-1);

  assert.ok(latestMigrationDir, 'expected at least one Prisma migration directory');

  return readFileSync(path.join(migrationsDir, latestMigrationDir, 'migration.sql'), 'utf8');
}

test('scanned items schema defines the userId + scannedAt compound index', () => {
  const schema = readFileSync(schemaPath, 'utf8');

  assert.match(schema, /@@index\(\[userId,\s*scannedAt\]\)/);
});

test('latest Prisma migration creates the scanned-item userId + scannedAt compound index', () => {
  const migrationSql = getLatestMigrationSql();

  assert.match(
    migrationSql,
    /CREATE\s+INDEX\s+"ScannedItem_userId_scannedAt_idx"\s+ON\s+"ScannedItem"\("userId",\s*"scannedAt"\)/i
  );
});
