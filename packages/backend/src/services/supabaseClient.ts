/**
 * Supabase Admin Client - für Backend-Operationen (Auth, Storage)
 * Verwendet den service_role key → bypassed RLS → NUR im Backend verwenden!
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

function createSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export const supabaseAdmin = createSupabaseAdmin();
