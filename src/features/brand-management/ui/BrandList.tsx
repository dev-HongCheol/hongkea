"use client";

import { useBrandsQuery } from "@/entities/brand";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@/shared/ui";
import { useBrandStore } from "../lib/useBrandStore";

const BrandList = () => {
  const { data: brands, isLoading, error } = useBrandsQuery();
  const selectedBrandId = useBrandStore(state => state.selectedBrandId);
  const setSelectedBrandId = useBrandStore(state => state.setSelectedBrandId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-gray-500">브랜드를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-red-500">
          브랜드를 불러올 수 없습니다: {error.message}
        </div>
      </div>
    );
  }

  if (!brands?.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-gray-500">등록된 브랜드가 없습니다.</div>
      </div>
    );
  }

  return (
    <ItemGroup>
        {brands.map((brand, index) => (
          <div key={brand.id}>
            <Item
              variant={selectedBrandId === brand.id ? "outline" : "default"}
              className={`cursor-pointer transition-colors ${
                selectedBrandId === brand.id
                  ? "bg-accent border-accent-foreground"
                  : "hover:bg-accent/50"
              }`}
              onClick={() => setSelectedBrandId(brand.id)}
            >
              <ItemContent>
                <ItemTitle>{brand.name}</ItemTitle>
                {brand.description && (
                  <ItemDescription>{brand.description}</ItemDescription>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  Slug: {brand.slug}
                  {brand.website_url && (
                    <span className="ml-2">
                      • <a href={brand.website_url} target="_blank" rel="noopener noreferrer" className="hover:underline">웹사이트</a>
                    </span>
                  )}
                </div>
              </ItemContent>
            </Item>
            {index < brands.length - 1 && <ItemSeparator />}
          </div>
        ))}
    </ItemGroup>
  );
};

export default BrandList;