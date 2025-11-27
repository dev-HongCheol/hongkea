/**
 * Product Table Actions
 * 선택된 제품들에 대한 일괄 액션 UI
 */

"use client";

import React, { useState } from "react";
import {
  Trash2,
  Eye,
  EyeOff,
  Star,
  TrendingUp,
  Award,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { UseProductTableReturn } from "../model/useProductTable";
import { toast } from "sonner";

interface ProductTableActionsProps {
  productTableData: UseProductTableReturn;
  onCreateProduct?: () => void;
}

export const ProductTableActions: React.FC<ProductTableActionsProps> = ({
  productTableData,
  onCreateProduct,
}) => {
  const {
    selectedRows,
    bulkUpdate,
    bulkDelete,
    isBulkUpdating,
    isBulkDeleting,
  } = productTableData;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const hasSelectedRows = selectedRows.length > 0;

  // 일괄 활성화
  const handleBulkActivate = async () => {
    try {
      await bulkUpdate({
        productIds: selectedRows,
        updates: { is_active: true },
      });
      toast.success(`${selectedRows.length}개 제품이 활성화되었습니다.`);
    } catch (error) {
      toast.error("제품 활성화에 실패했습니다.");
    }
  };

  // 일괄 비활성화
  const handleBulkDeactivate = async () => {
    try {
      await bulkUpdate({
        productIds: selectedRows,
        updates: { is_active: false },
      });
      toast.success(`${selectedRows.length}개 제품이 비활성화되었습니다.`);
    } catch (error) {
      toast.error("제품 비활성화에 실패했습니다.");
    }
  };

  // 일괄 추천 설정
  const handleBulkSetFeatured = async (featured: boolean) => {
    try {
      await bulkUpdate({
        productIds: selectedRows,
        updates: { is_featured: featured },
      });
      toast.success(
        `${selectedRows.length}개 제품의 추천 설정이 ${featured ? "활성화" : "비활성화"}되었습니다.`,
      );
    } catch (error) {
      toast.error("추천 설정 변경에 실패했습니다.");
    }
  };

  // 일괄 신상품 설정
  const handleBulkSetNew = async (isNew: boolean) => {
    try {
      await bulkUpdate({
        productIds: selectedRows,
        updates: { is_new: isNew },
      });
      toast.success(
        `${selectedRows.length}개 제품의 신상품 설정이 ${isNew ? "활성화" : "비활성화"}되었습니다.`,
      );
    } catch (error) {
      toast.error("신상품 설정 변경에 실패했습니다.");
    }
  };

  // 일괄 베스트셀러 설정
  const handleBulkSetBestseller = async (isBestseller: boolean) => {
    try {
      await bulkUpdate({
        productIds: selectedRows,
        updates: { is_bestseller: isBestseller },
      });
      toast.success(
        `${selectedRows.length}개 제품의 베스트셀러 설정이 ${isBestseller ? "활성화" : "비활성화"}되었습니다.`,
      );
    } catch (error) {
      toast.error("베스트셀러 설정 변경에 실패했습니다.");
    }
  };

  // 일괄 삭제
  const handleBulkDeleteConfirm = async () => {
    try {
      await bulkDelete(selectedRows);
      toast.success(`${selectedRows.length}개 제품이 삭제되었습니다.`);
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("제품 삭제에 실패했습니다.");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between border-b bg-white p-4">
        {/* 왼쪽: 선택된 항목 정보 및 일괄 액션 */}
        <div className="flex items-center gap-4">
          {hasSelectedRows ? (
            <>
              <span className="text-sm font-medium">
                {selectedRows.length}개 선택됨
              </span>

              <div className="flex items-center gap-2">
                {/* 활성화/비활성화 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkActivate}
                  disabled={isBulkUpdating}
                >
                  <Eye className="mr-1 h-4 w-4" />
                  활성화
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDeactivate}
                  disabled={isBulkUpdating}
                >
                  <EyeOff className="mr-1 h-4 w-4" />
                  비활성화
                </Button>

                {/* 더 많은 액션 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleBulkSetFeatured(true)}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      추천 설정
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBulkSetFeatured(false)}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      추천 해제
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => handleBulkSetNew(true)}>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      신상품 설정
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkSetNew(false)}>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      신상품 해제
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => handleBulkSetBestseller(true)}
                    >
                      <Award className="mr-2 h-4 w-4" />
                      베스트셀러 설정
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBulkSetBestseller(false)}
                    >
                      <Award className="mr-2 h-4 w-4" />
                      베스트셀러 해제
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <span className="text-sm text-gray-500">
              제품을 선택하여 일괄 작업을 수행할 수 있습니다
            </span>
          )}
        </div>

        {/* 오른쪽: 일반 액션 */}
        <div className="flex items-center gap-2">
          {onCreateProduct && (
            <Button onClick={onCreateProduct}>
              <Plus className="h-4 w-4" />
              제품 추가
            </Button>
          )}
        </div>
      </div>

      {/* 삭제 확인 대화상자 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>제품 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              선택된 {selectedRows.length}개의 제품을 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={isBulkDeleting}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
