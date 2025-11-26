"use client";

import { useCategoryTreeQuery } from "@/entities/category";
import {
  DndProvider,
  getBackendOptions,
  MultiBackend,
  Tree,
} from "@minoru/react-dnd-treeview";
import { useCategoryTreeDnd } from "../lib/useCategoryTreeDnd";
import CategoryTreeNodeComponent from "./CategoryNode";

/**
 * Category tree list component with drag-and-drop functionality
 * Displays categories in a hierarchical tree structure
 */
const CategoryTreeList = () => {
  const { data: categoryTree, isLoading, error } = useCategoryTreeQuery();
  const { treeData, handleDrop, hasChildren } = useCategoryTreeDnd(categoryTree);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-gray-500">카테고리를 불러오는 중...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-red-500">
          카테고리를 불러올 수 없습니다: {error.message}
        </div>
      </div>
    );
  }

  // Empty state
  if (!treeData.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-gray-500">등록된 카테고리가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="x-5 w-full border">
      <DndProvider backend={MultiBackend} options={getBackendOptions()}>
        <Tree
          tree={treeData}
          rootId={0}
          render={(node, options) => (
            <CategoryTreeNodeComponent
              node={node}
              {...options}
              hasChildren={hasChildren(node.id)}
            />
          )}
          onDrop={handleDrop}
          classes={{
            root: "min-h-[200px]",
            draggingSource: "opacity-50",
            dropTarget: "bg-blue-50 border-l-2 border-blue-500",
          }}
        />
      </DndProvider>
    </div>
  );
};

export default CategoryTreeList;
