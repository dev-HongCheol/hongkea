/**
 * Product Creation Form
 * 관리자 제품 등록 폼 컴포넌트
 */

"use client";

import { Brand } from "@/entities/brand/model";
import { Category, CategoryTreeNode } from "@/entities/category/model";
import {
  ProductCreate,
  productCreateSchema,
  ProductFormData,
  ProductImageUpload,
} from "@/entities/product/model";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Folder, Save } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { BrandCombobox } from "./BrandCombobox";
import { CategoryTreeDialog } from "./CategoryTreeDialog";
import { ImageUpload } from "./ImageUpload";

interface ProductCreateFormProps {
  categories: Category[];
  brands: Brand[];
  onSubmit: (
    data: ProductCreate,
    images: ProductImageUpload[],
  ) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export const ProductCreateForm: React.FC<ProductCreateFormProps> = ({
  categories,
  brands,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [images, setImages] = useState<ProductImageUpload[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryTreeNode | null>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      name: "",
      slug: "",
      sku: "",
      short_description: "",
      long_description: "",
      base_price: 0,
      sale_price: null,
      cost_price: null,
      weight: null,
      materials: [],
      care_instructions: "",
      warranty_period: null,
      meta_title: "",
      meta_description: "",
      search_keywords: [],
      is_featured: false,
      is_new: false,
      is_bestseller: false,
      is_active: true,
    },
  });

  const { watch, setValue } = form;
  const nameValue = watch("name");

  // 이름으로 slug 자동 생성
  React.useEffect(() => {
    if (nameValue) {
      const slug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setValue("slug", slug);
    }
  }, [nameValue, setValue]);

  // 카테고리 선택 핸들러
  const handleCategorySelect = (category: CategoryTreeNode) => {
    setSelectedCategory(category);
    setValue("category_id", category.id);
  };

  // 폼 제출 핸들러
  const handleFormSubmit = async (data: ProductFormData) => {
    if (!selectedCategory) {
      toast.error("카테고리를 선택해주세요.");
      return;
    }

    if (images.length === 0) {
      toast.error("최소 1개의 제품 이미지를 업로드해주세요.");
      return;
    }

    try {
      const validatedData = productCreateSchema.parse(data);
      await onSubmit(validatedData, images);
      toast.success("제품이 성공적으로 등록되었습니다.");
    } catch (error) {
      toast.error("제품 등록 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">제품 등록</h1>
          <p className="text-muted-foreground">새로운 제품을 등록하세요.</p>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              취소
            </Button>
          )}
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>제품의 기본 정보를 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>제품명 *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="제품명을 입력하세요" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="예: PRD-001" />
                      </FormControl>
                      <FormDescription>
                        제품 고유 식별 코드 (대문자, 숫자, 하이픈, 언더스코어만
                        사용)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL 슬러그 *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="url-slug" />
                    </FormControl>
                    <FormDescription>
                      제품명에서 자동으로 생성됩니다. 필요시 수정 가능합니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="short_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>간단 설명</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        placeholder="제품의 간단한 설명을 입력하세요"
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormDescription>
                      제품 목록에서 표시될 간단한 설명 (최대 500자)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="long_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>상세 설명</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        placeholder="제품의 상세한 설명을 입력하세요"
                        className="min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 분류 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>분류 정보</CardTitle>
              <CardDescription>
                제품의 카테고리와 브랜드를 설정하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">카테고리 *</label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCategoryDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <Folder className="h-4 w-4" />
                    {selectedCategory ? "카테고리 변경" : "카테고리 선택"}
                  </Button>
                  {selectedCategory && (
                    <Badge variant="secondary">{selectedCategory.name}</Badge>
                  )}
                </div>
                {form.formState.errors.category_id && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.category_id.message}
                  </p>
                )}
              </div>

              <FormField
                control={form.control}
                name="brand_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>브랜드</FormLabel>
                    <FormControl>
                      <BrandCombobox
                        brands={brands}
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                        placeholder="브랜드를 선택하세요 (선택사항)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 가격 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>가격 정보</CardTitle>
              <CardDescription>제품의 가격 정보를 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="base_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>기본 가격 *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          value={field.value || ""}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? 0
                                : parseFloat(e.target.value);
                            field.onChange(isNaN(value) ? 0 : value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sale_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>판매 가격</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? null
                                : parseFloat(e.target.value);
                            field.onChange(
                              value === null || isNaN(value) ? null : value,
                            );
                          }}
                        />
                      </FormControl>
                      <FormDescription>할인 가격 (선택사항)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cost_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>원가</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? null
                                : parseFloat(e.target.value);
                            field.onChange(
                              value === null || isNaN(value) ? null : value,
                            );
                          }}
                        />
                      </FormControl>
                      <FormDescription>내부 관리용 원가</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* 제품 이미지 */}
          <Card>
            <CardHeader>
              <CardTitle>제품 이미지</CardTitle>
              <CardDescription>
                제품 이미지를 업로드하세요. 첫 번째 이미지가 대표 이미지로
                설정됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                images={images}
                onImagesChange={setImages}
                maxImages={10}
                maxFileSize={5}
              />
            </CardContent>
          </Card>

          {/* 특성 설정 */}
          <Card>
            <CardHeader>
              <CardTitle>제품 특성</CardTitle>
              <CardDescription>
                제품의 특별한 속성을 설정하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>추천 제품</FormLabel>
                        <FormDescription>
                          홈페이지 추천 섹션에 표시됩니다
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_new"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>신상품</FormLabel>
                        <FormDescription>
                          신상품 배지가 표시됩니다
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_bestseller"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>베스트셀러</FormLabel>
                        <FormDescription>
                          베스트셀러 배지가 표시됩니다
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>활성 상태</FormLabel>
                        <FormDescription>
                          비활성화시 고객에게 노출되지 않습니다
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* 제출 버튼 */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="min-w-32">
              {isSubmitting ? (
                "등록 중..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  제품 등록
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* 카테고리 선택 다이얼로그 */}
      <CategoryTreeDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        onSelectCategory={handleCategorySelect}
        selectedCategoryId={selectedCategory?.id}
        categories={categories}
      />
    </div>
  );
};
