import { pathToFileURL } from 'node:url';

import { runSetupWorkspaceToolchain } from './setup-workspace-toolchain.mjs';
import { runWorkspaceTypecheck } from './run-workspace-typecheck.mjs';

const TYPECHECK_WORKSPACES = ['mobile', 'backend'];
const TYPECHECK_WORKSPACE_PACKAGE_NAMES = TYPECHECK_WORKSPACES.map((workspace) =>
  `@scanapp/${workspace}`,
);

function formatWorkspaceResult(workspace, exitCode) {
  return exitCode === 0 ? `${workspace} passed` : `${workspace} failed (exit ${exitCode})`;
}

export async function runWorkspaceTypecheckAll(options = {}) {
  const {
    runSetupWorkspaceToolchain: runSetupWorkspaceToolchainImpl = runSetupWorkspaceToolchain,
    runWorkspaceTypecheck: runWorkspaceTypecheckImpl = runWorkspaceTypecheck,
    console: consoleImpl = console,
  } = options;

  const setupResult = await runSetupWorkspaceToolchainImpl({
    workspaceNames: TYPECHECK_WORKSPACE_PACKAGE_NAMES,
    retryCommand: 'npm run typecheck:all',
  });
  const setupExitCode = setupResult?.exitCode ?? 1;

  if (setupExitCode !== 0) {
    consoleImpl.error(
      `Workspace typecheck summary: ${TYPECHECK_WORKSPACES.map((workspace) =>
        formatWorkspaceResult(workspace, setupExitCode),
      ).join('; ')}`,
    );
    return { exitCode: setupExitCode };
  }

  const results = [];

  for (const workspace of TYPECHECK_WORKSPACES) {
    const result = await runWorkspaceTypecheckImpl(workspace, { skipSetup: true });
    const exitCode = result?.exitCode ?? 1;

    results.push({ workspace, exitCode });
  }

  const failedResults = results.filter(({ exitCode }) => exitCode !== 0);

  if (failedResults.length > 0) {
    consoleImpl.error(
      `Workspace typecheck summary: ${results
        .map(({ workspace, exitCode }) => formatWorkspaceResult(workspace, exitCode))
        .join('; ')}`,
    );
    return { exitCode: failedResults[0].exitCode };
  }

  return { exitCode: 0 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await runWorkspaceTypecheckAll();

  if (result.exitCode !== 0) {
    process.exit(result.exitCode);
  }
}
