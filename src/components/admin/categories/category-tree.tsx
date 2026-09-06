"use client";

import { useMemo } from "react";
import { ChevronsDownUp, ChevronsUpDown, FolderTree } from "lucide-react";
import type { CategoryTreeNode } from "@/types/api";
import { CategoryTreeItem } from "./category-tree-item";
import { countAllNodes } from "./utils";

export interface CategoryTreeProps {
  nodes: CategoryTreeNode[];
  activeId: string | null;
  isLoading?: boolean;
  isError?: boolean;
  isExpanded: (id: string) => boolean;
  onSelect: (node: CategoryTreeNode) => void;
  onToggle: (id: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onAddChild: (parentId: string) => void;
}

export function CategoryTree({
  nodes,
  activeId,
  isLoading,
  isError,
  isExpanded,
  onSelect,
  onToggle,
  onExpandAll,
  onCollapseAll,
  onAddChild,
}: CategoryTreeProps) {
  const totalCount = useMemo(() => countAllNodes(nodes), [nodes]);

  return (
    <section className="hairline-panel p-3">
      {/* Hierarchy Header Controls */}
      <div className="border-line mb-2 flex items-center justify-between border-b px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="technical-label">Category / hierarchy</span>
          {totalCount > 0 ? (
            <span className="rounded bg-muted/70 px-1.5 py-0.5 font-mono text-[9px] text-subtle">
              {totalCount}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onExpandAll}
            className="flex items-center gap-1 rounded px-2 py-1 font-mono text-[9px] text-subtle uppercase transition-colors hover:bg-muted hover:text-ink cursor-pointer"
            title="Expand all folders"
            aria-label="Expand all folders"
          >
            <ChevronsUpDown size={13} />
            <span className="hidden sm:inline">Expand all</span>
          </button>
          <button
            type="button"
            onClick={onCollapseAll}
            className="flex items-center gap-1 rounded px-2 py-1 font-mono text-[9px] text-subtle uppercase transition-colors hover:bg-muted hover:text-ink cursor-pointer"
            title="Collapse all folders"
            aria-label="Collapse all folders"
          >
            <ChevronsDownUp size={13} />
            <span className="hidden sm:inline">Collapse all</span>
          </button>
          <div className="mx-1 h-3.5 w-px bg-line/60" />
          <FolderTree size={16} className="text-subtle" />
        </div>
      </div>

      {/* Tree Content / States */}
      {isLoading ? (
        <div className="bg-muted h-96 animate-pulse rounded-lg" />
      ) : isError ? (
        <p className="text-danger p-6 text-sm">
          Category tree could not be loaded.
        </p>
      ) : nodes.length ? (
        <div
          role="tree"
          aria-label="Category hierarchy"
          className="space-y-0.5 p-1"
        >
          {nodes.map((node) => (
            <CategoryTreeItem
              key={node.id}
              node={node}
              activeId={activeId}
              isExpanded={isExpanded}
              onSelect={onSelect}
              onToggle={onToggle}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      ) : (
        <p className="text-subtle p-6 text-sm">No categories exist yet.</p>
      )}
    </section>
  );
}
