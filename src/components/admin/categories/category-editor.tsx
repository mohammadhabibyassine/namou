"use client";

import { useMemo, useState } from "react";
import { Trash2, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/features/admin/api";
import { queryKeys } from "@/lib/query/keys";
import type { CategoryTreeNode } from "@/types/api";
import { flattenCategoryTree, slugify } from "./utils";

export interface CategoryEditorProps {
  category: CategoryTreeNode | null;
  categories: CategoryTreeNode[];
  initialParentId?: string | null;
  onComplete: () => void;
}

export function CategoryEditor({
  category,
  categories,
  initialParentId,
  onComplete,
}: CategoryEditorProps) {
  const queryClient = useQueryClient();

  // Initialized with props, keyed from parent for clean resets (React best practice)
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [parentId, setParentId] = useState(
    category ? (category.parentId ?? "") : (initialParentId ?? ""),
  );
  const [sortOrder, setSortOrder] = useState(String(category?.sortOrder ?? 0));

  const refresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.admin.categories,
    });
    onComplete();
  };

  const save = useMutation({
    mutationFn: () => {
      const input = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        parentId: parentId || null,
        sortOrder: Number(sortOrder) || 0,
      };
      return category
        ? adminApi.updateCategory(category.id, input)
        : adminApi.createCategory(input);
    },
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: () => adminApi.deleteCategory(category!.id),
    onSuccess: refresh,
  });

  const flatCategories = useMemo(
    () => flattenCategoryTree(categories),
    [categories],
  );

  const isCreating = !category;
  const headingText = isCreating
    ? initialParentId
      ? "Create subcategory"
      : "Create category"
    : "Edit category";

  return (
    <section className="hairline-panel p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="technical-label text-subtle">Category editor</p>
          <h2 className="display-title mt-2 text-4xl">{headingText}</h2>
        </div>
        <div className="flex items-center gap-1">
          {category ? (
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    `Delete ${category.name}? The backend will reject deletion while it has active children or products.`,
                  )
                ) {
                  remove.mutate();
                }
              }}
              className="text-danger grid size-10 cursor-pointer place-items-center rounded-lg hover:bg-red-50"
              aria-label={`Delete ${category.name}`}
              title="Delete category"
            >
              <Trash2 size={15} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onComplete}
            className="text-subtle hover:text-ink hover:bg-muted grid size-10 cursor-pointer place-items-center rounded-lg"
            aria-label="Close editor"
            title="Close editor"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
        className="mt-6 space-y-4"
      >
        <label className="block">
          <span className="technical-label">Name</span>
          <input
            required
            maxLength={255}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (!category) setSlug(slugify(event.target.value));
            }}
            className="border-line bg-surface mt-2 h-11 w-full rounded-lg border px-3"
          />
        </label>

        <label className="block">
          <span className="technical-label">Slug</span>
          <input
            required
            maxLength={255}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="border-line bg-surface mt-2 h-11 w-full rounded-lg border px-3 font-mono text-xs"
          />
        </label>

        <label className="block">
          <span className="technical-label">Description</span>
          <textarea
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="border-line bg-surface mt-2 w-full rounded-lg border p-3 text-sm"
          />
        </label>

        <div className="grid grid-cols-[1fr_7rem] gap-3">
          <label>
            <span className="technical-label">Parent</span>
            <select
              value={parentId}
              onChange={(event) => setParentId(event.target.value)}
              className="border-line bg-surface mt-2 h-11 w-full rounded-lg border px-3 font-mono text-[9px] uppercase"
            >
              <option value="">Root level</option>
              {flatCategories
                .filter((node) => node.id !== category?.id)
                .map((node) => (
                  <option key={node.id} value={node.id}>
                    {"— ".repeat(node.depth)}
                    {node.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            <span className="technical-label">Sort</span>
            <input
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className="border-line bg-surface mt-2 h-11 w-full rounded-lg border px-3 font-mono text-xs"
            />
          </label>
        </div>

        {save.error ? (
          <p role="alert" className="text-danger text-sm">
            {save.error.message}
          </p>
        ) : null}

        <button
          disabled={!name.trim() || !slug.trim() || save.isPending}
          className="bg-ink min-h-11 w-full cursor-pointer rounded-lg font-mono text-[10px] text-white uppercase disabled:opacity-40"
        >
          {save.isPending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </section>
  );
}
