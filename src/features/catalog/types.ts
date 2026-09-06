export interface ProductFilters {
  categoryId?: string;
  search?: string;
  attributeValueIds?: readonly string[];
  minPrice?: string;
  maxPrice?: string;
  currencyCode?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "relevance";
  pageSize?: number;
  cursor?: string;
}

export type ProductFacetFilters = Pick<
  ProductFilters,
  "categoryId" | "currencyCode"
>;
