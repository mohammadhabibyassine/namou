import { useQuery } from "@tanstack/react-query";
import {
  getProductCatalogFacets,
  getProductsCatalog,
} from "@/services/api/v1/products.api";
import { queryKeys } from "@/lib/query/keys";
import {
  ListProductsQueryDto,
  ProductFacetsQueryDto,
} from "@/types/models/product.model";

export const PRODUCT_KEYS = {
  catalog: (query?: ListProductsQueryDto) => queryKeys.products.page(query),
  facets: (query?: ProductFacetsQueryDto) => queryKeys.products.facets(query),
};

export const useProducts = (query?: ListProductsQueryDto) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.catalog(query),
    queryFn: () => getProductsCatalog(query),
  });
};

export const useProductFacets = (query?: ProductFacetsQueryDto) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.facets(query),
    queryFn: () => getProductCatalogFacets(query),
  });
};
