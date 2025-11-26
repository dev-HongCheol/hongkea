"use client";

import BrandForm from "@/features/brand-management/ui/BrandForm";
import BrandList from "@/features/brand-management/ui/BrandList";

const BrandsPage = () => {
  return (
    <div className="flex h-[calc(100dvh-40px)] gap-4 px-4 overflow-hidden">
      <div className="w-full max-w-[400px] overflow-hidden rounded-lg border">
        <div className="max-h-full overflow-auto">
          <BrandList />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border">
        <div className="max-h-full overflow-auto p-4">
          <BrandForm />
        </div>
      </div>
    </div>
  );
};

export default BrandsPage;
