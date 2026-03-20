import test from 'node:test';
import assert from 'node:assert/strict';

import { runWorkspaceLint } from './run-workspace-lint.mjs';

test('runWorkspaceLint exits without running npm when workspace setup fails', async () => {
  const calls: string[] = [];

  const result = await runWorkspaceLint('mobile', {
    runSetupWorkspaceToolchain: async () => ({ exitCode: 1 }),
    runWorkspaceCommand: () => {
      calls.push('workspace');
      return { status: 0 };
    },
  });

  assert.equal(result.exitCode, 1);
  assert.deepEqual(calls, []);
});

test('runWorkspaceLint runs the requested workspace command after setup passes', async () => {
  const calls: string[] = [];

  const result = await runWorkspaceLint('mobile', {
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
  assert.deepEqual(calls, ['setup', 'workspace:mobile']);
});

test('runWorkspaceLint preserves non-zero workspace command exits', async () => {
  const result = await runWorkspaceLint('mobile', {
    runSetupWorkspaceToolchain: async () => ({ exitCode: 0 }),
    runWorkspaceCommand: () => ({ status: 2 }),
  });

  assert.equal(result.exitCode, 2);
});
