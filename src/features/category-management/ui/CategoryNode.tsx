import { CategoryTreeNode as CategoryTreeNodeType } from "@/entities/category";
import { NodeModel, useDragOver } from "@minoru/react-dnd-treeview";
import { File, FolderOpen } from "lucide-react";
import { MouseEvent, useState } from "react";
import { useCategoryStore } from "../lib/useCategoryStore";

/**
 * Tree node props for the drag-and-drop tree component
 */
interface TreeNodeProps {
  node: NodeModel<CategoryTreeNodeType>;
  depth: number;
  isOpen: boolean;
  onToggle: (id: NodeModel["id"]) => void;
  hasChildren: boolean;
}

/**
 * Individual tree node component with drag-and-drop support
 */
const CategoryTreeNode = ({
  node,
  depth,
  isOpen,
  onToggle,
  hasChildren,
}: TreeNodeProps) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const { id, text } = node;
  const indent = depth * 24;

  // Zustand store에서 선택된 카테고리 상태 가져오기
  const { selectedCategoryId, setSelectedCategoryId } = useCategoryStore();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(id);
  };

  const dragOverProps = useDragOver(id, isOpen, onToggle);

  /**
   * Handle category selection using Zustand store
   * @param categoryId - Category ID to select
   */
  const handleClickNode = (event: MouseEvent, categoryId: string) => {
    event.stopPropagation();
    setSelectedCategoryId(categoryId);
  };

  // 현재 노드가 선택된 상태인지 확인
  const isSelected = selectedCategoryId === id;

  return (
    <div
      className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-gray-50 ${
        isSelected ? "border border-blue-300 bg-blue-100" : ""
      }`}
      style={{ paddingInlineStart: indent }}
      {...dragOverProps}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(event) => handleClickNode(event, id as string)}
    >
      {/* Toggle icon for expandable nodes */}
      {hasChildren ? (
        <div onClick={handleToggle} className="cursor-pointer">
          <FolderOpen size={16} className="text-blue-600" />
        </div>
      ) : (
        <File size={16} className="text-gray-500" />
      )}
      <div
        className={`text-sm ${isSelected ? "font-semibold text-blue-700" : ""}`}
      >
        {text}
      </div>
    </div>
  );
};

export default CategoryTreeNode;
