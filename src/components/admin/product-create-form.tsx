"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
}: {
  attributes: AttributeTypeRecord[];
  selectedIds: string[];
  variants: VariantDraft[];
  onChange: (variants: VariantDraft[]) => void;
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
  return (
    <section className="hairline-panel overflow-hidden">
      <div className="border-line flex items-center justify-between border-b p-4">
        <div>
          <h2 className="technical-label">
            Variant matrix / {variants.length}
          </h2>
          <p className="text-subtle mt-1 text-xs">
            Every product requires at least one variant and exactly one default.
          </p>
        </div>
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
          className="bg-acid inline-flex min-h-9 items-center gap-2 rounded-lg px-3 font-mono text-[8px] uppercase"
        >
          <Plus size={13} /> Variant
        </button>
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
              <th className="p-3">Default</th>
              <th>
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => (
              <tr key={variant.key} className="border-line border-t">
                <td className="p-2">
                  <input
                    required
                    value={variant.sku}
                    onChange={(event) =>
                      update(variant.key, {
                        sku: event.target.value.toUpperCase(),
                      })
                    }
                    className="border-line bg-surface h-10 w-40 rounded-lg border px-3 font-mono text-[9px] uppercase"
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
                      className="border-line bg-surface h-10 min-w-28 rounded-lg border px-2 font-mono text-[9px] uppercase"
                    >
                      <option value="">Select</option>
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
                    className="border-line bg-surface h-10 w-24 rounded-lg border px-3 font-mono text-[9px]"
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
                    className="border-line bg-surface h-10 w-20 rounded-lg border px-3 font-mono text-[9px]"
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
                    className="accent-black"
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
                    className="text-danger grid size-9 place-items-center disabled:opacity-25"
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
      basePrice,
      currencyCode: currencyCode.toUpperCase(),
      isActive,
      attributes: selectedAttributeIds.map((attributeTypeId, sortOrder) => ({
        attributeTypeId,
        sortOrder,
      })),
      variants: variants.map((variant) => ({
        sku: variant.sku,
        ...(variant.priceOverride
          ? { priceOverride: variant.priceOverride }
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
    <div className="p-4 sm:p-7">
      <div>
        <p className="technical-label text-subtle">Catalog / New object</p>
        <h1 className="display-title mt-2 text-6xl sm:text-8xl">
          Create product
        </h1>
      </div>
      <form className="mt-7 space-y-4" onSubmit={submit}>
        <section className="hairline-panel grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
          <label>
            <span className="technical-label">Title</span>
            <input
              required
              maxLength={255}
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setSlug(slugify(event.target.value));
              }}
              className="border-line bg-surface mt-2 h-11 w-full rounded-lg border px-3"
            />
          </label>
          <label>
            <span className="technical-label">Slug</span>
            <input
              required
              value={slug}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              onChange={(event) => setSlug(event.target.value)}
              className="border-line bg-surface mt-2 h-11 w-full rounded-lg border px-3 font-mono text-[10px]"
            />
          </label>
          <label>
            <span className="technical-label">Category</span>
            <select
              required
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="border-line bg-surface mt-2 h-11 w-full rounded-lg border px-3 font-mono text-[9px] uppercase"
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
          <div className="grid grid-cols-[1fr_5rem] gap-2">
            <label>
              <span className="technical-label">Base price</span>
              <input
                required
                inputMode="decimal"
                pattern="\d+(\.\d{1,2})?"
                value={basePrice}
                onChange={(event) => setBasePrice(event.target.value)}
                className="border-line bg-surface mt-2 h-11 w-full rounded-lg border px-3 font-mono text-xs"
              />
            </label>
            <label>
              <span className="technical-label">Currency</span>
              <input
                required
                maxLength={3}
                value={currencyCode}
                onChange={(event) => setCurrencyCode(event.target.value)}
                className="border-line bg-surface mt-2 h-11 w-full rounded-lg border px-2 font-mono text-xs uppercase"
              />
            </label>
          </div>
          <label className="md:col-span-2 xl:col-span-3">
            <span className="technical-label">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="border-line bg-surface mt-2 w-full rounded-lg border p-3 text-sm"
            />
          </label>
          <label className="flex items-center gap-3 self-end pb-3 font-mono text-[9px] uppercase">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="accent-black"
            />{" "}
            Active in catalog
          </label>
        </section>
        <section className="hairline-panel p-5">
          <h2 className="technical-label">Attribute configuration</h2>
          <div className="mt-4 flex flex-wrap gap-2">
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
                  className={
                    selected
                      ? "bg-ink rounded-lg px-4 py-3 font-mono text-[9px] text-white uppercase"
                      : "border-line rounded-lg border px-4 py-3 font-mono text-[9px] uppercase"
                  }
                >
                  {attribute.name} / {attribute.values.length}
                </button>
              );
            })}
          </div>
        </section>
        <VariantTable
          attributes={attributes.data ?? []}
          selectedIds={selectedAttributeIds}
          variants={variants}
          onChange={setVariants}
        />
        <section className="hairline-panel flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="technical-label">Cloudflare product media</h2>
            <p className="text-subtle mt-1 text-xs">
              Images are uploaded securely after the product receives its ID.
            </p>
          </div>
          <span className="bg-muted rounded-full px-3 py-2 font-mono text-[8px] uppercase">
            Next step / Media
          </span>
        </section>
        {create.error ? (
          <p
            className="text-danger rounded-lg bg-red-50 p-4 text-sm"
            role="alert"
          >
            {create.error.message}
          </p>
        ) : null}
        <div className="flex justify-end">
          <button
            disabled={
              create.isPending || categories.isPending || attributes.isPending
            }
            className="bg-acid min-h-12 min-w-64 rounded-lg px-6 font-mono text-[10px] uppercase disabled:opacity-40"
          >
            {create.isPending ? "Creating product…" : "Create product & add media"}
          </button>
        </div>
      </form>
    </div>
  );
}
