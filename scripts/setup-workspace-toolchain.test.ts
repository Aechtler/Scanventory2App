import test from 'node:test';
import assert from 'node:assert/strict';

import { runSetupWorkspaceToolchain } from './setup-workspace-toolchain.mjs';

test('runSetupWorkspaceToolchain exits early with actionable package-lock diagnostics before install', async () => {
  const calls: string[] = [];
  const result = await runSetupWorkspaceToolchain({
    repoRoot: '/tmp/repo',
    loadPackageLock: () => ({
      packageLock: null,
      issue: {
        packageLockPath: '/tmp/repo/package-lock.json',
        reason: 'missing',
        detail: 'Missing root package-lock.json at /tmp/repo/package-lock.json',
      },
    }),
    collectMissingToolchainRequirements: () => [
      {
        moduleDirectory: 'node_modules/expo',
        missingFiles: ['package.json', 'tsconfig.base'],
      },
    ],
    collectMissingInstalledPackageRequirements: () => [],
    formatMissingToolchainRequirements: (requirements, options) => {
      calls.push('format');
      assert.deepEqual(requirements, [
        {
          moduleDirectory: 'node_modules/expo',
          missingFiles: ['package.json', 'tsconfig.base'],
        },
      ]);
      assert.deepEqual(options?.packageLockIssue, {
        packageLockPath: '/tmp/repo/package-lock.json',
        reason: 'missing',
        detail: 'Missing root package-lock.json at /tmp/repo/package-lock.json',
      });
      return 'package-lock issue';
    },
    restoreMissingToolchainRequirementsFromCache: async () => {
      calls.push('restore');
      return { restoredPackages: [], unresolvedRequirements: [] };
    },
    runNpmInstall: () => {
      calls.push('install');
      return { status: 0, stdout: '', stderr: '' };
    },
    console: {
      log: () => calls.push('log'),
      error: (message: string) => calls.push(`error:${message}`),
    },
  });

  assert.equal(result.exitCode, 1);
  assert.deepEqual(calls, ['format', 'error:package-lock issue']);
});

test('runSetupWorkspaceToolchain skips npm install when cache restoration resolves missing requirements', async () => {
  const calls: string[] = [];
  let collectCount = 0;
  const result = await runSetupWorkspaceToolchain({
    repoRoot: '/tmp/repo',
    loadPackageLock: () => ({
      packageLock: { packages: {} },
      issue: null,
    }),
    collectMissingToolchainRequirements: () => {
      collectCount += 1;
      return collectCount === 1
        ? [
            {
              moduleDirectory: 'node_modules/expo',
              missingFiles: ['package.json'],
            },
          ]
        : [];
    },
    collectMissingInstalledPackageRequirements: () => [],
    restoreMissingToolchainRequirementsFromCache: async () => ({
      restoredPackages: ['expo'],
      unresolvedRequirements: [],
    }),
    runNpmInstall: () => {
      calls.push('install');
      return { status: 0, stdout: '', stderr: '' };
    },
    console: {
      log: (message: string) => calls.push(`log:${message}`),
      error: (message: string) => calls.push(`error:${message}`),
    },
  });

  assert.equal(result.exitCode, 0);
  assert.deepEqual(calls, [
    'log:Restored cached workspace packages: expo',
    'log:Workspace lint/typecheck toolchain is ready.',
  ]);
});

test('runSetupWorkspaceToolchain reports merged offline cache misses after npm install failure', async () => {
  const calls: string[] = [];
  const result = await runSetupWorkspaceToolchain({
    repoRoot: '/tmp/repo',
    loadPackageLock: () => ({
      packageLock: { packages: {} },
      issue: null,
    }),
    collectMissingToolchainRequirements: () => [
      {
        moduleDirectory: 'node_modules/expo',
        missingFiles: ['package.json'],
      },
    ],
    collectMissingInstalledPackageRequirements: () => [],
    restoreMissingToolchainRequirementsFromCache: async () => ({
      restoredPackages: [],
      unresolvedRequirements: [
        {
          moduleDirectory: 'node_modules/expo',
          missingFiles: ['package.json'],
        },
      ],
    }),
    collectOfflineCacheMissesFromLockfile: async () => [
      {
        packageName: 'expo',
        tarballUrl: 'https://registry.npmjs.org/expo/-/expo-54.0.32.tgz',
      },
    ],
    extractOfflineInstallCacheMisses: () => [
      {
        packageName: 'expo',
        tarballUrl: 'https://registry.npmjs.org/expo/-/expo-54.0.32.tgz',
      },
      {
        packageName: '@types/uuid',
        tarballUrl: 'https://registry.npmjs.org/@types/uuid/-/uuid-10.0.0.tgz',
      },
    ],
    formatMissingToolchainRequirements: (_requirements, options) => {
      assert.deepEqual(options?.offlineCacheMisses, [
        {
          packageName: 'expo',
          tarballUrl: 'https://registry.npmjs.org/expo/-/expo-54.0.32.tgz',
        },
        {
          packageName: '@types/uuid',
          tarballUrl: 'https://registry.npmjs.org/@types/uuid/-/uuid-10.0.0.tgz',
        },
      ]);
      return 'offline misses';
    },
    runNpmInstall: () => ({
      status: 1,
      stdout: 'install stdout',
      stderr: 'install stderr',
    }),
    console: {
      log: (message: string) => calls.push(`log:${message}`),
      error: (message: string) => calls.push(`error:${message}`),
    },
    writeStdout: (output: string) => calls.push(`stdout:${output}`),
    writeStderr: (output: string) => calls.push(`stderr:${output}`),
  });

  assert.equal(result.exitCode, 1);
  assert.deepEqual(calls, [
    'log:Installing workspace dependencies for lint/typecheck...',
    'stdout:install stdout',
    'stderr:install stderr',
    'error:Offline npm install failed with exit code 1.',
    'error:offline misses',
  ]);
});
