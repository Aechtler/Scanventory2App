export interface CategoryNode {
  id: string;
  name: string;
  parentId: string | null;
  iconName: string | null;
  sortOrder: number;
  children: CategoryNode[];
}

export interface CreateCategoryPayload {
  name: string;
  parentId?: string | null;
  iconName?: string | null;
  sortOrder?: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  iconName?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CategoryState {
  tree: CategoryNode[];
  lastSyncedAt: number | null;
  syncCategories: () => Promise<void>;
  createCategory: (payload: CreateCategoryPayload) => Promise<CategoryNode | null>;
  updateCategory: (id: string, payload: UpdateCategoryPayload) => Promise<void>;
}
