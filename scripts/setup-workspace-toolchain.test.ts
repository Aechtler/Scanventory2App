import test from 'node:test';
import assert from 'node:assert/strict';

import { runSetupWorkspaceToolchain } from './setup-workspace-toolchain.mjs';

test('runSetupWorkspaceToolchain exits early with actionable package-lock diagnostics before install', async () => {
  const calls: string[] = [];
  const result = await runSetupWorkspaceToolchain({
    repoRoot: '/tmp/repo',
    collectWorkspaceDependencyOwners: () => ({}),
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
    collectMissingWorkspaceDependencyRequirements: () => [],
    collectMissingInstalledPackageRequirements: () => [],
    collectWorkspaceDependencyLockIssues: () => [],
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

test('runSetupWorkspaceToolchain exits early when missing workspace packages are backed by stale lockfile versions', async () => {
  const calls: string[] = [];
  const result = await runSetupWorkspaceToolchain({
    repoRoot: '/tmp/repo',
    collectWorkspaceDependencyOwners: () => ({
      uuid: ['@scanapp/backend'],
    }),
    loadPackageLock: () => ({
      packageLock: { packages: {} },
      issue: null,
    }),
    collectMissingToolchainRequirements: () => [],
    collectMissingWorkspaceDependencyRequirements: () => [
      {
        moduleDirectory: 'node_modules/uuid',
        missingFiles: ['package.json'],
      },
    ],
    collectMissingInstalledPackageRequirements: () => [],
    collectWorkspaceDependencyLockIssues: () => [
      {
        packageName: 'uuid',
        issue: 'version-mismatch',
        lockfileVersion: '7.0.3',
        declarations: [
          {
            owner: '@scanapp/backend',
            dependencyGroup: 'dependencies',
            spec: '^11.1.0',
          },
        ],
      },
      {
        packageName: 'expo',
        issue: 'version-mismatch',
        lockfileVersion: '54.0.20',
        declarations: [
          {
            owner: '@scanapp/mobile',
            dependencyGroup: 'dependencies',
            spec: '~54.0.32',
          },
        ],
      },
    ],
    formatMissingToolchainRequirements: (requirements, options) => {
      calls.push('format');
      assert.deepEqual(requirements, [
        {
          moduleDirectory: 'node_modules/uuid',
          missingFiles: ['package.json'],
        },
      ]);
      assert.deepEqual(options?.dependencyLockIssues, [
        {
          packageName: 'uuid',
          issue: 'version-mismatch',
          lockfileVersion: '7.0.3',
          declarations: [
            {
              owner: '@scanapp/backend',
              dependencyGroup: 'dependencies',
              spec: '^11.1.0',
            },
          ],
        },
      ]);
      return 'stale lockfile issue';
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
  assert.deepEqual(calls, ['format', 'error:stale lockfile issue']);
});

test('runSetupWorkspaceToolchain skips npm install when cache restoration resolves missing requirements', async () => {
  const calls: string[] = [];
  let collectCount = 0;
  const result = await runSetupWorkspaceToolchain({
    repoRoot: '/tmp/repo',
    collectWorkspaceDependencyOwners: () => ({}),
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
    collectMissingWorkspaceDependencyRequirements: () => [],
    collectMissingInstalledPackageRequirements: () => [],
    collectWorkspaceDependencyLockIssues: () => [],
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
    collectWorkspaceDependencyOwners: () => ({
      expo: ['@scanapp/mobile'],
    }),
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
    collectMissingWorkspaceDependencyRequirements: () => [],
    collectMissingInstalledPackageRequirements: () => [],
    collectWorkspaceDependencyLockIssues: () => [],
    restoreMissingToolchainRequirementsFromCache: async () => ({
      restoredPackages: [],
      unresolvedRequirements: [
        {
          moduleDirectory: 'node_modules/expo',
          missingFiles: ['package.json'],
        },
      ],
    }),
    collectOfflineCacheMissesFromLockfile: async () => [],
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
      assert.deepEqual(options?.workspaceDependencyOwners, {
        expo: ['@scanapp/mobile'],
      });
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

test('runSetupWorkspaceToolchain skips offline npm install when unresolved requirements are already confirmed cache misses', async () => {
  const calls: string[] = [];
  const unresolvedRequirements = [
    {
      moduleDirectory: 'node_modules/expo',
      missingFiles: ['package.json'],
    },
    {
      moduleDirectory: 'node_modules/nativewind',
      missingFiles: ['package.json', 'types/index.d.ts'],
    },
  ];

  const result = await runSetupWorkspaceToolchain({
    repoRoot: '/tmp/repo',
    collectWorkspaceDependencyOwners: () => ({
      expo: ['@scanapp/mobile'],
      nativewind: ['@scanapp/mobile'],
    }),
    loadPackageLock: () => ({
      packageLock: { packages: {} },
      issue: null,
    }),
    collectMissingToolchainRequirements: () => unresolvedRequirements,
    collectMissingWorkspaceDependencyRequirements: () => [],
    collectMissingInstalledPackageRequirements: () => [],
    collectWorkspaceDependencyLockIssues: () => [],
    restoreMissingToolchainRequirementsFromCache: async () => ({
      restoredPackages: [],
      unresolvedRequirements,
    }),
    collectOfflineCacheMissesFromLockfile: async (_repoRoot, missingRequirements) => {
      assert.deepEqual(missingRequirements, unresolvedRequirements);
      return [
        {
          packageName: 'expo',
          tarballUrl: 'https://registry.npmjs.org/expo/-/expo-54.0.32.tgz',
        },
        {
          packageName: 'nativewind',
          tarballUrl: 'https://registry.npmjs.org/nativewind/-/nativewind-4.2.1.tgz',
        },
      ];
    },
    formatMissingToolchainRequirements: (_requirements, options) => {
      assert.deepEqual(options?.offlineCacheMisses, [
        {
          packageName: 'expo',
          tarballUrl: 'https://registry.npmjs.org/expo/-/expo-54.0.32.tgz',
        },
        {
          packageName: 'nativewind',
          tarballUrl: 'https://registry.npmjs.org/nativewind/-/nativewind-4.2.1.tgz',
        },
      ]);
      return 'preinstall misses';
    },
    runNpmInstall: () => {
      calls.push('install');
      return { status: 0, stdout: '', stderr: '' };
    },
    console: {
      log: (message: string) => calls.push(`log:${message}`),
      error: (message: string) => calls.push(`error:${message}`),
    },
  });

  assert.equal(result.exitCode, 1);
  assert.deepEqual(calls, ['error:preinstall misses']);
});

test('runSetupWorkspaceToolchain scopes unresolved requirement diagnostics to the requested workspace', async () => {
  const calls: string[] = [];
  const result = await runSetupWorkspaceToolchain({
    repoRoot: '/tmp/repo',
    workspaceNames: ['@scanapp/backend'],
    retryCommand: 'npm run typecheck:backend',
    collectWorkspaceDependencyOwners: () => ({
      expo: ['@scanapp/mobile'],
      express: ['@scanapp/backend'],
      typescript: ['@scanapp/backend', '@scanapp/mobile'],
    }),
    loadPackageLock: () => ({
      packageLock: { packages: {} },
      issue: null,
    }),
    collectMissingToolchainRequirements: () => [
      {
        moduleDirectory: 'node_modules/typescript',
        missingFiles: ['lib/typescript.js'],
      },
      {
        moduleDirectory: 'node_modules/expo',
        missingFiles: ['package.json', 'tsconfig.base'],
      },
    ],
    collectMissingWorkspaceDependencyRequirements: () => [
      {
        moduleDirectory: 'node_modules/express',
        missingFiles: ['package.json'],
      },
      {
        moduleDirectory: 'node_modules/ownerless-helper',
        missingFiles: ['package.json'],
      },
    ],
    collectMissingInstalledPackageRequirements: () => [],
    collectWorkspaceDependencyLockIssues: () => [],
    restoreMissingToolchainRequirementsFromCache: async () => ({
      restoredPackages: [],
      unresolvedRequirements: [
        {
          moduleDirectory: 'node_modules/typescript',
          missingFiles: ['lib/typescript.js'],
        },
        {
          moduleDirectory: 'node_modules/express',
          missingFiles: ['package.json'],
        },
        {
          moduleDirectory: 'node_modules/ownerless-helper',
          missingFiles: ['package.json'],
        },
      ],
    }),
    collectOfflineCacheMissesFromLockfile: async (_repoRoot, missingRequirements) => {
      assert.deepEqual(missingRequirements, [
        {
          moduleDirectory: 'node_modules/typescript',
          missingFiles: ['lib/typescript.js'],
        },
        {
          moduleDirectory: 'node_modules/express',
          missingFiles: ['package.json'],
        },
        {
          moduleDirectory: 'node_modules/ownerless-helper',
          missingFiles: ['package.json'],
        },
      ]);

      return [
        {
          packageName: 'typescript',
          tarballUrl: 'https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz',
        },
        {
          packageName: 'express',
          tarballUrl: 'https://registry.npmjs.org/express/-/express-5.1.0.tgz',
        },
        {
          packageName: 'ownerless-helper',
          tarballUrl: 'https://registry.npmjs.org/ownerless-helper/-/ownerless-helper-1.0.0.tgz',
        },
      ];
    },
    formatMissingToolchainRequirements: (missingRequirements, options) => {
      assert.deepEqual(missingRequirements, [
        {
          moduleDirectory: 'node_modules/typescript',
          missingFiles: ['lib/typescript.js'],
        },
        {
          moduleDirectory: 'node_modules/express',
          missingFiles: ['package.json'],
        },
        {
          moduleDirectory: 'node_modules/ownerless-helper',
          missingFiles: ['package.json'],
        },
      ]);
      assert.deepEqual(options?.workspaceDependencyOwners, {
        express: ['@scanapp/backend'],
        typescript: ['@scanapp/backend'],
      });
      assert.deepEqual(options?.offlineCacheMisses, [
        {
          packageName: 'typescript',
          tarballUrl: 'https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz',
        },
        {
          packageName: 'express',
          tarballUrl: 'https://registry.npmjs.org/express/-/express-5.1.0.tgz',
        },
        {
          packageName: 'ownerless-helper',
          tarballUrl: 'https://registry.npmjs.org/ownerless-helper/-/ownerless-helper-1.0.0.tgz',
        },
      ]);
      assert.equal(options?.retryCommand, 'npm run typecheck:backend');
      return 'scoped misses';
    },
    runNpmInstall: () => {
      calls.push('install');
      return { status: 0, stdout: '', stderr: '' };
    },
    console: {
      log: (message: string) => calls.push(`log:${message}`),
      error: (message: string) => calls.push(`error:${message}`),
    },
  });

  assert.equal(result.exitCode, 1);
  assert.deepEqual(calls, ['error:scoped misses']);
});

test('runSetupWorkspaceToolchain scopes npm install to the requested workspaces', async () => {
  const installCalls: Array<{ offline: boolean; workspaceNames?: string[] }> = [];
  let collectCount = 0;

  const result = await runSetupWorkspaceToolchain({
    repoRoot: '/tmp/repo',
    workspaceNames: ['@scanapp/backend'],
    collectWorkspaceDependencyOwners: () => ({
      typescript: ['@scanapp/backend'],
    }),
    loadPackageLock: () => ({
      packageLock: { packages: {} },
      issue: null,
    }),
    collectMissingToolchainRequirements: () => {
      collectCount += 1;

      return collectCount === 1
        ? [
            {
              moduleDirectory: 'node_modules/typescript',
              missingFiles: ['lib/typescript.js'],
            },
          ]
        : [];
    },
    collectMissingWorkspaceDependencyRequirements: () => [],
    collectMissingInstalledPackageRequirements: () => [],
    collectWorkspaceDependencyLockIssues: () => [],
    restoreMissingToolchainRequirementsFromCache: async () => ({
      restoredPackages: [],
      unresolvedRequirements: [
        {
          moduleDirectory: 'node_modules/typescript',
          missingFiles: ['lib/typescript.js'],
        },
      ],
    }),
    collectOfflineCacheMissesFromLockfile: async () => [],
    runNpmInstall: ({ offline, workspaceNames }) => {
      installCalls.push({ offline, workspaceNames });
      return { status: 0, stdout: '', stderr: '' };
    },
    console: {
      log: () => {},
      error: () => {},
    },
  });

  assert.equal(result.exitCode, 0);
  assert.deepEqual(installCalls, [
    {
      offline: true,
      workspaceNames: ['@scanapp/backend'],
    },
  ]);
});

test('runSetupWorkspaceToolchain keeps workspace-scoped post-install diagnostics focused on direct blockers', async () => {
  const observed: string[] = [];
  let installedRequirementCollectCount = 0;

  const result = await runSetupWorkspaceToolchain({
    repoRoot: '/tmp/repo',
    workspaceNames: ['@scanapp/backend'],
    retryCommand: 'npm run typecheck:backend',
    collectWorkspaceDependencyOwners: () => ({
      typescript: ['@scanapp/backend'],
      uuid: ['@scanapp/backend'],
    }),
    loadPackageLock: () => ({
      packageLock: { packages: {} },
      issue: null,
    }),
    collectMissingToolchainRequirements: () => [
      {
        moduleDirectory: 'node_modules/typescript',
        missingFiles: ['lib/typescript.js'],
      },
    ],
    collectMissingWorkspaceDependencyRequirements: () => [
      {
        moduleDirectory: 'node_modules/uuid',
        missingFiles: ['package.json'],
      },
    ],
    collectMissingInstalledPackageRequirements: () => {
      installedRequirementCollectCount += 1;

      return installedRequirementCollectCount === 1
        ? []
        : [
            {
              moduleDirectory: 'node_modules/@babel/core',
              missingFiles: ['package.json'],
            },
          ];
    },
    collectWorkspaceDependencyLockIssues: () => [],
    restoreMissingToolchainRequirementsFromCache: async (_repoRoot, missingRequirements) => {
      observed.push(`restore:${missingRequirements.map(({ moduleDirectory }) => moduleDirectory).join(',')}`);
      return {
        restoredPackages: [],
        unresolvedRequirements: missingRequirements,
      };
    },
    collectOfflineCacheMissesFromLockfile: async (_repoRoot, missingRequirements) => {
      observed.push(`offline:${missingRequirements.map(({ moduleDirectory }) => moduleDirectory).join(',')}`);
      return [];
    },
    formatMissingToolchainRequirements: (missingRequirements, options) => {
      observed.push(`format:${missingRequirements.map(({ moduleDirectory }) => moduleDirectory).join(',')}`);
      observed.push(`owners:${JSON.stringify(options?.workspaceDependencyOwners)}`);
      return 'workspace-scoped failure';
    },
    runNpmInstall: () => ({
      status: 1,
      stdout: '',
      stderr: '',
    }),
    console: {
      log: (message: string) => observed.push(`log:${message}`),
      error: (message: string) => observed.push(`error:${message}`),
    },
  });

  assert.equal(result.exitCode, 1);
  assert.deepEqual(observed, [
    'restore:node_modules/typescript,node_modules/uuid',
    'offline:node_modules/typescript,node_modules/uuid',
    'log:Installing workspace dependencies for lint/typecheck...',
    'restore:node_modules/typescript,node_modules/uuid',
    'offline:node_modules/typescript,node_modules/uuid',
    'error:Offline npm install failed with exit code 1.',
    'format:node_modules/typescript,node_modules/uuid',
    'owners:{"typescript":["@scanapp/backend"],"uuid":["@scanapp/backend"]}',
    'error:workspace-scoped failure',
  ]);
});

test('runSetupWorkspaceToolchain merges missing direct workspace dependencies into cache restore and install diagnostics', async () => {
  const requirements = [
    {
      moduleDirectory: 'node_modules/expo',
      missingFiles: ['package.json'],
    },
    {
      moduleDirectory: 'node_modules/react',
      missingFiles: ['package.json'],
    },
  ];

  const observed: string[] = [];

  const result = await runSetupWorkspaceToolchain({
    repoRoot: '/tmp/repo',
    collectWorkspaceDependencyOwners: () => ({
      expo: ['@scanapp/mobile'],
      react: ['@scanapp/root', '@scanapp/mobile'],
    }),
    loadPackageLock: () => ({
      packageLock: { packages: {} },
      issue: null,
    }),
    collectMissingToolchainRequirements: () => [requirements[0]!],
    collectMissingWorkspaceDependencyRequirements: () => [requirements[1]!],
    collectMissingInstalledPackageRequirements: () => [],
    collectWorkspaceDependencyLockIssues: () => [],
    restoreMissingToolchainRequirementsFromCache: async (_repoRoot, missingRequirements) => {
      observed.push(`restore:${missingRequirements.map(({ moduleDirectory }) => moduleDirectory).join(',')}`);
      return {
        restoredPackages: [],
        unresolvedRequirements: missingRequirements,
      };
    },
    collectOfflineCacheMissesFromLockfile: async (_repoRoot, missingRequirements) => {
      observed.push(`offline:${missingRequirements.map(({ moduleDirectory }) => moduleDirectory).join(',')}`);
      return [];
    },
    formatMissingToolchainRequirements: (missingRequirements, options) => {
      observed.push(`format:${missingRequirements.map(({ moduleDirectory }) => moduleDirectory).join(',')}`);
      observed.push(`owners:${JSON.stringify(options?.workspaceDependencyOwners)}`);
      return 'merged requirements';
    },
    runNpmInstall: () => ({
      status: 1,
      stdout: '',
      stderr: '',
    }),
    console: {
      log: () => {},
      error: () => {},
    },
  });

  assert.equal(result.exitCode, 1);
  assert.deepEqual(observed, [
    'restore:node_modules/expo,node_modules/react',
    'offline:node_modules/expo,node_modules/react',
    'restore:node_modules/expo,node_modules/react',
    'offline:node_modules/expo,node_modules/react',
    'format:node_modules/expo,node_modules/react',
    'owners:{"expo":["@scanapp/mobile"],"react":["@scanapp/root","@scanapp/mobile"]}',
  ]);
});

test('runSetupWorkspaceToolchain retries cache restoration for newly hollow packages after offline install failure', async () => {
  const observed: string[] = [];
  let collectCount = 0;

  const result = await runSetupWorkspaceToolchain({
    repoRoot: '/tmp/repo',
    collectWorkspaceDependencyOwners: () => ({
      expo: ['@scanapp/mobile'],
      react: ['@scanapp/mobile'],
    }),
    loadPackageLock: () => ({
      packageLock: { packages: {} },
      issue: null,
    }),
    collectMissingToolchainRequirements: () => {
      collectCount += 1;

      if (collectCount === 1) {
        return [
          {
            moduleDirectory: 'node_modules/expo',
            missingFiles: ['package.json'],
          },
        ];
      }

      if (collectCount === 2) {
        return [
          {
            moduleDirectory: 'node_modules/expo',
            missingFiles: ['package.json'],
          },
          {
            moduleDirectory: 'node_modules/react',
            missingFiles: ['package.json'],
          },
        ];
      }

      return [
        {
          moduleDirectory: 'node_modules/react',
          missingFiles: ['package.json'],
        },
      ];
    },
    collectMissingWorkspaceDependencyRequirements: () => [],
    collectMissingInstalledPackageRequirements: () => [],
    collectWorkspaceDependencyLockIssues: () => [],
    restoreMissingToolchainRequirementsFromCache: async (_repoRoot, missingRequirements) => {
      observed.push(`restore:${missingRequirements.map(({ moduleDirectory }) => moduleDirectory).join(',')}`);

      if (missingRequirements.some(({ moduleDirectory }) => moduleDirectory === 'node_modules/react')) {
        return {
          restoredPackages: ['react'],
          unresolvedRequirements: missingRequirements.filter(
            ({ moduleDirectory }) => moduleDirectory !== 'node_modules/react',
          ),
        };
      }

      return {
        restoredPackages: [],
        unresolvedRequirements: missingRequirements,
      };
    },
    collectOfflineCacheMissesFromLockfile: async (_repoRoot, missingRequirements) => {
      observed.push(`offline:${missingRequirements.map(({ moduleDirectory }) => moduleDirectory).join(',')}`);
      return [];
    },
    extractOfflineInstallCacheMisses: () => [],
    formatMissingToolchainRequirements: (missingRequirements) => {
      observed.push(`format:${missingRequirements.map(({ moduleDirectory }) => moduleDirectory).join(',')}`);
      return 'post-install restore result';
    },
    runNpmInstall: () => ({
      status: 1,
      stdout: '',
      stderr: '',
    }),
    console: {
      log: (message: string) => observed.push(`log:${message}`),
      error: (message: string) => observed.push(`error:${message}`),
    },
  });

  assert.equal(result.exitCode, 1);
  assert.deepEqual(observed, [
    'restore:node_modules/expo',
    'offline:node_modules/expo',
    'log:Installing workspace dependencies for lint/typecheck...',
    'restore:node_modules/expo,node_modules/react',
    'log:Restored cached workspace packages after offline npm install failure: react',
    'offline:node_modules/expo',
    'error:Offline npm install failed with exit code 1.',
    'format:node_modules/expo',
    'error:post-install restore result',
  ]);
});

test('runSetupWorkspaceToolchain falls back to online npm install when cache misses are known and network installs are allowed', async () => {
  const observed: string[] = [];
  let collectCount = 0;

  const result = await runSetupWorkspaceToolchain({
    repoRoot: '/tmp/repo',
    allowNetworkInstall: true,
    collectWorkspaceDependencyOwners: () => ({
      expo: ['@scanapp/mobile'],
    }),
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
    collectMissingWorkspaceDependencyRequirements: () => [],
    collectMissingInstalledPackageRequirements: () => [],
    collectWorkspaceDependencyLockIssues: () => [],
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
    runNpmInstall: ({ offline }: { offline: boolean }) => {
      observed.push(`install:${offline ? 'offline' : 'online'}`);
      return { status: 0, stdout: '', stderr: '' };
    },
    console: {
      log: (message: string) => observed.push(`log:${message}`),
      error: (message: string) => observed.push(`error:${message}`),
    },
  });

  assert.equal(result.exitCode, 0);
  assert.deepEqual(observed, [
    'log:Offline cache misses detected for unresolved workspace packages; retrying with network install...',
    'log:Installing workspace dependencies for lint/typecheck...',
    'install:online',
    'log:Workspace lint/typecheck toolchain is ready.',
  ]);
});

test('runSetupWorkspaceToolchain retries with online npm install after offline install cache miss failure when allowed', async () => {
  const observed: string[] = [];
  let collectCount = 0;

  const result = await runSetupWorkspaceToolchain({
    repoRoot: '/tmp/repo',
    allowNetworkInstall: true,
    collectWorkspaceDependencyOwners: () => ({
      expo: ['@scanapp/mobile'],
    }),
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
    collectMissingWorkspaceDependencyRequirements: () => [],
    collectMissingInstalledPackageRequirements: () => [],
    collectWorkspaceDependencyLockIssues: () => [],
    restoreMissingToolchainRequirementsFromCache: async () => ({
      restoredPackages: [],
      unresolvedRequirements: [
        {
          moduleDirectory: 'node_modules/expo',
          missingFiles: ['package.json'],
        },
      ],
    }),
    collectOfflineCacheMissesFromLockfile: async () => [],
    extractOfflineInstallCacheMisses: () => [
      {
        packageName: 'expo',
        tarballUrl: 'https://registry.npmjs.org/expo/-/expo-54.0.32.tgz',
      },
    ],
    runNpmInstall: ({ offline }: { offline: boolean }) => {
      observed.push(`install:${offline ? 'offline' : 'online'}`);
      return offline
        ? { status: 1, stdout: '', stderr: 'npm error missing: https://registry.npmjs.org/expo/-/expo-54.0.32.tgz' }
        : { status: 0, stdout: '', stderr: '' };
    },
    console: {
      log: (message: string) => observed.push(`log:${message}`),
      error: (message: string) => observed.push(`error:${message}`),
    },
  });

  assert.equal(result.exitCode, 0);
  assert.deepEqual(observed, [
    'log:Installing workspace dependencies for lint/typecheck...',
    'install:offline',
    'log:Offline npm install hit cache misses; retrying with network install...',
    'log:Installing workspace dependencies for lint/typecheck...',
    'install:online',
    'log:Workspace lint/typecheck toolchain is ready.',
  ]);
});
