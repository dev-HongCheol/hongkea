/**
 * Product Table State Management
 * Infinite Query와 Virtualization을 위한 상태 관리
 */

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useCallback } from "react";
import { 
  productTableApi, 
  ProductTableFilter, 
  ProductTableSorting, 
  ProductTableParams 
} from "../api/productTableApi";
import { ProductListItem } from "@/entities/product/model";

export interface UseProductTableOptions {
  pageSize?: number;
  initialFilters?: ProductTableFilter;
  initialSorting?: ProductTableSorting;
}

export const useProductTable = ({
  pageSize = 50,
  initialFilters = {},
  initialSorting = { column: "created_at", direction: "desc" }
}: UseProductTableOptions = {}) => {
  // 필터와 정렬 상태
  const [filters, setFilters] = useState<ProductTableFilter>(initialFilters);
  const [sorting, setSorting] = useState<ProductTableSorting>(initialSorting);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Query Key
  const queryKey = ["productTable", { filters, sorting }];

  // Infinite Query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      productTableApi.getProducts({
        pageSize,
        cursor: pageParam,
        filters,
        sorting,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
  });

  // 평면화된 데이터
  const allItems = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items);
  }, [data?.pages]);

  // 총 개수 (첫 번째 페이지에서 가져옴)
  const totalCount = data?.pages[0]?.total ?? 0;

  // Query Client
  const queryClient = useQueryClient();

  // 일괄 업데이트 Mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: ({ 
      productIds, 
      updates 
    }: { 
      productIds: string[]; 
      updates: Parameters<typeof productTableApi.bulkUpdateProducts>[1]
    }) =>
      productTableApi.bulkUpdateProducts(productIds, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productTable"] });
      setSelectedRows([]);
    },
  });

  // 일괄 삭제 Mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (productIds: string[]) =>
      productTableApi.bulkDeleteProducts(productIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productTable"] });
      setSelectedRows([]);
    },
  });

  // 필터 업데이트
  const updateFilters = useCallback((newFilters: Partial<ProductTableFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // 정렬 업데이트
  const updateSorting = useCallback((newSorting: ProductTableSorting) => {
    setSorting(newSorting);
  }, []);

  // 행 선택 관리
  const toggleRowSelection = useCallback((rowId: string) => {
    setSelectedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
  }, []);

  const toggleAllRowsSelection = useCallback((selectAll: boolean) => {
    if (selectAll) {
      setSelectedRows(allItems.map((item) => item.id));
    } else {
      setSelectedRows([]);
    }
  }, [allItems]);

  // 검색 디바운스용
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  // 검색어 적용 (디바운스된)
  const applySearch = useCallback((search: string) => {
    updateFilters({ search: search || undefined });
  }, [updateFilters]);

  return {
    // 데이터
    items: allItems,
    totalCount,
    
    // 로딩 상태
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    
    // 액션
    fetchNextPage,
    refetch,
    
    // 필터링 & 정렬
    filters,
    sorting,
    updateFilters,
    updateSorting,
    
    // 검색
    searchTerm,
    setSearchTerm,
    applySearch,
    
    // 행 선택
    selectedRows,
    toggleRowSelection,
    toggleAllRowsSelection,
    
    // 일괄 액션
    bulkUpdate: bulkUpdateMutation.mutateAsync,
    bulkDelete: bulkDeleteMutation.mutateAsync,
    isBulkUpdating: bulkUpdateMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
  };
};

export type UseProductTableReturn = ReturnType<typeof useProductTable>;