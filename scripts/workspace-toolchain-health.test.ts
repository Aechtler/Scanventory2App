import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  collectMissingToolchainRequirements,
  collectOfflineCacheMissesFromLockfile,
  extractOfflineInstallCacheMisses,
  formatMissingToolchainRequirements,
  restoreMissingToolchainRequirementsFromCache,
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
      '',
      'Suggested next steps:',
      '- Restore the missing packages from cache or reinstall with network access.',
      '- If network access is available, run: npm install',
      '- Then rerun: npm run setup:workspace',
      '- Likely affected packages: expo, @types/uuid',
    ].join('\n'),
  );
});

test('extractOfflineInstallCacheMisses returns package tarball cache misses from npm offline output', () => {
  const misses = extractOfflineInstallCacheMisses(`
npm error code ENOTCACHED
npm error request to https://registry.npmjs.org/uuid/-/uuid-11.1.0.tgz failed: cache mode is 'only-if-cached' but no cached response is available.
npm error request to https://registry.npmjs.org/expo/-/expo-54.0.20.tgz failed: cache mode is 'only-if-cached' but no cached response is available.
`);

  assert.deepEqual(misses, [
    {
      packageName: 'uuid',
      tarballUrl: 'https://registry.npmjs.org/uuid/-/uuid-11.1.0.tgz',
    },
    {
      packageName: 'expo',
      tarballUrl: 'https://registry.npmjs.org/expo/-/expo-54.0.20.tgz',
    },
  ]);
});

test('formatMissingToolchainRequirements appends offline cache misses when provided', () => {
  const message = formatMissingToolchainRequirements(
    [
      {
        moduleDirectory: 'node_modules/expo',
        missingFiles: ['package.json', 'tsconfig.base'],
      },
    ],
    {
      offlineCacheMisses: [
        {
          packageName: 'uuid',
          tarballUrl: 'https://registry.npmjs.org/uuid/-/uuid-11.1.0.tgz',
        },
      ],
    },
  );

  assert.equal(
    message,
    [
      'Workspace setup incomplete. Missing required package files:',
      '- node_modules/expo -> package.json, tsconfig.base',
      '',
      'Offline npm cache misses detected:',
      '- uuid -> https://registry.npmjs.org/uuid/-/uuid-11.1.0.tgz',
      '',
      'Suggested next steps:',
      '- Restore the missing packages from cache or reinstall with network access.',
      '- If network access is available, run: npm install',
      '- Then rerun: npm run setup:workspace',
      '- Likely affected packages: expo',
    ].join('\n'),
  );
});

test('collectOfflineCacheMissesFromLockfile reports scoped and unscoped missing tarballs', async () => {
  const repoRoot = createTempRepo();

  fs.writeFileSync(
    path.join(repoRoot, 'package-lock.json'),
    JSON.stringify({
      packages: {
        'node_modules/expo': {
          version: '54.0.32',
          resolved: 'https://registry.npmjs.org/expo/-/expo-54.0.32.tgz',
          integrity: 'sha512-expo',
        },
        'node_modules/@types/uuid': {
          version: '10.0.0',
          resolved: 'https://registry.npmjs.org/@types/uuid/-/uuid-10.0.0.tgz',
          integrity: 'sha512-types-uuid',
        },
      },
    }),
  );

  const misses = await collectOfflineCacheMissesFromLockfile(
    repoRoot,
    [
      {
        moduleDirectory: 'node_modules/expo',
        missingFiles: ['package.json'],
      },
      {
        moduleDirectory: 'node_modules/@types/uuid',
        missingFiles: ['package.json', 'index.d.ts'],
      },
    ],
    {
      hasCachedTarball: async ({ integrity }) => integrity === 'sha512-expo',
    },
  );

  assert.deepEqual(misses, [
    {
      packageName: '@types/uuid',
      tarballUrl: 'https://registry.npmjs.org/@types/uuid/-/uuid-10.0.0.tgz',
    },
  ]);
});

test('restoreMissingToolchainRequirementsFromCache restores available tarballs and reports unresolved packages', async () => {
  const repoRoot = createTempRepo();

  fs.writeFileSync(
    path.join(repoRoot, 'package-lock.json'),
    JSON.stringify({
      packages: {
        'node_modules/expo': {
          version: '54.0.32',
          resolved: 'https://registry.npmjs.org/expo/-/expo-54.0.32.tgz',
          integrity: 'sha512-expo',
        },
        'node_modules/nativewind': {
          version: '4.2.1',
          resolved: 'https://registry.npmjs.org/nativewind/-/nativewind-4.2.1.tgz',
          integrity: 'sha512-nativewind',
        },
      },
    }),
  );

  fs.mkdirSync(path.join(repoRoot, 'node_modules', 'expo'), { recursive: true });
  fs.mkdirSync(path.join(repoRoot, 'node_modules', 'nativewind'), { recursive: true });

  const restored = await restoreMissingToolchainRequirementsFromCache(
    repoRoot,
    [
      {
        moduleDirectory: 'node_modules/expo',
        missingFiles: ['package.json', 'tsconfig.base'],
      },
      {
        moduleDirectory: 'node_modules/nativewind',
        missingFiles: ['package.json', 'types/index.d.ts'],
      },
    ],
    {
      readTarballByIntegrity: async (integrity) => {
        if (integrity === 'sha512-expo') {
          return Buffer.from('expo tarball');
        }

        const error = new Error('missing');
        (error as NodeJS.ErrnoException).code = 'ENOENT';
        throw error;
      },
      extractPackageTarball: async (packageBuffer, moduleDirectoryPath) => {
        fs.mkdirSync(moduleDirectoryPath, { recursive: true });
        fs.writeFileSync(
          path.join(moduleDirectoryPath, 'package.json'),
          packageBuffer.toString('utf8'),
        );
        fs.writeFileSync(path.join(moduleDirectoryPath, 'tsconfig.base'), '{}');
      },
    },
  );

  assert.deepEqual(restored, {
    restoredPackages: ['expo'],
    unresolvedRequirements: [
      {
        moduleDirectory: 'node_modules/nativewind',
        missingFiles: ['package.json', 'types/index.d.ts'],
      },
    ],
  });
  assert.equal(
    fs.readFileSync(path.join(repoRoot, 'node_modules', 'expo', 'package.json'), 'utf8'),
    'expo tarball',
  );
});
