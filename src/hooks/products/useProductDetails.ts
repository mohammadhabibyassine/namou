import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { getProductBySlug } from "@/services/api/v1/products.api";

export const PRODUCT_DETAILS_QUERY_KEY = (slug: string) =>
  queryKeys.products.detail(slug);

export const useProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: PRODUCT_DETAILS_QUERY_KEY(slug),
    queryFn: () => getProductBySlug(slug),
    enabled: Boolean(slug),
  });
};

export const useProductDetails = (slugOrId: string) => {
  return useProductBySlug(slugOrId);
};
