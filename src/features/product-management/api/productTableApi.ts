/**
 * Product Management Table API
 * Infinite scrolling을 지원하는 제품 목록 조회 API
 */

import { supabase } from "@/shared/lib/supabase/client";
import { ProductListItem } from "@/entities/product/model";
import { Tables } from "@/shared/types/database.types";

export interface ProductTableFilter {
  search?: string;
  category_ids?: string[];
  brand_ids?: string[];
  is_featured?: boolean;
  is_new?: boolean;
  is_bestseller?: boolean;
  is_active?: boolean;
  price_min?: number;
  price_max?: number;
}

export interface ProductTableSorting {
  column:
    | "name"
    | "sku"
    | "base_price"
    | "sale_price"
    | "created_at"
    | "category_name"
    | "brand_name";
  direction: "asc" | "desc";
}

export interface ProductTableParams {
  pageSize?: number;
  cursor?: string; // created_at timestamp for cursor-based pagination
  filters?: ProductTableFilter;
  sorting?: ProductTableSorting;
}

export interface ProductTableResponse {
  items: ProductListItem[];
  nextCursor?: string;
  hasMore: boolean;
  total?: number;
}

export const productTableApi = {
  /**
   * 제품 목록 조회 (Infinite Scrolling용)
   */
  async getProducts({
    pageSize = 50,
    cursor,
    filters = {},
    sorting = { column: "created_at", direction: "desc" },
  }: ProductTableParams): Promise<ProductTableResponse> {
    let query = supabase.from("vw_hk_products_summary").select(
      `
        id,
        name,
        slug,
        sku,
        short_description,
        base_price,
        sale_price,
        primary_image_url,
        is_featured,
        is_new,
        is_bestseller,
        is_active,
        category_name,
        brand_name,
        review_count,
        avg_rating,
        total_stock,
        created_at
      `,
      { count: "exact" },
    );

    // 기본 필터 - 활성 상품만 (관리자는 is_active: false도 볼 수 있음)
    if (filters.is_active !== undefined) {
      query = query.eq("is_active", filters.is_active);
    } else {
      // 기본적으로 모든 상품 표시 (관리자 화면)
    }

    // 검색 필터
    if (filters.search) {
      query = query.or(`
        name.ilike.%${filters.search}%,
        sku.ilike.%${filters.search}%,
        short_description.ilike.%${filters.search}%
      `);
    }

    // 카테고리 필터
    if (filters.category_ids && filters.category_ids.length > 0) {
      query = query.in("category_id", filters.category_ids);
    }

    // 브랜드 필터
    if (filters.brand_ids && filters.brand_ids.length > 0) {
      query = query.in("brand_id", filters.brand_ids);
    }

    // 특성 필터
    if (filters.is_featured !== undefined) {
      query = query.eq("is_featured", filters.is_featured);
    }
    if (filters.is_new !== undefined) {
      query = query.eq("is_new", filters.is_new);
    }
    if (filters.is_bestseller !== undefined) {
      query = query.eq("is_bestseller", filters.is_bestseller);
    }

    // 가격 범위 필터
    if (filters.price_min !== undefined) {
      query = query.gte("sale_price", filters.price_min);
    }
    if (filters.price_max !== undefined) {
      query = query.lte("sale_price", filters.price_max);
    }

    // Cursor-based pagination
    if (cursor) {
      if (sorting.direction === "desc") {
        query = query.lt("created_at", cursor);
      } else {
        query = query.gt("created_at", cursor);
      }
    }

    // 정렬
    const isAscending = sorting.direction === "asc";
    switch (sorting.column) {
      case "name":
        query = query.order("name", { ascending: isAscending });
        break;
      case "sku":
        query = query.order("sku", { ascending: isAscending });
        break;
      case "base_price":
        query = query.order("base_price", { ascending: isAscending });
        break;
      case "sale_price":
        query = query.order("sale_price", { ascending: isAscending });
        break;
      case "category_name":
        query = query.order("category_name", { ascending: isAscending });
        break;
      case "brand_name":
        query = query.order("brand_name", { ascending: isAscending });
        break;
      default:
        query = query.order("created_at", { ascending: isAscending });
        break;
    }

    // 보조 정렬 (일관된 결과를 위해)
    if (sorting.column !== "created_at") {
      query = query.order("created_at", { ascending: false });
    }

    // 페이지 크기 + 1 (hasMore 판단용)
    query = query.limit(pageSize + 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`제품 목록 조회 실패: ${error.message}`);
    }

    const items = (data as Tables<"vw_hk_products_summary">[]) || [];
    const hasMore = items.length > pageSize;
    const actualItems = hasMore ? items.slice(0, pageSize) : items;

    // 다음 커서는 마지막 항목의 created_at
    const nextCursor =
      hasMore && actualItems.length > 0
        ? (actualItems[actualItems.length - 1].created_at ?? undefined)
        : undefined;

    return {
      items: actualItems.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        short_description: item.short_description,
        base_price: item.base_price,
        sale_price: item.sale_price,
        primary_image_url: item.primary_image_url,
        is_featured: item.is_featured,
        is_new: item.is_new,
        is_bestseller: item.is_bestseller,
        category_name: item.category_name,
        brand_name: item.brand_name,
        review_count: item.review_count,
        average_rating: item.avg_rating,
        created_at: item.created_at,
      })),
      nextCursor,
      hasMore,
      total: count || 0,
    };
  },

  /**'''qq  q 1A
   * 제품 일괄 업데이트
   */
  async bulkUpdateProducts(
    productIds: string[],
    updates: {
      is_active?: boolean;
      is_featured?: boolean;
      is_new?: boolean;
      is_bestseller?: boolean;
    },
  ): Promise<void> {
    const { error } = await supabase
      .from("hk_products")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .in("id", productIds);

    if (error) {
      throw new Error(`제품 일괄 업데이트 실패: ${error.message}`);
    }
  },

  /**
   * 제품 일괄 삭제 (소프트 삭제)
   */
  async bulkDeleteProducts(productIds: string[]): Promise<void> {
    const { error } = await supabase
      .from("hk_products")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .in("id", productIds);

    if (error) {
      throw new Error(`제품 일괄 삭제 실패: ${error.message}`);
    }
  },
};
