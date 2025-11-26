import { Tables } from "@/shared/types/database.types";
import { EntityCreate, EntityUpdate, EntityView } from "@/shared/types/entity";
import z from "zod";

// Database type aliases (Supabase 자동 생성 타입)
export type BrandRow = Tables<"hk_brands">;

// Frontend entity types (clean, without auto fields)
export type Brand = EntityView<BrandRow>;
export type BrandCreate = EntityCreate<BrandRow>;
export type BrandUpdate = EntityUpdate<BrandRow>;

export const brandCrateSchema = z
  .object({
    name: z.string().min(1, "브랜드명은 필수입니다."),
    is_active: z.boolean().default(true),
    slug: z.string().min(1, "URL 슬러그는 필수입니다"),
    description: z.string().nullable().optional(),
    logo_url: z.string().nullable().optional(),
    website_url: z.string().nullable().optional(),
  })
  .transform((data) => ({
    ...data,
    description: data.description?.trim() || null,
    logo_url: data.logo_url?.trim() || null,
    website_url: data.website_url?.trim() || null,
  }));

// 타입 정의
export type BrandFormData = z.input<typeof brandCrateSchema>; // transform 이전 타입
// export type BrandCreateOutput = z.output<typeof brandCrateSchema>; // transform 이후 타입

// React Query hooks export
export * from "./useBrandsQuery";
