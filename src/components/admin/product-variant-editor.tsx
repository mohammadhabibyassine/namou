"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Cloud,
  ExternalLink,
  Layers,
  LayoutGrid,
  Plus,
  Sliders,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/features/admin/api";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { queryKeys } from "@/lib/query/keys";
import type {
  AdminVariant,
  AttributeTypeRecord,
  CategoryTreeNode,
  ProductMetadataInput,
} from "@/types/api";

interface Draft {
  key: string;
  id?: string;
  sku: string;
  priceOverride: string;
  stockQuantity: string;
  isDefault: boolean;
  options: Record<string, string>;
}

function toDraft(variant: AdminVariant): Draft {
  return {
    key: variant.id,
    id: variant.id,
    sku: variant.sku,
    priceOverride: variant.priceOverride ?? "",
    stockQuantity: String(variant.stockQuantity),
    isDefault: variant.isDefault,
    options: Object.fromEntries(
      variant.options.map((option) => [
        option.attributeTypeId,
        option.attributeValueId,
      ]),
    ),
  };
}

function attributeFor(attributes: AttributeTypeRecord[], id: string) {
  return attributes.find((attribute) => attribute.id === id);
}

function flatten(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
  return nodes.flatMap((node) => [node, ...flatten(node.children)]);
}

type StudioTab = "all" | "overview" | "variants" | "media";

export function ProductVariantEditor({ productId }: { productId: string }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<StudioTab>("all");

  const configuration = useQuery({
    queryKey: queryKeys.admin.variantConfiguration(productId),
    queryFn: () => adminApi.variantConfiguration(productId),
  });

  const attributes = useQuery({
    queryKey: queryKeys.admin.attributes,
    queryFn: adminApi.attributes,
  });

  const categories = useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: adminApi.categories,
  });

  const product = useQuery({
    queryKey: queryKeys.admin.product(productId),
    queryFn: () => adminApi.product(productId),
  });

  const flatCategories = useMemo(
    () => flatten(categories.data ?? []),
    [categories.data],
  );

  // Product Metadata form state
  const [title, setTitle] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [basePrice, setBasePrice] = useState<string | null>(null);
  const [currencyCode, setCurrencyCode] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [metaSavedNotice, setMetaSavedNotice] = useState(false);

  // Keep drafts local while using the authoritative admin response as the
  // initial value. This avoids deriving editable metadata from catalog prices.
  const currentTitle = title ?? product.data?.title ?? "";
  const currentSlug = slug ?? product.data?.slug ?? "";
  const currentCategoryId = categoryId ?? product.data?.categoryId ?? "";
  const currentBasePrice = basePrice ?? product.data?.basePrice ?? "";
  const currentCurrency = currencyCode ?? product.data?.currencyCode ?? "USD";
  const currentIsActive = isActive ?? product.data?.isActive ?? true;
  const currentDescription = description ?? product.data?.description ?? "";

  const updateMetadata = useMutation({
    mutationFn: (input: Partial<ProductMetadataInput>) =>
      adminApi.updateProduct(productId, input),
    onSuccess: (updated) => {
      setTitle(updated.title);
      setSlug(updated.slug);
      setCategoryId(updated.categoryId);
      setBasePrice(updated.basePrice);
      setCurrencyCode(updated.currencyCode);
      setIsActive(updated.isActive);
      setDescription(updated.description ?? "");
      setMetaSavedNotice(true);
      setTimeout(() => setMetaSavedNotice(false), 3500);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.products,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });

  const [rows, setRows] = useState<Draft[] | null>(null);
  const currentRows = rows ?? configuration.data?.variants.map(toDraft) ?? [];
  const configuredAttributes = useMemo(
    () =>
      configuration.data?.attributes
        .map((item) =>
          attributeFor(attributes.data ?? [], item.attributeTypeId),
        )
        .filter((item): item is AttributeTypeRecord => Boolean(item)) ?? [],
    [attributes.data, configuration.data],
  );

  const saveVariants = useMutation({
    mutationFn: () =>
      adminApi.replaceVariantConfiguration(productId, {
        attributes: (configuration.data?.attributes ?? []).map((item) => ({
          ...item,
        })),
        variants: currentRows.map((row) => ({
          ...(row.id ? { id: row.id } : {}),
          sku: row.sku.trim().toUpperCase(),
          ...(row.priceOverride.trim()
            ? { priceOverride: row.priceOverride.trim() }
            : { priceOverride: null }),
          stockQuantity: Number(row.stockQuantity),
          isDefault: row.isDefault,
          options: configuredAttributes.map((attribute) => ({
            attributeTypeId: attribute.id,
            attributeValueId: row.options[attribute.id] ?? "",
          })),
        })),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(
        queryKeys.admin.variantConfiguration(productId),
        data,
      );
      setRows(data.variants.map(toDraft));
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.products,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });

  const updateDraft = (key: string, input: Partial<Draft>) =>
    setRows((current) =>
      (current ?? configuration.data?.variants.map(toDraft) ?? []).map((row) =>
        row.key === key ? { ...row, ...input } : row,
      ),
    );

  const addVariant = () => {
    setRows((current) => [
      ...(current ?? configuration.data?.variants.map(toDraft) ?? []),
      {
        key: crypto.randomUUID(),
        sku: "",
        priceOverride: "",
        stockQuantity: "0",
        isDefault: (current ?? configuration.data?.variants ?? []).length === 0,
        options: {},
      },
    ]);
  };

  if (configuration.isPending || attributes.isPending || product.isPending) {
    return (
      <div className="space-y-4 p-7">
        <div className="bg-muted h-12 w-48 animate-pulse rounded-lg" />
        <div className="bg-muted h-96 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (configuration.isError || attributes.isError || product.isError) {
    return (
      <div className="p-7">
        <div className="hairline-panel text-danger p-10 text-center font-mono text-sm">
          Variant configuration could not be loaded for product: {productId}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl p-4 sm:p-7">
      {/* Top Breadcrumbs & Quick Back */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="text-subtle hover:text-ink inline-flex items-center gap-2 font-mono text-[9px] tracking-wider uppercase transition-colors"
        >
          <ArrowLeft size={13} /> Back to Products
        </Link>
        {currentSlug ? (
          <Link
            href={`/shop/${currentSlug}`}
            target="_blank"
            rel="noreferrer"
            className="text-subtle hover:text-ink inline-flex items-center gap-1.5 font-mono text-[9px] tracking-wider uppercase transition-colors"
          >
            Storefront View <ExternalLink size={11} />
          </Link>
        ) : null}
      </div>

      {/* Main Studio Header */}
      <div className="border-line mt-4 flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="border-line bg-surface rounded-full border px-2.5 py-0.5 font-mono text-[8px] tracking-wider uppercase">
              ID: {productId.slice(0, 8)}…
            </span>
            <span className="bg-acid rounded-full px-2.5 py-0.5 font-mono text-[8px] font-bold tracking-wider text-black uppercase">
              {currentIsActive ? "Catalog Active" : "Draft / Inactive"}
            </span>
          </div>
          <h1 className="display-title mt-2 text-5xl sm:text-7xl">
            {currentTitle || "Product Workspace"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addVariant}
            className="bg-acid inline-flex min-h-11 items-center gap-2 rounded-lg px-4 font-mono text-[9px] font-semibold tracking-wider uppercase shadow-sm transition-opacity hover:opacity-90"
          >
            <Plus size={14} /> Add Variant
          </button>
        </div>
      </div>

      {/* Segmented Studio Tabs */}
      <div className="border-line mt-6 flex flex-wrap items-center gap-2 border-b pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-[9px] tracking-wider uppercase transition-colors ${
            activeTab === "all"
              ? "bg-black text-white"
              : "border-line hover:bg-muted text-ink border"
          }`}
        >
          <LayoutGrid size={12} /> All in One
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-[9px] tracking-wider uppercase transition-colors ${
            activeTab === "overview"
              ? "bg-black text-white"
              : "border-line hover:bg-muted text-ink border"
          }`}
        >
          <Sliders size={12} /> Specifications & Metadata
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("variants")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-[9px] tracking-wider uppercase transition-colors ${
            activeTab === "variants"
              ? "bg-black text-white"
              : "border-line hover:bg-muted text-ink border"
          }`}
        >
          <Layers size={12} /> Variants ({currentRows.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("media")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-[9px] tracking-wider uppercase transition-colors ${
            activeTab === "media"
              ? "bg-black text-white"
              : "border-line hover:bg-muted text-ink border"
          }`}
        >
          <Cloud size={12} /> Cloudflare R2 Media
        </button>
      </div>

      {/* Workspace Content */}
      <div className="mt-6 space-y-8">
        {/* Section 1: Overview & Metadata */}
        {(activeTab === "all" || activeTab === "overview") && (
          <section className="hairline-panel space-y-5 p-5 sm:p-6">
            <div className="border-line flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="technical-label flex items-center gap-2 text-base">
                  <span className="size-2 rounded-full bg-black" /> Product
                  Specifications
                </h2>
                <p className="text-subtle mt-0.5 text-xs">
                  Update primary catalog details, pricing base, and public
                  visibility.
                </p>
              </div>
              {metaSavedNotice ? (
                <span className="inline-flex items-center gap-1 font-mono text-[9px] text-emerald-600 uppercase">
                  <Check size={12} /> Specifications saved.
                </span>
              ) : null}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                updateMetadata.mutate({
                  ...(currentTitle ? { title: currentTitle.trim() } : {}),
                  ...(currentSlug ? { slug: currentSlug.trim() } : {}),
                  ...(currentCategoryId
                    ? { categoryId: currentCategoryId }
                    : {}),
                  ...(currentBasePrice
                    ? { basePrice: currentBasePrice.trim() }
                    : {}),
                  currencyCode: currentCurrency.trim().toUpperCase(),
                  isActive: currentIsActive,
                  description: currentDescription
                    ? currentDescription.trim()
                    : null,
                });
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <label className="lg:col-span-2">
                  <span className="technical-label">Title</span>
                  <input
                    required
                    maxLength={255}
                    value={currentTitle}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-line bg-surface mt-1.5 h-10 w-full rounded-lg border px-3 text-sm focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </label>

                <label>
                  <span className="technical-label">Slug</span>
                  <input
                    required
                    value={currentSlug}
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    onChange={(e) => setSlug(e.target.value)}
                    className="border-line bg-surface mt-1.5 h-10 w-full rounded-lg border px-3 font-mono text-[10px] focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </label>

                <label>
                  <span className="technical-label">Category</span>
                  <select
                    value={currentCategoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="border-line bg-surface mt-1.5 h-10 w-full rounded-lg border px-2 font-mono text-[9px] uppercase focus:ring-1 focus:ring-black focus:outline-none"
                  >
                    <option value="">Keep Existing</option>
                    {flatCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {"— ".repeat(c.depth)}
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="technical-label">
                    Base Price ({currentCurrency})
                  </span>
                  <div className="relative mt-1.5 flex items-center">
                    <input
                      inputMode="decimal"
                      pattern="\d+(\.\d{1,2})?"
                      value={currentBasePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      placeholder="0.00"
                      className="border-line bg-surface h-10 w-full rounded-lg border px-3 pr-14 font-mono text-xs focus:ring-1 focus:ring-black focus:outline-none"
                    />
                    <span className="text-subtle border-line bg-muted/40 absolute right-2.5 rounded border px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase select-none">
                      {currentCurrency}
                    </span>
                  </div>
                </label>

                <label>
                  <span className="technical-label">Currency</span>
                  <input
                    required
                    maxLength={3}
                    pattern="[A-Za-z]{3}"
                    value={currentCurrency}
                    onChange={(e) =>
                      setCurrencyCode(e.target.value.toUpperCase())
                    }
                    className="border-line bg-surface mt-1.5 h-10 w-full rounded-lg border px-3 font-mono text-xs uppercase focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </label>

                <div className="border-line flex items-center justify-between rounded-lg border p-3 md:col-span-2">
                  <div>
                    <span className="font-mono text-[9px] font-semibold uppercase">
                      Catalog Status
                    </span>
                    <p className="text-subtle text-xs">
                      Visible to storefront shoppers
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={currentIsActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="bg-muted peer h-5 w-10 rounded-full peer-checked:bg-black peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white" />
                  </label>
                </div>
              </div>

              <label className="block">
                <span className="technical-label">Description</span>
                <textarea
                  value={currentDescription}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Technical composition, functional specs, silhouette details..."
                  className="border-line bg-surface mt-1.5 w-full rounded-lg border p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none"
                />
              </label>

              {updateMetadata.error ? (
                <div className="text-danger rounded-lg bg-red-50 p-3 font-mono text-xs">
                  {updateMetadata.error.message}
                </div>
              ) : null}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updateMetadata.isPending}
                  className="min-h-10 min-w-44 rounded-lg bg-black px-4 font-mono text-[9px] font-semibold tracking-wider text-white uppercase shadow-sm transition-opacity hover:bg-neutral-800 disabled:opacity-40"
                >
                  {updateMetadata.isPending
                    ? "Saving Specifications…"
                    : "Save Specifications"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Section 2: Variants & Inventory Matrix */}
        {(activeTab === "all" || activeTab === "variants") && (
          <section className="space-y-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="technical-label flex items-center gap-2 text-base">
                  <span className="size-2 rounded-full bg-black" /> Variant
                  Matrix & Inventory
                </h2>
                <p className="text-subtle mt-0.5 text-xs">
                  Configure inventory stock levels, SKUs, and attribute option
                  mappings.
                </p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="bg-acid inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3.5 font-mono text-[8px] font-semibold tracking-wider uppercase shadow-sm transition-opacity hover:opacity-90"
              >
                <Plus size={13} /> Add Variant
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                saveVariants.mutate();
              }}
            >
              <div className="hairline-panel overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse text-left">
                  <thead>
                    <tr className="bg-muted text-subtle font-mono text-[8px] uppercase">
                      <th className="p-3">SKU</th>
                      {configuredAttributes.map((attribute) => (
                        <th key={attribute.id} className="p-3">
                          {attribute.name}
                        </th>
                      ))}
                      <th className="p-3">Price Override</th>
                      <th className="p-3">Stock Units</th>
                      <th className="p-3 text-center">Default</th>
                      <th>
                        <span className="sr-only">Remove</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((row) => (
                      <tr
                        key={row.key}
                        className="border-line border-t hover:bg-black/[0.01]"
                      >
                        <td className="p-2">
                          <input
                            required
                            value={row.sku}
                            onChange={(event) =>
                              updateDraft(row.key, {
                                sku: event.target.value.toUpperCase(),
                              })
                            }
                            className="border-line bg-surface h-9 w-40 rounded-lg border px-3 font-mono text-[9px] uppercase focus:ring-1 focus:ring-black focus:outline-none"
                          />
                        </td>
                        {configuredAttributes.map((attribute) => (
                          <td key={attribute.id} className="p-2">
                            <select
                              required
                              value={row.options[attribute.id] ?? ""}
                              onChange={(event) =>
                                updateDraft(row.key, {
                                  options: {
                                    ...row.options,
                                    [attribute.id]: event.target.value,
                                  },
                                })
                              }
                              className="border-line bg-surface h-9 min-w-28 rounded-lg border px-2 font-mono text-[9px] uppercase focus:ring-1 focus:ring-black focus:outline-none"
                            >
                              <option value="">Select option</option>
                              {attribute.values.map((value) => (
                                <option key={value.id} value={value.id}>
                                  {value.value}
                                </option>
                              ))}
                            </select>
                          </td>
                        ))}
                        <td className="p-2">
                          <input
                            value={row.priceOverride}
                            onChange={(event) =>
                              updateDraft(row.key, {
                                priceOverride: event.target.value,
                              })
                            }
                            inputMode="decimal"
                            placeholder="Base"
                            className="border-line bg-surface h-9 w-24 rounded-lg border px-3 font-mono text-[9px] focus:ring-1 focus:ring-black focus:outline-none"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            required
                            min="0"
                            value={row.stockQuantity}
                            onChange={(event) =>
                              updateDraft(row.key, {
                                stockQuantity: event.target.value,
                              })
                            }
                            className="border-line bg-surface h-9 w-24 rounded-lg border px-3 font-mono text-[9px] focus:ring-1 focus:ring-black focus:outline-none"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="radio"
                            name="default"
                            checked={row.isDefault}
                            onChange={() =>
                              setRows((current) =>
                                (
                                  current ??
                                  configuration.data?.variants.map(toDraft) ??
                                  []
                                ).map((item) => ({
                                  ...item,
                                  isDefault: item.key === row.key,
                                })),
                              )
                            }
                            className="size-4 cursor-pointer accent-black"
                          />
                        </td>
                        <td className="p-2">
                          <button
                            type="button"
                            disabled={currentRows.length === 1}
                            onClick={() =>
                              setRows((current) =>
                                (
                                  current ??
                                  configuration.data?.variants.map(toDraft) ??
                                  []
                                ).filter((item) => item.key !== row.key),
                              )
                            }
                            className="text-danger grid size-8 place-items-center rounded-lg transition-colors hover:bg-red-50 disabled:opacity-25"
                            aria-label={`Remove ${row.sku || "variant"}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {saveVariants.error ? (
                <div
                  className="text-danger mt-3 rounded-lg border border-red-200 bg-red-50 p-3 font-mono text-xs"
                  role="alert"
                >
                  {saveVariants.error.message}
                </div>
              ) : null}

              <div className="mt-4 flex items-center justify-between">
                <div>
                  {saveVariants.isSuccess ? (
                    <span className="flex items-center gap-1 font-mono text-[9px] text-emerald-600 uppercase">
                      <Check size={12} /> Variant configuration synchronized.
                    </span>
                  ) : null}
                </div>
                <button
                  type="submit"
                  disabled={!currentRows.length || saveVariants.isPending}
                  className="min-h-11 min-w-52 rounded-lg bg-black px-6 font-mono text-[9px] font-semibold tracking-wider text-white uppercase shadow-sm transition-opacity hover:bg-neutral-800 disabled:opacity-40"
                >
                  {saveVariants.isPending
                    ? "Saving Matrix…"
                    : "Save Variant Matrix"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Section 3: Cloudflare Media Studio */}
        {(activeTab === "all" || activeTab === "media") && (
          <ProductImageManager productId={productId} />
        )}
      </div>
    </div>
  );
}
