/**
 * Brand React Query hooks
 * Provides data fetching and caching for brand operations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { brandApi } from "../api/brandApi";
import { BrandCreate, BrandUpdate } from "./";

// Query keys for brand queries
export const brandQueryKeys = {
  all: ["brands"] as const,
  lists: () => [...brandQueryKeys.all, "list"] as const,
  list: (filters: string) =>
    [...brandQueryKeys.lists(), { filters }] as const,
  details: () => [...brandQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...brandQueryKeys.details(), id] as const,
  bySlug: (slug: string) => [...brandQueryKeys.all, "slug", slug] as const,
};

/**
 * 모든 브랜드 조회 hook
 * @returns 브랜드 목록 쿼리 결과
 */
export const useBrandsQuery = () => {
  return useQuery({
    queryKey: brandQueryKeys.lists(),
    queryFn: brandApi.getAll,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * 특정 브랜드 조회 hook
 * @param id 브랜드 ID
 * @returns 브랜드 상세 정보 쿼리 결과
 */
export const useBrandQuery = (id: string) => {
  return useQuery({
    queryKey: brandQueryKeys.detail(id),
    queryFn: () => brandApi.getById(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!id,
  });
};

/**
 * 슬러그로 브랜드 조회 hook
 * @param slug 브랜드 슬러그
 * @returns 브랜드 상세 정보 쿼리 결과
 */
export const useBrandBySlugQuery = (slug: string) => {
  return useQuery({
    queryKey: brandQueryKeys.bySlug(slug),
    queryFn: () => brandApi.getBySlug(slug),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!slug,
  });
};

/**
 * 브랜드 생성 mutation hook
 * @returns 브랜드 생성 mutation 객체
 */
export const useBrandCreateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BrandCreate) => brandApi.create(data),
    onSuccess: () => {
      // 브랜드 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: brandQueryKeys.all });
    },
  });
};

/**
 * 브랜드 수정 mutation hook
 * @returns 브랜드 수정 mutation 객체
 */
export const useBrandUpdateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BrandUpdate }) =>
      brandApi.update(id, data),
    onSuccess: (_, { id }) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: brandQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: brandQueryKeys.detail(id) });
    },
  });
};

/**
 * 브랜드 삭제 mutation hook
 * @returns 브랜드 삭제 mutation 객체
 */
export const useBrandDeleteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => brandApi.delete(id),
    onSuccess: (_, id) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: brandQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: brandQueryKeys.detail(id) });
    },
  });
};

/**
 * 브랜드명 중복 검사 hook
 * @param name 브랜드명
 * @param excludeId 제외할 ID (수정 시 사용)
 * @returns 중복 검사 쿼리 결과
 */
export const useBrandNameExistsQuery = (name: string, excludeId?: string) => {
  return useQuery({
    queryKey: ["brand-name-exists", name, excludeId],
    queryFn: () => brandApi.checkNameExists(name, excludeId),
    enabled: !!name && name.length > 0,
    staleTime: 30 * 1000, // 30초
  });
};

/**
 * 슬러그 중복 검사 hook
 * @param slug 슬러그
 * @param excludeId 제외할 ID (수정 시 사용)
 * @returns 중복 검사 쿼리 결과
 */
export const useBrandSlugExistsQuery = (slug: string, excludeId?: string) => {
  return useQuery({
    queryKey: ["brand-slug-exists", slug, excludeId],
    queryFn: () => brandApi.checkSlugExists(slug, excludeId),
    enabled: !!slug && slug.length > 0,
    staleTime: 30 * 1000, // 30초
  });
};