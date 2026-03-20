import test from 'node:test';
import assert from 'node:assert/strict';

import { buildErrorLogLine } from './errorLogging.ts';

test('buildErrorLogLine omits stack traces and keeps request correlation', () => {
  const error = new Error('Database write failed');
  error.name = 'PrismaClientKnownRequestError';
  error.stack = `PrismaClientKnownRequestError: Database write failed
    at saveItem (/root/Projekte/Scanventory2App/packages/backend/src/services/itemService.ts:42:13)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)`;

  const line = buildErrorLogLine(error, 'req-123');

  assert.equal(
    line,
    '[Error] req=req-123 name=PrismaClientKnownRequestError message=Database write failed'
  );
  assert.doesNotMatch(line, /itemService\.ts/);
  assert.doesNotMatch(line, /processTicksAndRejections/);
});

test('buildErrorLogLine redacts credentials embedded in error messages', () => {
  const error = new Error(
    'Connection failed for postgresql://scanapp:supersecret@db.internal:5432/scanapp'
  );

  const line = buildErrorLogLine(error, 'req-999');

  assert.equal(
    line,
    '[Error] req=req-999 name=Error message=Connection failed for postgresql://[redacted]@db.internal:5432/scanapp'
  );
  assert.doesNotMatch(line, /supersecret/);
});
