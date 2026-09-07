"use client";

import { ChevronRight, Folder, FolderOpen, Plus } from "lucide-react";
import type { CategoryTreeNode } from "@/types/api";
import { cn } from "@/lib/utils/cn";

export interface CategoryTreeItemProps {
  node: CategoryTreeNode;
  activeId: string | null;
  isExpanded: (id: string) => boolean;
  onSelect: (node: CategoryTreeNode) => void;
  onToggle: (id: string) => void;
  onAddChild: (parentId: string) => void;
}

export function CategoryTreeItem({
  node,
  activeId,
  isExpanded,
  onSelect,
  onToggle,
  onAddChild,
}: CategoryTreeItemProps) {
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const expanded = isExpanded(node.id);
  const isActive = activeId === node.id;

  return (
    <div
      role="treeitem"
      aria-selected={isActive}
      aria-expanded={hasChildren ? expanded : undefined}
      className="space-y-0.5"
    >
      <div
        className={cn(
          "group flex min-h-10 w-full items-center gap-1.5 rounded-lg px-2 text-left font-mono text-[10px] uppercase transition-colors select-none",
          isActive
            ? "bg-signal text-white font-semibold shadow-xs"
            : "text-ink/80 hover:bg-muted/70 hover:text-ink",
        )}
      >
        {/* Chevron disclosure button */}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            if (hasChildren) {
              onToggle(node.id);
            }
          }}
          disabled={!hasChildren}
          aria-label={
            hasChildren
              ? expanded
                ? `Collapse ${node.name}`
                : `Expand ${node.name}`
              : undefined
          }
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded transition-colors",
            hasChildren
              ? "text-subtle hover:text-ink cursor-pointer hover:bg-black/10"
              : "pointer-events-none opacity-0",
            isActive && "text-ink hover:bg-black/15",
          )}
        >
          {hasChildren ? (
            <ChevronRight
              size={13}
              className={cn(
                "transition-transform duration-200",
                expanded && "rotate-90",
                isActive && "text-ink",
              )}
            />
          ) : null}
        </button>

        {/* Primary Row Action: Folder icon & category name */}
        <button
          type="button"
          onClick={() => onSelect(node)}
          onDoubleClick={() => {
            if (hasChildren) {
              onToggle(node.id);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" && hasChildren && !expanded) {
              e.preventDefault();
              onToggle(node.id);
            } else if (e.key === "ArrowLeft" && hasChildren && expanded) {
              e.preventDefault();
              onToggle(node.id);
            }
          }}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 py-1.5 text-left focus-visible:outline-none"
        >
          {/* Folder Icon representing open / closed state */}
          <span className="flex shrink-0 items-center justify-center">
            {hasChildren ? (
              expanded ? (
                <FolderOpen
                  size={15}
                  className={cn(
                    "transition-colors",
                    isActive ? "text-ink" : "text-subtle",
                  )}
                />
              ) : (
                <Folder
                  size={15}
                  className={cn(
                    "transition-colors",
                    isActive ? "text-ink" : "text-subtle",
                  )}
                />
              )
            ) : (
              <Folder
                size={15}
                className={cn(
                  "transition-colors",
                  isActive ? "text-ink" : "text-subtle/50",
                )}
              />
            )}
          </span>

          {/* Category Name */}
          <span
            className={cn(
              "min-w-0 flex-1 truncate tracking-wide",
              isActive ? "text-ink font-bold" : "text-foreground",
            )}
          >
            {node.name}
          </span>
        </button>

        {/* Child count tag */}
        {hasChildren ? (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 font-mono text-[8px] transition-colors",
              isActive
                ? "text-ink bg-black/15 font-semibold"
                : "bg-muted/90 text-subtle",
            )}
            title={`${node.children.length} subcategories`}
          >
            {node.children.length}
          </span>
        ) : null}

        {/* Quick Add Subcategory action button on hover */}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => onAddChild(node.id)}
          title={`Add subcategory to ${node.name}`}
          aria-label={`Add subcategory to ${node.name}`}
          className={cn(
            "grid size-5 shrink-0 place-items-center rounded opacity-0 transition-opacity group-hover:opacity-100",
            isActive
              ? "text-ink hover:bg-black/15"
              : "text-subtle hover:text-ink hover:bg-black/10",
          )}
        >
          <Plus size={12} />
        </button>

        {/* Sort Order Badge */}
        <span
          className={cn(
            "shrink-0 rounded border px-1.5 py-0.5 font-mono text-[8px] transition-colors",
            isActive
              ? "text-ink border-black/20 bg-black/5 font-semibold"
              : "border-line/40 bg-surface/80 text-subtle",
          )}
          title={`Sort order: ${node.sortOrder}`}
        >
          {node.sortOrder}
        </span>
      </div>

      {/* Nested Children Tree with guideline */}
      {hasChildren && expanded ? (
        <div
          role="group"
          className="border-line/50 relative my-0.5 ml-[19px] space-y-0.5 border-l pl-2"
        >
          {node.children.map((child) => (
            <CategoryTreeItem
              key={child.id}
              node={child}
              activeId={activeId}
              isExpanded={isExpanded}
              onSelect={onSelect}
              onToggle={onToggle}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
