import { useCategoryStore } from '../store/categoryStore';
import type { CategoryNode } from '../types/category.types';

/** Findet einen Node anhand seiner ID (rekursiv) */
function findNode(tree: CategoryNode[], id: string): CategoryNode | null {
  for (const node of tree) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
}

/** Baut den Pfad von der Wurzel zum gesuchten Node */
function buildPath(tree: CategoryNode[], id: string, path: CategoryNode[] = []): CategoryNode[] {
  for (const node of tree) {
    const current = [...path, node];
    if (node.id === id) return current;
    const found = buildPath(node.children, id, current);
    if (found.length > 0) return found;
  }
  return [];
}

interface UseCategoryTreeReturn {
  /** Direktkinder einer Kategorie (oder Wurzel-Ebene wenn null) */
  getChildren: (parentId: string | null) => CategoryNode[];
  /** Node anhand ID finden */
  findById: (id: string) => CategoryNode | null;
  /** Pfad von Wurzel bis Node: [{Videospiele}, {Sony}, {PS5}] */
  getPath: (id: string) => CategoryNode[];
  /** Pfad als lesbarer String: "Videospiele > Sony > PlayStation 5" */
  getPathString: (id: string) => string;
}

export function useCategoryTree(): UseCategoryTreeReturn {
  const tree = useCategoryStore((state) => state.tree);

  return {
    getChildren: (parentId) => {
      if (!parentId) return tree;
      const parent = findNode(tree, parentId);
      return parent?.children ?? [];
    },

    findById: (id) => findNode(tree, id),

    getPath: (id) => buildPath(tree, id),

    getPathString: (id) =>
      buildPath(tree, id)
        .map((n) => n.name)
        .join(' > '),
  };
}
