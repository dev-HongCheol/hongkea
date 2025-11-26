/**
 * Custom hook for category tree drag-and-drop functionality
 * Manages local tree state and drag-and-drop operations
 */

import { CategoryTreeNode } from "@/entities/category";
import { NodeModel } from "@minoru/react-dnd-treeview";
import { useCallback, useEffect, useMemo, useState } from "react";
import { convertToTreeNodes, hasChildren } from "./categoryTreeUtils";

/**
 * Custom hook for managing category tree drag-and-drop state
 * @param categoryTree - Category tree data from server
 * @returns Tree state and handlers for drag-and-drop operations
 */
export const useCategoryTreeDnd = (categoryTree?: CategoryTreeNode[]) => {
  // Convert server data to tree nodes (memoized)
  const initialTreeData = useMemo(() => {
    if (!categoryTree) return [];
    return convertToTreeNodes(categoryTree);
  }, [categoryTree]);

  // Local state for drag-and-drop
  const [localTreeData, setLocalTreeData] = useState<
    NodeModel<CategoryTreeNode>[]
  >([]);

  // Update local tree data when server data changes
  useEffect(() => {
    setLocalTreeData(initialTreeData);
  }, [initialTreeData]);

  /**
   * Handle tree structure changes from drag-and-drop
   * @param newTree - New tree structure after drop
   */
  const handleDrop = useCallback((newTree: NodeModel<CategoryTreeNode>[]) => {
    setLocalTreeData(newTree);
    // TODO: Implement server-side update for category hierarchy
    console.log("카테고리 순서 변경:", newTree);
  }, []);

  /**
   * Check if a node has children (wrapped with current tree data)
   * @param nodeId - Node ID to check
   * @returns Boolean indicating if node has children
   */
  const checkHasChildren = useCallback(
    (nodeId: NodeModel["id"]) => hasChildren(nodeId, localTreeData),
    [localTreeData],
  );

  return {
    treeData: localTreeData,
    handleDrop,
    hasChildren: checkHasChildren,
  };
};