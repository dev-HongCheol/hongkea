/**
 * Admin Product Create View
 * 관리자 제품 생성 페이지 뷰 컴포넌트
 */

"use client";

import { useBrandsQuery } from "@/entities/brand/model";
import { useCategoriesQuery } from "@/entities/category";
import { productApi } from "@/entities/product";
import { ProductCreate, ProductImageUpload } from "@/entities/product/model";
import { ProductCreateForm } from "@/features/product-creation";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

export const AdminProductCreateView: React.FC = () => {
  const router = useRouter();

  // 데이터 조회
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategoriesQuery();
  const { data: brandsData, isLoading: brandsLoading } = useBrandsQuery();

  const handleSubmit = async (
    data: ProductCreate,
    images: ProductImageUpload[],
  ) => {
    try {
      // 1. 제품 생성
      const createdProduct = await productApi.create(data);

      // 2. 이미지 업로드 및 저장
      if (images.length > 0) {
        // TODO: Supabase Storage에 이미지 업로드 로직 구현
        // 현재는 임시로 로컬 URL을 사용
        for (let i = 0; i < images.length; i++) {
          const image = images[i];

          // 실제 구현 시에는 여기서 Storage에 업로드하고 경로를 받아옴
          const imagePath = `products/${createdProduct.id}/${Date.now()}-${image.file.name}`;

          await productApi.addImage(createdProduct.id, imagePath, {
            alt_text: image.alt_text,
            is_primary: image.is_primary,
            sort_order: image.sort_order,
          });
        }
      }

      toast.success("제품이 성공적으로 등록되었습니다.");
      router.push("/admin/products");
    } catch (error) {
      console.error("제품 등록 오류:", error);
      throw error; // ProductCreateForm에서 에러 처리
    }
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
