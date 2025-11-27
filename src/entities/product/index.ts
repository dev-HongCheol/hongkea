/**
 * Product entity barrel exports
 * FSD architecture compliant exports for product domain
 */

// Types
export type {
  Product,
  ProductCreate,
  ProductCreateInput,
  ProductCreateOutput,
  ProductFormData,
  ProductRow,
  ProductUpdate,
  ProductDetail,
  ProductImage,
  ProductOptionGroup,
  ProductOptionValue,
  ProductVariant,
  ProductListItem,
  ProductFilter,
} from "./model";

// Validation schemas
export { productCreateSchema } from "./model";

// API functions
export { productApi } from "./api/productApi";

// React Query hooks
export {
  productQueryKeys,
  useProductsQuery,
  useProductQuery,
  useProductBySlugQuery,
  useFeaturedProductsQuery,
  useNewProductsQuery,
  useBestsellerProductsQuery,
  useProductsByCategoryQuery,
  useProductsByBrandQuery,
  useProductCreateMutation,
  useProductUpdateMutation,
  useProductDeleteMutation,
  useCheckSkuDuplicateQuery,
  useCheckSlugDuplicateQuery,
} from "./model/useProductsQuery";