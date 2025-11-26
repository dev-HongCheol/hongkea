/**
 * Zustand store for category selection state management
 * Manages selected category across components efficiently
 */

import { create } from "zustand";

interface CategoryStore {
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
  clearSelection: () => void;
}

/**
 * Zustand store for managing selected category state
 * Provides efficient state sharing across category management components
 */
export const useCategoryStore = create<CategoryStore>((set) => ({
  selectedCategoryId: "",
  
  /**
   * Set the selected category ID
   * @param id - Category ID to select
   */
  setSelectedCategoryId: (id: string) => set({ selectedCategoryId: id }),
  
  /**
   * Clear the current category selection
   */
  clearSelection: () => set({ selectedCategoryId: "" }),
}));