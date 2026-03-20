import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  collectMissingInstalledPackageRequirements,
  collectWorkspaceDependencyOwners,
  collectMissingWorkspaceDependencyRequirements,
  collectMissingToolchainRequirements,
  collectOfflineCacheMissesFromLockfile,
  extractOfflineInstallCacheMisses,
  formatMissingToolchainRequirements,
  loadPackageLock,
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

test('collectMissingInstalledPackageRequirements flags hollow installed packages beyond the fixed toolchain list', () => {
  const repoRoot = createTempRepo();

  fs.writeFileSync(
    path.join(repoRoot, 'package-lock.json'),
    JSON.stringify({
      packages: {
        'node_modules/@types/react': {
          version: '19.1.0',
        },
        'node_modules/@types/yargs': {
          version: '17.0.33',
        },
      },
    }),
  );

  fs.mkdirSync(path.join(repoRoot, 'node_modules', '@types', 'react'), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(repoRoot, 'node_modules', '@types', 'react', 'package.json'),
    '{"name":"@types/react"}',
  );
  fs.mkdirSync(path.join(repoRoot, 'node_modules', '@types', 'yargs'), {
    recursive: true,
  });

  const missing = collectMissingInstalledPackageRequirements(repoRoot);

  assert.deepEqual(missing, [
    {
      moduleDirectory: 'node_modules/@types/react',
      missingFiles: ['index.d.ts'],
    },
    {
      moduleDirectory: 'node_modules/@types/yargs',
      missingFiles: ['package.json', 'index.d.ts'],
    },
  ]);
});

test('collectMissingInstalledPackageRequirements also flags hollow non-types installed packages present on disk', () => {
  const repoRoot = createTempRepo();

  fs.writeFileSync(
    path.join(repoRoot, 'package-lock.json'),
    JSON.stringify({
      packages: {
        'node_modules/react': {
          version: '19.1.0',
        },
        'node_modules/@babel/core': {
          version: '7.28.4',
        },
      },
    }),
  );

  fs.mkdirSync(path.join(repoRoot, 'node_modules', 'react'), {
    recursive: true,
  });
  fs.mkdirSync(path.join(repoRoot, 'node_modules', '@babel', 'core'), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(repoRoot, 'node_modules', '@babel', 'core', 'package.json'),
    '{"name":"@babel/core"}',
  );

  const missing = collectMissingInstalledPackageRequirements(repoRoot);

  assert.deepEqual(missing, [
    {
      moduleDirectory: 'node_modules/react',
      missingFiles: ['package.json'],
    },
  ]);
});

test('collectMissingInstalledPackageRequirements ignores nested package-owned node_modules entries', () => {
  const repoRoot = createTempRepo();

  fs.writeFileSync(
    path.join(repoRoot, 'package-lock.json'),
    JSON.stringify({
      packages: {
        'node_modules/expo': {
          version: '54.0.32',
        },
        'node_modules/expo/node_modules/@expo/metro-config': {
          version: '54.0.8',
        },
      },
    }),
  );

  fs.mkdirSync(path.join(repoRoot, 'node_modules', 'expo'), {
    recursive: true,
  });
  fs.mkdirSync(
    path.join(repoRoot, 'node_modules', 'expo', 'node_modules', '@expo', 'metro-config'),
    {
      recursive: true,
    },
  );

  const missing = collectMissingInstalledPackageRequirements(repoRoot);

  assert.deepEqual(missing, [
    {
      moduleDirectory: 'node_modules/expo',
      missingFiles: ['package.json', 'tsconfig.base'],
    },
  ]);
});

test('collectMissingWorkspaceDependencyRequirements flags hollow direct workspace dependencies', () => {
  const repoRoot = createTempRepo();

  fs.writeFileSync(
    path.join(repoRoot, 'package.json'),
    JSON.stringify({
      private: true,
      workspaces: ['packages/*'],
      dependencies: {
        react: '19.1.0',
      },
    }),
  );
  fs.mkdirSync(path.join(repoRoot, 'packages', 'backend'), { recursive: true });
  fs.writeFileSync(
    path.join(repoRoot, 'packages', 'backend', 'package.json'),
    JSON.stringify({
      name: '@scanapp/backend',
      dependencies: {
        cors: '^2.8.5',
      },
      devDependencies: {
        typescript: '~5.9.2',
      },
    }),
  );
  fs.mkdirSync(path.join(repoRoot, 'packages', 'mobile'), { recursive: true });
  fs.writeFileSync(
    path.join(repoRoot, 'packages', 'mobile', 'package.json'),
    JSON.stringify({
      name: '@scanapp/mobile',
      dependencies: {
        expo: '~54.0.32',
      },
    }),
  );

  fs.mkdirSync(path.join(repoRoot, 'node_modules', 'react'), { recursive: true });
  fs.writeFileSync(
    path.join(repoRoot, 'node_modules', 'react', 'package.json'),
    '{"name":"react"}',
  );
  fs.mkdirSync(path.join(repoRoot, 'node_modules', 'expo'), { recursive: true });
  fs.mkdirSync(path.join(repoRoot, 'node_modules', 'typescript'), { recursive: true });
  fs.writeFileSync(
    path.join(repoRoot, 'node_modules', 'typescript', 'package.json'),
    '{"name":"typescript"}',
  );

  const missing = collectMissingWorkspaceDependencyRequirements(repoRoot);

  assert.deepEqual(missing, [
    {
      moduleDirectory: 'node_modules/cors',
      missingFiles: ['package.json'],
    },
    {
      moduleDirectory: 'node_modules/expo',
      missingFiles: ['package.json'],
    },
  ]);
});

test('collectWorkspaceDependencyOwners maps external dependencies back to root and workspace packages', () => {
  const repoRoot = createTempRepo();

  fs.writeFileSync(
    path.join(repoRoot, 'package.json'),
    JSON.stringify({
      name: '@scanapp/root',
      private: true,
      workspaces: ['packages/*'],
      dependencies: {
        react: '19.1.0',
      },
      devDependencies: {
        typescript: '~5.9.2',
      },
    }),
  );
  fs.mkdirSync(path.join(repoRoot, 'packages', 'backend'), { recursive: true });
  fs.writeFileSync(
    path.join(repoRoot, 'packages', 'backend', 'package.json'),
    JSON.stringify({
      name: '@scanapp/backend',
      dependencies: {
        react: '19.1.0',
        express: '^5.1.0',
      },
    }),
  );
  fs.mkdirSync(path.join(repoRoot, 'packages', 'mobile'), { recursive: true });
  fs.writeFileSync(
    path.join(repoRoot, 'packages', 'mobile', 'package.json'),
    JSON.stringify({
      name: '@scanapp/mobile',
      dependencies: {
        expo: '~54.0.32',
        react: '19.1.0',
      },
    }),
  );

  assert.deepEqual(collectWorkspaceDependencyOwners(repoRoot), {
    expo: ['@scanapp/mobile'],
    express: ['@scanapp/backend'],
    react: ['@scanapp/backend', '@scanapp/mobile', '@scanapp/root'],
    typescript: ['@scanapp/root'],
  });
});

test('formatMissingToolchainRequirements renders a stable actionable message', () => {
  const message = formatMissingToolchainRequirements(
    [
      {
        moduleDirectory: 'node_modules/expo',
        missingFiles: ['package.json', 'tsconfig.base'],
      },
      {
        moduleDirectory: 'node_modules/@types/uuid',
        missingFiles: ['package.json', 'index.d.ts'],
      },
    ],
    {
      workspaceDependencyOwners: {
        expo: ['@scanapp/mobile'],
        uuid: ['@scanapp/backend'],
      },
    },
  );

  assert.equal(
    message,
    [
      'Workspace setup incomplete. Missing required package files:',
      '- node_modules/expo -> package.json, tsconfig.base',
      '- node_modules/@types/uuid -> package.json, index.d.ts',
      '',
      'Direct workspace dependency owners:',
      '- expo -> @scanapp/mobile',
      '',
      'Workspace-owned type-definition blockers:',
      '- @types/uuid (for uuid) -> @scanapp/backend',
      '',
      'Suggested next steps:',
      '- Restore the missing packages from cache or reinstall with network access.',
      '- If network access is available, run: npm install',
      '- Then rerun: npm run setup:workspace',
      '- Likely affected packages: expo, @types/uuid',
    ].join('\n'),
  );
});

test('formatMissingToolchainRequirements maps scoped @types packages back to workspace dependency owners', () => {
  const message = formatMissingToolchainRequirements(
    [
      {
        moduleDirectory: 'node_modules/@types/babel__core',
        missingFiles: ['package.json', 'index.d.ts'],
      },
    ],
    {
      workspaceDependencyOwners: {
        '@types/babel__core': ['@scanapp/mobile'],
        '@babel/core': ['@scanapp/mobile'],
      },
    },
  );

  assert.equal(
    message,
    [
      'Workspace setup incomplete. Missing required package files:',
      '- node_modules/@types/babel__core -> package.json, index.d.ts',
      '',
      'Direct workspace dependency owners:',
      '- @types/babel__core (for @babel/core) -> @scanapp/mobile',
      '',
      'Suggested next steps:',
      '- Restore the missing packages from cache or reinstall with network access.',
      '- If network access is available, run: npm install',
      '- Then rerun: npm run setup:workspace',
      '- Likely affected packages: @types/babel__core',
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
      workspaceDependencyOwners: {
        expo: ['@scanapp/mobile'],
      },
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
      'Direct workspace dependency owners:',
      '- expo -> @scanapp/mobile',
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

test('loadPackageLock reports malformed lockfiles with an actionable issue', () => {
  const repoRoot = createTempRepo();
  const packageLockPath = path.join(repoRoot, 'package-lock.json');

  fs.writeFileSync(packageLockPath, '{invalid json');

  const result = loadPackageLock(repoRoot);

  assert.equal(result.packageLock, null);
  assert.deepEqual(result.issue, {
    packageLockPath,
    reason: 'invalid',
    detail: `Unable to parse ${packageLockPath}: Expected property name or '}' in JSON at position 1 (line 1 column 2)`,
  });
});

test('formatMissingToolchainRequirements appends package-lock remediation when provided', () => {
  const message = formatMissingToolchainRequirements(
    [
      {
        moduleDirectory: 'node_modules/expo',
        missingFiles: ['package.json', 'tsconfig.base'],
      },
    ],
    {
      packageLockIssue: {
        packageLockPath: '/tmp/repo/package-lock.json',
        reason: 'missing',
        detail: 'Missing root package-lock.json at /tmp/repo/package-lock.json',
      },
    },
  );

  assert.equal(
    message,
    [
      'Workspace setup incomplete. Missing required package files:',
      '- node_modules/expo -> package.json, tsconfig.base',
      '',
      'Additional hollow installed packages:',
      '- expo',
      '',
      'Package-lock issue detected:',
      '- Missing root package-lock.json at /tmp/repo/package-lock.json',
      '',
      'Suggested next steps:',
      '- Restore or regenerate the root package-lock.json before retrying workspace setup.',
      '- Restore the missing packages from cache or reinstall with network access.',
      '- If network access is available, run: npm install',
      '- Then rerun: npm run setup:workspace',
      '- Likely affected packages: expo',
    ].join('\n'),
  );
});

test('formatMissingToolchainRequirements summarizes large transitive requirement and cache-miss lists', () => {
  const missingRequirements = Array.from({ length: 7 }, (_, index) => ({
    moduleDirectory: `node_modules/transitive-${index + 1}`,
    missingFiles: ['package.json'],
  }));

  const offlineCacheMisses = Array.from({ length: 7 }, (_, index) => ({
    packageName: `transitive-${index + 1}`,
    tarballUrl: `https://registry.npmjs.org/transitive-${index + 1}/-/transitive-${index + 1}-1.0.0.tgz`,
  }));

  const message = formatMissingToolchainRequirements(missingRequirements, {
    maxListedEntries: 3,
    offlineCacheMisses,
  });

  assert.equal(
    message,
    [
      'Workspace setup incomplete. Missing required package files:',
      '- node_modules/transitive-1 -> package.json',
      '- node_modules/transitive-2 -> package.json',
      '- node_modules/transitive-3 -> package.json',
      '- ... 4 more missing package entries omitted for brevity',
      '',
      'Additional hollow installed packages (showing first 3 of 7):',
      '- transitive-1',
      '- transitive-2',
      '- transitive-3',
      '- ... 4 more packages omitted for brevity',
      '',
      'Offline npm cache misses detected (showing first 3 of 7):',
      '- transitive-1 -> https://registry.npmjs.org/transitive-1/-/transitive-1-1.0.0.tgz',
      '- transitive-2 -> https://registry.npmjs.org/transitive-2/-/transitive-2-1.0.0.tgz',
      '- transitive-3 -> https://registry.npmjs.org/transitive-3/-/transitive-3-1.0.0.tgz',
      '- ... 4 more cache misses omitted for brevity',
      '',
      'Suggested next steps:',
      '- Restore the missing packages from cache or reinstall with network access.',
      '- If network access is available, run: npm install',
      '- Then rerun: npm run setup:workspace',
      '- Likely affected packages (showing first 3 of 7): transitive-1, transitive-2, transitive-3',
      '- ... 4 more affected packages omitted for brevity',
    ].join('\n'),
  );
});
