"use client";

import {
  useBrandCreateMutation,
  useBrandUpdateMutation,
  brandCrateSchema,
  BrandFormData,
  useBrandQuery,
} from "@/entities/brand";
import {
  Button,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Input,
  Label,
} from "@/shared/ui";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { useBrandStore } from "../lib/useBrandStore";

const BrandForm = () => {
  const selectedBrandId = useBrandStore(state => state.selectedBrandId);
  const clearSelection = useBrandStore(state => state.clearSelection);

  const { data: selectedBrand } = useBrandQuery(selectedBrandId);

  const isEditMode = !!selectedBrand;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandCrateSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      logo_url: "",
      website_url: "",
      is_active: true,
    },
  });

  const nameValue = watch("name");
  useEffect(() => {
    if (nameValue) {
      const slug = nameValue
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/^-+|-+$/g, "")
        .trim();
      setValue("slug", slug);
    }
  }, [nameValue, setValue]);

  const createMutation = useBrandCreateMutation();
  const updateMutation = useBrandUpdateMutation();

  const onSubmit = useCallback(async (data: BrandFormData) => {
    try {
      const transformedData = brandCrateSchema.parse(data);

      if (isEditMode && selectedBrandId) {
        await updateMutation.mutateAsync({
          id: selectedBrandId,
          data: transformedData,
        });
      } else {
        await createMutation.mutateAsync(transformedData);
      }

      if (!isEditMode) {
        reset();
      }
    } catch (err) {
      console.error(`브랜드 ${isEditMode ? "수정" : "생성"} 실패:`, err);
    }
  }, [isEditMode, selectedBrandId, updateMutation, createMutation, reset]);

  useEffect(() => {
    if (selectedBrand) {
      reset({
        name: selectedBrand.name || "",
        slug: selectedBrand.slug || "",
        description: selectedBrand.description || "",
        logo_url: selectedBrand.logo_url || "",
        website_url: selectedBrand.website_url || "",
        is_active: selectedBrand.is_active ?? true,
      });
    }
  }, [selectedBrand, reset]);

  const handleNewBrand = useCallback(() => {
    clearSelection();
    reset({
      name: "",
      slug: "",
      description: "",
      logo_url: "",
      website_url: "",
      is_active: true,
    });
  }, [clearSelection, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit, (error) => console.log(error))}>
      <FieldGroup>
        <FieldSet>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <FieldLegend>
                {isEditMode ? "브랜드 수정" : "브랜드 등록"}
              </FieldLegend>
              <FieldDescription>
                {isEditMode
                  ? "선택된 브랜드를 수정하세요"
                  : "추가할 브랜드를 입력하세요"}
              </FieldDescription>
            </div>
            {isEditMode && (
              <Button type="button" variant="outline" onClick={handleNewBrand}>
                새 브랜드 추가
              </Button>
            )}
          </div>

          {selectedBrand && (
            <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3">
              <div className="text-sm font-medium text-blue-800">
                ID: {selectedBrand.id}
              </div>
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="name">브랜드명</FieldLabel>
            <Input
              id="name"
              placeholder="브랜드명을 입력하세요."
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
              placeholder="브랜드의 설명을 작성해주세요."
              className="resize-none"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="logo_url">로고 URL</FieldLabel>
            <Input
              id="logo_url"
              placeholder="로고 이미지 URL을 입력하세요."
              {...register("logo_url")}
            />
            {errors.logo_url && (
              <p className="text-sm text-red-600">{errors.logo_url.message}</p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="website_url">웹사이트 URL</FieldLabel>
            <Input
              id="website_url"
              placeholder="브랜드 웹사이트 URL을 입력하세요."
              {...register("website_url")}
            />
            {errors.website_url && (
              <p className="text-sm text-red-600">
                {errors.website_url.message}
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
              <Label htmlFor="is_active">브랜드 표시</Label>
            </div>
            {errors.is_active && (
              <p className="text-sm text-red-600">{errors.is_active.message}</p>
            )}
          </Field>

          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {isEditMode ? "브랜드 수정" : "브랜드 추가"}
            {(createMutation.isPending || updateMutation.isPending) && " 중..."}
          </Button>
        </FieldSet>
      </FieldGroup>
    </form>
  );
};

export default BrandForm;
