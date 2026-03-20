import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');

function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('root docker compose reads database credentials from env files', () => {
  const compose = readRepoFile('docker-compose.yml');
  const dockerEnvExample = readRepoFile('.env.docker.example');

  assert.match(compose, /env_file:/);
  assert.match(compose, /\.env\.docker/);
  assert.doesNotMatch(compose, /POSTGRES_PASSWORD:\s*scanapp_dev/);
  assert.doesNotMatch(compose, /DATABASE_URL:\s*postgresql:\/\/scanapp:scanapp_dev@db:5432\/scanapp/);
  assert.match(dockerEnvExample, /^POSTGRES_USER=/m);
  assert.match(dockerEnvExample, /^POSTGRES_PASSWORD=/m);
  assert.match(dockerEnvExample, /^POSTGRES_DB=/m);
  assert.match(dockerEnvExample, /^DATABASE_URL=/m);
});

test('backend docker compose reads database credentials from env files', () => {
  const compose = readRepoFile('packages/backend/docker-compose.yml');
  const backendEnvExample = readRepoFile('packages/backend/.env.example');

  assert.match(compose, /env_file:/);
  assert.match(compose, /\.env/);
  assert.doesNotMatch(compose, /POSTGRES_PASSWORD:\s*scanapp_dev/);
  assert.doesNotMatch(compose, /DATABASE_URL:\s*postgresql:\/\/scanapp:scanapp_dev@db:5432\/scanapp/);
  assert.match(backendEnvExample, /^POSTGRES_USER=/m);
  assert.match(backendEnvExample, /^POSTGRES_PASSWORD=/m);
  assert.match(backendEnvExample, /^POSTGRES_DB=/m);
  assert.match(backendEnvExample, /^DATABASE_URL=/m);
});
