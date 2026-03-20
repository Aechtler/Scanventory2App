import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

import { runSetupWorkspaceToolchain } from './setup-workspace-toolchain.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');

const WORKSPACE_TYPECHECK_COMMANDS = {
  mobile: ['npm', ['run', 'typecheck', '--workspace=@scanapp/mobile']],
  backend: ['npm', ['run', 'build', '--workspace=@scanapp/backend']],
};

function defaultRunWorkspaceCommand(workspace) {
  const [command, args] = WORKSPACE_TYPECHECK_COMMANDS[workspace];

  return spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
  });
}

export async function runWorkspaceTypecheck(workspace, options = {}) {
  const {
    runSetupWorkspaceToolchain: runSetupWorkspaceToolchainImpl = runSetupWorkspaceToolchain,
    runWorkspaceCommand: runWorkspaceCommandImpl = defaultRunWorkspaceCommand,
  } = options;

  const setupResult = await runSetupWorkspaceToolchainImpl();

  if ((setupResult?.exitCode ?? 1) !== 0) {
    return { exitCode: setupResult.exitCode ?? 1 };
  }

  const result = runWorkspaceCommandImpl(workspace);
  return { exitCode: result.status ?? 1 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const workspace = process.argv[2];

  if (!(workspace in WORKSPACE_TYPECHECK_COMMANDS)) {
    console.error('Usage: node ./scripts/run-workspace-typecheck.mjs <mobile|backend>');
    process.exit(1);
  }

  const result = await runWorkspaceTypecheck(workspace);

  if (result.exitCode !== 0) {
    process.exit(result.exitCode);
  }
}
