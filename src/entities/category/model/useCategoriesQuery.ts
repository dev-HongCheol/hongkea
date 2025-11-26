/**
 * Category React Query hooks
 * Provides data fetching and caching for category operations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { categoryApi } from "../api/categoryApi";
import { CategoryCreate, CategoryUpdate } from "./";

// Query keys for category queries
export const categoryQueryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryQueryKeys.all, "list"] as const,
  list: (filters: string) =>
    [...categoryQueryKeys.lists(), { filters }] as const,
  details: () => [...categoryQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryQueryKeys.details(), id] as const,
  children: (parentId: string | null) =>
    [...categoryQueryKeys.all, "children", parentId] as const,
};

/**
 * 모든 카테고리 조회 hook
 * @returns 카테고리 목록 쿼리 결과
 */
export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: categoryQueryKeys.lists(),
    queryFn: categoryApi.getAll,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * 카테고리 트리 구조 조회 hook
 * @returns 계층 구조로 변환된 카테고리 트리
 */
export const useCategoryTreeQuery = () => {
  const categoriesQuery = useCategoriesQuery();

  // 객체 참조 안정화를 위한 memoization
  return useMemo(
    () => ({
      ...categoriesQuery,
      data: categoriesQuery.data
        ? categoryApi.buildCategoryTree(categoriesQuery.data)
        : undefined,
    }),
    [
      categoriesQuery.data,
      categoriesQuery.isLoading,
      categoriesQuery.error,
      categoriesQuery.status,
    ],
  );
};

/**
 * 특정 카테고리 조회 hook
 * @param id 카테고리 ID
 * @returns 카테고리 상세 정보 쿼리 결과
 */
export const useCategoryQuery = (id: string) => {
  return useQuery({
    queryKey: categoryQueryKeys.detail(id),
    queryFn: () => categoryApi.getById(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!id,
  });
};

/**
 * 자식 카테고리 조회 hook
 * @param parentId 부모 카테고리 ID (null이면 최상위 카테고리)
 * @returns 자식 카테고리 목록 쿼리 결과
 */
export const useCategoryChildrenQuery = (parentId: string | null = null) => {
  return useQuery({
    queryKey: categoryQueryKeys.children(parentId),
    queryFn: () => categoryApi.getChildren(parentId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * 카테고리 생성 mutation hook
 * @returns 카테고리 생성 mutation 객체
 */
export const useCategoryCreateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryCreate) => categoryApi.create(data),
    onSuccess: () => {
      // 카테고리 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
    },
  });
};

/**
 * 카테고리 수정 mutation hook
 * @returns 카테고리 수정 mutation 객체
 */
export const useCategoryUpdateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryUpdate }) =>
      categoryApi.update(id, data),
    onSuccess: (_, { id }) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.detail(id) });
    },
  });
};

/**
 * 카테고리 삭제 mutation hook
 * @returns 카테고리 삭제 mutation 객체
 */
export const useCategoryDeleteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: (_, id) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.detail(id) });
    },
  });
};
