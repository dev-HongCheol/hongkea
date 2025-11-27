/**
 * Product Management Feature
 * 
 * 제품 관리를 위한 Feature 모듈
 * - Virtualized Infinite Scrolling DataTable
 * - 고급 필터링 및 검색
 * - 일괄 작업 지원
 */

// Main Page Component
export { ProductManagementPage } from "./ui/ProductManagementPage";

// Individual Components
export { ProductTable } from "./ui/ProductTable";
export { ProductTableFilters } from "./ui/ProductTableFilters";
export { ProductTableActions } from "./ui/ProductTableActions";

// Hooks and State Management
export { useProductTable } from "./model/useProductTable";
export type { UseProductTableReturn } from "./model/useProductTable";

// API
export { productTableApi } from "./api/productTableApi";
export type {
  ProductTableFilter,
  ProductTableSorting,
  ProductTableParams,
  ProductTableResponse,
} from "./api/productTableApi";