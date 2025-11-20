/**
 * 데이터베이스 JSON 컬럼들의 구체적인 타입 정의
 * database.types.ts의 Json 타입을 실제 사용되는 구조로 대체
 */

// 1. 관리자 권한 시스템 관련 JSON 타입
export interface AdminPermissions {
  products?: string[];
  orders?: string[];
  users?: string[];
  reviews?: string[];
  coupons?: string[];
  analytics?: string[];
}

// 2. 상품 옵션 조합 JSON 타입 (hk_product_variants.option_combinations)
export interface ProductOptionCombinations {
  [optionGroupName: string]: string | number;
}

// 예시:
// {
//   "색상": "베이지",
//   "크기": "Large",
//   "소재": "패브릭"
// }

// 3. 상품 치수 정보 JSON 타입 (hk_products.dimensions)
export interface ProductDimensions {
  width?: number;
  height?: number;
  depth?: number;
  weight?: number;
  unit?: 'cm' | 'mm' | 'inch';
  weight_unit?: 'kg' | 'g' | 'lb';
  assembly_required?: boolean;
  package_dimensions?: {
    width: number;
    height: number;
    depth: number;
    weight: number;
  };
}

// 4. 주문 아이템 옵션 상세 JSON 타입 (hk_order_items.option_details)
export interface OrderItemOptionDetails {
  option_combinations?: ProductOptionCombinations;
  selected_options?: Array<{
    group_name: string;
    option_name: string;
    additional_price: number;
  }>;
  custom_requests?: string;
  special_instructions?: string;
}

// 5. 결제 상세 정보 JSON 타입 (hk_payments.payment_details)
export interface PaymentDetails {
  payment_method_type?: 'card' | 'bank_transfer' | 'mobile' | 'virtual_account';
  provider_name?: string;
  last_four_digits?: string;
  card_type?: 'credit' | 'debit';
  bank_name?: string;
  installment_months?: number;
  approval_number?: string;
  receipt_url?: string;
  vat_amount?: number;
  point_used?: number;
  coupon_discount?: number;
  transaction_id?: string;
}

// 6. 검색 필터 JSON 타입 (hk_search_logs.search_filters)
export interface SearchFilters {
  category_ids?: string[];
  brand_ids?: string[];
  price_range?: {
    min: number;
    max: number;
  };
  materials?: string[];
  colors?: string[];
  sizes?: string[];
  ratings?: number[];
  is_new?: boolean;
  is_bestseller?: boolean;
  is_featured?: boolean;
  in_stock_only?: boolean;
  sort_by?: 'name' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popularity';
  page?: number;
  limit?: number;
}

// 7. 관리자 활동 로그 JSON 타입 (hk_admin_activity_logs.new_values, old_values)
export interface AdminActivityLogValues {
  [field: string]: any;
  changed_fields?: string[];
  previous_state?: Record<string, any>;
  new_state?: Record<string, any>;
  change_reason?: string;
  affected_items_count?: number;
}

// 8. 통합된 JSON 타입 유니언
export type DatabaseJsonTypes =
  | AdminPermissions
  | ProductOptionCombinations
  | ProductDimensions
  | OrderItemOptionDetails
  | PaymentDetails
  | SearchFilters
  | AdminActivityLogValues;

// 9. 타입 가드 함수들
export const isAdminPermissions = (value: any): value is AdminPermissions => {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value.products !== undefined || 
     value.orders !== undefined || 
     value.users !== undefined ||
     value.reviews !== undefined ||
     value.coupons !== undefined ||
     value.analytics !== undefined)
  );
};

export const isProductOptionCombinations = (value: any): value is ProductOptionCombinations => {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every(v => typeof v === 'string' || typeof v === 'number')
  );
};

export const isProductDimensions = (value: any): value is ProductDimensions => {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value.width !== undefined || value.height !== undefined || value.depth !== undefined)
  );
};

export const isSearchFilters = (value: any): value is SearchFilters => {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value.category_ids !== undefined || 
     value.brand_ids !== undefined || 
     value.price_range !== undefined ||
     value.sort_by !== undefined)
  );
};

// 10. 기본값 상수들
export const DEFAULT_ADMIN_PERMISSIONS: AdminPermissions = {
  products: ['read'],
  orders: ['read'],
  users: ['read'],
  reviews: ['read'],
  coupons: ['read'],
  analytics: ['read']
};

export const SUPER_ADMIN_PERMISSIONS: AdminPermissions = {
  products: ['create', 'read', 'update', 'delete'],
  orders: ['read', 'update'],
  users: ['read', 'update'],
  reviews: ['read', 'approve', 'delete'],
  coupons: ['create', 'read', 'update', 'delete'],
  analytics: ['read']
};

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  sort_by: 'newest',
  page: 1,
  limit: 20,
  in_stock_only: true
};