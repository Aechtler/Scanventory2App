import { pathToFileURL } from 'node:url';

import { runWorkspaceTypecheck } from './run-workspace-typecheck.mjs';

const TYPECHECK_WORKSPACES = ['mobile', 'backend'];

export async function runWorkspaceTypecheckAll(options = {}) {
  const {
    runWorkspaceTypecheck: runWorkspaceTypecheckImpl = runWorkspaceTypecheck,
  } = options;

  for (const workspace of TYPECHECK_WORKSPACES) {
    const result = await runWorkspaceTypecheckImpl(workspace);

    if ((result?.exitCode ?? 1) !== 0) {
      return { exitCode: result?.exitCode ?? 1 };
    }
  }

  return { exitCode: 0 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await runWorkspaceTypecheckAll();

  if (result.exitCode !== 0) {
    process.exit(result.exitCode);
  }
}
