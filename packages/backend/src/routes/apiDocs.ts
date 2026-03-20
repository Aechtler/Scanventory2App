import { buildOpenApiComponents } from './apiDocs/components.ts';
import { OPEN_API_INFO, OPEN_API_TAGS, getDefaultServerUrl } from './apiDocs/metadata.ts';
import { buildOpenApiPaths } from './apiDocs/paths.ts';
import { buildSwaggerHtml } from './apiDocs/swaggerHtml.ts';
import type { OpenApiDocument } from './apiDocs/types.ts';

export type { OpenApiDocument } from './apiDocs/types.ts';

export function buildOpenApiDocument(options: {
  serverUrl?: string;
} = {}): OpenApiDocument {
  const serverUrl = options.serverUrl?.trim() || getDefaultServerUrl();

  return {
    openapi: '3.1.0',
    info: OPEN_API_INFO,
    servers: [{ url: serverUrl }],
    tags: OPEN_API_TAGS,
    paths: buildOpenApiPaths(),
    components: buildOpenApiComponents(),
  };
}

export { buildSwaggerHtml };
