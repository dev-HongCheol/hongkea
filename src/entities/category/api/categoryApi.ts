/**
 * Category API functions
 * Handles CRUD operations for categories with proper FSD architecture
 */

import { supabase } from "@/shared/lib/supabase/client";
import {
  Category,
  CategoryCreate,
  CategoryUpdate,
  CategoryTreeNode,
} from "../model";

export const categoryApi = {
  /**
   * 모든 카테고리 조회 (계층 구조)
   * @returns 계층 구조로 정리된 카테고리 목록
   */
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("hk_categories")
      .select(
        `
        id,
        name,
        slug,
        description,
        parent_category_id,
        image_url,
        meta_title,
        meta_description,
        sort_order,
        is_active
      `,
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      throw new Error(`카테고리 조회 실패: ${error.message}`);
    }

    return data || [];
  },

  /**
   * 특정 카테고리 조회
   * @param id 카테고리 ID
   * @returns 카테고리 정보
   */
  async getById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from("hk_categories")
      .select(
        `
        id,
        name,
        slug,
        description,
        parent_category_id,
        image_url,
        meta_title,
        meta_description,
        sort_order,
        is_active
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`카테고리 조회 실패: ${error.message}`);
    }

    return data;
  },

  /**
   * 카테고리를 계층 구조로 변환
   * @param categories 평면 카테고리 목록
   * @returns 계층 구조 카테고리 트리
   */
  buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
    const categoryMap = new Map<string, CategoryTreeNode>();
    const rootCategories: CategoryTreeNode[] = [];

    // 모든 카테고리를 맵에 저장
    categories.forEach((category) => {
      categoryMap.set(category.id, {
        ...category,
        children: [],
        depth: 0,
      });
    });

    // 부모-자식 관계 구성
    categories.forEach((category) => {
      const node = categoryMap.get(category.id)!;

      if (category.parent_category_id) {
        const parent = categoryMap.get(category.parent_category_id);
        if (parent) {
          node.depth = parent.depth + 1;
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    });

    return rootCategories;
  },

  /**
   * 카테고리 생성
   * @param data 카테고리 생성 데이터
   * @returns 생성된 카테고리
   */
  async create(data: CategoryCreate): Promise<Category> {
    const { data: result, error } = await supabase
      .from("hk_categories")
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description,
        parent_category_id: data.parent_category_id,
        image_url: data.image_url,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        sort_order: data.sort_order,
        is_active: data.is_active ?? true,
      })
      .select(
        `
        id,
        name,
        slug,
        description,
        parent_category_id,
        image_url,
        meta_title,
        meta_description,
        sort_order,
        is_active
      `,
      )
      .single();

    if (error) {
      throw new Error(`카테고리 생성 실패: ${error.message}`);
    }

    return result;
  },

  /**
   * 카테고리 수정
   * @param id 카테고리 ID
   * @param data 수정 데이터
   * @returns 수정된 카테고리
   */
  async update(id: string, data: CategoryUpdate): Promise<Category> {
    const { data: result, error } = await supabase
      .from("hk_categories")
      .update(data)
      .eq("id", id)
      .select(
        `
        id,
        name,
        slug,
        description,
        parent_category_id,
        image_url,
        meta_title,
        meta_description,
        sort_order,
        is_active
      `,
      )
      .single();

    if (error) {
      throw new Error(`카테고리 수정 실패: ${error.message}`);
    }

    return result;
  },

  /**
   * 카테고리 삭제 (소프트 삭제 - is_active를 false로 변경)
   * @param id 카테고리 ID
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("hk_categories")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      throw new Error(`카테고리 삭제 실패: ${error.message}`);
    }
  },

  /**
   * 특정 부모 카테고리의 자식 카테고리 조회
   * @param parentId 부모 카테고리 ID (null이면 최상위 카테고리)
   * @returns 자식 카테고리 목록
   */
  async getChildren(parentId: string | null = null): Promise<Category[]> {
    const query = supabase
      .from("hk_categories")
      .select(
        `
        id,
        name,
        slug,
        description,
        parent_category_id,
        image_url,
        meta_title,
        meta_description,
        sort_order,
        is_active
      `,
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (parentId === null) {
      query.is("parent_category_id", null);
    } else {
      query.eq("parent_category_id", parentId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`자식 카테고리 조회 실패: ${error.message}`);
    }

    return data || [];
  },
};
