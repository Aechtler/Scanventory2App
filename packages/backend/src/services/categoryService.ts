/**
 * Category Service — CRUD-Operationen für das Kategorie-System
 */

import { CategoryNode, CreateCategoryBody, UpdateCategoryBody } from '../types';
import { prisma } from './prismaClient';

type FlatCategory = {
  id: string;
  name: string;
  parentId: string | null;
  iconName: string | null;
  sortOrder: number;
};

/** Baut aus einer flachen Liste einen verschachtelten Baum */
function buildTree(flat: FlatCategory[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  for (const cat of flat) {
    map.set(cat.id, { ...cat, children: [] });
  }

  for (const node of map.values()) {
    if (node.parentId) {
      map.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/** Sortiert alle Ebenen nach sortOrder */
function sortTree(nodes: CategoryNode[]): CategoryNode[] {
  return nodes
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((node) => ({ ...node, children: sortTree(node.children) }));
}

/** Gibt den vollständigen Kategorie-Baum zurück (nur aktive) */
export async function getCategoryTree(): Promise<CategoryNode[]> {
  const flat = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true, parentId: true, iconName: true, sortOrder: true },
    orderBy: { sortOrder: 'asc' },
  });

  return sortTree(buildTree(flat));
}

/** Gibt die direkten Kinder einer Kategorie zurück */
export async function getChildren(parentId: string): Promise<FlatCategory[]> {
  return prisma.category.findMany({
    where: { parentId, isActive: true },
    select: { id: true, name: true, parentId: true, iconName: true, sortOrder: true },
    orderBy: { sortOrder: 'asc' },
  });
}

/** Erstellt eine neue Kategorie */
export async function createCategory(body: CreateCategoryBody): Promise<FlatCategory> {
  if (body.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: body.parentId } });
    if (!parent) throw new Error('PARENT_NOT_FOUND');
  }

  return prisma.category.create({
    data: {
      name: body.name.trim(),
      parentId: body.parentId ?? null,
      iconName: body.iconName ?? null,
      sortOrder: body.sortOrder ?? 0,
    },
    select: { id: true, name: true, parentId: true, iconName: true, sortOrder: true },
  });
}

/** Aktualisiert Name, Icon oder sortOrder einer Kategorie */
export async function updateCategory(
  id: string,
  body: UpdateCategoryBody
): Promise<FlatCategory | null> {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return null;

  return prisma.category.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.iconName !== undefined && { iconName: body.iconName }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
    select: { id: true, name: true, parentId: true, iconName: true, sortOrder: true },
  });
}

/** Baut den Pfad-String für ein Item: "Videospiele > Sony > PlayStation 5 > Games" */
export async function buildCategoryPath(categoryId: string): Promise<string> {
  const segments: string[] = [];
  let currentId: string | null = categoryId;

  while (currentId) {
    const cat: { id: string; name: string; parentId: string | null } | null =
      await prisma.category.findUnique({
        where: { id: currentId },
        select: { id: true, name: true, parentId: true },
      });
    if (!cat) break;
    segments.unshift(cat.name);
    currentId = cat.parentId;
  }

  return segments.join(' > ');
}
