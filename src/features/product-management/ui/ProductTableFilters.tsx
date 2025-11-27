/**
 * Product Table Filters
 * 제품 테이블 필터링 및 검색 UI
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, X, RotateCcw } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { UseProductTableReturn } from "../model/useProductTable";
import { supabase } from "@/shared/lib/supabase/client";

interface ProductTableFiltersProps {
  productTableData: UseProductTableReturn;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface BrandOption {
  id: string;
  name: string;
}

export const ProductTableFilters: React.FC<ProductTableFiltersProps> = ({
  productTableData,
}) => {
  const {
    filters,
    updateFilters,
    searchTerm,
    setSearchTerm,
    applySearch,
    selectedRows,
    totalCount,
  } = productTableData;

  // 검색어 디바운스
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // 디바운스된 검색어가 변경되면 실제 검색 실행
  useEffect(() => {
    applySearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, applySearch]);

  // 카테고리 목록 조회
  const { data: categories = [] } = useQuery<CategoryOption[]>({
    queryKey: ["categories", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hk_categories")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // 브랜드 목록 조회
  const { data: brands = [] } = useQuery<BrandOption[]>({
    queryKey: ["brands", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hk_brands")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // 활성 필터 개수
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category_ids?.length) count++;
    if (filters.brand_ids?.length) count++;
    if (filters.is_featured !== undefined) count++;
    if (filters.is_new !== undefined) count++;
    if (filters.is_bestseller !== undefined) count++;
    if (filters.is_active !== undefined) count++;
    if (filters.price_min !== undefined) count++;
    if (filters.price_max !== undefined) count++;
    return count;
  }, [filters]);

  // 필터 초기화
  const resetFilters = () => {
    updateFilters({
      category_ids: undefined,
      brand_ids: undefined,
      is_featured: undefined,
      is_new: undefined,
      is_bestseller: undefined,
      is_active: undefined,
      price_min: undefined,
      price_max: undefined,
    });
    setSearchTerm("");
  };

  // 카테고리 필터 토글
  const toggleCategoryFilter = (categoryId: string) => {
    const current = filters.category_ids || [];
    const updated = current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId];

    updateFilters({
      category_ids: updated.length > 0 ? updated : undefined,
    });
  };

  // 브랜드 필터 토글
  const toggleBrandFilter = (brandId: string) => {
    const current = filters.brand_ids || [];
    const updated = current.includes(brandId)
      ? current.filter((id) => id !== brandId)
      : [...current, brandId];

    updateFilters({
      brand_ids: updated.length > 0 ? updated : undefined,
    });
  };

  return (
    <div className="flex flex-col gap-4 border-b bg-white p-4">
      {/* 상단 행: 검색 + 필터 버튼 + 선택된 항목 정보 */}
      <div className="flex items-center justify-between gap-4">
        {/* 검색 */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="제품명, SKU로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="absolute top-1/2 right-2 h-auto -translate-y-1/2 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex gap-4">
          {/* 결과 정보 */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>총 {totalCount.toLocaleString()}개</span>
            {selectedRows.length > 0 && (
              <span className="font-medium text-blue-600">
                {selectedRows.length}개 선택
              </span>
            )}
          </div>

          {/* 필터 버튼 */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="mr-2 h-4 w-4" />
                필터
                {activeFilterCount > 0 && (
                  <span className="ml-2 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">필터</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="h-auto p-1"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                {/* 카테고리 필터 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">카테고리</Label>
                  <div className="max-h-32 space-y-2 overflow-y-auto">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={
                            filters.category_ids?.includes(category.id) || false
                          }
                          onCheckedChange={() =>
                            toggleCategoryFilter(category.id)
                          }
                        />
                        <Label
                          htmlFor={`category-${category.id}`}
                          className="text-sm"
                        >
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 브랜드 필터 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">브랜드</Label>
                  <div className="max-h-32 space-y-2 overflow-y-auto">
                    {brands.map((brand) => (
                      <div
                        key={brand.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`brand-${brand.id}`}
                          checked={
                            filters.brand_ids?.includes(brand.id) || false
                          }
                          onCheckedChange={() => toggleBrandFilter(brand.id)}
                        />
                        <Label
                          htmlFor={`brand-${brand.id}`}
                          className="text-sm"
                        >
                          {brand.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 상품 특성 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">상품 특성</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is-featured"
                        checked={filters.is_featured === true}
                        onCheckedChange={(checked) =>
                          updateFilters({
                            is_featured: checked ? true : undefined,
                          })
                        }
                      />
                      <Label htmlFor="is-featured" className="text-sm">
                        추천 상품
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is-new"
                        checked={filters.is_new === true}
                        onCheckedChange={(checked) =>
                          updateFilters({
                            is_new: checked ? true : undefined,
                          })
                        }
                      />
                      <Label htmlFor="is-new" className="text-sm">
                        신상품
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is-bestseller"
                        checked={filters.is_bestseller === true}
                        onCheckedChange={(checked) =>
                          updateFilters({
                            is_bestseller: checked ? true : undefined,
                          })
                        }
                      />
                      <Label htmlFor="is-bestseller" className="text-sm">
                        베스트셀러
                      </Label>
                    </div>
                  </div>
                </div>

                {/* 활성 상태 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">상태</Label>
                  <Select
                    value={
                      filters.is_active === undefined
                        ? "all"
                        : filters.is_active
                          ? "active"
                          : "inactive"
                    }
                    onValueChange={(value) =>
                      updateFilters({
                        is_active:
                          value === "all" ? undefined : value === "active",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="active">활성</SelectItem>
                      <SelectItem value="inactive">비활성</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 가격 범위 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">가격 범위</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="최소"
                      value={filters.price_min || ""}
                      onChange={(e) =>
                        updateFilters({
                          price_min: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                    <span className="flex items-center">~</span>
                    <Input
                      type="number"
                      placeholder="최대"
                      value={filters.price_max || ""}
                      onChange={(e) =>
                        updateFilters({
                          price_max: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* 활성 필터 표시 */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.category_ids?.map((categoryId) => {
            const category = categories.find((c) => c.id === categoryId);
            return category ? (
              <div
                key={categoryId}
                className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
              >
                {category.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCategoryFilter(categoryId)}
                  className="h-auto p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : null;
          })}

          {filters.brand_ids?.map((brandId) => {
            const brand = brands.find((b) => b.id === brandId);
            return brand ? (
              <div
                key={brandId}
                className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
              >
                {brand.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleBrandFilter(brandId)}
                  className="h-auto p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : null;
          })}

          {filters.is_featured && (
            <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
              추천 상품
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilters({ is_featured: undefined })}
                className="h-auto p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {filters.is_new && (
            <div className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
              신상품
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilters({ is_new: undefined })}
                className="h-auto p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {filters.is_bestseller && (
            <div className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700">
              베스트셀러
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilters({ is_bestseller: undefined })}
                className="h-auto p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
