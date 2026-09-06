"use client";

import { useCallback, useState } from "react";
import type { CategoryTreeNode } from "@/types/api";
import { findAncestorIds, getAllParentIds } from "./utils";

export function useCategoryTree() {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const isExpanded = useCallback(
    (id: string) => !collapsedIds.has(id),
    [collapsedIds],
  );

  const toggleExpand = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const expandNode = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setCollapsedIds(new Set());
  }, []);

  const collapseAll = useCallback((nodes: CategoryTreeNode[]) => {
    setCollapsedIds(new Set(getAllParentIds(nodes)));
  }, []);

  const ensureVisible = useCallback(
    (nodes: CategoryTreeNode[], targetId: string) => {
      const ancestors = findAncestorIds(nodes, targetId);
      if (ancestors && ancestors.length > 0) {
        setCollapsedIds((prev) => {
          let changed = false;
          const next = new Set(prev);
          ancestors.forEach((id) => {
            if (next.has(id)) {
              next.delete(id);
              changed = true;
            }
          });
          return changed ? next : prev;
        });
      }
    },
    [],
  );

  return {
    collapsedIds,
    isExpanded,
    toggleExpand,
    expandNode,
    expandAll,
    collapseAll,
    ensureVisible,
  };
}
