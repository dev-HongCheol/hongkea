/**
 * Product Creation Storage utilities
 * 제품 등록 시 이미지 업로드 관련 유틸리티
 */

import { supabase } from "@/shared/lib/supabase/client";
import { STORAGE_CONFIG } from "@/shared/config";

export const productImageStorage = {
  /**
   * 제품 이미지 업로드
   * @param file 업로드할 파일
   * @param productId 제품 ID (폴더 구분용)
   * @returns 업로드된 파일의 Storage 경로
   */
  async uploadImage(file: File, productId?: string): Promise<string> {
    try {
      // 파일 유효성 검사
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // 파일명 생성
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = crypto.randomUUID().slice(0, 8);
      
      // 제품 ID가 있으면 해당 폴더에, 없으면 temp 폴더에 저장
      const folder = productId || 'temp';
      const fileName = `${timestamp}-${randomId}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from(STORAGE_CONFIG.PRODUCTS)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw new Error(`이미지 업로드 실패: ${error.message}`);
      }

      return data.path;
    } catch (error) {
      console.error('Product image upload error:', error);
      throw error;
    }
  },

  /**
   * 여러 이미지 동시 업로드
   * @param files 업로드할 파일들
   * @param productId 제품 ID
   * @returns 업로드된 파일 경로들
   */
  async uploadMultipleImages(files: File[], productId?: string): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, productId));
    return Promise.all(uploadPromises);
  },

  /**
   * 이미지 파일 삭제
   * @param filePath Storage 파일 경로
   */
  async deleteImage(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(STORAGE_CONFIG.PRODUCTS)
        .remove([filePath]);

      if (error) {
        throw new Error(`이미지 삭제 실패: ${error.message}`);
      }
    } catch (error) {
      console.error('Product image delete error:', error);
      throw error;
    }
  },

  /**
   * 공개 URL 생성
   * @param filePath Storage 파일 경로
   * @returns 공개 접근 가능한 URL
   */
  getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(STORAGE_CONFIG.PRODUCTS)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  },

  /**
   * temp 폴더의 이미지를 제품 폴더로 이동
   * @param tempPath temp 경로
   * @param productId 제품 ID
   * @returns 새로운 파일 경로
   */
  async moveFromTempToProduct(tempPath: string, productId: string): Promise<string> {
    try {
      // 원본 파일 다운로드
      const { data: fileData, error: downloadError } = await supabase.storage
        .from(STORAGE_CONFIG.PRODUCTS)
        .download(tempPath);

      if (downloadError) {
        throw new Error(`파일 다운로드 실패: ${downloadError.message}`);
      }

      // 새 경로 생성
      const fileName = tempPath.split('/').pop();
      const newPath = `${productId}/${fileName}`;

      // 새 위치에 업로드
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_CONFIG.PRODUCTS)
        .upload(newPath, fileData, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`파일 이동 실패: ${uploadError.message}`);
      }

      // 기존 temp 파일 삭제
      await this.deleteImage(tempPath);

      return uploadData.path;
    } catch (error) {
      console.error('Move file error:', error);
      throw error;
    }
  },

  /**
   * 파일 유효성 검사
   * @param file 검사할 파일
   * @returns 유효성 검사 결과
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    // 파일 타입 검사
    if (!STORAGE_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `지원되지 않는 파일 형식입니다. (${STORAGE_CONFIG.ALLOWED_IMAGE_TYPES.join(', ')}만 허용)`
      };
    }

    // 파일 크기 검사
    const maxSizeInBytes = STORAGE_CONFIG.MAX_IMAGE_SIZE * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return {
        isValid: false,
        error: `파일 크기가 너무 큽니다. 최대 ${STORAGE_CONFIG.MAX_IMAGE_SIZE}MB까지 업로드 가능합니다.`
      };
    }

    return { isValid: true };
  },
};