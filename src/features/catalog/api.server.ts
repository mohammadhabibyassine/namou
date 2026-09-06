import "server-only";

import { fetchPublicApi } from "@/lib/api/backend";
import type {
  CategoryTreeNode,
  CursorPage,
  ProductCatalogFacets,
  ProductDetail,
  ProductListItem,
} from "@/types/api";
import { productFacetsPath, productListPath } from "./paths";
import type { ProductFacetFilters, ProductFilters } from "./types";

export const catalogServerApi = {
  categories: () => fetchPublicApi<CategoryTreeNode[]>("/categories/tree"),
  products: (filters: ProductFilters = {}) =>
    fetchPublicApi<CursorPage<ProductListItem>>(productListPath(filters)),
  product: (slug: string) =>
    fetchPublicApi<ProductDetail>(`/products/${encodeURIComponent(slug)}`),
  facets: (filters: ProductFacetFilters = {}) =>
    fetchPublicApi<ProductCatalogFacets>(productFacetsPath(filters)),
};
