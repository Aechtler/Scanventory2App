import test from 'node:test';
import assert from 'node:assert/strict';

import { createItemService } from './itemServiceFactory.ts';

test('createItemService uses the injected scanned-item dependency for pagination reads', async () => {
  const calls: Array<{ method: string; args: unknown[] }> = [];

  const service = createItemService(
    {
      scannedItem: {
        findMany: async (...args: unknown[]) => {
          calls.push({ method: 'findMany', args });
          return [{ id: 'item-1' }];
        },
        count: async (...args: unknown[]) => {
          calls.push({ method: 'count', args });
          return 11;
        },
        findFirst: async () => null,
        create: async () => ({ id: 'created-item' }),
        updateMany: async () => ({ count: 1 }),
      },
      $transaction: async () => null,
    },
    {
      toJsonOrNull: (value) => value ?? null,
    }
  );

  const result = await service.getItems('user-1', 2, 5);

  assert.deepEqual(result, {
    items: [{ id: 'item-1' }],
    total: 11,
    page: 2,
    totalPages: 3,
  });
  assert.deepEqual(calls, [
    {
      method: 'findMany',
      args: [
        {
          where: { userId: 'user-1' },
          orderBy: { scannedAt: 'desc' },
          skip: 5,
          take: 5,
        },
      ],
    },
    {
      method: 'count',
      args: [{ where: { userId: 'user-1' } }],
    },
  ]);
});

test('createItemService uses the injected transaction dependency for deletes', async () => {
  const deletedIds: string[] = [];

  const service = createItemService(
    {
      scannedItem: {
        findMany: async () => [],
        count: async () => 0,
        findFirst: async () => null,
        create: async () => ({ id: 'created-item' }),
        updateMany: async () => ({ count: 0 }),
      },
      $transaction: async (callback) =>
        callback({
          scannedItem: {
            findUnique: async () => ({ imageFilename: 'item.jpg', userId: 'user-1' }),
            delete: async ({ where }: { where: { id: string } }) => {
              deletedIds.push(where.id);
              return { id: where.id };
            },
          },
        }),
    },
    {
      toJsonOrNull: (value) => value ?? null,
    }
  );

  const result = await service.deleteItem('item-1', 'user-1');

  assert.deepEqual(result, { imageFilename: 'item.jpg' });
  assert.deepEqual(deletedIds, ['item-1']);
});
