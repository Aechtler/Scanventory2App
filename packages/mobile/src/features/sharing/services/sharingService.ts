import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '@/shared/constants';
import type { SharedItemResult, ReceivedItem, ShareTargetType, SharePermission } from '../types/sharing.types';

const BASE = API_CONFIG.BASE_URL;
const TOKEN_KEY = 'auth_token';

async function authHeaders(): Promise<Record<string, string>> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers as Record<string, string> ?? {}) },
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error?.message ?? 'Request failed');
  return json.data as T;
}

export const sharingService = {
  /** Item mit User oder Gruppe teilen */
  share: (itemId: string, targetType: ShareTargetType, targetId: string, permission: SharePermission = 'VIEW') =>
    apiFetch<SharedItemResult>(`/api/items/${itemId}/share`, {
      method: 'POST',
      body: JSON.stringify({ targetType, targetId, permission }),
    }),

  /** Sharing aufheben */
  unshare: (itemId: string, shareId: string) =>
    apiFetch<{ unshared: boolean }>(`/api/items/${itemId}/share/${shareId}`, { method: 'DELETE' }),

  /** Items die mit mir geteilt wurden */
  getSharedWithMe: () =>
    apiFetch<ReceivedItem[]>('/api/shared/with-me'),

  /** Geteilte Items einer Gruppe */
  getGroupLibrary: (groupId: string) =>
    apiFetch<ReceivedItem[]>(`/api/groups/${groupId}/library`),
};
