"use client";

import { useState } from "react";
import { FolderTree, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/features/admin/api";
import { queryKeys } from "@/lib/query/keys";
import type { CategoryTreeNode } from "@/types/api";
import { CategoryEditor, CategoryTree, useCategoryTree } from "./categories";

export function CategoryManager() {
  const query = useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: adminApi.categories,
  });

  const [selected, setSelected] = useState<CategoryTreeNode | null | undefined>(
    undefined,
  );
  const [createParentId, setCreateParentId] = useState<string | null>(null);

  const {
    isExpanded,
    toggleExpand,
    expandNode,
    expandAll,
    collapseAll,
    ensureVisible,
  } = useCategoryTree();

  const handleSelectNode = (node: CategoryTreeNode) => {
    if (query.data) {
      ensureVisible(query.data, node.id);
    }
    setCreateParentId(null);
    setSelected(node);
  };

  const handleAddChild = (parentId: string) => {
    expandNode(parentId);
    setCreateParentId(parentId);
    setSelected(null);
  };

  const handleCreateRoot = () => {
    setCreateParentId(null);
    setSelected(null);
  };

  const handleCollapseAll = () => {
    if (query.data) {
      collapseAll(query.data);
    }
  };

  return (
    <div className="p-4 sm:p-7">
      {/* Page Title & Root Action */}
      <div className="flex items-end justify-between">
        <div>
          <p className="technical-label text-subtle">Catalog / Navigation</p>
          <h1 className="display-title mt-2 text-6xl sm:text-8xl">
            Category tree
          </h1>
        </div>
        <button
          onClick={handleCreateRoot}
          className="bg-ink inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-4 font-mono text-[9px] text-white uppercase"
        >
          <Plus size={14} /> Create category
        </button>
      </div>

      {/* Main Dual-Panel Layout */}
      <div className="mt-7 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <CategoryTree
          nodes={query.data ?? []}
          activeId={selected?.id ?? null}
          isLoading={query.isPending}
          isError={query.isError}
          isExpanded={isExpanded}
          onSelect={handleSelectNode}
          onToggle={toggleExpand}
          onExpandAll={expandAll}
          onCollapseAll={handleCollapseAll}
          onAddChild={handleAddChild}
        />

        {selected !== undefined && query.data ? (
          <CategoryEditor
            key={selected?.id ?? `create-${createParentId ?? "root"}`}
            category={selected}
            categories={query.data}
            initialParentId={createParentId}
            onComplete={() => {
              setSelected(undefined);
              setCreateParentId(null);
            }}
          />
        ) : (
          <aside className="technical-grid hairline-panel hidden min-h-[32rem] place-items-center lg:grid">
            <div className="text-center">
              <FolderTree className="mx-auto" size={28} />
              <p className="display-title mt-4 text-4xl">Select a branch.</p>
              <p className="text-subtle mt-2 font-mono text-xs">
                Click any category to edit, or toggle folders to explore.
              </p>
            </div>
          </aside>
        )}
      </div>

      {/* Constraints Footer Note */}
      <div className="mt-4 rounded-xl border border-[#ded3a7] bg-[#f6f0d8] p-4 font-mono text-[9px] text-[#765b00] uppercase">
        A category must have no active children or products before deletion.
      </div>
    </div>
  );
}
