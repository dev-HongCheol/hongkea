/**
 * Admin Products View
 * 관리자용 제품 관리 페이지 뷰
 */

"use client";

import { ProductListItem } from "@/entities/product/model";
import { ProductManagementPage } from "@/features/product-management";
import { useRouter } from "next/navigation";
import React from "react";

export const AdminProductsView: React.FC = () => {
  const router = useRouter();

  const handleCreateProduct = () => {
    router.push("/admin/products/create");
  };

  const handleViewProduct = (product: ProductListItem) => {
    router.push(`/admin/products/${product.id}`);
  };

  const handleEditProduct = (product: ProductListItem) => {
    router.push(`/admin/products/${product.id}/edit`);
  };

  return (
    <div className="flex h-screen flex-col">
      <ProductManagementPage
        onCreateProduct={handleCreateProduct}
        onViewProduct={handleViewProduct}
        onEditProduct={handleEditProduct}
      />
    </div>
  );
};
