"use client";

import CategoryForm from "@/features/category-management/ui/CategoryForm";
import CategoryTreeList from "@/features/category-management/ui/CategoryTreeList";

const CategoriesPage = () => {
  return (
    <div className="flex h-[calc(100dvh-40px)] gap-4 px-4 overflow-hidden">
      <div className="w-full max-w-[400px] overflow-hidden rounded-lg border">
        <div className="max-h-full overflow-auto p-2">
          <CategoryTreeList />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border">
        <div className="max-h-full overflow-auto p-4">
          <CategoryForm />
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;