/**
 * Supabase Storage configuration
 * 스토리지 버킷명 및 관련 설정 관리
 */

export const STORAGE_CONFIG = {
  // Storage bucket names
  PRODUCTS: 'hk_products',
  CATEGORIES: 'hk_categories', 
  BRANDS: 'hk_brands',
  USERS: 'hk_users',
  
  // File size limits (MB)
  MAX_IMAGE_SIZE: 5,
  MAX_DOCUMENT_SIZE: 10,
  
  // Allowed file types
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain'],
} as const;