/**
 * Category entity types for FSD architecture
 * Provides clean type definitions based on database schema
 */

import { z } from "zod";
import { Tables } from "@/shared/types/database.types";
import { EntityView, EntityCreate, EntityUpdate } from "@/shared/types/entity";

// Database type aliases (Supabase 자동 생성 타입)
export type CategoryRow = Tables<"hk_categories">;

// Frontend entity types (clean, without auto fields)
export type Category = EntityView<CategoryRow>;
export type CategoryCreate = EntityCreate<CategoryRow>;
export type CategoryUpdate = EntityUpdate<CategoryRow>;

// Zod 스키마 with 스마트 기본값
export const categoryCreateSchema = z
  .object({
    // 필수 필드
    name: z.string().min(1, "카테고리명을 입력해주세요"),
    slug: z
      .string()
      .min(1, "URL 슬러그는 필수입니다")
      .regex(/^[a-z0-9-]+$/, "슬러그는 소문자, 숫자, 하이픈만 사용 가능합니다"),

    // 선택 필드 with 기본값
    description: z.string().nullable().optional(),
    parent_category_id: z.string().nullable().optional(),
    image_url: z.string().nullable().optional(),
    meta_title: z.string().nullable().optional(),
    meta_description: z.string().nullable().optional(),

    // 기본값이 있는 필드
    sort_order: z
      .number()
      .int()
      .min(0, "정렬 순서는 0 이상이어야 합니다")
      .default(1),
    is_active: z.boolean().default(true),
  })
  .transform((data) => ({
    // 빈 문자열을 null로 변환 (DB 친화적)
    ...data,
    description: data.description?.trim() || null,
    parent_category_id: data.parent_category_id?.trim() || null,
    image_url: data.image_url?.trim() || null,
    meta_title: data.meta_title?.trim() || null,
    meta_description: data.meta_description?.trim() || null,
  }));

// 타입 정의
export type CategoryCreateInput = z.input<typeof categoryCreateSchema>; // transform 이전 타입
export type CategoryCreateOutput = z.output<typeof categoryCreateSchema>; // transform 이후 타입

// 폼용 타입 (transform 이전)
export type CategoryFormData = CategoryCreateInput;

// Tree structure for hierarchical display
export interface CategoryTreeNode extends Category {
  children?: CategoryTreeNode[];
  depth: number;
}
