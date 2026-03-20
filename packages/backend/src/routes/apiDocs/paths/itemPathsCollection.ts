export function buildItemCollectionPaths(): Record<string, unknown> {
  return {
    '/items': {
      get: {
        tags: ['Items'],
        summary: 'List scanned items for the authenticated user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          },
        ],
        responses: {
          '200': { description: 'Paginated item list' },
          '401': { description: 'Missing or invalid token' },
        },
      },
      post: {
        tags: ['Items'],
        summary: 'Create a scanned item with multipart image upload',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image', 'data'],
                properties: {
                  image: {
                    type: 'string',
                    format: 'binary',
                  },
                  data: {
                    description: 'JSON-serialized CreateItemBody payload',
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Item created successfully' },
          '400': { description: 'Invalid upload or payload' },
          '401': { description: 'Missing or invalid token' },
        },
      },
    },
  };
}
