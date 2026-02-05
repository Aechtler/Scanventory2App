/**
 * Backend Konfiguration - Env-Validation
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  apiKey: requireEnv('API_KEY'),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  databaseUrl: requireEnv('DATABASE_URL'),
} as const;
