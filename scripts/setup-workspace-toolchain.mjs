import { spawnSync } from 'node:child_process';
import path from 'node:path';
import {
  collectMissingToolchainRequirements,
  formatMissingToolchainRequirements,
} from './workspace-toolchain-health.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');

function runNpmInstall() {
  return spawnSync('npm', ['install', '--offline', '--no-audit', '--no-fund'], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
}

const missingRequirementsBeforeInstall = collectMissingToolchainRequirements(repoRoot);
let installStatus = 0;

if (missingRequirementsBeforeInstall.length > 0) {
  console.log('Installing workspace dependencies for lint/typecheck...');
  installStatus = runNpmInstall().status ?? 1;
}

const missingRequirementsAfterInstall = collectMissingToolchainRequirements(repoRoot);

if (missingRequirementsAfterInstall.length > 0) {
  if (installStatus !== 0) {
    console.error(`Offline npm install failed with exit code ${installStatus}.`);
  }
  console.error(formatMissingToolchainRequirements(missingRequirementsAfterInstall));
  process.exit(1);
}

console.log('Workspace lint/typecheck toolchain is ready.');
