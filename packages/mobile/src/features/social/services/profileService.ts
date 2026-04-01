import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/shared/constants';
import type {
  PublicProfile,
  ProfileUpdatePayload,
  UsernameCheckResult,
} from '../types/profile.types';

const BASE = API_CONFIG.BASE_URL;
const TOKEN_KEY = 'auth_token';

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Eigenes Profil aktualisieren
 * PATCH /api/auth/profile
 */
export async function updateProfile(payload: ProfileUpdatePayload): Promise<PublicProfile> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/auth/profile`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message ?? 'Profil konnte nicht aktualisiert werden');
  }
  return json.data as PublicProfile;
}

/**
 * Username-Verfügbarkeit prüfen
 * GET /api/auth/profile/check-username?q=...
 */
export async function checkUsernameAvailability(username: string): Promise<UsernameCheckResult> {
  const res = await fetch(
    `${BASE}/api/auth/profile/check-username?q=${encodeURIComponent(username)}`
  );
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message ?? 'Check fehlgeschlagen');
  }
  return json.data as UsernameCheckResult;
}

/**
 * Öffentliches Profil laden (per ID oder Username)
 * GET /api/users/:idOrUsername
 */
export async function getPublicProfile(idOrUsername: string): Promise<PublicProfile> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/users/${encodeURIComponent(idOrUsername)}`, { headers });
  const json = await res.json();

  if (res.status === 404) throw new Error('USER_NOT_FOUND');
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message ?? 'Profil konnte nicht geladen werden');
  }
  return json.data as PublicProfile;
}

/**
 * User suchen
 * GET /api/users/search?q=...
 */
export async function searchUsers(query: string): Promise<PublicProfile[]> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/users/search?q=${encodeURIComponent(query)}`, { headers });
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error?.message ?? 'Suche fehlgeschlagen');
  }
  return json.data as PublicProfile[];
}
