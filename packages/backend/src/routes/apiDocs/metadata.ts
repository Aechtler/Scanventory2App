export const OPEN_API_INFO = {
  title: 'ScanApp Backend API',
  version: '1.0.0',
  description:
    'HTTP API for authentication, image delivery, scanned-item history, and health checks.',
};

export const OPEN_API_TAGS = [
  { name: 'Health', description: 'Service and dependency health checks' },
  { name: 'Auth', description: 'User registration, login, and session endpoints' },
  { name: 'Images', description: 'Public scanned-image delivery' },
  { name: 'Items', description: 'Authenticated scanned-item CRUD and pricing updates' },
];

export function getDefaultServerUrl(): string {
  return process.env.OPENAPI_SERVER_URL?.trim() || '/api';
}
