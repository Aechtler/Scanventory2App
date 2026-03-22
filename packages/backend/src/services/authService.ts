/**
 * Auth Service - Benutzer-Authentifizierung via Supabase Auth
 * Ersetzt bcrypt + jsonwebtoken durch Supabase Auth
 */

import { supabaseAdmin } from './supabaseClient';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string | null;
    isAdmin: boolean;
  };
  token: string;
  refreshToken?: string;
}

/**
 * Neuen User registrieren via Supabase Auth.
 * Supabase erstellt den User in auth.users, der DB-Trigger
 * spiegelt ihn automatisch in die public.User Tabelle.
 */
export async function registerUser(
  email: string,
  password: string,
  name?: string
): Promise<AuthResult> {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm (kein Email-Verify nötig für native App)
    user_metadata: { name: name ?? null },
  });

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already exists')) {
      throw new Error('User with this email already exists');
    }
    throw new Error(`Registration failed: ${error.message}`);
  }

  if (!data.user) throw new Error('Registration failed: no user returned');

  // Login direkt nach Registrierung um Token zu bekommen
  return loginUser(email, password);
}

/**
 * User einloggen via Supabase Auth.
 * Gibt Supabase JWT access_token zurück (wird vom Backend als Bearer Token akzeptiert).
 */
export async function loginUser(
  email: string,
  password: string
): Promise<AuthResult> {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error('Invalid email or password');
  }

  if (!data.user || !data.session) throw new Error('Login failed: no session returned');

  // Profil-Daten aus public.User nachladen (isAdmin, name)
  const profile = await getUserById(data.user.id).catch(() => null);

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
      name: profile?.name ?? data.user.user_metadata?.name ?? null,
      isAdmin: profile?.isAdmin ?? false,
    },
    token: data.session.access_token,
    refreshToken: data.session.refresh_token,
  };
}

/**
 * Verifiziert einen Supabase JWT Token und gibt die User-Payload zurück.
 * Wird von der Auth-Middleware aufgerufen.
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    throw new Error('Invalid or expired token');
  }

  return {
    userId: data.user.id,
    email: data.user.email!,
  };
}

/**
 * User-Profil aus der public.User Tabelle laden
 */
export async function getUserById(userId: string) {
  // Prisma-Import aus itemService (wie bisher)
  const { prisma } = await import('./itemService');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      isAdmin: true,
      createdAt: true,
    },
  });

  if (!user) throw new Error('User not found');
  return user;
}
