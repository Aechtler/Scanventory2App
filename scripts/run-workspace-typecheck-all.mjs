import { pathToFileURL } from 'node:url';

import { runWorkspaceTypecheck } from './run-workspace-typecheck.mjs';

const TYPECHECK_WORKSPACES = ['mobile', 'backend'];

function formatWorkspaceResult(workspace, exitCode) {
  return exitCode === 0 ? `${workspace} passed` : `${workspace} failed (exit ${exitCode})`;
}

export async function runWorkspaceTypecheckAll(options = {}) {
  const {
    runWorkspaceTypecheck: runWorkspaceTypecheckImpl = runWorkspaceTypecheck,
    console: consoleImpl = console,
  } = options;
  const results = [];

  for (const workspace of TYPECHECK_WORKSPACES) {
    const result = await runWorkspaceTypecheckImpl(workspace);
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
