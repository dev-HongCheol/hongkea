/**
 * Virtualized Product DataTable
 * TanStack Table + React Virtual을 사용한 고성능 제품 목록
 */

"use client";

import { ProductListItem } from "@/entities/product/model";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { productImageStorage } from "@/features/product-creation/lib/storage";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Badge,
  Edit,
  Eye,
  Star,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useMemo, useRef } from "react";
import { UseProductTableReturn } from "../model/useProductTable";

interface ProductTableProps {
  productTableData: UseProductTableReturn;
  onViewProduct?: (product: ProductListItem) => void;
  onEditProduct?: (product: ProductListItem) => void;
  className?: string;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  productTableData,
  onViewProduct,
  onEditProduct,
  className,
}) => {
  const {
    items,
    selectedRows,
    toggleRowSelection,
    toggleAllRowsSelection,
    sorting,
    updateSorting,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = productTableData;

  // 테이블 컨테이너 참조
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // 컬럼 정의
  const columns = useMemo<ColumnDef<ProductListItem>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => {
              toggleAllRowsSelection(!!value);
            }}
            aria-label="전체 선택"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedRows.includes(row.original.id)}
            onCheckedChange={() => toggleRowSelection(row.original.id)}
            aria-label={`${row.original.name} 선택`}
          />
        ),
        enableSorting: false,
        size: 50,
      },
      {
        accessorKey: "primary_image_url",
        header: "이미지",
        cell: ({ row }) => (
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100">
            {row.original.primary_image_url ? (
              <img
                src={productImageStorage.getPublicUrl(row.original.primary_image_url)}
                alt={row.original.name}
                className="h-full w-full rounded-md object-cover"
              />
            ) : (
              <div className="text-xs text-gray-400">No Image</div>
            )}
          </div>
        ),
        enableSorting: false,
        size: 80,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() =>
              updateSorting({
                column: "name",
                direction:
                  sorting.column === "name" && sorting.direction === "asc"
                    ? "desc"
                    : "asc",
              })
            }
            className="font-sm h-auto p-0"
          >
            제품명
            {sorting.column === "name" ? (
              sorting.direction === "asc" ? (
                <ArrowUp className="ml-1 size-3" />
              ) : (
                <ArrowDown className="ml-1 size-3" />
              )
            ) : (
              <ArrowUpDown className="ml-1 size-3" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="max-w-[200px]">
            <div className="font-sm truncate">{row.original.name}</div>
            {row.original.short_description && (
              <div className="truncate text-sm text-gray-500">
                {row.original.short_description}
              </div>
            )}
            <div className="mt-1 flex gap-1">
              {row.original.is_featured && (
                <>
                  <Badge className="size-3 text-yellow-600" />
                  추천 상품
                </>
              )}
              {row.original.is_new && (
                <>
                  <TrendingUp className="size-3 text-green-600" />
                  신상품
                </>
              )}
              {row.original.is_bestseller && (
                <>
                  <Star className="size-3 text-orange-600" />
                  베스트셀러
                </>
              )}
            </div>
          </div>
        ),
        size: 250,
      },
      {
        accessorKey: "sku",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() =>
              updateSorting({
                column: "sku",
                direction:
                  sorting.column === "sku" && sorting.direction === "asc"
                    ? "desc"
                    : "asc",
              })
            }
            className="font-sm h-auto p-0"
          >
            SKU
            {sorting.column === "sku" ? (
              sorting.direction === "asc" ? (
                <ArrowUp className="ml-1 size-3" />
              ) : (
                <ArrowDown className="ml-1 size-3" />
              )
            ) : (
              <ArrowUpDown className="ml-1 size-3" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">
            {row.original.sku}
          </code>
        ),
        size: 120,
      },
      {
        accessorKey: "category_name",
        header: "카테고리",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.category_name || "-"}</span>
        ),
        size: 120,
      },
      {
        accessorKey: "brand_name",
        header: "브랜드",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.brand_name || "노브랜드"}
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: "base_price",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() =>
              updateSorting({
                column: "base_price",
                direction:
                  sorting.column === "base_price" && sorting.direction === "asc"
                    ? "desc"
                    : "asc",
              })
            }
            className="font-sm h-auto p-0"
          >
            가격
            {sorting.column === "base_price" ? (
              sorting.direction === "asc" ? (
                <ArrowUp className="ml-1 size-3" />
              ) : (
                <ArrowDown className="ml-1 size-3" />
              )
            ) : (
              <ArrowUpDown className="ml-1 size-3" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-right">
            <div className="font-sm">
              ₩{row.original.base_price.toLocaleString()}
            </div>
            {row.original.sale_price && (
              <div className="text-sm text-red-600">
                ₩{row.original.sale_price.toLocaleString()}
              </div>
            )}
          </div>
        ),
        size: 120,
      },
      {
        accessorKey: "review_count",
        header: "리뷰",
        cell: ({ row }) => (
          <div className="text-center text-sm">
            <div>{row.original.review_count || 0}개</div>
            {row.original.average_rating && (
              <div className="text-yellow-600">
                ★ {row.original.average_rating.toFixed(1)}
              </div>
            )}
          </div>
        ),
        size: 80,
      },
      {
        id: "actions",
        header: "액션",
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewProduct?.(row.original)}
              className="h-8 w-8 p-0"
            >
              <Eye className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditProduct?.(row.original)}
              className="h-8 w-8 p-0"
            >
              <Edit className="size-3" />
            </Button>
          </div>
        ),
        enableSorting: false,
        size: 100,
      },
    ],
    [
      selectedRows,
      sorting,
      toggleRowSelection,
      toggleAllRowsSelection,
      updateSorting,
      onViewProduct,
      onEditProduct,
    ],
  );

  // TanStack Table 인스턴스
  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true, // 서버 사이드 정렬
  });

  // 가상화를 위한 행들
  const { rows } = table.getRowModel();

  // React Virtual 설정
  const virtualizer = useVirtualizer({
    count: hasNextPage ? rows.length + 1 : rows.length, // 로딩 행 추가
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 80, // 예상 행 높이
    overscan: 10, // 화면 밖 렌더링할 항목 수
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Infinite Scrolling 처리
  useEffect(() => {
    const [lastItem] = [...virtualItems].reverse();

    if (!lastItem) return;

    if (
      lastItem.index >= rows.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    virtualItems,
    rows.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  return (
    <div className={cn("flex flex-col", className)}>
      {/* 테이블 헤더 */}
      <div className="sticky top-0 z-10 border-b bg-white">
        <div
          className="grid"
          style={{
            gridTemplateColumns: columns
              .map((col) => `${col.size}px`)
              .join(" "),
          }}
        >
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => (
              <div
                key={header.id}
                className="flex h-8 items-center border-r px-4 text-left text-sm font-bold last:border-r-0"
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </div>
            )),
          )}
        </div>
      </div>

      {/* 가상화된 테이블 바디 */}
      <div
        ref={tableContainerRef}
        className="flex-1 overflow-auto"
        style={{ height: "600px" }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualItems.map((virtualItem) => {
            const isLoaderRow = virtualItem.index > rows.length - 1;
            const row = rows[virtualItem.index];

            return (
              <div
                key={virtualItem.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className="border-b"
              >
                {isLoaderRow ? (
                  hasNextPage ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-sm text-gray-500">로딩 중...</div>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-sm text-gray-500">
                        더 이상 데이터가 없습니다
                      </div>
                    </div>
                  )
                ) : (
                  <div
                    className="grid h-full"
                    style={{
                      gridTemplateColumns: columns
                        .map((col) => `${col.size}px`)
                        .join(" "),
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <div
                        key={cell.id}
                        className="flex items-center border-r px-4 last:border-r-0"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
