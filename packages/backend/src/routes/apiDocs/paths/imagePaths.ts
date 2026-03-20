export function buildImagePaths(): Record<string, unknown> {
  return {
    '/images/{filename}': {
      get: {
        tags: ['Images'],
        summary: 'Fetch an uploaded image by filename',
        parameters: [
          {
            name: 'filename',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Image binary',
            content: {
              'image/jpeg': {},
              'image/png': {},
              'image/webp': {},
            },
          },
          '400': { description: 'Invalid filename' },
          '404': { description: 'Image not found' },
        },
      },
    },
  };
}
