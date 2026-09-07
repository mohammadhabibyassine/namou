"use client";

import { useState } from "react";
import { Pencil, Plus, Settings2, Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/features/admin/api";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { queryKeys } from "@/lib/query/keys";
import type { AttributeTypeRecord } from "@/types/api";
import { cn } from "@/lib/utils/cn";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function AttributeEditor({
  attribute,
  onClose,
}: {
  attribute: AttributeTypeRecord | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(attribute?.name ?? "");
  const [slug, setSlug] = useState(attribute?.slug ?? "");
  const [sortOrder, setSortOrder] = useState(String(attribute?.sortOrder ?? 0));
  const [newValue, setNewValue] = useState("");
  const [newValueSort, setNewValueSort] = useState("0");
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.attributes });
  const save = useMutation({
    mutationFn: () =>
      attribute
        ? adminApi.updateAttribute(attribute.id, {
            name,
            slug,
            sortOrder: Number(sortOrder) || 0,
          })
        : adminApi.createAttribute({
            name,
            slug,
            sortOrder: Number(sortOrder) || 0,
          }),
    onSuccess: async () => {
      await refresh();
      onClose();
    },
  });
  const addValue = useMutation({
    mutationFn: () => {
      if (!attribute)
        throw new Error("Save the attribute type before adding values");
      return adminApi.createAttributeValue(attribute.id, {
        value: newValue.trim(),
        sortOrder: Number(newValueSort) || 0,
      });
    },
    onSuccess: async () => {
      setNewValue("");
      setNewValueSort("0");
      await refresh();
    },
  });
  const removeValue = useMutation({
    mutationFn: (valueId: string) => {
      if (!attribute) throw new Error("Attribute unavailable");
      return adminApi.deleteAttributeValue(attribute.id, valueId);
    },
    onSuccess: refresh,
  });
  const removeType = useMutation({
    mutationFn: () => adminApi.deleteAttribute(attribute!.id),
    onSuccess: async () => {
      await refresh();
      onClose();
    },
  });
  return (
    <section className="hairline-panel p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="technical-label text-subtle">Attribute editor</p>
          <h2 className="display-title mt-2 text-4xl">
            {attribute ? attribute.name : "New attribute"}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="grid size-10 place-items-center"
          aria-label="Close editor"
        >
          <X size={16} />
        </button>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
        className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_6rem]"
      >
        <label>
          <span className="technical-label">Name</span>
          <input
            required
            maxLength={255}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (!attribute) setSlug(slugify(event.target.value));
            }}
            className="border-line bg-surface mt-2 h-11 w-full rounded-lg border px-3"
          />
        </label>
        <label>
          <span className="technical-label">Slug</span>
          <input
            required
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="border-line bg-surface mt-2 h-11 w-full rounded-lg border px-3 font-mono text-xs"
          />
        </label>
        <label>
          <span className="technical-label">Sort</span>
          <input
            type="number"
            min="0"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="border-line bg-surface mt-2 h-11 w-full rounded-lg border px-3 font-mono text-xs"
          />
        </label>
        {save.error ? (
          <p className="text-danger text-sm sm:col-span-3">
            {save.error.message}
          </p>
        ) : null}
        <button
          disabled={save.isPending}
          className="bg-ink min-h-11 rounded-lg font-mono text-[9px] text-white uppercase sm:col-span-3"
        >
          {save.isPending ? (
            <>
              <LoadingSpinner size="sm" /> Saving…
            </>
          ) : attribute ? (
            "Save type"
          ) : (
            "Create type"
          )}
        </button>
      </form>
      {attribute ? (
        <div className="border-line mt-7 border-t pt-6">
          <div className="flex items-center justify-between">
            <h3 className="technical-label">
              Values / {attribute.values.length}
            </h3>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete ${attribute.name}?`)) {
                  removeType.mutate();
                }
              }}
              className="text-danger inline-flex items-center gap-2 font-mono text-[9px] uppercase"
            >
              <Trash2 size={13} /> Delete type
            </button>
          </div>
          <div className="divide-line border-line mt-4 divide-y rounded-xl border">
            {attribute.values.map((value) => (
              <div
                key={value.id}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-4 p-3"
              >
                <span className="font-mono text-[10px] uppercase">
                  {value.value}
                </span>
                <span className="text-subtle font-mono text-[8px]">
                  {value.sortOrder}
                </span>
                <button
                  onClick={() => removeValue.mutate(value.id)}
                  className="text-danger grid size-8 place-items-center"
                  aria-label={`Delete ${value.value}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              addValue.mutate();
            }}
            className="mt-4 grid grid-cols-[1fr_6rem_auto] gap-2"
          >
            <label>
              <span className="sr-only">New value</span>
              <input
                required
                value={newValue}
                onChange={(event) => setNewValue(event.target.value)}
                placeholder="New value"
                className="border-line bg-surface h-11 w-full rounded-lg border px-3 text-sm"
              />
            </label>
            <label>
              <span className="sr-only">Sort order</span>
              <input
                type="number"
                min="0"
                value={newValueSort}
                onChange={(event) => setNewValueSort(event.target.value)}
                className="border-line bg-surface h-11 w-full rounded-lg border px-3 font-mono text-xs"
              />
            </label>
            <button
              className="action-button grid size-11 place-items-center rounded-lg"
              aria-label="Create value"
            >
              <Plus size={16} />
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}

export function AttributeManager() {
  const query = useQuery({
    queryKey: queryKeys.admin.attributes,
    queryFn: adminApi.attributes,
  });
  const [selectedId, setSelectedId] = useState<string | null | undefined>(
    undefined,
  );
  const selected =
    selectedId === null
      ? null
      : query.data?.find((attribute) => attribute.id === selectedId);
  return (
    <div className="p-4 sm:p-7">
      <div className="flex items-end justify-between">
        <div>
          <p className="technical-label text-subtle">
            Catalog / Variant options
          </p>
          <h1 className="display-title mt-2 text-6xl sm:text-8xl">
            Attributes
          </h1>
        </div>
        <button
          onClick={() => setSelectedId(null)}
          className="action-button inline-flex min-h-11 items-center gap-3 rounded-lg px-4 font-mono text-[9px] uppercase"
        >
          <Plus size={14} /> Create attribute
        </button>
      </div>
      <div className="mt-7 grid gap-4 lg:grid-cols-[.75fr_1.25fr]">
        <section className="hairline-panel overflow-hidden">
          <div className="border-line bg-muted text-subtle grid grid-cols-[1fr_4rem_4rem] border-b p-3 font-mono text-[8px] uppercase">
            <span>Attribute type</span>
            <span>Values</span>
            <span>Action</span>
          </div>
          {query.isPending ? (
            <div className="bg-muted h-72 animate-pulse" />
          ) : query.isError ? (
            <p className="text-danger p-6 text-sm">
              Attributes could not be loaded.
            </p>
          ) : (
            query.data?.map((attribute) => (
              <button
                key={attribute.id}
                onClick={() => setSelectedId(attribute.id)}
                className={cn(
                  "border-line grid min-h-14 w-full grid-cols-[1fr_4rem_4rem] items-center border-b p-3 text-left",
                  selectedId === attribute.id
                    ? "bg-signal/10"
                    : "hover:bg-muted",
                )}
              >
                <span>
                  <span className="block font-mono text-[10px] uppercase">
                    {attribute.name}
                  </span>
                  <span className="text-subtle mt-1 block font-mono text-[8px]">
                    {attribute.slug}
                  </span>
                </span>
                <span className="font-mono text-[9px]">
                  {attribute.values.length}
                </span>
                <Pencil size={13} />
              </button>
            ))
          )}
        </section>
        {selectedId !== undefined && selected !== undefined ? (
          <AttributeEditor
            key={selected?.id ?? "new"}
            attribute={selected}
            onClose={() => setSelectedId(undefined)}
          />
        ) : (
          <aside className="technical-grid hairline-panel hidden min-h-96 place-items-center lg:grid">
            <div className="text-center">
              <Settings2 className="mx-auto" size={28} />
              <p className="display-title mt-4 text-4xl">Select a type.</p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
