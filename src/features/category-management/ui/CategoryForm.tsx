"use client";

// TODO: image_url 관련 처리 필요.

import {
  useCategoryCreateMutation,
  useCategoryUpdateMutation,
  categoryCreateSchema,
  CategoryFormData,
  useCategoryQuery,
} from "@/entities/category";
import {
  Button,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  Input,
  Label,
} from "@/shared/ui";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useCategoryStore } from "../lib/useCategoryStore";

const CategoryForm = () => {
  // Zustand store에서 선택된 카테고리 ID 가져오기
  const { selectedCategoryId, clearSelection } = useCategoryStore();

  // 선택된 카테고리 데이터 가져오기
  const { data: selectedCategory } = useCategoryQuery(selectedCategoryId);

  // 모드 결정: 선택된 카테고리가 있으면 수정 모드
  const isEditMode = !!selectedCategory;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: {
      // 필수 필드
      name: "",
      slug: "",

      // 선택 필드 (빈 문자열로 시작, transform에서 null로)
      description: "",
      parent_category_id: "",
      image_url: "",
      meta_title: "",
      meta_description: "",

      // 의미있는 기본값
      sort_order: 1,
      is_active: true,
    },
  });

  // 자동 slug 생성
  const nameValue = watch("name");
  useEffect(() => {
    if (nameValue) {
      const slug = nameValue
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // 특수문자 제거
        .replace(/\s+/g, "-") // 공백을 하이픈으로
        .replace(/^-+|-+$/g, "") // 앞뒤 하이픈 제거
        .trim();
      setValue("slug", slug);
    }
  }, [nameValue, setValue]);

  const createMutation = useCategoryCreateMutation();
  const updateMutation = useCategoryUpdateMutation();

  const onSubmit = async (data: CategoryFormData) => {
    try {
      // Transform form data through schema to match API requirements
      const transformedData = categoryCreateSchema.parse(data);

      if (isEditMode && selectedCategoryId) {
        // 수정 모드
        await updateMutation.mutateAsync({
          id: selectedCategoryId,
          data: transformedData,
        });
      } else {
        // 생성 모드
        await createMutation.mutateAsync(transformedData);
      }

      // 성공 시 폼 초기화
      if (!isEditMode) {
        reset();
      }
    } catch (err) {
      console.error(`카테고리 ${isEditMode ? "수정" : "생성"} 실패:`, err);
      // React Query의 error 상태는 mutation.error에서 관리됨
    }
  };

  // 선택된 카테고리가 변경되면 폼에 데이터 채우기
  useEffect(() => {
    if (selectedCategory) {
      reset({
        name: selectedCategory.name || "",
        slug: selectedCategory.slug || "",
        description: selectedCategory.description || "",
        parent_category_id: selectedCategory.parent_category_id || "",
        image_url: selectedCategory.image_url || "",
        meta_title: selectedCategory.meta_title || "",
        meta_description: selectedCategory.meta_description || "",
        sort_order: selectedCategory.sort_order || 1,
        is_active: selectedCategory.is_active ?? true,
      });
    }
  }, [selectedCategory, reset]);

  /**
   * Handle new category creation (reset form)
   */
  const handleNewCategory = () => {
    clearSelection();
    reset({
      name: "",
      slug: "",
      description: "",
      parent_category_id: "",
      image_url: "",
      meta_title: "",
      meta_description: "",
      sort_order: 1,
      is_active: true,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, (error) => console.log(error))}>
      <FieldGroup>
        <FieldSet>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <FieldLegend>
                {isEditMode ? "카테고리 수정" : "카테고리 등록"}
              </FieldLegend>
              <FieldDescription>
                {isEditMode
                  ? "선택된 카테고리를 수정하세요"
                  : "추가할 카테고리를 입력하세요"}
              </FieldDescription>
            </div>
            {isEditMode && (
              <Button
                type="button"
                variant="outline"
                onClick={handleNewCategory}
              >
                새 카테고리 추가
              </Button>
            )}
          </div>

          {/* 선택된 카테고리 표시 */}
          {selectedCategory && (
            <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3">
              <div className="text-sm font-medium text-blue-800">
                ID: {selectedCategory.id}
              </div>
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="name">카테고리명</FieldLabel>
            <Input
              id="name"
              placeholder="카테고리 명을 입력하세요."
              required
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="slug">슬러그</FieldLabel>
            <Input
              id="slug"
              placeholder="URL용 슬러그 (자동 생성)"
              {...register("slug")}
              readOnly
              className="bg-gray-50"
            />
            {errors.slug && (
              <p className="text-sm text-red-600">{errors.slug.message}</p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="description">설명</FieldLabel>
            <Textarea
              id="description"
              placeholder="카테고리의 설명을 작성해주세요."
              className="resize-none"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="sort_order">정렬 순서</FieldLabel>
              <Input
                id="sort_order"
                type="number"
                min={1}
                placeholder="0"
                {...register("sort_order", { valueAsNumber: true })}
              />
              {errors.sort_order && (
                <p className="text-sm text-red-600">
                  {errors.sort_order.message}
                </p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="is_active">활성화</FieldLabel>
              <div className="flex h-full items-center space-x-2">
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <Switch
                      id="is_active"
                      {...field}
                      checked={value ?? false}
                      onCheckedChange={onChange}
                    />
                  )}
                />
                <Label htmlFor="is_active">카테고리 표시</Label>
              </div>
              {errors.is_active && (
                <p className="text-sm text-red-600">
                  {errors.is_active.message}
                </p>
              )}
            </Field>
          </div>
          <FieldSeparator />

          <FieldSet>
            <FieldLegend>메타태그 정보</FieldLegend>
            <FieldDescription>
              HTML 메타태그 정보를 입력하세요.
            </FieldDescription>
            <Field>
              <FieldLabel htmlFor="meta_title">타이틀</FieldLabel>
              <Input
                id="meta_title"
                placeholder="타이틀을 입력하세요."
                required
                {...register("meta_title")}
              />
              {errors.meta_title && (
                <p className="text-sm text-red-600">
                  {errors.meta_title.message}
                </p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="meta_description">설명</FieldLabel>
              <Input
                id="meta_description"
                placeholder="설명을 입력하세요."
                required
                {...register("meta_description")}
              />
              {errors.meta_description && (
                <p className="text-sm text-red-600">
                  {errors.meta_description.message}
                </p>
              )}
            </Field>
          </FieldSet>

          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {isEditMode ? "카테고리 수정" : "카테고리 추가"}
            {(createMutation.isPending || updateMutation.isPending) && " 중..."}
          </Button>
        </FieldSet>
      </FieldGroup>
    </form>
  );
};

export default CategoryForm;
