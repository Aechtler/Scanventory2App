import test from 'node:test';
import assert from 'node:assert/strict';

import { runWorkspaceBuild } from './run-workspace-build.mjs';

test('runWorkspaceBuild exits without running npm when workspace setup fails', async () => {
  const calls: string[] = [];

  const result = await runWorkspaceBuild('backend', {
    runSetupWorkspaceToolchain: async () => ({ exitCode: 1 }),
    runWorkspaceCommand: () => {
      calls.push('workspace');
      return { status: 0 };
    },
  });

  assert.equal(result.exitCode, 1);
  assert.deepEqual(calls, []);
});

test('runWorkspaceBuild runs the requested workspace command after setup passes', async () => {
  const calls: string[] = [];

  const result = await runWorkspaceBuild('backend', {
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

test('runWorkspaceBuild preserves non-zero workspace command exits', async () => {
  const result = await runWorkspaceBuild('backend', {
    runSetupWorkspaceToolchain: async () => ({ exitCode: 0 }),
    runWorkspaceCommand: () => ({ status: 2 }),
  });

  assert.equal(result.exitCode, 2);
});

test('runWorkspaceBuild scopes workspace setup diagnostics to backend', async () => {
  let receivedOptions:
    | {
        workspaceNames?: string[];
        retryCommand?: string;
      }
    | undefined;

  const result = await runWorkspaceBuild('backend', {
    runSetupWorkspaceToolchain: async (options) => {
      receivedOptions = options;
      return { exitCode: 0 };
    },
    runWorkspaceCommand: () => ({ status: 0 }),
  });

  assert.equal(result.exitCode, 0);
  assert.deepEqual(receivedOptions, {
    workspaceNames: ['@scanapp/backend'],
    retryCommand: 'npm run build:backend',
  });
});
