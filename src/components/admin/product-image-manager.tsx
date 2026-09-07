"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Cloud,
  ImagePlus,
  Loader2,
  Sparkles,
  Star,
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
  fileName: string;
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
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const currentRows = drafts ?? images.data?.map(toDraft) ?? [];

  const synchronize = (data: ProductImageAdminView[]) => {
    queryClient.setQueryData(queryKeys.admin.productImages(productId), data);
    void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.products });
    setDrafts(data.map(toDraft));
    setIsDirty(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3500);
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
        throw new Error(
          `A product can have up to ${MAX_PRODUCT_IMAGES} images.`,
        );
      }

      const completed: Array<{
        objectKey: string;
        altText: string;
      }> = [];

      try {
        for (const [index, file] of files.entries()) {
          setProgress({
            file: index + 1,
            total: files.length,
            percent: 0,
            fileName: file.name,
          });
          const result = await uploadProductImage(productId, file, (percent) =>
            setProgress({
              file: index + 1,
              total: files.length,
              percent,
              fileName: file.name,
            }),
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

  const makeCover = (index: number) => {
    if (index === 0 || index >= currentRows.length) return;
    const next = [...currentRows];
    const [selected] = next.splice(index, 1);
    next.unshift(selected);
    setDrafts(next);
    setIsDirty(true);
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || !fileList.length || busy) return;
    const files = Array.from(fileList);
    upload.mutate(files);
  };

  return (
    <section className="space-y-6">
      {/* Cloudflare Header Banner */}
      <div className="hairline-panel p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Cloud size={15} className="text-ink" />
              <span className="text-subtle font-mono text-[9px] font-semibold tracking-widest uppercase">
                Cloudflare R2 Media Studio
              </span>
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            </div>
            <h2 className="display-title text-ink mt-1 text-4xl sm:text-6xl">
              Product Media Gallery
            </h2>
            <p className="text-subtle mt-1 font-mono text-[9px] tracking-wider uppercase">
              Direct Presigned S3 Upload · Edge Accelerated ·{" "}
              {currentRows.length} / {MAX_PRODUCT_IMAGES} slots
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label
              className={`bg-acid inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-5 font-mono text-[9px] font-bold tracking-wider text-black uppercase shadow-sm transition-opacity hover:opacity-90 ${
                busy ? "pointer-events-none opacity-50" : ""
              }`}
            >
              {upload.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <UploadCloud size={15} />
              )}
              {progress
                ? `Uploading ${progress.file}/${progress.total} (${progress.percent}%)`
                : "Upload Images"}
              <input
                className="sr-only"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={busy}
                onChange={(event) => {
                  handleFiles(event.currentTarget.files);
                  event.currentTarget.value = "";
                }}
              />
            </label>
          </div>
        </div>

        {/* Live Upload Progress Bar */}
        {progress ? (
          <div className="border-line mt-4 border-t pt-4">
            <div className="text-ink flex items-center justify-between font-mono text-[9px] font-semibold uppercase">
              <span className="max-w-xs truncate sm:max-w-md">
                Uploading: {progress.fileName}
              </span>
              <span>
                File {progress.file} of {progress.total} · {progress.percent}%
              </span>
            </div>
            <div className="bg-muted mt-2 h-2 w-full overflow-hidden rounded-full">
              <div
                className="h-full bg-black transition-all duration-200"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? "scale-[1.005] border-black bg-black/[0.03]"
            : "border-line bg-surface hover:border-black/30"
        } ${busy ? "pointer-events-none opacity-50" : ""}`}
      >
        <input
          type="file"
          id="cloudflare-dropzone-input"
          className="sr-only"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={busy}
          onChange={(event) => {
            handleFiles(event.currentTarget.files);
            event.currentTarget.value = "";
          }}
        />
        <label
          htmlFor="cloudflare-dropzone-input"
          className="block cursor-pointer"
        >
          <div className="bg-muted mx-auto mb-3 grid size-12 place-items-center rounded-full">
            <ImagePlus size={22} className="text-subtle" />
          </div>
          <p className="text-ink font-mono text-[11px] font-semibold tracking-wider uppercase">
            {isDragging
              ? "Drop Files to Upload Now"
              : "Drag & Drop Images Here"}
          </p>
          <p className="text-subtle mt-1 text-xs">
            or{" "}
            <span className="text-ink font-mono text-[10px] uppercase underline">
              browse from disk
            </span>{" "}
            (JPEG, PNG, WebP, AVIF up to 10 MB each)
          </p>
          <div className="border-line bg-muted/30 text-subtle mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[8px] uppercase">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Direct Cloudflare R2 Ingress
          </div>
        </label>
      </div>

      {/* Error state */}
      {error ? (
        <div
          className="text-danger rounded-lg border border-red-200 bg-red-50 p-4 font-mono text-xs"
          role="alert"
        >
          {error.message}
        </div>
      ) : null}

      {/* Media Items List */}
      <div className="hairline-panel overflow-hidden">
        <div className="border-line bg-muted/20 flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-black" />
            <h3 className="technical-label">
              Attached Media / {currentRows.length} Items
            </h3>
          </div>
          {currentRows.length > 0 ? (
            <span className="text-subtle font-mono text-[8px] uppercase">
              First image is the primary cover
            </span>
          ) : null}
        </div>

        {images.isPending || configuration.isPending ? (
          <div className="bg-muted h-64 animate-pulse" />
        ) : images.isError || configuration.isError ? (
          <div className="p-8 text-center" role="alert">
            <p className="text-danger font-mono text-sm">
              Product media could not be loaded from backend.
            </p>
          </div>
        ) : currentRows.length ? (
          <div className="divide-line divide-y">
            {currentRows.map((image, index) => {
              const isCover = index === 0;
              return (
                <article
                  key={image.id}
                  className={`grid gap-4 p-4 transition-colors sm:grid-cols-[7.5rem_1fr_.9fr_auto] sm:items-center ${
                    isCover ? "bg-black/[0.015]" : ""
                  }`}
                >
                  {/* Thumbnail with Cover Badge */}
                  <div className="border-line bg-muted relative aspect-square overflow-hidden rounded-lg border">
                    <ProductMedia
                      src={image.imageUrl}
                      alt={image.altText || `Product image ${index + 1}`}
                      className="size-full object-cover"
                      sizes="120px"
                    />
                    {isCover ? (
                      <div className="bg-acid absolute top-1.5 left-1.5 flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[7px] font-bold tracking-wider text-black uppercase shadow-sm">
                        <Star size={9} fill="currentColor" /> Cover
                      </div>
                    ) : (
                      <div className="absolute top-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[7px] text-white uppercase">
                        #{index + 1}
                      </div>
                    )}
                  </div>

                  {/* Alt Text Input */}
                  <div>
                    <label>
                      <span className="technical-label flex items-center justify-between">
                        <span>Alt Description</span>
                        <span className="text-subtle font-mono text-[8px]">
                          {image.altText.length}/255
                        </span>
                      </span>
                      <input
                        value={image.altText}
                        maxLength={255}
                        onChange={(event) =>
                          update(image.id, { altText: event.target.value })
                        }
                        className="border-line bg-surface mt-1.5 h-10 w-full rounded-lg border px-3 text-xs focus:ring-1 focus:ring-black focus:outline-none"
                        placeholder="Describe technical view, angle, silhouette..."
                      />
                    </label>
                  </div>

                  {/* Variant Tagging */}
                  <div>
                    <label>
                      <span className="technical-label">
                        Variant Association
                      </span>
                      <select
                        value={image.variantId}
                        onChange={(event) =>
                          update(image.id, { variantId: event.target.value })
                        }
                        className="border-line bg-surface mt-1.5 h-10 w-full rounded-lg border px-3 font-mono text-[9px] uppercase focus:ring-1 focus:ring-black focus:outline-none"
                      >
                        <option value="">All Variants (General)</option>
                        {configuration.data?.variants.map((variant) => (
                          <option key={variant.id} value={variant.id}>
                            SKU: {variant.sku}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {/* Controls & Reordering */}
                  <div className="flex items-center justify-end gap-1.5 pt-2 sm:pt-0">
                    {!isCover ? (
                      <button
                        type="button"
                        title="Set as primary cover object"
                        disabled={busy}
                        onClick={() => makeCover(index)}
                        className="border-line hover:bg-muted inline-flex h-9 items-center gap-1 rounded-lg border px-2.5 font-mono text-[8px] tracking-wider uppercase transition-colors disabled:opacity-30"
                      >
                        <Sparkles size={11} /> Cover
                      </button>
                    ) : null}

                    <button
                      type="button"
                      disabled={busy || index === 0}
                      onClick={() => move(index, -1)}
                      className="border-line hover:bg-muted grid size-9 place-items-center rounded-lg border transition-colors disabled:opacity-20"
                      aria-label={`Move image ${index + 1} earlier`}
                    >
                      <ArrowUp size={13} />
                    </button>

                    <button
                      type="button"
                      disabled={busy || index === currentRows.length - 1}
                      onClick={() => move(index, 1)}
                      className="border-line hover:bg-muted grid size-9 place-items-center rounded-lg border transition-colors disabled:opacity-20"
                      aria-label={`Move image ${index + 1} later`}
                    >
                      <ArrowDown size={13} />
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => remove.mutate(image.id)}
                      className="text-danger grid size-9 place-items-center rounded-lg transition-colors hover:bg-red-50 disabled:opacity-25"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="grid min-h-56 place-items-center p-8 text-center">
            <div>
              <ImagePlus
                className="text-subtle mx-auto opacity-40"
                size={36}
                strokeWidth={1.25}
              />
              <h4 className="mt-3 font-mono text-xs font-semibold tracking-wider uppercase">
                No Media Attached
              </h4>
              <p className="text-subtle mt-1 max-w-sm text-xs">
                Upload your product&apos;s primary images, angle shots, and
                detail views to appear in the storefront.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Save Bar */}
      <div className="flex items-center justify-between">
        <div>
          {savedNotice ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-[9px] text-emerald-600 uppercase">
              <Check size={13} /> Media catalog synchronized with Cloudflare.
            </span>
          ) : isDirty ? (
            <span className="font-mono text-[9px] text-amber-600 uppercase">
              Unsaved changes in image order or descriptions.
            </span>
          ) : null}
        </div>

        <button
          type="button"
          disabled={!isDirty || busy}
          onClick={() => save.mutate()}
          className="min-h-11 min-w-44 rounded-lg bg-black px-5 font-mono text-[9px] font-semibold tracking-wider text-white uppercase shadow-sm transition-opacity hover:bg-neutral-800 disabled:opacity-30"
        >
          {save.isPending ? "Saving Media…" : "Save Media Details"}
        </button>
      </div>
    </section>
  );
}
