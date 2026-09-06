import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import {
  AdminVariantView,
  AttributeTypeRecord,
  AttributeValueRecord,
  CreateAttributeTypeDto,
  CreateAttributeValueDto,
  ProductImageAdminView,
  ReplaceProductImagesDto,
  ReplaceVariantConfigurationDto,
  UpdateAttributeTypeDto,
  UpdateAttributeValueDto,
  UpdateVariantDto,
  VariantConfigurationView,
} from "@/types/models/variant.model";

// Product Variants & Configuration
export const getVariantConfiguration = async (
  productId: string,
): Promise<VariantConfigurationView> => {
  const response = await apiClient.get<VariantConfigurationView>(
    API_ENDPOINTS.VARIANTS.CONFIGURATION(productId),
  );
  return response.data;
};

export const replaceVariantConfiguration = async (
  productId: string,
  input: ReplaceVariantConfigurationDto,
): Promise<VariantConfigurationView> => {
  const response = await apiClient.put<VariantConfigurationView>(
    API_ENDPOINTS.VARIANTS.CONFIGURATION(productId),
    input,
  );
  return response.data;
};

export const updateVariant = async (
  productId: string,
  variantId: string,
  input: UpdateVariantDto,
): Promise<AdminVariantView> => {
  const response = await apiClient.patch<AdminVariantView>(
    API_ENDPOINTS.VARIANTS.VARIANT_BY_ID(productId, variantId),
    input,
  );
  return response.data;
};

export const deleteVariant = async (
  productId: string,
  variantId: string,
): Promise<void> => {
  await apiClient.delete(
    API_ENDPOINTS.VARIANTS.VARIANT_BY_ID(productId, variantId),
  );
};

export const replaceProductImages = async (
  productId: string,
  input: ReplaceProductImagesDto,
): Promise<ProductImageAdminView[]> => {
  const response = await apiClient.put<ProductImageAdminView[]>(
    API_ENDPOINTS.VARIANTS.IMAGES(productId),
    input,
  );
  return response.data;
};

// Global Attribute Types & Values
export const getAttributeTypes = async (): Promise<AttributeTypeRecord[]> => {
  const response = await apiClient.get<AttributeTypeRecord[]>(
    API_ENDPOINTS.ATTRIBUTES.ROOT,
  );
  return response.data;
};

export const createAttributeType = async (
  input: CreateAttributeTypeDto,
): Promise<AttributeTypeRecord> => {
  const response = await apiClient.post<AttributeTypeRecord>(
    API_ENDPOINTS.ATTRIBUTES.ROOT,
    input,
  );
  return response.data;
};

export const updateAttributeType = async (
  attributeTypeId: string,
  input: UpdateAttributeTypeDto,
): Promise<AttributeTypeRecord> => {
  const response = await apiClient.patch<AttributeTypeRecord>(
    API_ENDPOINTS.ATTRIBUTES.BY_ID(attributeTypeId),
    input,
  );
  return response.data;
};

export const deleteAttributeType = async (
  attributeTypeId: string,
): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.ATTRIBUTES.BY_ID(attributeTypeId));
};

export const createAttributeValue = async (
  attributeTypeId: string,
  input: CreateAttributeValueDto,
): Promise<AttributeValueRecord> => {
  const response = await apiClient.post<AttributeValueRecord>(
    API_ENDPOINTS.ATTRIBUTES.VALUES(attributeTypeId),
    input,
  );
  return response.data;
};

export const updateAttributeValue = async (
  attributeTypeId: string,
  attributeValueId: string,
  input: UpdateAttributeValueDto,
): Promise<AttributeValueRecord> => {
  const response = await apiClient.patch<AttributeValueRecord>(
    API_ENDPOINTS.ATTRIBUTES.VALUE_BY_ID(attributeTypeId, attributeValueId),
    input,
  );
  return response.data;
};

export const deleteAttributeValue = async (
  attributeTypeId: string,
  attributeValueId: string,
): Promise<void> => {
  await apiClient.delete(
    API_ENDPOINTS.ATTRIBUTES.VALUE_BY_ID(attributeTypeId, attributeValueId),
  );
};
