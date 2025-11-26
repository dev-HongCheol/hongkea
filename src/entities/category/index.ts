/**
 * Category entity barrel exports
 * FSD architecture compliant exports for category domain
 */

// Types
export type {
  Category,
  CategoryCreate,
  CategoryCreateInput,
  CategoryCreateOutput,
  CategoryFormData,
  CategoryRow,
  CategoryTreeNode,
  CategoryUpdate,
} from "./model";

// Validation schemas
export { categoryCreateSchema } from "./model";

// API functions
export { categoryApi } from "./api/categoryApi";

// React Query hooks
export {
  categoryQueryKeys,
  useCategoriesQuery,
  useCategoryChildrenQuery,
  useCategoryCreateMutation,
  useCategoryDeleteMutation,
  useCategoryQuery,
  useCategoryTreeQuery,
  useCategoryUpdateMutation,
} from "./model/useCategoriesQuery";
