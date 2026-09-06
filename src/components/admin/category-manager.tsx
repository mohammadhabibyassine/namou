"use client";

import { useEffect, useState } from "react";
import { ChevronRight, FolderTree, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/features/admin/api";
import { queryKeys } from "@/lib/query/keys";
import type { CategoryTreeNode } from "@/types/api";
import { cn } from "@/lib/utils/cn";

function CategoryRows({
  nodes,
  activeId,
  onSelect,
}: {
  nodes: CategoryTreeNode[];
  activeId: string | null;
  onSelect: (node: CategoryTreeNode) => void;
}) {
  return nodes.map((node) => (
    <div key={node.id}>
      <button
        onClick={() => onSelect(node)}
        className={cn(
          "flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left font-mono text-[10px] uppercase",
          activeId === node.id ? "bg-acid" : "hover:bg-muted",
        )}
        style={{ paddingLeft: `${12 + node.depth * 18}px` }}
      >
        <ChevronRight
          size={12}
          className={node.children.length ? "" : "opacity-20"}
        />
        <span className="min-w-0 flex-1 truncate">{node.name}</span>
        <span className="text-subtle text-[8px]">{node.sortOrder}</span>
      </button>
      {node.children.length ? (
        <CategoryRows
          nodes={node.children}
          activeId={activeId}
          onSelect={onSelect}
        />
      ) : null}
    </div>
  ));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function CategoryEditor({
  category,
  categories,
  onComplete,
}: {
  category: CategoryTreeNode | null;
  categories: CategoryTreeNode[];
  onComplete: () => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  useEffect(() => {
    setName(category?.name ?? "");
    setSlug(category?.slug ?? "");
    setDescription(category?.description ?? "");
    setParentId(category?.parentId ?? "");
    setSortOrder(String(category?.sortOrder ?? 0));
  }, [category]);
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
  const flat = categories.flatMap(function walk(node): CategoryTreeNode[] {
    return [node, ...node.children.flatMap(walk)];
  });
  return (
    <section className="hairline-panel p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="technical-label text-subtle">Category editor</p>
          <h2 className="display-title mt-2 text-4xl">
            {category ? "Edit category" : "Create category"}
          </h2>
        </div>
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
            className="text-danger grid size-10 place-items-center rounded-lg hover:bg-red-50"
            aria-label={`Delete ${category.name}`}
          >
            <Trash2 size={15} />
          </button>
        ) : null}
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
              {flat
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
          className="bg-ink min-h-11 w-full rounded-lg font-mono text-[10px] text-white uppercase disabled:opacity-40"
        >
          {save.isPending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </section>
  );
}

export function CategoryManager() {
  const query = useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: adminApi.categories,
  });
  const [selected, setSelected] = useState<CategoryTreeNode | null | undefined>(
    undefined,
  );
  return (
    <div className="p-4 sm:p-7">
      <div className="flex items-end justify-between">
        <div>
          <p className="technical-label text-subtle">Catalog / Navigation</p>
          <h1 className="display-title mt-2 text-6xl sm:text-8xl">
            Category tree
          </h1>
        </div>
        <button
          onClick={() => setSelected(null)}
          className="bg-ink inline-flex min-h-11 items-center gap-3 rounded-lg px-4 font-mono text-[9px] text-white uppercase"
        >
          <Plus size={14} /> Create category
        </button>
      </div>
      <div className="mt-7 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <section className="hairline-panel p-3">
          <div className="border-line mb-2 flex items-center justify-between border-b px-3 py-3">
            <span className="technical-label">Category / hierarchy</span>
            <FolderTree size={16} />
          </div>
          {query.isPending ? (
            <div className="bg-muted h-96 animate-pulse rounded-lg" />
          ) : query.isError ? (
            <p className="text-danger p-6 text-sm">
              Category tree could not be loaded.
            </p>
          ) : query.data?.length ? (
            <CategoryRows
              nodes={query.data}
              activeId={selected?.id ?? null}
              onSelect={setSelected}
            />
          ) : (
            <p className="text-subtle p-6 text-sm">No categories exist yet.</p>
          )}
        </section>
        {selected !== undefined && query.data ? (
          <CategoryEditor
            category={selected}
            categories={query.data}
            onComplete={() => setSelected(undefined)}
          />
        ) : (
          <aside className="technical-grid hairline-panel hidden min-h-[32rem] place-items-center lg:grid">
            <div className="text-center">
              <FolderTree className="mx-auto" size={28} />
              <p className="display-title mt-4 text-4xl">Select a branch.</p>
            </div>
          </aside>
        )}
      </div>
      <div className="mt-4 rounded-xl border border-[#ded3a7] bg-[#f6f0d8] p-4 font-mono text-[9px] text-[#765b00] uppercase">
        A category must have no active children or products before deletion.
      </div>
    </div>
  );
}
