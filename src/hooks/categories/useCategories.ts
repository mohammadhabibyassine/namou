import { useQuery } from "@tanstack/react-query";
import {
  getCategoryById,
  getCategorySubtree,
  getCategoryTree,
} from "@/services/api/v1/categories.api";
import { queryKeys } from "@/lib/query/keys";

export const CATEGORY_KEYS = {
  tree: queryKeys.categories.tree,
  subtree: queryKeys.categories.subtree,
  byId: queryKeys.categories.detail,
};

export const useCategoryTree = () => {
  return useQuery({
    queryKey: CATEGORY_KEYS.tree,
    queryFn: () => getCategoryTree(),
  });
};

export const useCategorySubtree = (categoryId: string) => {
  return useQuery({
    queryKey: CATEGORY_KEYS.subtree(categoryId),
    queryFn: () => getCategorySubtree(categoryId),
    enabled: Boolean(categoryId),
  });
};

export const useCategory = (categoryId: string) => {
  return useQuery({
    queryKey: CATEGORY_KEYS.byId(categoryId),
    queryFn: () => getCategoryById(categoryId),
    enabled: Boolean(categoryId),
  });
};
