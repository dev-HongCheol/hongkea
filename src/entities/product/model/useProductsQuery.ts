/**
 * Product React Query hooks
 * Provides data fetching and caching for product operations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../api/productApi";
import { ProductCreate, ProductUpdate, ProductFilter } from "./";

// Query keys for product queries
export const productQueryKeys = {
  all: ["products"] as const,
  lists: () => [...productQueryKeys.all, "list"] as const,
  list: (filter: ProductFilter) =>
    [...productQueryKeys.lists(), { filter }] as const,
  details: () => [...productQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...productQueryKeys.details(), id] as const,
  bySlug: (slug: string) => [...productQueryKeys.all, "slug", slug] as const,
  featured: () => [...productQueryKeys.all, "featured"] as const,
  new: () => [...productQueryKeys.all, "new"] as const,
  bestsellers: () => [...productQueryKeys.all, "bestsellers"] as const,
  byCategory: (categoryId: string, filter?: ProductFilter) =>
    [...productQueryKeys.all, "category", categoryId, filter] as const,
  byBrand: (brandId: string, filter?: ProductFilter) =>
    [...productQueryKeys.all, "brand", brandId, filter] as const,
};

/**
 * 상품 목록 조회 hook
 * @param filter 필터링 및 정렬 옵션
 * @returns 상품 목록 쿼리 결과
 */
export const useProductsQuery = (filter: ProductFilter = {}) => {
  return useQuery({
    queryKey: productQueryKeys.list(filter),
    queryFn: () => productApi.getAll(filter),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * 특정 상품 조회 hook (상세 정보 포함)
 * @param id 상품 ID
 * @returns 상품 상세 정보 쿼리 결과
 */
export const useProductQuery = (id: string) => {
  return useQuery({
    queryKey: productQueryKeys.detail(id),
    queryFn: () => productApi.getById(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!id,
  });
};

/**
 * slug로 상품 조회 hook
 * @param slug 상품 slug
 * @returns 상품 상세 정보 쿼리 결과
 */
export const useProductBySlugQuery = (slug: string) => {
  return useQuery({
    queryKey: productQueryKeys.bySlug(slug),
    queryFn: () => productApi.getBySlug(slug),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!slug,
  });
};

/**
 * 추천 상품 조회 hook
 * @param limit 조회할 개수 (기본값: 8)
 * @returns 추천 상품 목록 쿼리 결과
 */
export const useFeaturedProductsQuery = (limit: number = 8) => {
  return useQuery({
    queryKey: [...productQueryKeys.featured(), { limit }],
    queryFn: () => productApi.getFeatured(limit),
    staleTime: 10 * 60 * 1000, // 10분 - 추천 상품은 자주 변경되지 않음
    gcTime: 30 * 60 * 1000,
  });
};

/**
 * 신상품 조회 hook
 * @param limit 조회할 개수 (기본값: 8)
 * @returns 신상품 목록 쿼리 결과
 */
export const useNewProductsQuery = (limit: number = 8) => {
  return useQuery({
    queryKey: [...productQueryKeys.new(), { limit }],
    queryFn: () => productApi.getNew(limit),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 15 * 60 * 1000,
  });
};

/**
 * 베스트셀러 조회 hook
 * @param limit 조회할 개수 (기본값: 8)
 * @returns 베스트셀러 목록 쿼리 결과
 */
export const useBestsellerProductsQuery = (limit: number = 8) => {
  return useQuery({
    queryKey: [...productQueryKeys.bestsellers(), { limit }],
    queryFn: () => productApi.getBestsellers(limit),
    staleTime: 15 * 60 * 1000, // 15분
    gcTime: 30 * 60 * 1000,
  });
};

/**
 * 특정 카테고리의 상품 조회 hook
 * @param categoryId 카테고리 ID
 * @param filter 추가 필터 옵션
 * @returns 해당 카테고리의 상품 목록 쿼리 결과
 */
export const useProductsByCategoryQuery = (
  categoryId: string,
  filter: Omit<ProductFilter, 'category_ids'> = {}
) => {
  return useQuery({
    queryKey: productQueryKeys.byCategory(categoryId, filter),
    queryFn: () => productApi.getByCategory(categoryId, filter),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!categoryId,
  });
};

/**
 * 특정 브랜드의 상품 조회 hook
 * @param brandId 브랜드 ID
 * @param filter 추가 필터 옵션
 * @returns 해당 브랜드의 상품 목록 쿼리 결과
 */
export const useProductsByBrandQuery = (
  brandId: string,
  filter: Omit<ProductFilter, 'brand_ids'> = {}
) => {
  return useQuery({
    queryKey: productQueryKeys.byBrand(brandId, filter),
    queryFn: () => productApi.getByBrand(brandId, filter),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!brandId,
  });
};

/**
 * 상품 생성 mutation hook
 * @returns 상품 생성 mutation 객체
 */
export const useProductCreateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductCreate) => productApi.create(data),
    onSuccess: (newProduct) => {
      // 상품 목록 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.featured() });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.new() });
      
      // 카테고리별 상품 목록 무효화
      if (newProduct.category_id) {
        queryClient.invalidateQueries({
          queryKey: [...productQueryKeys.all, "category", newProduct.category_id],
        });
      }
      
      // 브랜드별 상품 목록 무효화
      if (newProduct.brand_id) {
        queryClient.invalidateQueries({
          queryKey: [...productQueryKeys.all, "brand", newProduct.brand_id],
        });
      }
    },
  });
};

/**
 * 상품 수정 mutation hook
 * @returns 상품 수정 mutation 객체
 */
export const useProductUpdateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductUpdate }) =>
      productApi.update(id, data),
    onSuccess: (updatedProduct, { id }) => {
      // 상세 정보 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: productQueryKeys.detail(id) });
      
      // 상품 목록 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.featured() });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.new() });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.bestsellers() });
      
      // slug 쿼리 무효화
      if (updatedProduct.slug) {
        queryClient.invalidateQueries({ 
          queryKey: productQueryKeys.bySlug(updatedProduct.slug) 
        });
      }
      
      // 카테고리별 상품 목록 무효화
      if (updatedProduct.category_id) {
        queryClient.invalidateQueries({
          queryKey: [...productQueryKeys.all, "category", updatedProduct.category_id],
        });
      }
      
      // 브랜드별 상품 목록 무효화
      if (updatedProduct.brand_id) {
        queryClient.invalidateQueries({
          queryKey: [...productQueryKeys.all, "brand", updatedProduct.brand_id],
        });
      }
    },
  });
};

/**
 * 상품 삭제 mutation hook
 * @returns 상품 삭제 mutation 객체
 */
export const useProductDeleteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: (_, id) => {
      // 상세 정보 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: productQueryKeys.detail(id) });
      
      // 모든 상품 목록 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.featured() });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.new() });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.bestsellers() });
      
      // 카테고리 및 브랜드별 목록들도 무효화 (전체적으로)
      queryClient.invalidateQueries({
        queryKey: [...productQueryKeys.all, "category"],
      });
      queryClient.invalidateQueries({
        queryKey: [...productQueryKeys.all, "brand"],
      });
    },
  });
};

/**
 * SKU 중복 확인 hook
 * @param sku 확인할 SKU
 * @param excludeId 제외할 상품 ID (수정시 자기 자신 제외용)
 * @returns SKU 중복 확인 쿼리 결과
 */
export const useCheckSkuDuplicateQuery = (sku: string, excludeId?: string) => {
  return useQuery({
    queryKey: ["products", "check-sku", sku, excludeId],
    queryFn: () => productApi.checkSkuDuplicate(sku, excludeId),
    enabled: !!sku && sku.length > 0,
    staleTime: 30 * 1000, // 30초
    gcTime: 1 * 60 * 1000, // 1분
  });
};

/**
 * Slug 중복 확인 hook
 * @param slug 확인할 slug
 * @param excludeId 제외할 상품 ID (수정시 자기 자신 제외용)
 * @returns Slug 중복 확인 쿼리 결과
 */
export const useCheckSlugDuplicateQuery = (slug: string, excludeId?: string) => {
  return useQuery({
    queryKey: ["products", "check-slug", slug, excludeId],
    queryFn: () => productApi.checkSlugDuplicate(slug, excludeId),
    enabled: !!slug && slug.length > 0,
    staleTime: 30 * 1000, // 30초
    gcTime: 1 * 60 * 1000, // 1분
  });
};