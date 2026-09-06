import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { CursorPage } from "@/types/api/common.types";
import {
  CreateProductDto,
  ListProductsQueryDto,
  ProductAdminView,
  ProductCatalogFacets,
  ProductCreatedResult,
  ProductDetail,
  ProductFacetsQueryDto,
  ProductListItem,
  UpdateProductDto,
} from "@/types/models/product.model";

export const getProductsCatalog = async (
  query?: ListProductsQueryDto,
): Promise<CursorPage<ProductListItem>> => {
  const response = await apiClient.get<CursorPage<ProductListItem>>(
    API_ENDPOINTS.PRODUCTS.ROOT,
    { params: query },
  );
  return response.data;
};

export const getProductCatalogFacets = async (
  query?: ProductFacetsQueryDto,
): Promise<ProductCatalogFacets> => {
  const response = await apiClient.get<ProductCatalogFacets>(
    API_ENDPOINTS.PRODUCTS.FACETS,
    { params: query },
  );
  return response.data;
};

export const getProductBySlug = async (
  slug: string,
): Promise<ProductDetail> => {
  const response = await apiClient.get<ProductDetail>(
    API_ENDPOINTS.PRODUCTS.BY_SLUG(slug),
  );
  return response.data;
};

// Admin Operations
export const createProduct = async (
  input: CreateProductDto,
): Promise<ProductCreatedResult> => {
  const response = await apiClient.post<ProductCreatedResult>(
    API_ENDPOINTS.PRODUCTS.ROOT,
    input,
  );
  return response.data;
};

export const updateProduct = async (
  productId: string,
  input: UpdateProductDto,
): Promise<ProductAdminView> => {
  const response = await apiClient.patch<ProductAdminView>(
    API_ENDPOINTS.PRODUCTS.BY_ID(productId),
    input,
  );
  return response.data;
};

export const deleteProduct = async (productId: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.PRODUCTS.BY_ID(productId));
};

// Backward-compatibility aliases
export const getProducts = getProductsCatalog;
export const getProductById = async (id: string): Promise<ProductDetail> => {
  // In backend, catalog detail is fetched by slug; if given id/slug, use endpoint
  const response = await apiClient.get<ProductDetail>(
    API_ENDPOINTS.PRODUCTS.BY_SLUG(id),
  );
  return response.data;
};
