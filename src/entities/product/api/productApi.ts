/**
 * Product API functions
 * Handles CRUD operations for products with proper FSD architecture
 */

import { supabase } from "@/shared/lib/supabase/client";
import {
  Product,
  ProductCreate,
  ProductUpdate,
  ProductDetail,
  ProductListItem,
  ProductFilter,
} from "../model";
import { Tables } from "@/shared/types/database.types";

export const productApi = {
  /**
   * 모든 활성 상품 조회 (필터링 및 정렬 지원)
   * @param filter 필터링 및 정렬 옵션
   * @returns 상품 목록
   */
  async getAll(filter: ProductFilter = {}): Promise<ProductListItem[]> {
    let query = supabase
      .from("vw_hk_products_summary") // 상품 요약 뷰 사용
      .select(
        `
        id,
        name,
        slug,
        short_description,
        base_price,
        sale_price,
        primary_image_url,
        is_featured,
        is_new,
        is_bestseller,
        category_name,
        brand_name,
        review_count,
        avg_rating,
        created_at
      `,
      )
      .eq("is_active", true);

    // 카테고리 필터
    if (filter.category_ids && filter.category_ids.length > 0) {
      query = query.in("category_id", filter.category_ids);
    }

    // 브랜드 필터
    if (filter.brand_ids && filter.brand_ids.length > 0) {
      query = query.in("brand_id", filter.brand_ids);
    }

    // 가격 범위 필터
    if (filter.price_min !== undefined) {
      query = query.gte("sale_price", filter.price_min);
    }
    if (filter.price_max !== undefined) {
      query = query.lte("sale_price", filter.price_max);
    }

    // 특성 필터
    if (filter.is_featured !== undefined) {
      query = query.eq("is_featured", filter.is_featured);
    }
    if (filter.is_new !== undefined) {
      query = query.eq("is_new", filter.is_new);
    }
    if (filter.is_bestseller !== undefined) {
      query = query.eq("is_bestseller", filter.is_bestseller);
    }

    // 소재 필터
    if (filter.materials && filter.materials.length > 0) {
      query = query.overlaps("materials", filter.materials);
    }

    // 검색 쿼리
    if (filter.search_query) {
      query = query.or(`
        name.ilike.%${filter.search_query}%,
        short_description.ilike.%${filter.search_query}%,
        search_keywords.cs.{${filter.search_query}}
      `);
    }

    // 정렬
    const sortBy = filter.sort_by || "created_at";
    const sortOrder =
      filter.sort_order === "asc" ? { ascending: true } : { ascending: false };

    switch (sortBy) {
      case "name":
        query = query.order("name", sortOrder);
        break;
      case "price":
        query = query.order("sale_price", sortOrder);
        break;
      case "popularity":
        query = query.order("review_count", sortOrder);
        break;
      default:
        query = query.order("created_at", sortOrder);
        break;
    }

    // 페이징
    if (filter.limit) {
      query = query.limit(filter.limit);
    }
    if (filter.offset) {
      query = query.range(
        filter.offset,
        filter.offset + (filter.limit || 10) - 1,
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`상품 목록 조회 실패: ${error.message}`);
    }

    return ((data as Tables<"vw_hk_products_summary">[]) || []).map((item) => ({
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
    }));
  },

  /**
   * 특정 상품 조회 (상세 정보 포함)
   * @param id 상품 ID
   * @returns 상품 상세 정보
   */
  async getById(id: string): Promise<ProductDetail | null> {
    const { data, error } = await supabase
      .from("hk_products")
      .select(
        `
        *,
        category:hk_categories(id, name, slug),
        brand:hk_brands(id, name, logo_url),
        images:hk_product_images(id, image_url, alt_text, sort_order, is_primary),
        variants:hk_product_variants(id, variant_sku, option_combinations, additional_price, stock_quantity, is_active)
      `,
      )
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`상품 조회 실패: ${error.message}`);
    }

    // 리뷰 통계 조회
    const { data: reviewStats } = await supabase
      .from("hk_product_reviews")
      .select("rating")
      .eq("product_id", id)
      .eq("is_approved", true);

    const reviewCount = reviewStats?.length || 0;
    const averageRating =
      reviewCount > 0
        ? reviewStats!.reduce((sum, review) => sum + review.rating, 0) /
          reviewCount
        : 0;

    // 재고 정보 조회
    const { data: inventoryData } = await supabase
      .from("hk_product_variants")
      .select("stock_quantity")
      .eq("product_id", id)
      .eq("is_active", true);

    const totalStock =
      inventoryData?.reduce(
        (sum, variant) => sum + (variant.stock_quantity || 0),
        0,
      ) || 0;

    return {
      ...data,
      reviews: {
        count: reviewCount,
        average_rating: averageRating,
      },
      inventory: {
        total_stock: totalStock,
        available_stock: totalStock,
      },
    };
  },

  /**
   * slug로 상품 조회
   * @param slug 상품 slug
   * @returns 상품 상세 정보
   */
  async getBySlug(slug: string): Promise<ProductDetail | null> {
    const { data, error } = await supabase
      .from("hk_products")
      .select("id")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return null;
    }

    return this.getById(data.id);
  },

  /**
   * 상품 생성
   * @param data 상품 생성 데이터
   * @returns 생성된 상품
   */
  async create(data: ProductCreate): Promise<Product> {
    const { data: result, error } = await supabase
      .from("hk_products")
      .insert({
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        category_id: data.category_id,
        brand_id: data.brand_id,
        short_description: data.short_description,
        long_description: data.long_description,
        base_price: data.base_price,
        sale_price: data.sale_price,
        cost_price: data.cost_price,
        weight: data.weight,
        dimensions: data.dimensions,
        materials: data.materials,
        care_instructions: data.care_instructions,
        warranty_period: data.warranty_period,
        is_featured: data.is_featured ?? false,
        is_new: data.is_new ?? false,
        is_bestseller: data.is_bestseller ?? false,
        is_active: data.is_active ?? true,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        search_keywords: data.search_keywords,
      })
      .select(
        `
        id,
        category_id,
        brand_id,
        name,
        slug,
        short_description,
        long_description,
        sku,
        base_price,
        sale_price,
        cost_price,
        weight,
        dimensions,
        materials,
        care_instructions,
        warranty_period,
        is_featured,
        is_new,
        is_bestseller,
        is_active,
        meta_title,
        meta_description,
        search_keywords,
        created_at,
        updated_at
      `,
      )
      .single();

    if (error) {
      // 중복 키 오류 처리
      if (error.code === "23505") {
        if (error.message.includes("slug")) {
          throw new Error("이미 사용 중인 슬러그입니다.");
        }
        if (error.message.includes("sku")) {
          throw new Error("이미 사용 중인 SKU입니다.");
        }
      }
      throw new Error(`상품 생성 실패: ${error.message}`);
    }

    return result;
  },

  /**
   * 상품 수정
   * @param id 상품 ID
   * @param data 수정 데이터
   * @returns 수정된 상품
   */
  async update(id: string, data: ProductUpdate): Promise<Product> {
    const { data: result, error } = await supabase
      .from("hk_products")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        id,
        category_id,
        brand_id,
        name,
        slug,
        short_description,
        long_description,
        sku,
        base_price,
        sale_price,
        cost_price,
        weight,
        dimensions,
        materials,
        care_instructions,
        warranty_period,
        is_featured,
        is_new,
        is_bestseller,
        is_active,
        meta_title,
        meta_description,
        search_keywords,
        created_at,
        updated_at
      `,
      )
      .single();

    if (error) {
      // 중복 키 오류 처리
      if (error.code === "23505") {
        if (error.message.includes("slug")) {
          throw new Error("이미 사용 중인 슬러그입니다.");
        }
        if (error.message.includes("sku")) {
          throw new Error("이미 사용 중인 SKU입니다.");
        }
      }
      throw new Error(`상품 수정 실패: ${error.message}`);
    }

    return result;
  },

  /**
   * 상품 삭제 (소프트 삭제 - is_active를 false로 변경)
   * @param id 상품 ID
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("hk_products")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      throw new Error(`상품 삭제 실패: ${error.message}`);
    }
  },

  /**
   * 특정 카테고리의 상품 조회
   * @param categoryId 카테고리 ID
   * @param filter 추가 필터 옵션
   * @returns 해당 카테고리의 상품 목록
   */
  async getByCategory(
    categoryId: string,
    filter: Omit<ProductFilter, "category_ids"> = {},
  ): Promise<ProductListItem[]> {
    return this.getAll({
      ...filter,
      category_ids: [categoryId],
    });
  },

  /**
   * 특정 브랜드의 상품 조회
   * @param brandId 브랜드 ID
   * @param filter 추가 필터 옵션
   * @returns 해당 브랜드의 상품 목록
   */
  async getByBrand(
    brandId: string,
    filter: Omit<ProductFilter, "brand_ids"> = {},
  ): Promise<ProductListItem[]> {
    return this.getAll({
      ...filter,
      brand_ids: [brandId],
    });
  },

  /**
   * 추천 상품 조회
   * @param limit 조회할 개수 (기본값: 8)
   * @returns 추천 상품 목록
   */
  async getFeatured(limit: number = 8): Promise<ProductListItem[]> {
    return this.getAll({
      is_featured: true,
      limit,
      sort_by: "created_at",
      sort_order: "desc",
    });
  },

  /**
   * 신상품 조회
   * @param limit 조회할 개수 (기본값: 8)
   * @returns 신상품 목록
   */
  async getNew(limit: number = 8): Promise<ProductListItem[]> {
    return this.getAll({
      is_new: true,
      limit,
      sort_by: "created_at",
      sort_order: "desc",
    });
  },

  /**
   * 베스트셀러 조회
   * @param limit 조회할 개수 (기본값: 8)
   * @returns 베스트셀러 목록
   */
  async getBestsellers(limit: number = 8): Promise<ProductListItem[]> {
    return this.getAll({
      is_bestseller: true,
      limit,
      sort_by: "popularity",
      sort_order: "desc",
    });
  },

  /**
   * SKU 중복 확인
   * @param sku 확인할 SKU
   * @param excludeId 제외할 상품 ID (수정시 자기 자신 제외용)
   * @returns 중복 여부
   */
  async checkSkuDuplicate(sku: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from("hk_products")
      .select("id")
      .eq("sku", sku)
      .limit(1);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`SKU 중복 확인 실패: ${error.message}`);
    }

    return (data && data.length > 0) || false;
  },

  /**
   * Slug 중복 확인
   * @param slug 확인할 slug
   * @param excludeId 제외할 상품 ID (수정시 자기 자신 제외용)
   * @returns 중복 여부
   */
  async checkSlugDuplicate(slug: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from("hk_products")
      .select("id")
      .eq("slug", slug)
      .limit(1);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Slug 중복 확인 실패: ${error.message}`);
    }

    return (data && data.length > 0) || false;
  },
};
