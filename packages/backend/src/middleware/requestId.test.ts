import test from 'node:test';
import assert from 'node:assert/strict';

import {
  REQUEST_ID_HEADER,
  requestIdMiddleware,
} from './requestId.ts';

function createResponseDouble() {
  const headers = new Map<string, string>();

  return {
    headers,
    setHeader(name: string, value: string) {
      headers.set(name, value);
    },
  };
}

test('requestIdMiddleware preserves a valid incoming request id header', () => {
  const req = {
    headers: {
      [REQUEST_ID_HEADER]: 'req-123._:trace',
    },
  };
  const res = createResponseDouble();
  let nextCalled = false;

  requestIdMiddleware(req as never, res as never, () => {
    nextCalled = true;
  });

  assert.equal((req as { requestId?: string }).requestId, 'req-123._:trace');
  assert.equal(res.headers.get(REQUEST_ID_HEADER), 'req-123._:trace');
  assert.equal(nextCalled, true);
});

test('requestIdMiddleware replaces blank, unsafe, or oversized request ids', () => {
  const invalidValues = [
    '   ',
    'req-123\nforged-log-line',
    `req-${'a'.repeat(201)}`,
  ];

  for (const value of invalidValues) {
    const req = {
      headers: {
        [REQUEST_ID_HEADER]: value,
      },
    };
    const res = createResponseDouble();
    let nextCalled = false;

    requestIdMiddleware(req as never, res as never, () => {
      nextCalled = true;
    });

    const requestId = (req as { requestId?: string }).requestId;

    assert.equal(nextCalled, true);
    assert.ok(requestId);
    assert.notEqual(requestId, value);
    assert.equal(res.headers.get(REQUEST_ID_HEADER), requestId);
    assert.match(requestId, /^[0-9a-f-]{36}$/i);
  }
});
