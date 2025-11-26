/**
 * Brand API functions
 * Handles CRUD operations for brands with proper FSD architecture
 */

import { supabase } from "@/shared/lib/supabase/client";
import {
  Brand,
  BrandCreate,
  BrandUpdate,
} from "../model";

export const brandApi = {
  /**
   * 모든 브랜드 조회
   * @returns 활성화된 브랜드 목록
   */
  async getAll(): Promise<Brand[]> {
    const { data, error } = await supabase
      .from("hk_brands")
      .select(
        `
        id,
        name,
        slug,
        description,
        logo_url,
        website_url,
        is_active
      `,
      )
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      throw new Error(`브랜드 조회 실패: ${error.message}`);
    }

    return data || [];
  },

  /**
   * 특정 브랜드 조회
   * @param id 브랜드 ID
   * @returns 브랜드 정보
   */
  async getById(id: string): Promise<Brand | null> {
    const { data, error } = await supabase
      .from("hk_brands")
      .select(
        `
        id,
        name,
        slug,
        description,
        logo_url,
        website_url,
        is_active
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`브랜드 조회 실패: ${error.message}`);
    }

    return data;
  },

  /**
   * 슬러그로 브랜드 조회
   * @param slug 브랜드 슬러그
   * @returns 브랜드 정보
   */
  async getBySlug(slug: string): Promise<Brand | null> {
    const { data, error } = await supabase
      .from("hk_brands")
      .select(
        `
        id,
        name,
        slug,
        description,
        logo_url,
        website_url,
        is_active
      `,
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`브랜드 조회 실패: ${error.message}`);
    }

    return data;
  },

  /**
   * 브랜드 생성
   * @param data 브랜드 생성 데이터
   * @returns 생성된 브랜드
   */
  async create(data: BrandCreate): Promise<Brand> {
    const { data: result, error } = await supabase
      .from("hk_brands")
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description,
        logo_url: data.logo_url,
        website_url: data.website_url,
        is_active: data.is_active ?? true,
      })
      .select(
        `
        id,
        name,
        slug,
        description,
        logo_url,
        website_url,
        is_active
      `,
      )
      .single();

    if (error) {
      throw new Error(`브랜드 생성 실패: ${error.message}`);
    }

    return result;
  },

  /**
   * 브랜드 수정
   * @param id 브랜드 ID
   * @param data 수정 데이터
   * @returns 수정된 브랜드
   */
  async update(id: string, data: BrandUpdate): Promise<Brand> {
    const { data: result, error } = await supabase
      .from("hk_brands")
      .update(data)
      .eq("id", id)
      .select(
        `
        id,
        name,
        slug,
        description,
        logo_url,
        website_url,
        is_active
      `,
      )
      .single();

    if (error) {
      throw new Error(`브랜드 수정 실패: ${error.message}`);
    }

    return result;
  },

  /**
   * 브랜드 삭제 (소프트 삭제 - is_active를 false로 변경)
   * @param id 브랜드 ID
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("hk_brands")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      throw new Error(`브랜드 삭제 실패: ${error.message}`);
    }
  },

  /**
   * 브랜드명 중복 검사
   * @param name 브랜드명
   * @param excludeId 제외할 ID (수정 시 사용)
   * @returns 중복 여부
   */
  async checkNameExists(name: string, excludeId?: string): Promise<boolean> {
    const query = supabase
      .from("hk_brands")
      .select("id")
      .eq("name", name);

    if (excludeId) {
      query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`브랜드명 중복 검사 실패: ${error.message}`);
    }

    return (data?.length ?? 0) > 0;
  },

  /**
   * 슬러그 중복 검사
   * @param slug 슬러그
   * @param excludeId 제외할 ID (수정 시 사용)
   * @returns 중복 여부
   */
  async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    const query = supabase
      .from("hk_brands")
      .select("id")
      .eq("slug", slug);

    if (excludeId) {
      query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`슬러그 중복 검사 실패: ${error.message}`);
    }

    return (data?.length ?? 0) > 0;
  },
};
