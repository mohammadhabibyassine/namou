import { withSearchParams } from "@/lib/api/search-params";
import type { ProductFacetFilters, ProductFilters } from "./types";

export function productListPath(filters: ProductFilters): string {
  return withSearchParams("/products", { ...filters });
}

export function productFacetsPath(filters: ProductFacetFilters): string {
  return withSearchParams("/products/facets", { ...filters });
}
