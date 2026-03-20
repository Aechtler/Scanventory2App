export type OpenApiDocument = {
  openapi: '3.1.0';
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{ url: string }>;
  tags: Array<{ name: string; description: string }>;
  paths: Record<string, unknown>;
  components: {
    securitySchemes: Record<string, unknown>;
    schemas: Record<string, unknown>;
  };
};

function getDefaultServerUrl(): string {
  return process.env.OPENAPI_SERVER_URL?.trim() || '/api';
}

export function buildOpenApiDocument(options: {
  serverUrl?: string;
} = {}): OpenApiDocument {
  const serverUrl = options.serverUrl?.trim() || getDefaultServerUrl();

  return {
    openapi: '3.1.0',
    info: {
      title: 'ScanApp Backend API',
      version: '1.0.0',
      description:
        'HTTP API for authentication, image delivery, scanned-item history, and health checks.',
    },
    servers: [{ url: serverUrl }],
    tags: [
      { name: 'Health', description: 'Service and dependency health checks' },
      { name: 'Auth', description: 'User registration, login, and session endpoints' },
      { name: 'Images', description: 'Public scanned-image delivery' },
      { name: 'Items', description: 'Authenticated scanned-item CRUD and pricing updates' },
    ],
    paths: {
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
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterRequest' },
              },
            },
          },
          responses: {
            '201': { description: 'User registered successfully' },
            '400': { description: 'Invalid request body' },
            '409': { description: 'User already exists' },
            '429': { description: 'Rate limited' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
              },
            },
          },
          responses: {
            '200': { description: 'Authenticated successfully' },
            '400': { description: 'Invalid request body' },
            '401': { description: 'Invalid credentials' },
            '429': { description: 'Rate limited' },
          },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get the current authenticated user',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Authenticated user returned' },
            '401': { description: 'Missing or invalid token' },
            '404': { description: 'User not found' },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout on the client side',
          responses: {
            '200': { description: 'Client-side logout acknowledged' },
          },
        },
      },
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
      '/items/{id}': {
        get: {
          tags: ['Items'],
          summary: 'Get a scanned item by id',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
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
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
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
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': { description: 'Delete result returned successfully' },
            '400': { description: 'Invalid item id' },
            '401': { description: 'Missing or invalid token' },
            '404': { description: 'Item not found' },
          },
        },
      },
      '/items/{id}/prices': {
        patch: {
          tags: ['Items'],
          summary: 'Update eBay price statistics and listings',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
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
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
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
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
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
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            name: { type: 'string' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        SearchQueries: {
          type: 'object',
          properties: {
            ebay: { type: 'string' },
            kleinanzeigen: { type: 'string' },
            amazon: { type: 'string' },
            idealo: { type: 'string' },
            generic: { type: 'string' },
          },
        },
        MarketListing: {
          type: 'object',
          required: [
            'id',
            'title',
            'price',
            'currency',
            'condition',
            'imageUrl',
            'itemUrl',
            'sold',
          ],
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            price: { type: 'number' },
            currency: { type: 'string' },
            condition: { type: 'string' },
            imageUrl: { type: 'string' },
            itemUrl: { type: 'string' },
            sold: { type: 'boolean' },
            marketplace: { type: 'string' },
            selected: { type: 'boolean' },
          },
        },
        PriceStats: {
          type: 'object',
          required: [
            'minPrice',
            'maxPrice',
            'avgPrice',
            'medianPrice',
            'totalListings',
            'soldListings',
          ],
          properties: {
            minPrice: { type: 'number' },
            maxPrice: { type: 'number' },
            avgPrice: { type: 'number' },
            medianPrice: { type: 'number' },
            totalListings: { type: 'integer' },
            soldListings: { type: 'integer' },
          },
        },
        MarketValueResult: {
          type: 'object',
          required: [
            'estimatedPrice',
            'priceRange',
            'confidence',
            'sources',
            'summary',
            'rawResponse',
          ],
          properties: {
            estimatedPrice: { type: 'string' },
            priceRange: { type: 'string' },
            confidence: {
              type: 'string',
              enum: ['hoch', 'mittel', 'niedrig'],
            },
            sources: {
              type: 'array',
              items: { type: 'string' },
            },
            summary: { type: 'string' },
            rawResponse: { type: 'string' },
          },
        },
        CreateItemBody: {
          type: 'object',
          required: [
            'productName',
            'category',
            'condition',
            'confidence',
            'searchQuery',
            'scannedAt',
          ],
          properties: {
            productName: { type: 'string' },
            category: { type: 'string' },
            brand: { type: ['string', 'null'] },
            condition: { type: 'string' },
            confidence: { type: 'number' },
            gtin: { type: ['string', 'null'] },
            searchQuery: { type: 'string' },
            searchQueries: { $ref: '#/components/schemas/SearchQueries' },
            originalUri: { type: 'string' },
            priceStats: { $ref: '#/components/schemas/PriceStats' },
            ebayListings: {
              type: 'array',
              items: { $ref: '#/components/schemas/MarketListing' },
            },
            ebayListingsFetchedAt: { type: 'string', format: 'date-time' },
            kleinanzeigenListings: {
              type: 'array',
              items: { $ref: '#/components/schemas/MarketListing' },
            },
            kleinanzeigenListingsFetchedAt: { type: 'string', format: 'date-time' },
            marketValue: { $ref: '#/components/schemas/MarketValueResult' },
            marketValueFetchedAt: { type: 'string', format: 'date-time' },
            finalPrice: { type: ['number', 'null'] },
            finalPriceNote: { type: ['string', 'null'] },
            scannedAt: { type: 'string', format: 'date-time' },
          },
        },
        UpdatePricesRequest: {
          type: 'object',
          required: ['priceStats'],
          properties: {
            priceStats: { $ref: '#/components/schemas/PriceStats' },
            ebayListings: {
              type: 'array',
              items: { $ref: '#/components/schemas/MarketListing' },
            },
          },
        },
        UpdateKleinanzeigenPricesRequest: {
          type: 'object',
          required: ['kleinanzeigenListings'],
          properties: {
            kleinanzeigenListings: {
              type: 'array',
              items: { $ref: '#/components/schemas/MarketListing' },
            },
          },
        },
        UpdateMarketValueRequest: {
          type: 'object',
          required: ['marketValue'],
          properties: {
            marketValue: { $ref: '#/components/schemas/MarketValueResult' },
          },
        },
      },
    },
  };
}

export function buildSwaggerHtml(openApiJsonUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ScanApp API Docs</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
    />
    <style>
      body {
        margin: 0;
        background: #f5f7fb;
      }

      .topbar {
        display: none;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '${openApiJsonUrl}',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
      });
    </script>
  </body>
</html>`;
}
