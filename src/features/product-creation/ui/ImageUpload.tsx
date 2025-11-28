/**
 * Product Image Upload Component
 * 제품 이미지 업로드 및 미리보기 기능
 */

"use client";

import { ProductImageUpload } from "@/entities/product/model";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { AlertCircle, Star, StarOff, Upload, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

interface ImageUploadProps {
  images: ProductImageUpload[];
  onImagesChange: (images: ProductImageUpload[]) => void;
  maxImages?: number;
  maxFileSize?: number; // MB
  acceptedFileTypes?: string[];
}

interface ImagePreview extends ProductImageUpload {
  id: string;
  previewUrl: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  maxFileSize = 5, // 5MB
  acceptedFileTypes = ["image/jpeg", "image/png", "image/webp"],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);

  // 파일 유효성 검사
  const validateFile = (file: File): boolean => {
    if (!acceptedFileTypes.includes(file.type)) {
      toast.error(
        `지원되지 않는 파일 형식입니다. (${acceptedFileTypes.join(", ")})`,
      );
      return false;
    }

    if (file.size > maxFileSize * 1024 * 1024) {
      toast.error(
        `파일 크기가 너무 큽니다. 최대 ${maxFileSize}MB까지 업로드 가능합니다.`,
      );
      return false;
    }

    return true;
  };

  // 파일 처리
  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    const totalImages = images.length + fileArray.length;

    if (totalImages > maxImages) {
      toast.error(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`);
      return;
    }

    const validFiles = fileArray.filter(validateFile);

    if (validFiles.length === 0) return;

    const newImageUploads: ProductImageUpload[] = validFiles.map(
      (file, index) => ({
        file,
        is_primary: images.length === 0 && index === 0, // 첫 번째 이미지를 기본으로 설정
        sort_order: images.length + index + 1,
      }),
    );

    // 미리보기 URL 생성
    const newPreviews: ImagePreview[] = await Promise.all(
      newImageUploads.map(async (upload, index) => {
        const previewUrl = URL.createObjectURL(upload.file);
        return {
          ...upload,
          id: `${Date.now()}-${index}`,
          previewUrl,
        };
      }),
    );

    setImagePreviews((prev) => [...prev, ...newPreviews]);
    onImagesChange([...images, ...newImageUploads]);
  };

  // 드래그 앤 드롭 핸들러
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  // 이미지 삭제
  const handleRemoveImage = (index: number) => {
    const imageToRemove = imagePreviews[index];
    if (imageToRemove?.previewUrl) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }

    const newImages = [...images];
    const newPreviews = [...imagePreviews];

    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    // 기본 이미지가 삭제된 경우, 첫 번째 이미지를 기본으로 설정
    if (images[index]?.is_primary && newImages.length > 0) {
      newImages[0].is_primary = true;
    }

    setImagePreviews(newPreviews);
    onImagesChange(newImages);
  };

  // 기본 이미지 설정
  const handleSetPrimary = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }));

    onImagesChange(newImages);
  };

  // Alt text 업데이트
  const handleAltTextChange = (index: number, altText: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], alt_text: altText };
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* 업로드 영역 */}
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors",
          dragActive && "border-blue-400 bg-blue-50",
          "hover:border-gray-400",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFileTypes.join(",")}
          onChange={handleFileSelect}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />

        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-medium">클릭하여 업로드</span> 하거나 파일을
            드래그하세요
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, WebP (최대 {maxFileSize}MB, {maxImages}개까지)
          </p>
        </div>
      </div>

      {/* 이미지 미리보기 그리드 */}
      {imagePreviews.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {imagePreviews.map((imagePreview, index) => (
            <Card key={imagePreview.id} className="relative overflow-hidden">
              <CardContent className="p-0">
                {/* 이미지 미리보기 */}
                <div className="relative aspect-square">
                  <img
                    src={imagePreview.previewUrl}
                    alt={imagePreview.alt_text || `제품 이미지 ${index + 1}`}
                    className="h-full w-full object-cover"
                  />

                  {/* 기본 이미지 표시 */}
                  {imagePreview.is_primary && (
                    <div className="absolute top-2 left-2 rounded-full bg-yellow-500 p-1">
                      <Star className="h-3 w-3 fill-current text-white" />
                    </div>
                  )}

                  {/* 삭제 버튼 */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  {/* 기본 이미지 설정 버튼 */}
                  {!imagePreview.is_primary && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-2 left-2 h-6 w-6 p-0"
                      onClick={() => handleSetPrimary(index)}
                      title="기본 이미지로 설정"
                    >
                      <StarOff className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Alt text 입력 */}
                <div className="p-2">
                  <Label htmlFor={`alt-${index}`} className="sr-only">
                    이미지 설명
                  </Label>
                  <Input
                    id={`alt-${index}`}
                    placeholder="이미지 설명 (선택사항)"
                    value={imagePreview.alt_text || ""}
                    onChange={(e) => handleAltTextChange(index, e.target.value)}
                    className="text-xs"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 이미지 업로드 가이드 */}
      {imagePreviews.length === 0 && (
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">
                이미지 업로드 안내
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>
                  • 첫 번째 업로드된 이미지가 자동으로 기본 이미지로 설정됩니다
                </li>
                <li>• ⭐ 버튼을 클릭하여 기본 이미지를 변경할 수 있습니다</li>
                <li>• 고품질의 제품 이미지를 업로드하세요</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
