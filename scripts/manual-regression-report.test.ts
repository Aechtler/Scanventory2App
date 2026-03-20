import test from 'node:test';
import assert from 'node:assert/strict';

import { buildManualRegressionReport } from './manual-regression-report.mjs';

test('buildManualRegressionReport returns a dated validation report with Trello handoff fields', () => {
  const report = buildManualRegressionReport({
    date: '2026-03-20',
    branch: 'scanapp2',
  });

  assert.match(report, /^# Manual Regression Report - 2026-03-20$/m);
  assert.match(report, /^- Branch: scanapp2$/m);
  assert.match(report, /^## Validation result$/m);
  assert.match(report, /^- Environment:$/m);
  assert.match(report, /^- Command checks:$/m);
  assert.match(report, /^- Manual sections completed:$/m);
  assert.match(report, /^- Regressions \/ blockers:$/m);
  assert.match(report, /^## Trello update$/m);
  assert.match(report, /^- Ziel$/m);
  assert.match(report, /^- Umfang$/m);
  assert.match(report, /^- Nachweise$/m);
  assert.match(report, /^- Nächster Schritt$/m);
  assert.match(report, /^- Validierung$/m);
});
