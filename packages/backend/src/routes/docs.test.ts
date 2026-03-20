import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildOpenApiDocument, buildSwaggerHtml } from './apiDocs.ts';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

test('buildOpenApiDocument exposes the current backend surface with bearer auth', () => {
  const document = buildOpenApiDocument({
    serverUrl: 'https://api.scanapp.test',
  });

  assert.equal(document.openapi, '3.1.0');
  assert.equal(document.info.title, 'ScanApp Backend API');
  assert.deepEqual(document.servers, [{ url: 'https://api.scanapp.test' }]);
  assert.ok(document.paths['/health']);
  assert.ok(document.paths['/auth/login']);
  assert.ok(document.paths['/auth/register']);
  assert.ok(document.paths['/auth/me']);
  assert.ok(document.paths['/images/{filename}']);
  assert.ok(document.paths['/items']);
  assert.ok(document.paths['/items/{id}']);
  assert.ok(document.paths['/items/{id}/prices']);
  assert.ok(document.paths['/items/{id}/kleinanzeigen-prices']);
  assert.ok(document.paths['/items/{id}/market-value']);
  assert.equal(
    document.components.securitySchemes.bearerAuth.scheme,
    'bearer'
  );
});

test('buildSwaggerHtml points Swagger UI at the generated OpenAPI json', () => {
  const html = buildSwaggerHtml('/api/docs/openapi.json');

  assert.match(html, /SwaggerUIBundle/);
  assert.match(html, /\/api\/docs\/openapi\.json/);
  assert.match(html, /ScanApp API Docs/);
});

test('api route aggregator registers the docs router as a public route', () => {
  const routeSource = readFileSync(path.join(currentDir, 'index.ts'), 'utf8');

  assert.match(routeSource, /import\s+docsRouter\s+from\s+'\.\/docs'/);
  assert.match(routeSource, /router\.use\('\/docs',\s*docsRouter\);/);
});
