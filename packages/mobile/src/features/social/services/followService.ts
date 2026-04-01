import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/shared/constants';
import type { PublicProfile } from '../types/profile.types';

const BASE = API_CONFIG.BASE_URL;
const TOKEN_KEY = 'auth_token';

async function authHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Einem User folgen — POST /api/users/:id/follow */
export async function followUser(userId: string): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/users/${userId}/follow`, {
    method: 'POST',
    headers,
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message ?? 'Follow fehlgeschlagen');
  }
}

/** User entfolgen — DELETE /api/users/:id/follow */
export async function unfollowUser(userId: string): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/users/${userId}/follow`, {
    method: 'DELETE',
    headers,
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message ?? 'Unfollow fehlgeschlagen');
  }
}

/** Follower-Liste laden — GET /api/users/:id/followers */
export async function getFollowers(userId: string, limit = 30, offset = 0): Promise<PublicProfile[]> {
  const headers = await authHeaders();
  const res = await fetch(
    `${BASE}/api/users/${userId}/followers?limit=${limit}&offset=${offset}`,
    { headers }
  );
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message ?? 'Follower konnten nicht geladen werden');
  }
  return json.data as PublicProfile[];
}

/** Following-Liste laden — GET /api/users/:id/following */
export async function getFollowing(userId: string, limit = 30, offset = 0): Promise<PublicProfile[]> {
  const headers = await authHeaders();
  const res = await fetch(
    `${BASE}/api/users/${userId}/following?limit=${limit}&offset=${offset}`,
    { headers }
  );
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message ?? 'Following konnten nicht geladen werden');
  }
  return json.data as PublicProfile[];
}
