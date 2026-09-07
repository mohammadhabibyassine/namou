"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Cloud,
  Layers,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { adminApi } from "@/features/admin/api";
import { queryKeys } from "@/lib/query/keys";
import type {
  AttributeTypeRecord,
  CategoryTreeNode,
  ProductCreateInput,
} from "@/types/api";

interface VariantDraft {
  key: number;
  sku: string;
  priceOverride: string;
  stockQuantity: string;
  isDefault: boolean;
  options: Record<string, string>;
}

let rowKey = 1;
const nextKey = () => rowKey++;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function flatten(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
  return nodes.flatMap((node) => [node, ...flatten(node.children)]);
}

function VariantTable({
  attributes,
  selectedIds,
  variants,
  onChange,
  slug,
}: {
  attributes: AttributeTypeRecord[];
  selectedIds: string[];
  variants: VariantDraft[];
  onChange: (variants: VariantDraft[]) => void;
  slug: string;
}) {
  const selected = selectedIds
    .map((id) => attributes.find((attribute) => attribute.id === id))
    .filter((value): value is AttributeTypeRecord => Boolean(value));

  const update = (key: number, input: Partial<VariantDraft>) =>
    onChange(
      variants.map((variant) =>
        variant.key === key ? { ...variant, ...input } : variant,
      ),
    );

  const autoGenerateSkus = () => {
    const base = (slug || "PROD").toUpperCase().replace(/-/g, "").slice(0, 8);
    onChange(
      variants.map((v, i) => ({
        ...v,
        sku: v.sku.trim() ? v.sku : `${base}-${String(i + 1).padStart(2, "0")}`,
      })),
    );
  };

  return (
    <section className="hairline-panel overflow-hidden">
      <div className="border-line flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-black" />
            <h2 className="technical-label">
              Variant Matrix / {variants.length}
            </h2>
          </div>
          <p className="text-subtle mt-1 text-xs">
            Every product requires at least one variant and exactly one default.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={autoGenerateSkus}
            className="border-line hover:bg-muted inline-flex min-h-8 items-center gap-1.5 rounded-lg border px-3 font-mono text-[8px] uppercase transition-colors"
          >
            <Sparkles size={12} /> Auto SKU
          </button>
          <button
            type="button"
            onClick={() =>
              onChange([
                ...variants,
                {
                  key: nextKey(),
                  sku: "",
                  priceOverride: "",
                  stockQuantity: "0",
                  isDefault: variants.length === 0,
                  options: {},
                },
              ])
            }
            className="action-button inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3 font-mono text-[8px] uppercase"
          >
            <Plus size={12} /> Add Variant
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="bg-muted text-subtle font-mono text-[8px] uppercase">
              <th className="p-3">SKU</th>
              {selected.map((attribute) => (
                <th key={attribute.id} className="p-3">
                  {attribute.name}
                </th>
              ))}
              <th className="p-3">Override</th>
              <th className="p-3">Stock</th>
              <th className="p-3 text-center">Default</th>
              <th>
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => (
              <tr
                key={variant.key}
                className="border-line border-t hover:bg-black/[0.01]"
              >
                <td className="p-2">
                  <input
                    required
                    value={variant.sku}
                    placeholder="e.g. NAM-01"
                    onChange={(event) =>
                      update(variant.key, {
                        sku: event.target.value.toUpperCase(),
                      })
                    }
                    className="border-line bg-surface h-9 w-36 rounded-lg border px-3 font-mono text-[9px] uppercase focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </td>
                {selected.map((attribute) => (
                  <td key={attribute.id} className="p-2">
                    <select
                      required
                      value={variant.options[attribute.id] ?? ""}
                      onChange={(event) =>
                        update(variant.key, {
                          options: {
                            ...variant.options,
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
                    value={variant.priceOverride}
                    onChange={(event) =>
                      update(variant.key, { priceOverride: event.target.value })
                    }
                    inputMode="decimal"
                    placeholder="Base"
                    className="border-line bg-surface h-9 w-24 rounded-lg border px-3 font-mono text-[9px] focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    required
                    min="0"
                    type="number"
                    value={variant.stockQuantity}
                    onChange={(event) =>
                      update(variant.key, { stockQuantity: event.target.value })
                    }
                    className="border-line bg-surface h-9 w-20 rounded-lg border px-3 font-mono text-[9px] focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="radio"
                    name="defaultVariant"
                    checked={variant.isDefault}
                    onChange={() =>
                      onChange(
                        variants.map((candidate) => ({
                          ...candidate,
                          isDefault: candidate.key === variant.key,
                        })),
                      )
                    }
                    className="size-4 cursor-pointer accent-black"
                  />
                </td>
                <td className="p-2">
                  <button
                    type="button"
                    disabled={variants.length === 1}
                    onClick={() =>
                      onChange(
                        variants.filter(
                          (candidate) => candidate.key !== variant.key,
                        ),
                      )
                    }
                    className="text-danger grid size-8 place-items-center rounded-lg transition-colors hover:bg-red-50 disabled:opacity-25"
                    aria-label={`Remove variant ${variant.sku || "row"}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ProductCreateForm() {
  const router = useRouter();
  const categories = useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: adminApi.categories,
  });
  const attributes = useQuery({
    queryKey: queryKeys.admin.attributes,
    queryFn: adminApi.attributes,
  });

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [isActive, setIsActive] = useState(true);
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>(
    [],
  );
  const [variants, setVariants] = useState<VariantDraft[]>([
    {
      key: nextKey(),
      sku: "",
      priceOverride: "",
      stockQuantity: "0",
      isDefault: true,
      options: {},
    },
  ]);

  const flatCategories = useMemo(
    () => flatten(categories.data ?? []),
    [categories.data],
  );

  const create = useMutation({
    mutationFn: (input: ProductCreateInput) => adminApi.createProduct(input),
    onSuccess: (product) => router.push(`/admin/products/${product.id}`),
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input: ProductCreateInput = {
      categoryId,
      title: title.trim(),
      slug: slug.trim(),
      ...(description.trim() ? { description: description.trim() } : {}),
      basePrice: basePrice.trim(),
      currencyCode: currencyCode.trim().toUpperCase() || "USD",
      isActive,
      attributes: selectedAttributeIds.map((attributeTypeId, sortOrder) => ({
        attributeTypeId,
        sortOrder,
      })),
      variants: variants.map((variant) => ({
        sku: variant.sku.trim().toUpperCase(),
        ...(variant.priceOverride.trim()
          ? { priceOverride: variant.priceOverride.trim() }
          : {}),
        stockQuantity: Number(variant.stockQuantity),
        isDefault: variant.isDefault,
        options: selectedAttributeIds.map((attributeTypeId) => ({
          attributeTypeId,
          attributeValueId: variant.options[attributeTypeId] ?? "",
        })),
      })),
    };
    create.mutate(input);
  }

  return (
    <div className="max-w-7xl p-4 sm:p-7">
      {/* Header & Breadcrumbs */}
      <div>
        <Link
          href="/admin/products"
          className="text-subtle hover:text-ink inline-flex items-center gap-2 font-mono text-[9px] tracking-wider uppercase transition-colors"
        >
          <ArrowLeft size={13} /> Products Catalog
        </Link>
        <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="technical-label text-subtle">Catalog / New Object</p>
            <h1 className="display-title mt-1 text-5xl sm:text-7xl">
              Create Product
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="border-line bg-surface rounded-full border px-3 py-1 font-mono text-[8px] tracking-wider uppercase">
              Step 1 of 2: Specifications
            </span>
          </div>
        </div>
      </div>

      <form className="mt-7 space-y-6" onSubmit={submit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Specifications (Left 2 cols) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Core Details */}
            <section className="hairline-panel space-y-4 p-5">
              <div className="border-line flex items-center justify-between border-b pb-3">
                <h2 className="technical-label flex items-center gap-2">
                  <span className="size-2 rounded-full bg-black" /> General
                  Specifications
                </h2>
                <span className="text-subtle font-mono text-[8px] uppercase">
                  Required Fields *
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="technical-label">Product Title *</span>
                  <input
                    required
                    maxLength={255}
                    placeholder="e.g. Modular Tactical Shell 01"
                    value={title}
                    onChange={(event) => {
                      setTitle(event.target.value);
                      if (!isSlugManual) {
                        setSlug(slugify(event.target.value));
                      }
                    }}
                    className="border-line bg-surface mt-1.5 h-11 w-full rounded-lg border px-3 text-sm focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </label>

                <label>
                  <div className="flex items-center justify-between">
                    <span className="technical-label">URL Slug *</span>
                    <button
                      type="button"
                      onClick={() => setIsSlugManual((v) => !v)}
                      className="text-subtle hover:text-ink font-mono text-[8px] uppercase underline"
                    >
                      {isSlugManual ? "Auto-sync" : "Edit manual"}
                    </button>
                  </div>
                  <input
                    required
                    value={slug}
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    readOnly={!isSlugManual}
                    onChange={(event) => setSlug(event.target.value)}
                    placeholder="e.g. modular-tactical-shell-01"
                    className={`border-line bg-surface mt-1.5 h-11 w-full rounded-lg border px-3 font-mono text-[10px] focus:ring-1 focus:ring-black focus:outline-none ${
                      !isSlugManual ? "bg-muted/40 text-subtle" : ""
                    }`}
                  />
                </label>

                <label>
                  <span className="technical-label">Category *</span>
                  <select
                    required
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    className="border-line bg-surface mt-1.5 h-11 w-full rounded-lg border px-3 font-mono text-[9px] uppercase focus:ring-1 focus:ring-black focus:outline-none"
                  >
                    <option value="">Choose category</option>
                    {flatCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {"— ".repeat(category.depth)}
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="technical-label">Product Description</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  placeholder="Technical composition, functional specs, silhouette details..."
                  className="border-line bg-surface mt-1.5 w-full rounded-lg border p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none"
                />
              </label>

              <div className="border-line flex items-center justify-between border-t pt-3">
                <div>
                  <p className="font-mono text-[9px] font-semibold uppercase">
                    Catalog Visibility
                  </p>
                  <p className="text-subtle text-xs">
                    When active, this product will appear in the public catalog
                    immediately.
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(event) => setIsActive(event.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="bg-muted peer h-6 w-11 rounded-full peer-checked:bg-black peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white" />
                </label>
              </div>
            </section>

            {/* Variant Matrix */}
            <VariantTable
              attributes={attributes.data ?? []}
              selectedIds={selectedAttributeIds}
              variants={variants}
              onChange={setVariants}
              slug={slug}
            />
          </div>

          {/* Sidebar / Configuration (Right 1 col) */}
          <div className="space-y-6">
            {/* Pricing Section */}
            <section className="hairline-panel space-y-4 p-5">
              <div className="border-line flex items-center justify-between border-b pb-3">
                <h2 className="technical-label flex items-center gap-2">
                  <span className="size-2 rounded-full bg-black" /> Pricing
                  (USD)
                </h2>
                <span className="border-line bg-surface text-ink rounded border px-2 py-0.5 font-mono text-[8px] font-bold uppercase">
                  USD ($)
                </span>
              </div>

              <div>
                <label className="block">
                  <span className="technical-label">
                    Base Price ({currencyCode || "USD"}) *
                  </span>
                  <div className="relative mt-1.5 flex items-center">
                    <input
                      required
                      inputMode="decimal"
                      placeholder="0.00"
                      pattern="\d+(\.\d{1,2})?"
                      value={basePrice}
                      onChange={(event) => setBasePrice(event.target.value)}
                      className="border-line bg-surface h-11 w-full rounded-lg border px-3 pr-16 font-mono text-sm focus:ring-1 focus:ring-black focus:outline-none"
                    />
                    <span className="text-subtle absolute right-3 font-mono text-[9px] font-bold uppercase select-none">
                      {currencyCode || "USD"}
                    </span>
                  </div>
                </label>
                <label className="block">
                  <span className="technical-label">Currency Code *</span>
                  <input
                    required
                    maxLength={3}
                    pattern="[A-Za-z]{3}"
                    value={currencyCode}
                    onChange={(event) =>
                      setCurrencyCode(event.target.value.toUpperCase())
                    }
                    className="border-line bg-surface mt-1.5 h-11 w-full rounded-lg border px-3 font-mono text-sm uppercase focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </label>
              </div>
              <p className="text-subtle text-[10px]">
                Use a three-letter ISO currency code. Variants can specify
                custom price overrides in the matrix table.
              </p>
            </section>

            {/* Attributes Selector */}
            <section className="hairline-panel space-y-4 p-5">
              <div className="border-line flex items-center justify-between border-b pb-3">
                <h2 className="technical-label flex items-center gap-2">
                  <Layers size={13} /> Attributes
                </h2>
                <span className="text-subtle font-mono text-[8px] uppercase">
                  {selectedAttributeIds.length} Selected
                </span>
              </div>
              <p className="text-subtle text-xs">
                Select attribute dimensions configured for your variants.
              </p>
              <div className="flex flex-wrap gap-2">
                {attributes.data?.map((attribute) => {
                  const selected = selectedAttributeIds.includes(attribute.id);
                  return (
                    <button
                      key={attribute.id}
                      type="button"
                      onClick={() =>
                        setSelectedAttributeIds((ids) =>
                          selected
                            ? ids.filter((id) => id !== attribute.id)
                            : [...ids, attribute.id],
                        )
                      }
                      aria-pressed={selected}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-[9px] uppercase transition-colors ${
                        selected
                          ? "bg-black text-white"
                          : "border-line hover:bg-muted text-ink border"
                      }`}
                    >
                      <span>{attribute.name}</span>
                      <span
                        className={`grid size-4 place-items-center rounded-full text-[8px] ${
                          selected
                            ? "bg-white/20 text-white"
                            : "bg-muted text-subtle"
                        }`}
                      >
                        {attribute.values.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Cloudflare R2 Pipeline Notice */}
            <section className="hairline-panel space-y-3 bg-[#fbfbfa] p-5">
              <div className="text-ink flex items-center gap-2">
                <Cloud size={16} className="text-black" />
                <h3 className="font-mono text-[10px] font-semibold tracking-wider uppercase">
                  Cloudflare R2 Media Studio
                </h3>
              </div>
              <p className="text-subtle text-xs leading-relaxed">
                Direct client-to-storage signed pipeline. Once this product is
                created, you will immediately land on the{" "}
                <strong>Media Studio</strong> where you can drag & drop
                high-resolution imagery, assign covers, and tag variants.
              </p>
              <div className="text-subtle flex items-center gap-2 pt-1 font-mono text-[8px] uppercase">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                R2 Edge Ready
              </div>
            </section>
          </div>
        </div>

        {create.error ? (
          <div
            className="text-danger rounded-lg border border-red-200 bg-red-50 p-4 font-mono text-xs"
            role="alert"
          >
            Failed to create product: {create.error.message}
          </div>
        ) : null}

        {/* Footer actions */}
        <div className="border-line flex flex-col items-center justify-between gap-4 border-t pt-5 sm:flex-row">
          <Link
            href="/admin/products"
            className="text-subtle hover:text-ink font-mono text-[9px] tracking-wider uppercase"
          >
            Cancel & Return
          </Link>
          <button
            type="submit"
            disabled={
              create.isPending || categories.isPending || attributes.isPending
            }
            className="action-button flex min-h-12 min-w-72 items-center justify-center gap-2 rounded-lg px-6 font-mono text-[10px] font-semibold tracking-wider uppercase"
          >
            {create.isPending ? (
              <>
                <LoadingSpinner size="sm" />
                Deploying Product…
              </>
            ) : (
              <>
                Create Product & Open Studio <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
