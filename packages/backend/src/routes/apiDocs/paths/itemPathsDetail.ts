import { ITEM_ID_PARAMETER } from './itemPathsShared';

export function buildItemDetailPaths(): Record<string, unknown> {
  return {
    '/items/{id}': {
      get: {
        tags: ['Items'],
        summary: 'Get a scanned item by id',
        security: [{ bearerAuth: [] }],
        parameters: ITEM_ID_PARAMETER,
        responses: {
          '200': { description: 'Item returned successfully' },
          '400': { description: 'Invalid item id' },
          '401': { description: 'Missing or invalid token' },
          '404': { description: 'Item not found' },
        },
      },
      put: {
        tags: ['Items'],
        summary: 'Update a scanned item',
        security: [{ bearerAuth: [] }],
        parameters: ITEM_ID_PARAMETER,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                additionalProperties: true,
              },
            },
          },
        },
        responses: {
          '200': { description: 'Item updated successfully' },
          '400': { description: 'Invalid item id' },
          '401': { description: 'Missing or invalid token' },
          '404': { description: 'Item not found' },
        },
      },
      delete: {
        tags: ['Items'],
        summary: 'Delete a scanned item and attempt image cleanup',
        security: [{ bearerAuth: [] }],
        parameters: ITEM_ID_PARAMETER,
        responses: {
          '200': { description: 'Delete result returned successfully' },
          '400': { description: 'Invalid item id' },
          '401': { description: 'Missing or invalid token' },
          '404': { description: 'Item not found' },
        },
      },
    },
  };
}
