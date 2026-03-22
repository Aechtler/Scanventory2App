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
  databaseUrl: requireEnv('DATABASE_URL'),

  // Supabase
  supabaseUrl: requireEnv('SUPABASE_URL'),
  supabaseServiceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),

  // uploadDir wird nicht mehr benötigt (Supabase Storage)
  // Nur noch für eventuelle Rückwärtskompatibilität
  uploadDir: process.env.UPLOAD_DIR ?? './uploads',
} as const;
