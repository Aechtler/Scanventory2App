import { spawnSync } from 'node:child_process';
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

function runNpmInstall() {
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

async function main() {
  const { packageLock, issue: packageLockIssue } = loadPackageLock(repoRoot);
  const missingRequirementsBeforeInstall = mergeMissingRequirements(
    collectMissingToolchainRequirements(repoRoot),
    packageLock ? collectMissingInstalledPackageRequirements(repoRoot, { packageLock }) : [],
  );
  let unresolvedRequirements = missingRequirementsBeforeInstall;

  if (missingRequirementsBeforeInstall.length > 0 && packageLockIssue) {
    console.error(
      formatMissingToolchainRequirements(missingRequirementsBeforeInstall, {
        packageLockIssue,
      }),
    );
    process.exit(1);
  }

  if (missingRequirementsBeforeInstall.length > 0) {
    const restoreResult = await restoreMissingToolchainRequirementsFromCache(
      repoRoot,
      missingRequirementsBeforeInstall,
      { packageLock },
    );
    unresolvedRequirements = restoreResult.unresolvedRequirements;

    if (restoreResult.restoredPackages.length > 0) {
      console.log(
        `Restored cached workspace packages: ${restoreResult.restoredPackages.join(', ')}`,
      );
    }
  }

  if (unresolvedRequirements.length > 0) {
    console.log('Installing workspace dependencies for lint/typecheck...');
    const installResult = runNpmInstall();
    const installStatus = installResult.status ?? 1;

    if (installResult.stdout) {
      process.stdout.write(installResult.stdout);
    }

    if (installResult.stderr) {
      process.stderr.write(installResult.stderr);
    }

    if (installStatus !== 0) {
      const offlineCacheMisses = mergeOfflineCacheMisses(
        await collectOfflineCacheMissesFromLockfile(repoRoot, unresolvedRequirements, {
          packageLock,
        }),
        extractOfflineInstallCacheMisses(
          `${installResult.stdout ?? ''}\n${installResult.stderr ?? ''}`,
        ),
      );

      console.error(`Offline npm install failed with exit code ${installStatus}.`);
      console.error(
        formatMissingToolchainRequirements(
          mergeMissingRequirements(
            collectMissingToolchainRequirements(repoRoot),
            collectMissingInstalledPackageRequirements(repoRoot, { packageLock }),
          ),
          {
          offlineCacheMisses,
          },
        ),
      );
      process.exit(1);
    }
  }

  const missingRequirementsAfterInstall = mergeMissingRequirements(
    collectMissingToolchainRequirements(repoRoot),
    collectMissingInstalledPackageRequirements(repoRoot, { packageLock }),
  );

  if (missingRequirementsAfterInstall.length > 0) {
    console.error(
      formatMissingToolchainRequirements(missingRequirementsAfterInstall, {
        offlineCacheMisses: await collectOfflineCacheMissesFromLockfile(
          repoRoot,
          missingRequirementsAfterInstall,
          { packageLock },
        ),
      }),
    );
    process.exit(1);
  }

  console.log('Workspace lint/typecheck toolchain is ready.');
}

await main();
