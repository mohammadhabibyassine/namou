import {
  ConfiguredProductAttributeDto,
  CreateProductVariantDto,
} from "./product.model";

export interface AttributeValueRecord {
  id: string;
  attributeTypeId?: string;
  value: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttributeTypeRecord {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  values: AttributeValueRecord[];
}

export interface AdminVariantView {
  id: string;
  productId: string;
  sku: string;
  priceOverride: string | null;
  effectivePrice: string;
  stockQuantity: number;
  isDefault: boolean;
  options: Array<{
    attributeTypeId: string;
    attributeValueId: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImageAdminView {
  id: string;
  productId: string;
  variantId: string | null;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface VariantConfigurationView {
  attributes: Array<{ attributeTypeId: string; sortOrder: number }>;
  variants: AdminVariantView[];
}

export interface CreateAttributeTypeDto {
  name: string;
  slug: string;
  sortOrder?: number;
}

export type UpdateAttributeTypeDto = Partial<CreateAttributeTypeDto>;

export interface CreateAttributeValueDto {
  value: string;
  sortOrder?: number;
}

export type UpdateAttributeValueDto = Partial<CreateAttributeValueDto>;

export interface UpdateVariantDto {
  sku?: string;
  priceOverride?: string | null;
  stockQuantity?: number;
}

export interface ReplacementProductImageDto {
  id?: string;
  imageUrl: string;
  altText?: string | null;
  sortOrder: number;
  variantId?: string | null;
}

export interface ReplaceProductImagesDto {
  images: ReplacementProductImageDto[];
}

export interface ReplacementProductVariantDto extends CreateProductVariantDto {
  id?: string;
}

export interface ReplaceVariantConfigurationDto {
  attributes?: ConfiguredProductAttributeDto[];
  variants: ReplacementProductVariantDto[];
}
