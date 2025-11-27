/**
 * Product Management Main Page
 * Virtualized DataTable with Infinite Scrolling을 사용한 제품 관리 페이지
 */

"use client";

import React from "react";
import { useProductTable } from "../model/useProductTable";
import { ProductTable } from "./ProductTable";
import { ProductTableFilters } from "./ProductTableFilters";
import { ProductTableActions } from "./ProductTableActions";
import { ProductListItem } from "@/entities/product/model";

interface ProductManagementPageProps {
  onCreateProduct?: () => void;
  onViewProduct?: (product: ProductListItem) => void;
  onEditProduct?: (product: ProductListItem) => void;
}

export const ProductManagementPage: React.FC<ProductManagementPageProps> = ({
  onCreateProduct,
  onViewProduct,
  onEditProduct,
}) => {
  // Product Table State
  const productTableData = useProductTable({
    pageSize: 50,
    initialFilters: { is_active: undefined }, // 관리자는 모든 상품 볼 수 있음
    initialSorting: { column: "created_at", direction: "desc" },
  });

  const { isLoading, isError, error } = productTableData;

  if (isError) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">데이터를 불러올 수 없습니다</h3>
          <p className="mt-2 text-sm text-gray-600">
            {error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b bg-white p-6">
        <div>
          <h1 className="text-2xl font-bold">제품 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            제품을 등록, 수정, 삭제하고 재고를 관리할 수 있습니다
          </p>
        </div>
      </div>

      {/* 액션 바 */}
      <ProductTableActions
        productTableData={productTableData}
        onCreateProduct={onCreateProduct}
      />

      {/* 필터 */}
      <ProductTableFilters productTableData={productTableData} />

      {/* 테이블 */}
      <div className="flex-1 overflow-hidden">
        {isLoading && productTableData.items.length === 0 ? (
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-2 text-sm text-gray-600">
                제품 목록을 불러오는 중...
              </p>
            </div>
          </div>
        ) : (
          <ProductTable
            productTableData={productTableData}
            onViewProduct={onViewProduct}
            onEditProduct={onEditProduct}
            className="h-full"
          />
        )}
      </div>
    </div>
  );
};
