/**
 * Product entity types for FSD architecture
 * Provides clean type definitions based on database schema
 */

import { Tables } from "@/shared/types/database.types";
import { EntityCreate, EntityUpdate, EntityView } from "@/shared/types/entity";
import { z } from "zod";

// Database type aliases (Supabase 자동 생성 타입)
export type ProductRow = Tables<"hk_products">;

// Frontend entity types (clean, without auto fields)
export type Product = EntityView<ProductRow>;
export type ProductCreate = EntityCreate<ProductRow>;
export type ProductUpdate = EntityUpdate<ProductRow>;

// Zod validation schemas with smart defaults
export const productCreateSchema = z
  .object({
    // 필수 필드
    name: z.string().min(1, "상품명을 입력해주세요"),
    slug: z
      .string()
      .min(1, "URL 슬러그는 필수입니다")
      .regex(/^[a-z0-9-]+$/, "슬러그는 소문자, 숫자, 하이픈만 사용 가능합니다"),
    sku: z
      .string()
      .min(1, "상품 코드(SKU)를 입력해주세요")
      .regex(
        /^[A-Z0-9-_]+$/,
        "SKU는 대문자, 숫자, 하이픈, 언더스코어만 사용 가능합니다",
      ),
    category_id: z.string().uuid("올바른 카테고리를 선택해주세요"),
    base_price: z
      .number()
      .positive("기본 가격은 0보다 커야 합니다")
      .max(99999999.99, "가격이 너무 큽니다"),

    // 선택 필드
    brand_id: z.string().uuid().nullable().optional(),
    short_description: z
      .string()
      .max(500, "간단 설명은 500자 이내로 입력해주세요")
      .nullable()
      .optional(),
    long_description: z.string().nullable().optional(),
    sale_price: z
      .number()
      .positive("판매 가격은 0보다 커야 합니다")
      .max(99999999.99, "가격이 너무 큽니다")
      .nullable()
      .optional(),
    cost_price: z
      .number()
      .positive("원가는 0보다 커야 합니다")
      .max(99999999.99, "가격이 너무 큽니다")
      .nullable()
      .optional(),
    weight: z
      .number()
      .positive("무게는 0보다 커야 합니다")
      .max(9999.99, "무게가 너무 큽니다")
      .nullable()
      .optional(),
    care_instructions: z.string().nullable().optional(),
    warranty_period: z
      .number()
      .int("보증 기간은 정수여야 합니다")
      .min(0, "보증 기간은 0 이상이어야 합니다")
      .max(120, "보증 기간은 120개월 이내여야 합니다")
      .nullable()
      .optional(),
    meta_title: z
      .string()
      .max(255, "메타 제목은 255자 이내로 입력해주세요")
      .nullable()
      .optional(),
    meta_description: z
      .string()
      .max(500, "메타 설명은 500자 이내로 입력해주세요")
      .nullable()
      .optional(),

    // 배열 필드
    materials: z
      .array(z.string().min(1, "소재명을 입력해주세요"))
      .nullable()
      .optional(),
    search_keywords: z
      .array(z.string().min(1, "키워드를 입력해주세요"))
      .nullable()
      .optional(),

    // 치수 정보 (JSONB)
    dimensions: z
      .object({
        width: z.number().positive("가로 크기는 0보다 커야 합니다").optional(),
        height: z.number().positive("세로 크기는 0보다 커야 합니다").optional(),
        depth: z.number().positive("깊이는 0보다 커야 합니다").optional(),
      })
      .nullable()
      .optional(),

    // 기본값이 있는 필드
    is_featured: z.boolean().default(false),
    is_new: z.boolean().default(false),
    is_bestseller: z.boolean().default(false),
    is_active: z.boolean().default(true),
  })
  .transform((data) => ({
    // 빈 문자열을 null로 변환 (DB 친화적)
    ...data,
    brand_id: data.brand_id?.trim() || null,
    short_description: data.short_description?.trim() || null,
    long_description: data.long_description?.trim() || null,
    care_instructions: data.care_instructions?.trim() || null,
    meta_title: data.meta_title?.trim() || null,
    meta_description: data.meta_description?.trim() || null,

    // 빈 배열을 null로 변환
    materials:
      data.materials && data.materials.length > 0
        ? data.materials.filter((m) => m.trim()).map((m) => m.trim())
        : null,
    search_keywords:
      data.search_keywords && data.search_keywords.length > 0
        ? data.search_keywords.filter((k) => k.trim()).map((k) => k.trim())
        : null,

    // 치수 정보 정제
    dimensions:
      data.dimensions &&
      Object.values(data.dimensions).some((v) => v !== undefined && v > 0)
        ? data.dimensions
        : null,
    // null 값 유지 (선택적 필드는 없으면 null)
    cost_price: data.cost_price || null,
    sale_price: data.sale_price || null,
    weight: data.weight || null,
    warranty_period: data.warranty_period || null,
  }))
  .refine(
    (data) => {
      // 판매가격이 있으면 기본가격보다 낮아야 함
      if (data.sale_price && data.sale_price >= data.base_price) {
        return false;
      }
      return true;
    },
    {
      message: "판매 가격은 기본 가격보다 낮아야 합니다",
      path: ["sale_price"],
    },
  )
  .refine(
    (data) => {
      // 원가가 있으면 판매가격(또는 기본가격)보다 낮아야 함
      if (data.cost_price) {
        const sellingPrice = data.sale_price || data.base_price;
        if (data.cost_price >= sellingPrice) {
          return false;
        }
      }
      return true;
    },
    {
      message: "원가는 판매 가격보다 낮아야 합니다",
      path: ["cost_price"],
    },
  );

// 타입 정의
export type ProductCreateInput = z.input<typeof productCreateSchema>; // transform 이전 타입
export type ProductCreateOutput = z.output<typeof productCreateSchema>; // transform 이후 타입

// 폼용 타입 (transform 이전)
export type ProductFormData = ProductCreateInput;

// Database type imports (기존 테이블 타입 재사용)
export type ProductImage = EntityView<Tables<"hk_product_images">>;
export type ProductImageCreate = EntityCreate<Tables<"hk_product_images">>;
export type ProductImageUpdate = EntityUpdate<Tables<"hk_product_images">>;
export type ProductOptionGroup = Tables<"hk_product_option_groups">;
export type ProductOptionValue = Tables<"hk_product_option_values">;
export type ProductVariant = EntityView<Tables<"hk_product_variants">>;

// 관리자 제품 등록을 위한 이미지 업로드 타입
export interface ProductImageUpload {
  file: File;
  alt_text?: string;
  is_primary?: boolean;
  sort_order?: number;
}

// 이미지 URL 변환이 포함된 타입 (프론트엔드 사용)
export type ProductImageWithUrl = Omit<ProductImage, "product_id"> & {
  public_url: string; // Supabase Storage에서 생성된 공개 URL
};

// 제품 상세 정보 (관계 데이터 포함)
export interface ProductDetail extends Product {
  category: {
    id: string;
    name: string;
    slug: string;
  };
  brand: {
    id: string;
    name: string;
    logo_url: string | null;
  } | null;
  images: ProductImageWithUrl[];
  variants: Partial<Omit<ProductVariant, "product_id">>[];
  reviews: {
    count: number;
    average_rating: number;
  };
  inventory: {
    total_stock: number;
    available_stock: number;
  };
}

// 제품 리스트용 간소화된 타입
export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  short_description: string | null;
  base_price: number;
  sale_price: number | null;
  primary_image_url: string | null;
  is_featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  category_name: string | null;
  brand_name: string | null;
  review_count: number | null;
  average_rating: number | null;
  created_at: string | null;
}

// 상품 검색/필터용 타입
export interface ProductFilter {
  category_ids?: string[];
  brand_ids?: string[];
  price_min?: number;
  price_max?: number;
  materials?: string[];
  is_featured?: boolean;
  is_new?: boolean;
  is_bestseller?: boolean;
  search_query?: string;
  sort_by?: "created_at" | "name" | "price" | "popularity";
  sort_order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}
