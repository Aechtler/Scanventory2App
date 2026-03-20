import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

import { runSetupWorkspaceToolchain } from './setup-workspace-toolchain.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');

const WORKSPACE_LINT_COMMANDS = {
  mobile: ['npm', ['run', 'lint', '--workspace=@scanapp/mobile']],
};

const WORKSPACE_PACKAGE_NAMES = {
  mobile: '@scanapp/mobile',
};

function defaultRunWorkspaceCommand(workspace) {
  const [command, args] = WORKSPACE_LINT_COMMANDS[workspace];

  return spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
  });
}

export async function runWorkspaceLint(workspace, options = {}) {
  const {
    runSetupWorkspaceToolchain: runSetupWorkspaceToolchainImpl = runSetupWorkspaceToolchain,
    runWorkspaceCommand: runWorkspaceCommandImpl = defaultRunWorkspaceCommand,
  } = options;

  const setupResult = await runSetupWorkspaceToolchainImpl({
    workspaceNames: [WORKSPACE_PACKAGE_NAMES[workspace]],
    retryCommand: `npm run lint:${workspace}`,
  });

  if ((setupResult?.exitCode ?? 1) !== 0) {
    return { exitCode: setupResult.exitCode ?? 1 };
  }

  const result = runWorkspaceCommandImpl(workspace);
  return { exitCode: result.status ?? 1 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const workspace = process.argv[2];

  if (!(workspace in WORKSPACE_LINT_COMMANDS)) {
    console.error('Usage: node ./scripts/run-workspace-lint.mjs <mobile>');
    process.exit(1);
  }

  const result = await runWorkspaceLint(workspace);

  if (result.exitCode !== 0) {
    process.exit(result.exitCode);
  }
}
