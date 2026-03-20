import { ITEM_ID_PARAMETER } from './itemPathsShared.ts';

export function buildItemPriceUpdatePaths(): Record<string, unknown> {
  return {
    '/items/{id}/prices': {
      patch: {
        tags: ['Items'],
        summary: 'Update eBay price statistics and listings',
        security: [{ bearerAuth: [] }],
        parameters: ITEM_ID_PARAMETER,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdatePricesRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Price data updated successfully' },
          '400': { description: 'Invalid request body or item id' },
          '401': { description: 'Missing or invalid token' },
          '404': { description: 'Item not found' },
        },
      },
    },
    '/items/{id}/kleinanzeigen-prices': {
      patch: {
        tags: ['Items'],
        summary: 'Update Kleinanzeigen listings',
        security: [{ bearerAuth: [] }],
        parameters: ITEM_ID_PARAMETER,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateKleinanzeigenPricesRequest',
              },
            },
          },
        },
        responses: {
          '200': { description: 'Kleinanzeigen data updated successfully' },
          '400': { description: 'Invalid request body or item id' },
          '401': { description: 'Missing or invalid token' },
          '404': { description: 'Item not found' },
        },
      },
    },
    '/items/{id}/market-value': {
      patch: {
        tags: ['Items'],
        summary: 'Update AI-derived market value',
        security: [{ bearerAuth: [] }],
        parameters: ITEM_ID_PARAMETER,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateMarketValueRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Market value updated successfully' },
          '400': { description: 'Invalid request body or item id' },
          '401': { description: 'Missing or invalid token' },
          '404': { description: 'Item not found' },
        },
      },
    },
  };
}
