import { createProductUpload } from "@/services/api/v1/storage.api";
import {
  PRODUCT_IMAGE_CONTENT_TYPES,
  type PresignedProductUpload,
  type ProductImageContentType,
} from "@/types/models/storage.model";

export const MAX_PRODUCT_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

function resolveImageContentType(file: File): ProductImageContentType {
  const type = file.type.toLowerCase();
  if (PRODUCT_IMAGE_CONTENT_TYPES.includes(type as ProductImageContentType)) {
    return type as ProductImageContentType;
  }
  const name = file.name.toLowerCase();
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".avif")) return "image/avif";
  throw new Error(
    `${file.name} is not a supported format. Please upload JPEG, PNG, WebP, or AVIF.`,
  );
}

function validateProductImage(file: File): ProductImageContentType {
  if (!file.size) throw new Error(`${file.name} is empty.`);
  if (file.size > MAX_PRODUCT_IMAGE_SIZE_BYTES) {
    throw new Error(`${file.name} exceeds the 10 MB image limit.`);
  }
  return resolveImageContentType(file);
}

function putImage(
  uploadUrl: string,
  uploadHeaders: Readonly<Record<string, string>>,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", uploadUrl);
    for (const [name, value] of Object.entries(uploadHeaders)) {
      request.setRequestHeader(name, value);
    }
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    });
    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        reject(
          new Error(`Cloudflare upload failed with status ${request.status}.`),
        );
      }
    });
    request.addEventListener("error", () => {
      reject(new Error("Cloudflare upload could not be reached."));
    });
    request.addEventListener("abort", () => {
      reject(new Error("Image upload was cancelled."));
    });
    request.send(file);
  });
}

export async function uploadProductImage(
  productId: string,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<PresignedProductUpload> {
  const contentType = validateProductImage(file);
  const upload = await createProductUpload(productId, {
    contentType,
    fileSizeBytes: file.size,
  });
  await putImage(upload.uploadUrl, upload.uploadHeaders, file, onProgress);
  return upload;
}
