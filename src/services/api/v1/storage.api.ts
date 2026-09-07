import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import type {
  CreateProductUploadDto,
  DeleteProductUploadsDto,
  PresignedProductUpload,
} from "@/types/models/storage.model";

export async function createProductUpload(
  productId: string,
  input: CreateProductUploadDto,
): Promise<PresignedProductUpload> {
  const response = await apiClient.post<PresignedProductUpload>(
    API_ENDPOINTS.UPLOADS.PRODUCT_PRESIGN(productId),
    input,
  );
  return response.data;
}

export async function deleteProductUploads(
  productId: string,
  input: DeleteProductUploadsDto,
): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.UPLOADS.PRODUCT(productId), {
    data: input,
  });
}
