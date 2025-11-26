/**
 * Zustand store for brand selection state management
 * Manages selected brand across components efficiently
 */

import { create } from "zustand";

interface BrandStore {
  selectedBrandId: string;
  setSelectedBrandId: (id: string) => void;
  clearSelection: () => void;
}

/**
 * Zustand store for managing selected brand state
 * Provides efficient state sharing across brand management components
 */
export const useBrandStore = create<BrandStore>((set) => ({
  selectedBrandId: "",
  
  /**
   * Set the selected brand ID
   * @param id - Brand ID to select
   */
  setSelectedBrandId: (id: string) => set({ selectedBrandId: id }),
  
  /**
   * Clear the current brand selection
   */
  clearSelection: () => set({ selectedBrandId: "" }),
}));