import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { validateManualRegressionChecklist } from './manual-regression-checklist.mjs';

function createTempWorkspace(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'manual-regression-checklist-'));
}

test('validateManualRegressionChecklist passes when documented scripts and sections exist', () => {
  const repoRoot = createTempWorkspace();

  fs.writeFileSync(
    path.join(repoRoot, 'package.json'),
    JSON.stringify({
      scripts: {
        'test:targeted': 'node --test',
        'typecheck:mobile': 'node mobile',
        'lint:mobile': 'node lint',
        'typecheck:backend': 'node backend',
      },
    }),
  );

  fs.mkdirSync(path.join(repoRoot, 'docs'), { recursive: true });
  fs.writeFileSync(
    path.join(repoRoot, 'docs', 'manual-regression-checklist.md'),
    `# Manual Regression Checklist

## Quick command checks

\`\`\`bash
npm run test:targeted
npm run typecheck:mobile
npm run lint:mobile
npm run typecheck:backend
\`\`\`

## 1) Auth
## 2) Scan and analyze
## 3) Save, library, and detail flows
## 4) Backend upload and image routes
## 5) Sync / update / delete
## Recording results

- environment used
- command checks run and pass/fail/block status
- manual sections completed
- any regressions or blockers with exact file/flow context

## Trello update template

- Ziel
- Umfang
- Nachweise
- Nächster Schritt
- Validierung
`,
  );

  const result = validateManualRegressionChecklist(repoRoot);

  assert.deepEqual(result, []);
});

test('validateManualRegressionChecklist reports missing scripts, sections, and Trello fields', () => {
  const repoRoot = createTempWorkspace();

  fs.writeFileSync(
    path.join(repoRoot, 'package.json'),
    JSON.stringify({
      scripts: {
        'test:targeted': 'node --test',
      },
    }),
  );

  fs.mkdirSync(path.join(repoRoot, 'docs'), { recursive: true });
  fs.writeFileSync(
    path.join(repoRoot, 'docs', 'manual-regression-checklist.md'),
    `# Manual Regression Checklist

## Quick command checks

\`\`\`bash
npm run test:targeted
npm run typecheck:mobile
\`\`\`

## 1) Auth
## Recording results
`,
  );

  const result = validateManualRegressionChecklist(repoRoot);

  assert.deepEqual(result, [
    'Documented npm script is missing from package.json: typecheck:mobile',
    'Checklist is missing required section: ## 2) Scan and analyze',
    'Checklist is missing required section: ## 3) Save, library, and detail flows',
    'Checklist is missing required section: ## 4) Backend upload and image routes',
    'Checklist is missing required section: ## 5) Sync / update / delete',
    'Checklist is missing recording-results bullet: environment used',
    'Checklist is missing recording-results bullet: command checks run and pass/fail/block status',
    'Checklist is missing recording-results bullet: manual sections completed',
    'Checklist is missing recording-results bullet: any regressions or blockers with exact file/flow context',
    'Checklist is missing Trello update template section',
  ]);
});
