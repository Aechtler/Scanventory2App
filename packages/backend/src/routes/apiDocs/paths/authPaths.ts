export function buildAuthPaths(): Record<string, unknown> {
  return {
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
  };
}
