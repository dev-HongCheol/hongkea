/**
 * Category Tree Selection Dialog
 * 트리 구조로 카테고리를 선택할 수 있는 다이얼로그
 */

"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { cn } from "@/shared/lib/utils";
import { CategoryTreeItem } from "@/entities/category/model";

interface CategoryTreeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCategory: (category: CategoryTreeItem) => void;
  selectedCategoryId?: string;
  categories: CategoryTreeItem[];
}

interface TreeNodeProps {
  node: CategoryTreeItem;
  level: number;
  selectedId?: string;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelect: (category: CategoryTreeItem) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level,
  selectedId,
  expandedIds,
  onToggleExpand,
  onSelect,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent cursor-pointer",
          isSelected && "bg-accent/50 font-medium",
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(node)}
      >
        {hasChildren ? (
          <button
            className="flex h-4 w-4 items-center justify-center rounded-sm hover:bg-accent/50"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.id);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        ) : (
          <div className="h-4 w-4" />
        )}
        
        {hasChildren ? (
          isExpanded ? (
            <FolderOpen className="h-4 w-4 text-blue-600" />
          ) : (
            <Folder className="h-4 w-4 text-blue-600" />
          )
        ) : (
          <div className="h-4 w-4 rounded border border-gray-300 bg-gray-50" />
        )}
        
        <span className="truncate">{node.name}</span>
        
        {node.is_active === false && (
          <span className="text-xs text-muted-foreground">(비활성)</span>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryTreeDialog: React.FC<CategoryTreeDialogProps> = ({
  open,
  onOpenChange,
  onSelectCategory,
  selectedCategoryId,
  categories,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [tempSelectedCategory, setTempSelectedCategory] = 
    useState<CategoryTreeItem | null>(null);

  // 초기 확장 상태 설정 (선택된 카테고리의 부모들을 모두 확장)
  useEffect(() => {
    if (selectedCategoryId && categories.length > 0) {
      const expandPath = (categories: CategoryTreeItem[], targetId: string, path: string[] = []): string[] | null => {
        for (const category of categories) {
          const currentPath = [...path, category.id];
          if (category.id === targetId) {
            return currentPath.slice(0, -1); // 마지막 본인 제외
          }
          if (category.children) {
            const result = expandPath(category.children, targetId, currentPath);
            if (result) return result;
          }
        }
        return null;
      };

      const pathToExpand = expandPath(categories, selectedCategoryId);
      if (pathToExpand) {
        setExpandedIds(new Set(pathToExpand));
      }
    }
  }, [selectedCategoryId, categories, open]);

  // 선택된 카테고리 찾기
  useEffect(() => {
    if (selectedCategoryId && categories.length > 0) {
      const findCategory = (categories: CategoryTreeItem[], id: string): CategoryTreeItem | null => {
        for (const category of categories) {
          if (category.id === id) return category;
          if (category.children) {
            const found = findCategory(category.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      const selectedCategory = findCategory(categories, selectedCategoryId);
      setTempSelectedCategory(selectedCategory);
    } else {
      setTempSelectedCategory(null);
    }
  }, [selectedCategoryId, categories]);

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectCategory = (category: CategoryTreeItem) => {
    setTempSelectedCategory(category);
  };

  const handleConfirm = () => {
    if (tempSelectedCategory) {
      onSelectCategory(tempSelectedCategory);
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempSelectedCategory(
      selectedCategoryId 
        ? categories.find(c => findCategoryInTree(c, selectedCategoryId)) || null
        : null
    );
    onOpenChange(false);
  };

  // 트리에서 카테고리 찾기 헬퍼
  const findCategoryInTree = (node: CategoryTreeItem, targetId: string): CategoryTreeItem | null => {
    if (node.id === targetId) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findCategoryInTree(child, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>카테고리 선택</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {tempSelectedCategory && (
            <div className="mb-4 rounded-md bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                <span className="font-medium">선택된 카테고리:</span> {tempSelectedCategory.name}
              </p>
            </div>
          )}
          
          <ScrollArea className="h-80">
            <div className="space-y-1">
              {categories.map((category) => (
                <TreeNode
                  key={category.id}
                  node={category}
                  level={0}
                  selectedId={tempSelectedCategory?.id}
                  expandedIds={expandedIds}
                  onToggleExpand={handleToggleExpand}
                  onSelect={handleSelectCategory}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            취소
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!tempSelectedCategory}
          >
            선택
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};