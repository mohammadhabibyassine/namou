import type { CategoryTreeNode } from "@/types/api";

export function getAllParentIds(nodes: CategoryTreeNode[]): string[] {
  const ids: string[] = [];
  function walk(items: CategoryTreeNode[]) {
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        ids.push(item.id);
        walk(item.children);
      }
    }
  }
  walk(nodes);
  return ids;
}

export function countAllNodes(nodes: CategoryTreeNode[]): number {
  let count = 0;
  function walk(items: CategoryTreeNode[]) {
    for (const item of items) {
      count++;
      if (item.children?.length) {
        walk(item.children);
      }
    }
  }
  walk(nodes);
  return count;
}

export function findAncestorIds(
  nodes: CategoryTreeNode[],
  targetId: string,
  ancestors: string[] = [],
): string[] | null {
  for (const node of nodes) {
    if (node.id === targetId) {
      return ancestors;
    }
    if (node.children?.length) {
      const found = findAncestorIds(node.children, targetId, [
        ...ancestors,
        node.id,
      ]);
      if (found) return found;
    }
  }
  return null;
}

export function flattenCategoryTree(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
  return nodes.flatMap(function walk(node): CategoryTreeNode[] {
    return [node, ...node.children.flatMap(walk)];
  });
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
