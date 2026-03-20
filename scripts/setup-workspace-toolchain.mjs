import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import {
  collectMissingInstalledPackageRequirements,
  collectMissingWorkspaceDependencyRequirements,
  collectWorkspaceDependencyLockIssues,
  collectMissingToolchainRequirements,
  collectWorkspaceDependencyOwners,
  collectOfflineCacheMissesFromLockfile,
  extractOfflineInstallCacheMisses,
  formatMissingToolchainRequirements,
  loadPackageLock,
  restoreMissingToolchainRequirementsFromCache,
} from './workspace-toolchain-health.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');

function defaultRunNpmInstall({ offline = true } = {}) {
  const installArgs = ['install', '--no-audit', '--no-fund', '--loglevel=notice'];

  if (offline) {
    installArgs.splice(1, 0, '--offline');
  }

  return spawnSync(
    'npm',
    installArgs,
    {
      cwd: repoRoot,
      encoding: 'utf8',
    },
  );
}

function mergeOfflineCacheMisses(...missGroups) {
  const mergedMisses = [];
  const seenTarballs = new Set();

  for (const misses of missGroups) {
    for (const miss of misses) {
      if (seenTarballs.has(miss.tarballUrl)) {
        continue;
      }

      seenTarballs.add(miss.tarballUrl);
      mergedMisses.push(miss);
    }
  }

  return mergedMisses;
}

function mergeMissingRequirements(...requirementGroups) {
  const mergedRequirements = new Map();

  for (const requirements of requirementGroups) {
    for (const requirement of requirements) {
      const existingRequirement = mergedRequirements.get(requirement.moduleDirectory);

      if (!existingRequirement) {
        mergedRequirements.set(requirement.moduleDirectory, {
          moduleDirectory: requirement.moduleDirectory,
          missingFiles: [...requirement.missingFiles],
        });
        continue;
      }

      existingRequirement.missingFiles = [
        ...new Set([...existingRequirement.missingFiles, ...requirement.missingFiles]),
      ];
    }
  }

  return [...mergedRequirements.values()].sort((left, right) =>
    left.moduleDirectory.localeCompare(right.moduleDirectory),
  );
}

function shouldSkipOfflineInstallForKnownCacheMisses(unresolvedRequirements, offlineCacheMisses) {
  if (unresolvedRequirements.length === 0 || offlineCacheMisses.length === 0) {
    return false;
  }

  const missedPackages = new Set(offlineCacheMisses.map((miss) => miss.packageName));

  return unresolvedRequirements.every((requirement) =>
    missedPackages.has(requirement.moduleDirectory.replace(/^node_modules\//, '')),
  );
}

function packageNameFromModuleDirectory(moduleDirectory) {
  return moduleDirectory.replace(/^node_modules\//, '');
}

function filterWorkspaceDependencyOwners(workspaceDependencyOwners, workspaceNames = []) {
  if (workspaceNames.length === 0) {
    return workspaceDependencyOwners;
  }

  return Object.fromEntries(
    Object.entries(workspaceDependencyOwners).filter(([, owners]) =>
      owners.some((owner) => workspaceNames.includes(owner)),
    ),
  );
}

function filterRequirementsForWorkspaces(
  requirements,
  workspaceDependencyOwners,
  workspaceNames = [],
) {
  if (workspaceNames.length === 0) {
    return requirements;
  }

  return requirements.filter(({ moduleDirectory }) => {
    const owners = workspaceDependencyOwners[packageNameFromModuleDirectory(moduleDirectory)] ?? [];
    return owners.length === 0 || owners.some((owner) => workspaceNames.includes(owner));
  });
}

function filterOfflineCacheMissesForWorkspaces(
  offlineCacheMisses,
  workspaceDependencyOwners,
  workspaceNames = [],
) {
  if (workspaceNames.length === 0) {
    return offlineCacheMisses;
  }

  return offlineCacheMisses.filter(({ packageName }) => {
    const owners = workspaceDependencyOwners[packageName] ?? [];
    return owners.length === 0 || owners.some((owner) => workspaceNames.includes(owner));
  });
}

function collectCurrentMissingRequirements({
  repoRoot,
  packageLock,
  collectMissingToolchainRequirements,
  collectMissingWorkspaceDependencyRequirements,
  collectMissingInstalledPackageRequirements,
}) {
  return mergeMissingRequirements(
    collectMissingToolchainRequirements(repoRoot),
    collectMissingWorkspaceDependencyRequirements(repoRoot),
    collectMissingInstalledPackageRequirements(repoRoot, { packageLock }),
  );
}

export async function runSetupWorkspaceToolchain(options = {}) {
  const {
    repoRoot: targetRepoRoot = repoRoot,
    loadPackageLock: loadPackageLockImpl = loadPackageLock,
    collectMissingToolchainRequirements: collectMissingToolchainRequirementsImpl =
      collectMissingToolchainRequirements,
    collectMissingWorkspaceDependencyRequirements: collectMissingWorkspaceDependencyRequirementsImpl =
      collectMissingWorkspaceDependencyRequirements,
    collectMissingInstalledPackageRequirements: collectMissingInstalledPackageRequirementsImpl =
      collectMissingInstalledPackageRequirements,
    collectWorkspaceDependencyLockIssues: collectWorkspaceDependencyLockIssuesImpl =
      collectWorkspaceDependencyLockIssues,
    collectWorkspaceDependencyOwners: collectWorkspaceDependencyOwnersImpl =
      collectWorkspaceDependencyOwners,
    restoreMissingToolchainRequirementsFromCache: restoreMissingToolchainRequirementsFromCacheImpl =
      restoreMissingToolchainRequirementsFromCache,
    collectOfflineCacheMissesFromLockfile: collectOfflineCacheMissesFromLockfileImpl =
      collectOfflineCacheMissesFromLockfile,
    extractOfflineInstallCacheMisses: extractOfflineInstallCacheMissesImpl =
      extractOfflineInstallCacheMisses,
    formatMissingToolchainRequirements: formatMissingToolchainRequirementsImpl =
      formatMissingToolchainRequirements,
    runNpmInstall: runNpmInstallImpl = defaultRunNpmInstall,
    allowNetworkInstall = process.env.SCANAPP_ALLOW_NETWORK_INSTALL === '1',
    workspaceNames = [],
    retryCommand = 'npm run setup:workspace',
    console: consoleImpl = console,
    writeStdout = (output) => process.stdout.write(output),
    writeStderr = (output) => process.stderr.write(output),
  } = options;
  const workspaceDependencyOwners = collectWorkspaceDependencyOwnersImpl(targetRepoRoot);
  const filteredWorkspaceDependencyOwners = filterWorkspaceDependencyOwners(
    workspaceDependencyOwners,
    workspaceNames,
  );

  const { packageLock, issue: packageLockIssue } = loadPackageLockImpl(targetRepoRoot);
  const missingRequirementsBeforeInstall = filterRequirementsForWorkspaces(
    collectCurrentMissingRequirements({
      repoRoot: targetRepoRoot,
      packageLock,
      collectMissingToolchainRequirements: collectMissingToolchainRequirementsImpl,
      collectMissingWorkspaceDependencyRequirements:
        collectMissingWorkspaceDependencyRequirementsImpl,
      collectMissingInstalledPackageRequirements: collectMissingInstalledPackageRequirementsImpl,
    }),
    workspaceDependencyOwners,
    workspaceNames,
  );
  let unresolvedRequirements = missingRequirementsBeforeInstall;
  const dependencyLockIssues = collectWorkspaceDependencyLockIssuesImpl(targetRepoRoot, {
    packageLock,
  }).filter(({ packageName }) =>
    missingRequirementsBeforeInstall.some(
      ({ moduleDirectory }) => packageNameFromModuleDirectory(moduleDirectory) === packageName,
    ),
  );

  if (missingRequirementsBeforeInstall.length > 0 && packageLockIssue) {
    consoleImpl.error(
      formatMissingToolchainRequirementsImpl(missingRequirementsBeforeInstall, {
        packageLockIssue,
        retryCommand,
        workspaceDependencyOwners: filteredWorkspaceDependencyOwners,
      }),
    );
    return { exitCode: 1 };
  }

  if (missingRequirementsBeforeInstall.length > 0 && dependencyLockIssues.length > 0) {
    consoleImpl.error(
      formatMissingToolchainRequirementsImpl(missingRequirementsBeforeInstall, {
        dependencyLockIssues,
        retryCommand,
        workspaceDependencyOwners: filteredWorkspaceDependencyOwners,
      }),
    );
    return { exitCode: 1 };
  }

  if (missingRequirementsBeforeInstall.length > 0) {
    const restoreResult = await restoreMissingToolchainRequirementsFromCacheImpl(
      targetRepoRoot,
      missingRequirementsBeforeInstall,
      { packageLock },
    );
    unresolvedRequirements = restoreResult.unresolvedRequirements;

    if (restoreResult.restoredPackages.length > 0) {
      consoleImpl.log(
        `Restored cached workspace packages: ${restoreResult.restoredPackages.join(', ')}`,
      );
    }
  }

  if (unresolvedRequirements.length > 0) {
    const preinstallOfflineCacheMisses = await collectOfflineCacheMissesFromLockfileImpl(
      targetRepoRoot,
      unresolvedRequirements,
      {
        packageLock,
      },
    );
    const filteredPreinstallOfflineCacheMisses = filterOfflineCacheMissesForWorkspaces(
      preinstallOfflineCacheMisses,
      workspaceDependencyOwners,
      workspaceNames,
    );
    const knownOfflineCacheMisses =
      shouldSkipOfflineInstallForKnownCacheMisses(
        unresolvedRequirements,
        filteredPreinstallOfflineCacheMisses,
      );

    if (knownOfflineCacheMisses) {
      if (allowNetworkInstall) {
        consoleImpl.log(
          'Offline cache misses detected for unresolved workspace packages; retrying with network install...',
        );
      } else {
        consoleImpl.error(
          formatMissingToolchainRequirementsImpl(unresolvedRequirements, {
            offlineCacheMisses: filteredPreinstallOfflineCacheMisses,
            retryCommand,
            workspaceDependencyOwners: filteredWorkspaceDependencyOwners,
          }),
        );
        return { exitCode: 1 };
      }
    }

    consoleImpl.log('Installing workspace dependencies for lint/typecheck...');
    let installMode = knownOfflineCacheMisses && allowNetworkInstall ? 'online' : 'offline';
    let installResult = runNpmInstallImpl({ offline: installMode === 'offline' });

    if (
      installMode === 'offline' &&
      (installResult.status ?? 1) !== 0 &&
      allowNetworkInstall
    ) {
      const offlineCacheMisses = extractOfflineInstallCacheMissesImpl(
        `${installResult.stdout ?? ''}\n${installResult.stderr ?? ''}`,
      );

      if (offlineCacheMisses.length > 0) {
        if (installResult.stdout) {
          writeStdout(installResult.stdout);
        }

        if (installResult.stderr) {
          writeStderr(installResult.stderr);
        }

        consoleImpl.log('Offline npm install hit cache misses; retrying with network install...');
        consoleImpl.log('Installing workspace dependencies for lint/typecheck...');
        installMode = 'online';
        installResult = runNpmInstallImpl({ offline: false });
      }
    }

    const installStatus = installResult.status ?? 1;

    if (installResult.stdout) {
      writeStdout(installResult.stdout);
    }

    if (installResult.stderr) {
      writeStderr(installResult.stderr);
    }

    if (installStatus !== 0) {
      const missingRequirementsAfterFailedInstall = filterRequirementsForWorkspaces(
        collectCurrentMissingRequirements({
          repoRoot: targetRepoRoot,
          packageLock,
          collectMissingToolchainRequirements: collectMissingToolchainRequirementsImpl,
          collectMissingWorkspaceDependencyRequirements:
            collectMissingWorkspaceDependencyRequirementsImpl,
          collectMissingInstalledPackageRequirements:
            collectMissingInstalledPackageRequirementsImpl,
        }),
        workspaceDependencyOwners,
        workspaceNames,
      );
      const postFailureRestoreResult = await restoreMissingToolchainRequirementsFromCacheImpl(
        targetRepoRoot,
        missingRequirementsAfterFailedInstall,
        { packageLock },
      );
      const finalUnresolvedRequirements = postFailureRestoreResult.unresolvedRequirements;

      if (postFailureRestoreResult.restoredPackages.length > 0) {
        consoleImpl.log(
          `Restored cached workspace packages after ${installMode} npm install failure: ${postFailureRestoreResult.restoredPackages.join(', ')}`,
        );
      }

      const offlineCacheMisses = mergeOfflineCacheMisses(
        filterOfflineCacheMissesForWorkspaces(
          await collectOfflineCacheMissesFromLockfileImpl(
            targetRepoRoot,
            finalUnresolvedRequirements,
            {
              packageLock,
            },
          ),
          workspaceDependencyOwners,
          workspaceNames,
        ),
        filterOfflineCacheMissesForWorkspaces(
          extractOfflineInstallCacheMissesImpl(
            `${installResult.stdout ?? ''}\n${installResult.stderr ?? ''}`,
          ),
          workspaceDependencyOwners,
          workspaceNames,
        ),
      );

      consoleImpl.error(
        `${installMode === 'offline' ? 'Offline' : 'Network'} npm install failed with exit code ${installStatus}.`,
      );
      consoleImpl.error(
        formatMissingToolchainRequirementsImpl(finalUnresolvedRequirements, {
          offlineCacheMisses,
          retryCommand,
          workspaceDependencyOwners: filteredWorkspaceDependencyOwners,
        }),
      );
      return { exitCode: 1 };
    }
  }

  const missingRequirementsAfterInstall = filterRequirementsForWorkspaces(
    collectCurrentMissingRequirements({
      repoRoot: targetRepoRoot,
      packageLock,
      collectMissingToolchainRequirements: collectMissingToolchainRequirementsImpl,
      collectMissingWorkspaceDependencyRequirements:
        collectMissingWorkspaceDependencyRequirementsImpl,
      collectMissingInstalledPackageRequirements: collectMissingInstalledPackageRequirementsImpl,
    }),
    workspaceDependencyOwners,
    workspaceNames,
  );

  if (missingRequirementsAfterInstall.length > 0) {
    consoleImpl.error(
      formatMissingToolchainRequirementsImpl(missingRequirementsAfterInstall, {
        offlineCacheMisses: filterOfflineCacheMissesForWorkspaces(
          await collectOfflineCacheMissesFromLockfileImpl(
            targetRepoRoot,
            missingRequirementsAfterInstall,
            { packageLock },
          ),
          workspaceDependencyOwners,
          workspaceNames,
        ),
        retryCommand,
        workspaceDependencyOwners: filteredWorkspaceDependencyOwners,
      }),
    );
    return { exitCode: 1 };
  }

  consoleImpl.log('Workspace lint/typecheck toolchain is ready.');
  return { exitCode: 0 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await runSetupWorkspaceToolchain();

  if (result.exitCode !== 0) {
    process.exit(result.exitCode);
  }
}
