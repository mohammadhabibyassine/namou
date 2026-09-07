import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import {
  CategoryRecord,
  CategoryTreeNode,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/types/models/category.model";

export const getCategoryTree = async (): Promise<CategoryTreeNode[]> => {
  const response = await apiClient.get<CategoryTreeNode[]>(
    API_ENDPOINTS.CATEGORIES.TREE,
  );
  return response.data;
};

export const getCategorySubtree = async (
  categoryId: string,
): Promise<CategoryTreeNode> => {
  const response = await apiClient.get<CategoryTreeNode>(
    API_ENDPOINTS.CATEGORIES.SUBTREE(categoryId),
  );
  return response.data;
};

export const getCategoryById = async (
  categoryId: string,
): Promise<CategoryRecord> => {
  const response = await apiClient.get<CategoryRecord>(
    API_ENDPOINTS.CATEGORIES.BY_ID(categoryId),
  );
  return response.data;
};

// Admin Operations
export const createCategory = async (
  input: CreateCategoryDto,
): Promise<CategoryRecord> => {
  const response = await apiClient.post<CategoryRecord>(
    API_ENDPOINTS.CATEGORIES.ROOT,
    input,
  );
  return response.data;
};

export const updateCategory = async (
  categoryId: string,
  input: UpdateCategoryDto,
): Promise<CategoryRecord> => {
  const response = await apiClient.patch<CategoryRecord>(
    API_ENDPOINTS.CATEGORIES.BY_ID(categoryId),
    input,
  );
  return response.data;
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.CATEGORIES.BY_ID(categoryId));
};
