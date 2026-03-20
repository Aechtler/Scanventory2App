import test from 'node:test';
import assert from 'node:assert/strict';

import { runWorkspaceTypecheckAll } from './run-workspace-typecheck-all.mjs';

test('runWorkspaceTypecheckAll continues to backend and reports both workspace results when mobile typecheck fails', async () => {
  const calls: string[] = [];
  const errors: string[] = [];

  const result = await runWorkspaceTypecheckAll({
    runWorkspaceTypecheck: async (workspace) => {
      calls.push(workspace);
      return { exitCode: workspace === 'mobile' ? 1 : 0 };
    },
    console: {
      error: (message: string) => errors.push(message),
    },
  });

  assert.equal(result.exitCode, 1);
  assert.deepEqual(calls, ['mobile', 'backend']);
  assert.deepEqual(errors, [
    'Workspace typecheck summary: mobile failed (exit 1); backend passed',
  ]);
});

test('runWorkspaceTypecheckAll runs mobile then backend when both pass', async () => {
  const calls: string[] = [];

  const result = await runWorkspaceTypecheckAll({
    runWorkspaceTypecheck: async (workspace) => {
      calls.push(workspace);
      return { exitCode: 0 };
    },
  });

  assert.equal(result.exitCode, 0);
  assert.deepEqual(calls, ['mobile', 'backend']);
});

test('runWorkspaceTypecheckAll returns the backend exit code after mobile succeeds', async () => {
  const result = await runWorkspaceTypecheckAll({
    runWorkspaceTypecheck: async (workspace) => ({
      exitCode: workspace === 'backend' ? 2 : 0,
    }),
  });

  assert.equal(result.exitCode, 2);
});

test('runWorkspaceTypecheckAll reports both failing workspaces and returns the first failure exit code', async () => {
  const errors: string[] = [];

  const result = await runWorkspaceTypecheckAll({
    runWorkspaceTypecheck: async (workspace) => ({
      exitCode: workspace === 'mobile' ? 1 : 2,
    }),
    console: {
      error: (message: string) => errors.push(message),
    },
  });

  assert.equal(result.exitCode, 1);
  assert.deepEqual(errors, [
    'Workspace typecheck summary: mobile failed (exit 1); backend failed (exit 2)',
  ]);
});
