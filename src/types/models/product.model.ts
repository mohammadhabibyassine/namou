import { CursorPaginationQuery } from "../api/common.types";

export const ProductSort = {
  Newest: "newest",
  PriceAscending: "price_asc",
  PriceDescending: "price_desc",
  Relevance: "relevance",
} as const;

export type ProductSortValue = (typeof ProductSort)[keyof typeof ProductSort];

export interface ProductCategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface ProductImageView {
  id: string;
  variantId: string | null;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
}

export interface ProductAttributeValueView {
  id: string;
  value: string;
  sortOrder: number;
}

export interface ProductAttributeView {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  values: ProductAttributeValueView[];
}

export interface ProductVariantOptionView {
  attributeTypeId: string;
  attributeTypeName: string;
  attributeTypeSlug: string;
  attributeValueId: string;
  value: string;
}

export interface ProductVariantView {
  id: string;
  sku: string;
  priceOverride: string | null;
  effectivePrice: string;
  stockQuantity: number;
  isDefault: boolean;
  options: ProductVariantOptionView[];
}

export interface ProductDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  basePrice: string;
  currencyCode: string;
  category: ProductCategorySummary;
  images: ProductImageView[];
  attributes: ProductAttributeView[];
  variants: ProductVariantView[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductListItem {
  id: string;
  title: string;
  slug: string;
  currencyCode: string;
  minimumPrice: string;
  maximumPrice: string;
  inStock: boolean;
  primaryImageUrl: string | null;
  category: ProductCategorySummary;
  createdAt: string;
}

export interface ProductCatalogFacets {
  attributes: Array<{
    id: string;
    name: string;
    slug: string;
    sortOrder: number;
    values: Array<{
      id: string;
      value: string;
      sortOrder: number;
    }>;
  }>;
  priceRanges: Array<{
    currencyCode: string;
    minimumPrice: string;
    maximumPrice: string;
  }>;
}

export interface ListProductsQueryDto extends CursorPaginationQuery {
  categoryId?: string;
  search?: string;
  attributeValueIds?: string[] | string;
  minPrice?: string;
  maxPrice?: string;
  currencyCode?: string;
  sort?: ProductSortValue;
}

export interface ProductFacetsQueryDto {
  categoryId?: string;
  currencyCode?: string;
}

export interface ConfiguredProductAttributeDto {
  attributeTypeId: string;
  sortOrder?: number;
}

export interface ProductVariantOptionDto {
  attributeTypeId: string;
  attributeValueId: string;
}

export interface CreateProductVariantDto {
  sku: string;
  priceOverride?: string | null;
  stockQuantity?: number;
  isDefault?: boolean;
  options?: ProductVariantOptionDto[];
}

export interface CreateProductDto {
  categoryId: string;
  title: string;
  slug: string;
  description?: string | null;
  basePrice: string;
  currencyCode?: string;
  isActive?: boolean;
  attributes?: ConfiguredProductAttributeDto[];
  variants: CreateProductVariantDto[];
}

export interface UpdateProductDto {
  categoryId?: string;
  title?: string;
  slug?: string;
  description?: string | null;
  basePrice?: string;
  currencyCode?: string;
  isActive?: boolean;
}

export interface ProductCreatedResult {
  id: string;
  slug: string;
}

export interface ProductAdminView {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string | null;
  basePrice: string;
  currencyCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Aliases for compatibility
export type Product = ProductDetail;
export type ProductSummary = ProductListItem;
export type ProductVariant = ProductVariantView;
