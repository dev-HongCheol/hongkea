/**
 * Product Creation Business Logic
 * 제품 생성 비즈니스 로직 훅
 */

import { productApi } from "@/entities/product";
import { ProductCreate, ProductImageUpload } from "@/entities/product/model";
import { productImageStorage } from "../lib/storage";
import { useMutation } from "@tanstack/react-query";

interface UseProductCreateOptions {
  onSuccess?: (productId: string) => void;
  onError?: (error: Error) => void;
}

/**
 * 제품 생성 훅
 * 제품 생성 및 이미지 업로드 로직을 처리
 */
export const useProductCreate = (options?: UseProductCreateOptions) => {
  const mutation = useMutation({
    mutationFn: async ({
      data,
      images,
    }: {
      data: ProductCreate;
      images: ProductImageUpload[];
    }) => {
      // 1. 제품 생성
      const createdProduct = await productApi.create(data);

      // 2. 이미지 업로드 및 저장
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const image = images[i];

          // productImageStorage 유틸리티로 이미지 업로드
          const uploadedPath = await productImageStorage.uploadImage(
            image.file,
            createdProduct.id
          );

          // 업로드된 이미지 경로를 DB에 저장
          await productApi.addImage(createdProduct.id, uploadedPath, {
            alt_text: image.alt_text,
            is_primary: image.is_primary,
            sort_order: image.sort_order,
          });
        }
      }

      return createdProduct;
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data.id);
    },
    onError: (error: Error) => {
      console.error("제품 등록 오류:", error);
      options?.onError?.(error);
    },
  });

  return {
    createProduct: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
};
