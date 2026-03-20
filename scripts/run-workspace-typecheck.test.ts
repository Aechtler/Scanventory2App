import test from 'node:test';
import assert from 'node:assert/strict';

import { runWorkspaceTypecheck } from './run-workspace-typecheck.mjs';

test('runWorkspaceTypecheck exits without running npm when workspace setup fails', async () => {
  const calls: string[] = [];

  const result = await runWorkspaceTypecheck('mobile', {
    runSetupWorkspaceToolchain: async () => ({ exitCode: 1 }),
    runWorkspaceCommand: () => {
      calls.push('workspace');
      return { status: 0 };
    },
  });

  assert.equal(result.exitCode, 1);
  assert.deepEqual(calls, []);
});

test('runWorkspaceTypecheck runs the requested workspace command after setup passes', async () => {
  const calls: string[] = [];

  const result = await runWorkspaceTypecheck('backend', {
    runSetupWorkspaceToolchain: async () => {
      calls.push('setup');
      return { exitCode: 0 };
    },
    runWorkspaceCommand: (workspace) => {
      calls.push(`workspace:${workspace}`);
      return { status: 0 };
    },
  });

  assert.equal(result.exitCode, 0);
  assert.deepEqual(calls, ['setup', 'workspace:backend']);
});

test('runWorkspaceTypecheck preserves non-zero workspace command exits', async () => {
  const result = await runWorkspaceTypecheck('mobile', {
    runSetupWorkspaceToolchain: async () => ({ exitCode: 0 }),
    runWorkspaceCommand: () => ({ status: 2 }),
  });

  assert.equal(result.exitCode, 2);
});

test('runWorkspaceTypecheck scopes workspace setup to the requested workspace', async () => {
  const calls: Array<string | { workspaceNames?: string[]; retryCommand?: string }> = [];

  const result = await runWorkspaceTypecheck('backend', {
    runSetupWorkspaceToolchain: async (options) => {
      calls.push(options ?? {});
      return { exitCode: 0 };
    },
    runWorkspaceCommand: (workspace) => {
      calls.push(`workspace:${workspace}`);
      return { status: 0 };
    },
  });

  assert.equal(result.exitCode, 0);
  assert.deepEqual(calls, [
    {
      workspaceNames: ['@scanapp/backend'],
      retryCommand: 'npm run typecheck:backend',
    },
    'workspace:backend',
  ]);
});
