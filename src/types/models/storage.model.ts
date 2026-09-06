export const PRODUCT_IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export type ProductImageContentType =
  (typeof PRODUCT_IMAGE_CONTENT_TYPES)[number];

export interface CreateProductUploadDto {
  contentType: ProductImageContentType;
  fileSizeBytes: number;
}

export interface PresignedProductUpload {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
  uploadHeaders: Record<string, string>;
}

export interface DeleteProductUploadsDto {
  objectKeys: string[];
}
