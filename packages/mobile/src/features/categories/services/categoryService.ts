import { API_CONFIG } from '@/shared/constants';
import type { CategoryNode, CreateCategoryPayload, UpdateCategoryPayload } from '../types';

const BASE = API_CONFIG.BASE_URL;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error?.message ?? 'Request failed');
  return json.data as T;
}

export const categoryService = {
  /** Vollständiger Baum – wird auf Mobile gecacht */
  getTree: () =>
    apiFetch<CategoryNode[]>('/api/categories'),

  /** Direkte Kinder einer Kategorie */
  getChildren: (parentId: string) =>
    apiFetch<CategoryNode[]>(`/api/categories/${parentId}/children`),

  /** Neue Kategorie anlegen */
  create: (payload: CreateCategoryPayload) =>
    apiFetch<CategoryNode>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** Kategorie umbenennen / deaktivieren */
  update: (id: string, payload: UpdateCategoryPayload) =>
    apiFetch<CategoryNode>(`/api/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};
