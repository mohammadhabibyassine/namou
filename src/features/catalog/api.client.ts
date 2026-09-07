"use client";

import { getCategoryTree } from "@/services/api/v1/categories.api";
import {
  getProductBySlug,
  getProductCatalogFacets,
  getProductsCatalog,
} from "@/services/api/v1/products.api";
import type { ProductFacetFilters, ProductFilters } from "./types";

export const catalogClientApi = {
  categories: getCategoryTree,
  products: (filters: ProductFilters = {}) =>
    getProductsCatalog({
      ...filters,
      attributeValueIds: filters.attributeValueIds
        ? [...filters.attributeValueIds]
        : undefined,
    }),
  product: getProductBySlug,
  facets: (filters: ProductFacetFilters = {}) =>
    getProductCatalogFacets(filters),
};
