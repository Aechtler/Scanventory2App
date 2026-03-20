export function buildOpenApiComponents(): {
  securitySchemes: Record<string, unknown>;
  schemas: Record<string, unknown>;
} {
  return {
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
  };
}
