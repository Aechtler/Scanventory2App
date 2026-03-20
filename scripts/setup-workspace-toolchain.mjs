import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const requiredModulePath = path.join(
  repoRoot,
  'node_modules',
  'typescript',
  'lib',
  'typescript.js',
);

function hasRequiredToolchain() {
  return fs.existsSync(requiredModulePath);
}

function runNpmInstall() {
  const result = spawnSync('npm', ['install', '--offline', '--no-audit', '--no-fund'], {
    cwd: repoRoot,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!hasRequiredToolchain()) {
  console.log('Installing workspace dependencies for lint/typecheck...');
  runNpmInstall();
}

if (!hasRequiredToolchain()) {
  console.error('Workspace setup incomplete. Missing local TypeScript runtime.');
  process.exit(1);
}

console.log('Workspace lint/typecheck toolchain is ready.');
