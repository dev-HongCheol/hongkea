/**
 * Admin Product Create View
 * 관리자 제품 생성 페이지 뷰 컴포넌트 (Pages Layer)
 * FSD: 순수하게 features와 entities를 조합만 하는 레이어
 */

"use client";

import { useBrandsQuery } from "@/entities/brand/model";
import { useCategoryTreeQuery } from "@/entities/category";
import { ProductCreate, ProductImageUpload } from "@/entities/product/model";
import {
  ProductCreateForm,
  useProductCreate,
} from "@/features/product-creation";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

export const AdminProductCreateView: React.FC = () => {
  const router = useRouter();

  // 데이터 조회 (트리 구조로 조회)
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategoryTreeQuery();
  const { data: brandsData, isLoading: brandsLoading } = useBrandsQuery();

  // 제품 생성 비즈니스 로직
  const { createProduct } = useProductCreate({
    onSuccess: () => {
      toast.success("제품이 성공적으로 등록되었습니다.");
      router.push("/admin/products");
    },
    onError: (error) => {
      toast.error(error.message || "제품 등록에 실패했습니다.");
    },
  });

  const handleSubmit = async (
    data: ProductCreate,
    images: ProductImageUpload[],
  ) => {
    await createProduct({ data, images });
  };

  const handleCancel = () => {
    router.push("/admin/products");
  };

  // 로딩 상태
  if (categoriesLoading || brandsLoading) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200"></div>
          <div className="h-4 w-96 rounded bg-gray-200"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 데이터 에러 상태
  if (!categoriesData || !brandsData) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 p-6">
        <div className="py-12 text-center">
          <p className="text-red-600">
            데이터를 불러오는 중 오류가 발생했습니다.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProductCreateForm
      categories={categoriesData}
      brands={brandsData}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};
