export interface CategoryRecord {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTreeRow {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  depth: number;
}

export interface CategoryTreeNode extends CategoryTreeRow {
  children: CategoryTreeNode[];
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  sortOrder?: number;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

// Alias for generic usage
export type Category = CategoryRecord;
