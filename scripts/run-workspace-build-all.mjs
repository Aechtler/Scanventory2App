import { pathToFileURL } from 'node:url';

import { runSetupWorkspaceToolchain } from './setup-workspace-toolchain.mjs';
import { runWorkspaceBuild } from './run-workspace-build.mjs';

const BUILD_WORKSPACES = ['backend'];
const BUILD_WORKSPACE_PACKAGE_NAMES = BUILD_WORKSPACES.map((workspace) => `@scanapp/${workspace}`);

function formatWorkspaceResult(workspace, exitCode) {
  return exitCode === 0 ? `${workspace} passed` : `${workspace} failed (exit ${exitCode})`;
}

export async function runWorkspaceBuildAll(options = {}) {
  const {
    runSetupWorkspaceToolchain: runSetupWorkspaceToolchainImpl = runSetupWorkspaceToolchain,
    runWorkspaceBuild: runWorkspaceBuildImpl = runWorkspaceBuild,
    console: consoleImpl = console,
  } = options;

  const setupResult = await runSetupWorkspaceToolchainImpl({
    workspaceNames: BUILD_WORKSPACE_PACKAGE_NAMES,
    retryCommand: 'npm run build:all',
  });
  const setupExitCode = setupResult?.exitCode ?? 1;

  if (setupExitCode !== 0) {
    consoleImpl.error(
      `Workspace build summary: ${BUILD_WORKSPACES.map((workspace) =>
        formatWorkspaceResult(workspace, setupExitCode),
      ).join('; ')}`,
    );
    return { exitCode: setupExitCode };
  }

  const results = [];

  for (const workspace of BUILD_WORKSPACES) {
    const result = await runWorkspaceBuildImpl(workspace, { skipSetup: true });
    const exitCode = result?.exitCode ?? 1;
    results.push({ workspace, exitCode });
  }

  const failedResults = results.filter(({ exitCode }) => exitCode !== 0);

  if (failedResults.length > 0) {
    consoleImpl.error(
      `Workspace build summary: ${results
        .map(({ workspace, exitCode }) => formatWorkspaceResult(workspace, exitCode))
        .join('; ')}`,
    );
    return { exitCode: failedResults[0].exitCode };
  }

  return { exitCode: 0 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await runWorkspaceBuildAll();

  if (result.exitCode !== 0) {
    process.exit(result.exitCode);
  }
}
