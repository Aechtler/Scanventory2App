import test from 'node:test';
import assert from 'node:assert/strict';

import { runWorkspaceBuildAll } from './run-workspace-build-all.mjs';

test('runWorkspaceBuildAll stops before per-workspace commands when shared setup fails', async () => {
  const setupCalls: Array<{ workspaceNames?: string[]; retryCommand?: string }> = [];
  const workspaceCalls: Array<{ workspace: string; options?: { skipSetup?: boolean } }> = [];
  const errors: string[] = [];

  const result = await runWorkspaceBuildAll({
    runSetupWorkspaceToolchain: async (options) => {
      setupCalls.push(options ?? {});
      return { exitCode: 1 };
    },
    runWorkspaceBuild: async (workspace, options) => {
      workspaceCalls.push({ workspace, options });
      return { exitCode: 0 };
    },
    console: {
      error: (message: string) => errors.push(message),
    },
  });

  assert.equal(result.exitCode, 1);
  assert.deepEqual(setupCalls, [
    {
      workspaceNames: ['@scanapp/backend'],
      retryCommand: 'npm run build:all',
    },
  ]);
  assert.deepEqual(workspaceCalls, []);
  assert.deepEqual(errors, ['Workspace build summary: backend failed (exit 1)']);
});

test('runWorkspaceBuildAll runs backend with skipSetup after shared setup passes', async () => {
  const calls: Array<{ workspace: string; options?: { skipSetup?: boolean } }> = [];

  const result = await runWorkspaceBuildAll({
    runSetupWorkspaceToolchain: async () => ({ exitCode: 0 }),
    runWorkspaceBuild: async (workspace, options) => {
      calls.push({ workspace, options });
      return { exitCode: 0 };
    },
  });

  assert.equal(result.exitCode, 0);
  assert.deepEqual(calls, [{ workspace: 'backend', options: { skipSetup: true } }]);
});

test('runWorkspaceBuildAll preserves backend exit codes in the summary', async () => {
  const errors: string[] = [];

  const result = await runWorkspaceBuildAll({
    runSetupWorkspaceToolchain: async () => ({ exitCode: 0 }),
    runWorkspaceBuild: async (workspace, options) => {
      assert.equal(workspace, 'backend');
      assert.deepEqual(options, { skipSetup: true });
      return { exitCode: 2 };
    },
    console: {
      error: (message: string) => errors.push(message),
    },
  });

  assert.equal(result.exitCode, 2);
  assert.deepEqual(errors, ['Workspace build summary: backend failed (exit 2)']);
});
