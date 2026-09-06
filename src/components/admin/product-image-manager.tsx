"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProductMedia } from "@/components/commerce/product-media";
import { adminApi } from "@/features/admin/api";
import { queryKeys } from "@/lib/query/keys";
import { deleteProductUploads } from "@/services/api/v1/storage.api";
import { uploadProductImage } from "@/services/uploads/product-image-upload";
import type { ProductImageAdminView } from "@/types/models/variant.model";

const MAX_PRODUCT_IMAGES = 50;

interface ImageDraft {
  id: string;
  imageUrl: string;
  altText: string;
  variantId: string;
}

interface UploadProgress {
  file: number;
  total: number;
  percent: number;
}

const toDraft = (image: ProductImageAdminView): ImageDraft => ({
  id: image.id,
  imageUrl: image.imageUrl,
  altText: image.altText ?? "",
  variantId: image.variantId ?? "",
});

const existingImagePayload = (rows: ImageDraft[]) =>
  rows.map((row, sortOrder) => ({
    id: row.id,
    ...(row.altText.trim() ? { altText: row.altText.trim() } : {}),
    sortOrder,
    ...(row.variantId ? { variantId: row.variantId } : {}),
  }));

const altTextFromFilename = (filename: string) =>
  filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();

export function ProductImageManager({ productId }: { productId: string }) {
  const queryClient = useQueryClient();
  const images = useQuery({
    queryKey: queryKeys.admin.productImages(productId),
    queryFn: () => adminApi.images(productId),
  });
  const configuration = useQuery({
    queryKey: queryKeys.admin.variantConfiguration(productId),
    queryFn: () => adminApi.variantConfiguration(productId),
  });
  const [drafts, setDrafts] = useState<ImageDraft[] | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const currentRows = drafts ?? images.data?.map(toDraft) ?? [];

  const synchronize = (data: ProductImageAdminView[]) => {
    queryClient.setQueryData(queryKeys.admin.productImages(productId), data);
    void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.products });
    setDrafts(data.map(toDraft));
    setIsDirty(false);
  };

  const save = useMutation({
    mutationFn: () =>
      adminApi.replaceImages(productId, {
        images: existingImagePayload(currentRows),
      }),
    onSuccess: synchronize,
  });

  const remove = useMutation({
    mutationFn: (imageId: string) =>
      adminApi.replaceImages(productId, {
        images: existingImagePayload(
          currentRows.filter((row) => row.id !== imageId),
        ),
      }),
    onSuccess: synchronize,
  });

  const upload = useMutation({
    mutationFn: async (files: File[]) => {
      if (currentRows.length + files.length > MAX_PRODUCT_IMAGES) {
        throw new Error(`A product can have up to ${MAX_PRODUCT_IMAGES} images.`);
      }

      const completed: Array<{
        objectKey: string;
        altText: string;
      }> = [];
      try {
        for (const [index, file] of files.entries()) {
          setProgress({ file: index + 1, total: files.length, percent: 0 });
          const result = await uploadProductImage(
            productId,
            file,
            (percent) =>
              setProgress({ file: index + 1, total: files.length, percent }),
          );
          completed.push({
            objectKey: result.objectKey,
            altText: altTextFromFilename(file.name),
          });
        }

        return await adminApi.replaceImages(productId, {
          images: [
            ...existingImagePayload(currentRows),
            ...completed.map((image, index) => ({
              objectKey: image.objectKey,
              altText: image.altText,
              sortOrder: currentRows.length + index,
            })),
          ],
        });
      } catch (error) {
        const objectKeys = completed.map((image) => image.objectKey);
        if (objectKeys.length) {
          await deleteProductUploads(productId, { objectKeys }).catch(() => {});
        }
        throw error;
      }
    },
    onSuccess: synchronize,
    onSettled: () => setProgress(null),
  });

  const busy = save.isPending || remove.isPending || upload.isPending;
  const error = save.error ?? remove.error ?? upload.error;

  const update = (id: string, input: Partial<ImageDraft>) => {
    setDrafts(
      currentRows.map((row) => (row.id === id ? { ...row, ...input } : row)),
    );
    setIsDirty(true);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= currentRows.length) return;
    const next = [...currentRows];
    [next[index], next[target]] = [next[target], next[index]];
    setDrafts(next);
    setIsDirty(true);
  };

  return (
    <section className="mt-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="technical-label text-subtle">Cloudflare R2 / Media</p>
          <h2 className="display-title mt-2 text-5xl sm:text-7xl">
            Product media
          </h2>
        </div>
        <label
          className={`bg-acid inline-flex min-h-11 items-center justify-center gap-3 rounded-lg px-4 font-mono text-[9px] uppercase ${busy ? "pointer-events-none opacity-45" : ""}`}
        >
          {upload.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <UploadCloud size={14} />
          )}
          {progress
            ? `Uploading ${progress.file}/${progress.total} · ${progress.percent}%`
            : "Upload images"}
          <input
            className="sr-only"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={busy}
            onChange={(event) => {
              const files = Array.from(event.currentTarget.files ?? []);
              event.currentTarget.value = "";
              if (files.length) upload.mutate(files);
            }}
          />
        </label>
      </div>

      <div className="hairline-panel mt-4 overflow-hidden">
        {images.isPending || configuration.isPending ? (
          <div className="bg-muted h-72 animate-pulse" />
        ) : images.isError || configuration.isError ? (
          <p className="text-danger p-8 text-center text-sm" role="alert">
            Product media could not be loaded.
          </p>
        ) : currentRows.length ? (
          <div className="divide-line divide-y">
            {currentRows.map((image, index) => (
              <article
                key={image.id}
                className="grid gap-4 p-3 sm:grid-cols-[7rem_1fr_.8fr_auto] sm:items-center"
              >
                <ProductMedia
                  src={image.imageUrl}
                  alt={image.altText || `Product image ${index + 1}`}
                  className="aspect-square rounded-lg"
                  sizes="112px"
                />
                <label>
                  <span className="technical-label">Alt text</span>
                  <input
                    value={image.altText}
                    maxLength={255}
                    onChange={(event) =>
                      update(image.id, { altText: event.target.value })
                    }
                    className="border-line bg-surface mt-2 h-10 w-full rounded-lg border px-3 text-xs"
                    placeholder="Describe the product image"
                  />
                </label>
                <label>
                  <span className="technical-label">Variant</span>
                  <select
                    value={image.variantId}
                    onChange={(event) =>
                      update(image.id, { variantId: event.target.value })
                    }
                    className="border-line bg-surface mt-2 h-10 w-full rounded-lg border px-3 font-mono text-[8px] uppercase"
                  >
                    <option value="">All variants</option>
                    {configuration.data?.variants.map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.sku}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    disabled={busy || index === 0}
                    onClick={() => move(index, -1)}
                    className="border-line grid size-9 place-items-center rounded-lg border disabled:opacity-25"
                    aria-label={`Move image ${index + 1} up`}
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    disabled={busy || index === currentRows.length - 1}
                    onClick={() => move(index, 1)}
                    className="border-line grid size-9 place-items-center rounded-lg border disabled:opacity-25"
                    aria-label={`Move image ${index + 1} down`}
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => remove.mutate(image.id)}
                    className="text-danger grid size-9 place-items-center disabled:opacity-25"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center p-8 text-center">
            <div>
              <ImagePlus className="mx-auto" size={28} strokeWidth={1.25} />
              <h3 className="mt-4 font-mono text-sm font-semibold uppercase">
                No product media yet
              </h3>
              <p className="text-subtle mt-2 max-w-md text-sm">
                Upload JPEG, PNG, WebP, or AVIF images up to 10 MB. Files go
                directly to Cloudflare and are verified before publication.
              </p>
            </div>
          </div>
        )}
      </div>

      {error ? (
        <p className="text-danger mt-3 rounded-lg bg-red-50 p-3 text-sm" role="alert">
          {error.message}
        </p>
      ) : null}

      <div className="mt-4 flex items-center justify-end gap-4">
        {upload.isSuccess && !isDirty ? (
          <span className="font-mono text-[9px] uppercase">
            Media uploaded and attached.
          </span>
        ) : null}
        <button
          type="button"
          disabled={!isDirty || busy}
          onClick={() => save.mutate()}
          className="bg-ink min-h-11 min-w-48 rounded-lg px-5 font-mono text-[9px] text-white uppercase disabled:opacity-35"
        >
          {save.isPending ? "Saving media…" : "Save media details"}
        </button>
      </div>
    </section>
  );
}
