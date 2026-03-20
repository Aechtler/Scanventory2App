import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import {
  collectMissingInstalledPackageRequirements,
  collectMissingToolchainRequirements,
  collectOfflineCacheMissesFromLockfile,
  extractOfflineInstallCacheMisses,
  formatMissingToolchainRequirements,
  loadPackageLock,
  restoreMissingToolchainRequirementsFromCache,
} from './workspace-toolchain-health.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');

function defaultRunNpmInstall() {
  return spawnSync(
    'npm',
    ['install', '--offline', '--no-audit', '--no-fund', '--loglevel=notice'],
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

export async function runSetupWorkspaceToolchain(options = {}) {
  const {
    repoRoot: targetRepoRoot = repoRoot,
    loadPackageLock: loadPackageLockImpl = loadPackageLock,
    collectMissingToolchainRequirements: collectMissingToolchainRequirementsImpl =
      collectMissingToolchainRequirements,
    collectMissingInstalledPackageRequirements: collectMissingInstalledPackageRequirementsImpl =
      collectMissingInstalledPackageRequirements,
    restoreMissingToolchainRequirementsFromCache: restoreMissingToolchainRequirementsFromCacheImpl =
      restoreMissingToolchainRequirementsFromCache,
    collectOfflineCacheMissesFromLockfile: collectOfflineCacheMissesFromLockfileImpl =
      collectOfflineCacheMissesFromLockfile,
    extractOfflineInstallCacheMisses: extractOfflineInstallCacheMissesImpl =
      extractOfflineInstallCacheMisses,
    formatMissingToolchainRequirements: formatMissingToolchainRequirementsImpl =
      formatMissingToolchainRequirements,
    runNpmInstall: runNpmInstallImpl = defaultRunNpmInstall,
    console: consoleImpl = console,
    writeStdout = (output) => process.stdout.write(output),
    writeStderr = (output) => process.stderr.write(output),
  } = options;

  const { packageLock, issue: packageLockIssue } = loadPackageLockImpl(targetRepoRoot);
  const missingRequirementsBeforeInstall = mergeMissingRequirements(
    collectMissingToolchainRequirementsImpl(targetRepoRoot),
    packageLock
      ? collectMissingInstalledPackageRequirementsImpl(targetRepoRoot, { packageLock })
      : [],
  );
  let unresolvedRequirements = missingRequirementsBeforeInstall;

  if (missingRequirementsBeforeInstall.length > 0 && packageLockIssue) {
    consoleImpl.error(
      formatMissingToolchainRequirementsImpl(missingRequirementsBeforeInstall, {
        packageLockIssue,
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
    consoleImpl.log('Installing workspace dependencies for lint/typecheck...');
    const installResult = runNpmInstallImpl();
    const installStatus = installResult.status ?? 1;

    if (installResult.stdout) {
      writeStdout(installResult.stdout);
    }

    if (installResult.stderr) {
      writeStderr(installResult.stderr);
    }

    if (installStatus !== 0) {
      const offlineCacheMisses = mergeOfflineCacheMisses(
        await collectOfflineCacheMissesFromLockfileImpl(targetRepoRoot, unresolvedRequirements, {
          packageLock,
        }),
        extractOfflineInstallCacheMissesImpl(
          `${installResult.stdout ?? ''}\n${installResult.stderr ?? ''}`,
        ),
      );

      consoleImpl.error(`Offline npm install failed with exit code ${installStatus}.`);
      consoleImpl.error(
        formatMissingToolchainRequirementsImpl(
          mergeMissingRequirements(
            collectMissingToolchainRequirementsImpl(targetRepoRoot),
            collectMissingInstalledPackageRequirementsImpl(targetRepoRoot, { packageLock }),
          ),
          {
            offlineCacheMisses,
          },
        ),
      );
      return { exitCode: 1 };
    }
  }

  const missingRequirementsAfterInstall = mergeMissingRequirements(
    collectMissingToolchainRequirementsImpl(targetRepoRoot),
    collectMissingInstalledPackageRequirementsImpl(targetRepoRoot, { packageLock }),
  );

  if (missingRequirementsAfterInstall.length > 0) {
    consoleImpl.error(
      formatMissingToolchainRequirementsImpl(missingRequirementsAfterInstall, {
        offlineCacheMisses: await collectOfflineCacheMissesFromLockfileImpl(
          targetRepoRoot,
          missingRequirementsAfterInstall,
          { packageLock },
        ),
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
