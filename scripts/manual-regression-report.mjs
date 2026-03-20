import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function resolveCurrentBranch(repoRoot) {
  try {
    return execFileSync('git', ['branch', '--show-current'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'unknown';
  }
}

function readChecklistDate(repoRoot) {
  const checklistPath = path.join(repoRoot, 'docs', 'manual-regression-checklist.md');

  try {
    const text = fs.readFileSync(checklistPath, 'utf8');
    const match = text.match(/_Last updated: (?<date>\d{4}-\d{2}-\d{2})_/u);
    return match?.groups?.date ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

export function buildManualRegressionReport({
  date = new Date().toISOString().slice(0, 10),
  branch = 'unknown',
  checklistLastUpdated = 'unknown',
} = {}) {
  return `# Manual Regression Report - ${date}

- Branch: ${branch}
- Checklist last updated: ${checklistLastUpdated}

## Validation result

- Environment:
- Command checks:
- Manual sections completed:
- Regressions / blockers:

## Trello update

- Ziel
- Umfang
- Nachweise
- Nächster Schritt
- Validierung
`;
}

export function printManualRegressionReport(repoRoot = process.cwd()) {
  const report = buildManualRegressionReport({
    branch: resolveCurrentBranch(repoRoot),
    checklistLastUpdated: readChecklistDate(repoRoot),
  });

  console.log(report);
  return report;
}

const entrypointPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
const modulePath = fileURLToPath(import.meta.url);

if (entrypointPath === modulePath) {
  printManualRegressionReport();
}
