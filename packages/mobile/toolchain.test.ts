import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const rootPackageJsonPath = path.join(repoRoot, 'package.json');
const mobilePackageJsonPath = path.join(import.meta.dirname, 'package.json');
const lintScriptPath = path.join(repoRoot, 'scripts', 'lint-mobile.mjs');
const typecheckScriptPath = path.join(repoRoot, 'scripts', 'run-workspace-typecheck.mjs');
const setupScriptPath = path.join(repoRoot, 'scripts', 'setup-workspace-toolchain.mjs');

type PackageJson = {
  scripts?: Record<string, string>;
};

function readPackageJson(filePath: string): PackageJson {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as PackageJson;
}

test('workspace setup exposes a repeatable lint/typecheck bootstrap entrypoint', () => {
  const rootPackageJson = readPackageJson(rootPackageJsonPath);

  assert.equal(
    rootPackageJson.scripts?.['setup:workspace'],
    'node ./scripts/setup-workspace-toolchain.mjs',
  );
  assert.equal(
    rootPackageJson.scripts?.['typecheck:mobile'],
    'node ./scripts/run-workspace-typecheck.mjs mobile',
  );
  assert.equal(
    rootPackageJson.scripts?.['typecheck:backend'],
    'node ./scripts/run-workspace-typecheck.mjs backend',
  );
  assert.equal(fs.existsSync(setupScriptPath), true);
  assert.equal(fs.existsSync(typecheckScriptPath), true);
});

test('mobile workspace points lint to the repo-local runner', () => {
  const mobilePackageJson = readPackageJson(mobilePackageJsonPath);

  assert.equal(mobilePackageJson.scripts?.lint, 'node ../../scripts/lint-mobile.mjs');
  assert.equal(
    mobilePackageJson.scripts?.typecheck,
    'node ../../node_modules/typescript/bin/tsc --noEmit',
  );
  assert.equal(fs.existsSync(lintScriptPath), true);
});
