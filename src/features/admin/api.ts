import {
  createCategory,
  deleteCategory,
  getCategoryTree,
  updateCategory,
} from "@/services/api/v1/categories.api";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/services/api/v1/products.api";
import {
  createAttributeType,
  createAttributeValue,
  deleteAttributeType,
  deleteAttributeValue,
  getAttributeTypes,
  getVariantConfiguration,
  replaceProductImages,
  replaceVariantConfiguration,
  updateAttributeType,
  updateAttributeValue,
} from "@/services/api/v1/variants.api";
import type { ProductCreateInput, ProductMetadataInput } from "@/types/api";

/** View-friendly facade over the existing v1 service modules. */
export const adminApi = {
  categories: getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,

  attributes: getAttributeTypes,
  createAttribute: createAttributeType,
  updateAttribute: updateAttributeType,
  deleteAttribute: deleteAttributeType,
  createAttributeValue,
  updateAttributeValue,
  deleteAttributeValue,

  createProduct: (input: ProductCreateInput) => createProduct(input),
  updateProduct: (id: string, input: Partial<ProductMetadataInput>) =>
    updateProduct(id, input),
  deleteProduct,
  variantConfiguration: getVariantConfiguration,
  replaceVariantConfiguration,
  replaceImages: (
    productId: string,
    images: NonNullable<ProductCreateInput["images"]>,
  ) => replaceProductImages(productId, { images }),
};
