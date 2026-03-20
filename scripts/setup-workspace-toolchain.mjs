import { spawnSync } from 'node:child_process';
import path from 'node:path';
import {
  collectMissingToolchainRequirements,
  extractOfflineInstallCacheMisses,
  formatMissingToolchainRequirements,
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

const missingRequirementsBeforeInstall = collectMissingToolchainRequirements(repoRoot);
let installStatus = 0;

if (missingRequirementsBeforeInstall.length > 0) {
  console.log('Installing workspace dependencies for lint/typecheck...');
  const installResult = runNpmInstall();
  installStatus = installResult.status ?? 1;

  if (installResult.stdout) {
    process.stdout.write(installResult.stdout);
  }

  if (installResult.stderr) {
    process.stderr.write(installResult.stderr);
  }

  if (installStatus !== 0) {
    const offlineCacheMisses = extractOfflineInstallCacheMisses(
      `${installResult.stdout ?? ''}\n${installResult.stderr ?? ''}`,
    );

    console.error(`Offline npm install failed with exit code ${installStatus}.`);
    console.error(
      formatMissingToolchainRequirements(collectMissingToolchainRequirements(repoRoot), {
        offlineCacheMisses,
      }),
    );
    process.exit(1);
  }
}

const missingRequirementsAfterInstall = collectMissingToolchainRequirements(repoRoot);

if (missingRequirementsAfterInstall.length > 0) {
  console.error(formatMissingToolchainRequirements(missingRequirementsAfterInstall));
  process.exit(1);
}

console.log('Workspace lint/typecheck toolchain is ready.');
