/**
 * Brand Selection Combobox
 * 검색 가능한 브랜드 선택 컴포넌트
 */

"use client";

import React, { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import { Brand } from "@/entities/brand/model";

interface BrandComboboxProps {
  brands: Brand[];
  value?: string;
  onValueChange: (brandId: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const BrandCombobox: React.FC<BrandComboboxProps> = ({
  brands,
  value,
  onValueChange,
  placeholder = "브랜드 선택...",
  disabled = false,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const selectedBrand = value ? brands.find((brand) => brand.id === value) : null;

  // 필터링된 브랜드 목록
  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (brandId: string) => {
    if (value === brandId) {
      onValueChange(undefined); // 선택 해제
    } else {
      onValueChange(brandId);
    }
    setOpen(false);
    setSearchValue("");
  };

  const handleClear = () => {
    onValueChange(undefined);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            !selectedBrand && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedBrand ? (
              <>
                {selectedBrand.logo_url && (
                  <img
                    src={selectedBrand.logo_url}
                    alt={selectedBrand.name}
                    className="h-4 w-4 rounded object-contain"
                  />
                )}
                <span className="truncate">{selectedBrand.name}</span>
              </>
            ) : (
              placeholder
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="브랜드 검색..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          <CommandList className="max-h-60">
            {selectedBrand && (
              <CommandGroup>
                <CommandItem
                  value="clear"
                  onSelect={handleClear}
                  className="text-muted-foreground"
                >
                  선택 해제
                </CommandItem>
              </CommandGroup>
            )}
            
            <CommandGroup>
              {filteredBrands.length > 0 ? (
                filteredBrands.map((brand) => (
                  <CommandItem
                    key={brand.id}
                    value={brand.id}
                    onSelect={handleSelect}
                    className="flex items-center gap-2"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === brand.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {brand.logo_url && (
                        <img
                          src={brand.logo_url}
                          alt={brand.name}
                          className="h-5 w-5 rounded object-contain flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{brand.name}</div>
                        {brand.description && (
                          <div className="truncate text-xs text-muted-foreground">
                            {brand.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))
              ) : (
                <CommandEmpty>
                  {searchValue 
                    ? "검색 결과가 없습니다." 
                    : "등록된 브랜드가 없습니다."
                  }
                </CommandEmpty>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};