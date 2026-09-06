"use client";

import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/features/admin/api";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { queryKeys } from "@/lib/query/keys";
import type { AdminVariant, AttributeTypeRecord } from "@/types/api";

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

export function ProductVariantEditor({ productId }: { productId: string }) {
  const queryClient = useQueryClient();
  const configuration = useQuery({
    queryKey: queryKeys.admin.variantConfiguration(productId),
    queryFn: () => adminApi.variantConfiguration(productId),
  });
  const attributes = useQuery({
    queryKey: queryKeys.admin.attributes,
    queryFn: adminApi.attributes,
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
  const save = useMutation({
    mutationFn: () =>
      adminApi.replaceVariantConfiguration(productId, {
        attributes: (configuration.data?.attributes ?? []).map((item) => ({
          ...item,
        })),
        variants: currentRows.map((row) => ({
          ...(row.id ? { id: row.id } : {}),
          sku: row.sku,
          ...(row.priceOverride
            ? { priceOverride: row.priceOverride }
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
    },
  });
  const update = (key: string, input: Partial<Draft>) =>
    setRows((current) =>
      (current ?? configuration.data?.variants.map(toDraft) ?? []).map((row) =>
        row.key === key ? { ...row, ...input } : row,
      ),
    );
  if (configuration.isPending || attributes.isPending)
    return (
      <div className="p-7">
        <div className="bg-muted h-[38rem] animate-pulse rounded-xl" />
      </div>
    );
  if (configuration.isError || attributes.isError)
    return (
      <div className="p-7">
        <div className="hairline-panel text-danger p-10 text-center">
          Variant configuration could not be loaded.
        </div>
      </div>
    );
  return (
    <div className="p-4 sm:p-7">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-3 font-mono text-[9px] uppercase"
      >
        <ArrowLeft size={13} /> Products
      </Link>
      <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="technical-label text-subtle">Product / {productId}</p>
          <h1 className="display-title mt-2 text-6xl sm:text-8xl">
            Product workspace
          </h1>
        </div>
        <button
          onClick={() =>
            setRows((current) => [
              ...(current ?? configuration.data?.variants.map(toDraft) ?? []),
              {
                key: crypto.randomUUID(),
                sku: "",
                priceOverride: "",
                stockQuantity: "0",
                isDefault:
                  (current ?? configuration.data?.variants ?? []).length === 0,
                options: {},
              },
            ])
          }
          className="bg-acid inline-flex min-h-11 items-center gap-3 rounded-lg px-4 font-mono text-[9px] uppercase"
        >
          <Plus size={14} /> Add variant
        </button>
      </div>
      <div className="mt-6 rounded-xl border border-[#ded3a7] bg-[#f6f0d8] p-3 font-mono text-[8px] text-[#765b00] uppercase">
        Variant changes and product media are saved independently so an upload
        failure never corrupts inventory configuration.
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
        className="mt-4"
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
                <th className="p-3">Price override</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Default</th>
                <th>
                  <span className="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row) => (
                <tr key={row.key} className="border-line border-t">
                  <td className="p-2">
                    <input
                      required
                      value={row.sku}
                      onChange={(event) =>
                        update(row.key, {
                          sku: event.target.value.toUpperCase(),
                        })
                      }
                      className="border-line bg-surface h-10 w-44 rounded-lg border px-3 font-mono text-[9px] uppercase"
                    />
                  </td>
                  {configuredAttributes.map((attribute) => (
                    <td key={attribute.id} className="p-2">
                      <select
                        required
                        value={row.options[attribute.id] ?? ""}
                        onChange={(event) =>
                          update(row.key, {
                            options: {
                              ...row.options,
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
                      value={row.priceOverride}
                      onChange={(event) =>
                        update(row.key, { priceOverride: event.target.value })
                      }
                      inputMode="decimal"
                      placeholder="Base"
                      className="border-line bg-surface h-10 w-24 rounded-lg border px-3 font-mono text-[9px]"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      required
                      min="0"
                      value={row.stockQuantity}
                      onChange={(event) =>
                        update(row.key, { stockQuantity: event.target.value })
                      }
                      className="border-line bg-surface h-10 w-24 rounded-lg border px-3 font-mono text-[9px]"
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
                      className="accent-black"
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
                      className="text-danger grid size-9 place-items-center disabled:opacity-25"
                      aria-label={`Remove ${row.sku || "variant"}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!currentRows.length ? (
            <p className="text-danger p-8 text-center text-sm">
              At least one variant is required.
            </p>
          ) : null}
        </div>
        {save.error ? (
          <p
            className="text-danger mt-4 rounded-lg bg-red-50 p-3 text-sm"
            role="alert"
          >
            {save.error.message}
          </p>
        ) : null}
        <div className="mt-5 flex items-center justify-end gap-4">
          {save.isSuccess ? (
            <span className="font-mono text-[9px] uppercase">
              Configuration synchronized.
            </span>
          ) : null}
          <button
            disabled={!currentRows.length || save.isPending}
            className="bg-ink min-h-12 min-w-60 rounded-lg px-6 font-mono text-[10px] text-white uppercase disabled:opacity-40"
          >
            {save.isPending ? "Saving…" : "Save configuration"}
          </button>
        </div>
      </form>
      <ProductImageManager productId={productId} />
    </div>
  );
}
