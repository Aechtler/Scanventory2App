import { useEffect } from 'react';
import { useCategoryStore } from '../store/categoryStore';
import type { CategoryNode, CreateCategoryPayload } from '../types';

interface UseCategoriesReturn {
  tree: CategoryNode[];
  syncCategories: () => Promise<void>;
  createCategory: (payload: CreateCategoryPayload) => Promise<CategoryNode | null>;
}

/**
 * Haupthook für Kategorien.
 * Triggert automatisch einen Sync wenn der Cache abgelaufen ist.
 */
export function useCategories(): UseCategoriesReturn {
  const { tree, syncCategories, createCategory } = useCategoryStore();

  useEffect(() => {
    syncCategories();
  }, [syncCategories]);

  return { tree, syncCategories, createCategory };
}
