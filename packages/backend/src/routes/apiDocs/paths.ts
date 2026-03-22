import { buildAuthPaths } from './paths/authPaths';
import { buildImagePaths } from './paths/imagePaths';
import { buildItemPaths } from './paths/itemPaths';

export function buildOpenApiPaths(): Record<string, unknown> {
  return {
    ...buildAuthPaths(),
    ...buildImagePaths(),
    ...buildItemPaths(),
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Check API and dependency health',
        responses: {
          '200': {
            description: 'All dependencies are healthy',
          },
          '503': {
            description: 'One or more dependencies are degraded',
          },
        },
      },
    },
  };
}
