import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/shared/constants';
import type {
  GroupSummary,
  GroupMember,
  GroupInvitation,
  CreateGroupPayload,
} from '../types/group.types';

const BASE = API_CONFIG.BASE_URL;
const TOKEN_KEY = 'auth_token';

async function authHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...headers, ...(init?.headers as Record<string,string> ?? {}) } });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error?.message ?? 'Request failed');
  return json.data as T;
}

export const groupService = {
  create: (payload: CreateGroupPayload) =>
    apiFetch<GroupSummary>('/api/groups', { method: 'POST', body: JSON.stringify(payload) }),

  getById: (id: string) =>
    apiFetch<GroupSummary>(`/api/groups/${id}`),

  getByInviteCode: (code: string) =>
    apiFetch<GroupSummary>(`/api/groups/resolve/${code}`),

  getMine: () =>
    apiFetch<GroupSummary[]>('/api/groups/mine'),

  getMembers: (id: string) =>
    apiFetch<GroupMember[]>(`/api/groups/${id}/members`),

  joinByCode: (code: string) =>
    apiFetch<GroupSummary>(`/api/groups/join/${code}`, { method: 'POST' }),

  invite: (groupId: string, userId: string) =>
    apiFetch<{ invited: boolean }>(`/api/groups/${groupId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  leave: (groupId: string) =>
    apiFetch<{ left: boolean }>(`/api/groups/${groupId}/members/me`, { method: 'DELETE' }),

  removeMember: (groupId: string, userId: string) =>
    apiFetch<{ removed: boolean }>(`/api/groups/${groupId}/members/${userId}`, { method: 'DELETE' }),

  getInvitations: () =>
    apiFetch<GroupInvitation[]>('/api/groups/invitations'),

  acceptInvitation: (id: string) =>
    apiFetch<{ accepted: boolean }>(`/api/groups/invitations/${id}/accept`, { method: 'POST' }),

  declineInvitation: (id: string) =>
    apiFetch<{ declined: boolean }>(`/api/groups/invitations/${id}/decline`, { method: 'POST' }),

  search: (q: string) =>
    apiFetch<GroupSummary[]>(`/api/groups/search?q=${encodeURIComponent(q)}`),
};
