import { buildOpenApiComponents } from './apiDocs/components';
import { OPEN_API_INFO, OPEN_API_TAGS, getDefaultServerUrl } from './apiDocs/metadata';
import { buildOpenApiPaths } from './apiDocs/paths';
import { buildSwaggerHtml } from './apiDocs/swaggerHtml';
import type { OpenApiDocument } from './apiDocs/types';

export type { OpenApiDocument } from './apiDocs/types';

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
