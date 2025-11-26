/**
 * Category tree utility functions
 * Contains pure functions for category tree data transformation and manipulation
 */

import { CategoryTreeNode } from "@/entities/category";
import { NodeModel } from "@minoru/react-dnd-treeview";

/**
 * Convert category tree data to tree nodes for drag-and-drop component
 * @param categories - Array of category tree nodes
 * @param parentId - Parent node ID (default: 0 for root)
 * @returns Array of NodeModel for tree component
 */
export const convertToTreeNodes = (
  categories: CategoryTreeNode[],
  parentId: string | number = 0,
): NodeModel<CategoryTreeNode>[] => {
  const nodes: NodeModel<CategoryTreeNode>[] = [];

  categories.forEach((category) => {
    nodes.push({
      id: category.id,
      parent: parentId,
      droppable: !!category.children?.length,
      text: category.name,
      data: category,
    });

    if (category.children?.length) {
      nodes.push(...convertToTreeNodes(category.children, category.id));
    }
  });

  return nodes;
};

/**
 * Check if a node has children in the tree data
 * @param nodeId - Node ID to check
 * @param treeData - Tree data array
 * @returns Boolean indicating if node has children
 */
export const hasChildren = (
  nodeId: NodeModel["id"],
  treeData: NodeModel<CategoryTreeNode>[],
): boolean => {
  return treeData.some((node) => node.parent === nodeId);
};