import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  collectMissingToolchainRequirements,
  formatMissingToolchainRequirements,
} from './workspace-toolchain-health.mjs';

function createTempRepo(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'workspace-toolchain-health-'));
}

test('collectMissingToolchainRequirements flags hollow package directories as missing requirements', () => {
  const repoRoot = createTempRepo();
  const hollowExpoDir = path.join(repoRoot, 'node_modules', 'expo');

  fs.mkdirSync(hollowExpoDir, { recursive: true });
  fs.mkdirSync(path.join(repoRoot, 'node_modules', 'typescript', 'lib'), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(repoRoot, 'node_modules', 'typescript', 'lib', 'typescript.js'),
    '// stub',
  );

  const missing = collectMissingToolchainRequirements(repoRoot, [
    {
      moduleDirectory: 'node_modules/expo',
      requiredFiles: ['package.json', 'tsconfig.base'],
    },
    {
      moduleDirectory: 'node_modules/typescript',
      requiredFiles: ['lib/typescript.js'],
    },
  ]);

  assert.deepEqual(missing, [
    {
      moduleDirectory: 'node_modules/expo',
      missingFiles: ['package.json', 'tsconfig.base'],
    },
  ]);
});

test('formatMissingToolchainRequirements renders a stable actionable message', () => {
  const message = formatMissingToolchainRequirements([
    {
      moduleDirectory: 'node_modules/expo',
      missingFiles: ['package.json', 'tsconfig.base'],
    },
    {
      moduleDirectory: 'node_modules/@types/uuid',
      missingFiles: ['package.json', 'index.d.ts'],
    },
  ]);

  assert.equal(
    message,
    [
      'Workspace setup incomplete. Missing required package files:',
      '- node_modules/expo -> package.json, tsconfig.base',
      '- node_modules/@types/uuid -> package.json, index.d.ts',
    ].join('\n'),
  );
});
