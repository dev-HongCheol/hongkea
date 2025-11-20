/**
 * 데이터베이스 JSON 컬럼들의 Zod 스키마 정의
 * database-json.types.ts의 타입들에 대응하는 validation 스키마
 */

import { z } from "zod";
import type {
  AdminPermissions,
  AdminActivityLogValues,
  ProductDimensions,
  ProductOptionCombinations,
  OrderItemOptionDetails,
  PaymentDetails,
  SearchFilters,
} from "./database-json.types";

// 관리자 권한 스키마
export const adminPermissionsSchema: z.ZodSchema<AdminPermissions> = z.object({
  products: z.array(z.string()).optional(),
  orders: z.array(z.string()).optional(),
  users: z.array(z.string()).optional(),
  reviews: z.array(z.string()).optional(),
  coupons: z.array(z.string()).optional(),
  analytics: z.array(z.string()).optional(),
});

// 관리자 활동 로그 값 스키마
export const adminActivityLogValuesSchema: z.ZodSchema<AdminActivityLogValues> =
  z
    .object({
      changed_fields: z.array(z.string()).optional(),
      previous_state: z.record(z.string(), z.unknown()).optional(),
      new_state: z.record(z.string(), z.unknown()).optional(),
      change_reason: z.string().optional(),
      affected_items_count: z.number().optional(),
    })
    .catchall(z.any());

// 상품 치수 스키마
export const productDimensionsSchema: z.ZodSchema<ProductDimensions> = z.object({
  width: z.number().optional(),
  height: z.number().optional(),
  depth: z.number().optional(),
  weight: z.number().optional(),
  unit: z.enum(["cm", "mm", "inch"]).optional(),
  weight_unit: z.enum(["kg", "g", "lb"]).optional(),
  assembly_required: z.boolean().optional(),
  package_dimensions: z
    .object({
      width: z.number(),
      height: z.number(),
      depth: z.number(),
      weight: z.number(),
    })
    .optional(),
});

// 상품 옵션 조합 스키마
export const productOptionCombinationsSchema: z.ZodSchema<ProductOptionCombinations> =
  z.record(z.string(), z.union([z.string(), z.number()]));

// 주문 아이템 옵션 상세 스키마
export const orderItemOptionDetailsSchema: z.ZodSchema<OrderItemOptionDetails> =
  z.object({
    option_combinations: productOptionCombinationsSchema.optional(),
    selected_options: z
      .array(
        z.object({
          group_name: z.string(),
          option_name: z.string(),
          additional_price: z.number(),
        })
      )
      .optional(),
    custom_requests: z.string().optional(),
    special_instructions: z.string().optional(),
  });

// 결제 상세 정보 스키마
export const paymentDetailsSchema: z.ZodSchema<PaymentDetails> = z.object({
  payment_method_type: z
    .enum(["card", "bank_transfer", "mobile", "virtual_account"])
    .optional(),
  provider_name: z.string().optional(),
  last_four_digits: z.string().optional(),
  card_type: z.enum(["credit", "debit"]).optional(),
  bank_name: z.string().optional(),
  installment_months: z.number().optional(),
  approval_number: z.string().optional(),
  receipt_url: z.string().optional(),
  vat_amount: z.number().optional(),
  point_used: z.number().optional(),
  coupon_discount: z.number().optional(),
  transaction_id: z.string().optional(),
});

// 검색 필터 스키마
export const searchFiltersSchema: z.ZodSchema<SearchFilters> = z.object({
  category_ids: z.array(z.string()).optional(),
  brand_ids: z.array(z.string()).optional(),
  price_range: z
    .object({
      min: z.number(),
      max: z.number(),
    })
    .optional(),
  materials: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  ratings: z.array(z.number()).optional(),
  is_new: z.boolean().optional(),
  is_bestseller: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  in_stock_only: z.boolean().optional(),
  sort_by: z
    .enum(["name", "price_asc", "price_desc", "rating", "newest", "popularity"])
    .optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

// 스키마 매핑 (동적 처리를 위한)
export const JSON_SCHEMA_MAP = {
  AdminPermissions: adminPermissionsSchema,
  AdminActivityLogValues: adminActivityLogValuesSchema,
  ProductDimensions: productDimensionsSchema,
  ProductOptionCombinations: productOptionCombinationsSchema,
  OrderItemOptionDetails: orderItemOptionDetailsSchema,
  PaymentDetails: paymentDetailsSchema,
  SearchFilters: searchFiltersSchema,
} as const;

export type JsonSchemaType = keyof typeof JSON_SCHEMA_MAP;