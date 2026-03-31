/**
 * Category Store — Offline-first Cache für den Kategorie-Baum.
 * Sync erfolgt beim App-Start oder nach 24h Cache-Ablauf.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { categoryService } from '../services/categoryService';
import type { CategoryNode, CategoryState, CreateCategoryPayload, UpdateCategoryPayload } from '../types';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 Stunden

/** Ersetzt einen Node im Baum (immutable) */
function replaceNode(tree: CategoryNode[], updated: CategoryNode): CategoryNode[] {
  return tree.map((node) => {
    if (node.id === updated.id) return { ...updated, children: node.children };
    return { ...node, children: replaceNode(node.children, updated) };
  });
}

/** Hängt einen neuen Node an die richtige Stelle im Baum */
function insertNode(tree: CategoryNode[], newNode: CategoryNode): CategoryNode[] {
  if (!newNode.parentId) return [...tree, newNode];
  return tree.map((node) => {
    if (node.id === newNode.parentId) {
      return { ...node, children: [...node.children, newNode] };
    }
    return { ...node, children: insertNode(node.children, newNode) };
  });
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      tree: [],
      lastSyncedAt: null,

      syncCategories: async () => {
        const { lastSyncedAt } = get();
        const isStale = !lastSyncedAt || Date.now() - lastSyncedAt > CACHE_TTL_MS;
        if (!isStale) return;

        try {
          const tree = await categoryService.getTree();
          set({ tree, lastSyncedAt: Date.now() });
        } catch (err) {
          console.warn('[categoryStore] Sync fehlgeschlagen:', err);
        }
      },

      createCategory: async (payload: CreateCategoryPayload) => {
        try {
          const created = await categoryService.create(payload);
          set((state) => ({
            tree: insertNode(state.tree, { ...created, children: [] }),
          }));
          return created;
        } catch (err) {
          console.warn('[categoryStore] Erstellen fehlgeschlagen:', err);
          return null;
        }
      },

      updateCategory: async (id: string, payload: UpdateCategoryPayload) => {
        try {
          const updated = await categoryService.update(id, payload);
          set((state) => ({ tree: replaceNode(state.tree, updated) }));
        } catch (err) {
          console.warn('[categoryStore] Update fehlgeschlagen:', err);
        }
      },
    }),
    {
      name: 'category-tree',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
