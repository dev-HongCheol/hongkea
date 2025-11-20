import { AdminActivityLogValues, AdminPermissions, OrderItemOptionDetails, PaymentDetails, ProductOptionCombinations, ProductDimensions, SearchFilters } from "./database-json.types";
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      hk_admin_activity_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: AdminActivityLogValues | null
          old_values: AdminActivityLogValues | null
          target_id: string | null
          target_table: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: AdminActivityLogValues | null
          old_values?: AdminActivityLogValues | null
          target_id?: string | null
          target_table: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: AdminActivityLogValues | null
          old_values?: AdminActivityLogValues | null
          target_id?: string | null
          target_table?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hk_admin_activity_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "hk_admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      hk_admin_users: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          permissions: AdminPermissions | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: AdminPermissions | null
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: AdminPermissions | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hk_admin_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "hk_admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "hk_users"
            referencedColumns: ["id"]
          },
        ]
      }
      hk_brands: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
          updated_by: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
          updated_by?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
          updated_by?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hk_brands_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "hk_admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_brands_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "hk_admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      hk_cart_items: {
        Row: {
          added_price: number
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          session_id: string | null
          updated_at: string | null
          user_id: string | null
          variant_id: string | null
        }
        Insert: {
          added_price: number
          created_at?: string | null
          id?: string
          product_id: string
          quantity: number
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          variant_id?: string | null
        }
        Update: {
          added_price?: number
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hk_cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "hk_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "vw_hk_products_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "hk_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "hk_product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      hk_categories: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          parent_category_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          parent_category_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          parent_category_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hk_categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "hk_admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "hk_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_categories_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "hk_admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      hk_coupons: {
        Row: {
          applicable_categories: string[] | null
          applicable_products: string[] | null
          code: string
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          maximum_discount_amount: number | null
          minimum_order_amount: number | null
          name: string
          updated_at: string | null
          usage_limit: number | null
          usage_limit_per_user: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_categories?: string[] | null
          applicable_products?: string[] | null
          code: string
          created_at?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          maximum_discount_amount?: number | null
          minimum_order_amount?: number | null
          name: string
          updated_at?: string | null
          usage_limit?: number | null
          usage_limit_per_user?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_categories?: string[] | null
          applicable_products?: string[] | null
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          maximum_discount_amount?: number | null
          minimum_order_amount?: number | null
          name?: string
          updated_at?: string | null
          usage_limit?: number | null
          usage_limit_per_user?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      hk_order_items: {
        Row: {
          created_at: string | null
          id: string
          option_details: OrderItemOptionDetails | null
          order_id: string
          product_id: string
          product_name: string
          product_sku: string
          quantity: number
          total_price: number
          unit_price: number
          variant_id: string | null
          variant_sku: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_details?: OrderItemOptionDetails | null
          order_id: string
          product_id: string
          product_name: string
          product_sku: string
          quantity: number
          total_price: number
          unit_price: number
          variant_id?: string | null
          variant_sku?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          option_details?: OrderItemOptionDetails | null
          order_id?: string
          product_id?: string
          product_name?: string
          product_sku?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          variant_id?: string | null
          variant_sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hk_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "hk_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "hk_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "vw_hk_products_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "hk_product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      hk_orders: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          delivered_at: string | null
          discount_amount: number | null
          guest_email: string | null
          id: string
          order_notes: string | null
          order_number: string
          shipped_at: string | null
          shipping_address_line1: string
          shipping_address_line2: string | null
          shipping_amount: number | null
          shipping_city: string
          shipping_country: string | null
          shipping_name: string
          shipping_notes: string | null
          shipping_phone: string
          shipping_postal_code: string
          shipping_state: string
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal_amount: number
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          delivered_at?: string | null
          discount_amount?: number | null
          guest_email?: string | null
          id?: string
          order_notes?: string | null
          order_number: string
          shipped_at?: string | null
          shipping_address_line1: string
          shipping_address_line2?: string | null
          shipping_amount?: number | null
          shipping_city: string
          shipping_country?: string | null
          shipping_name: string
          shipping_notes?: string | null
          shipping_phone: string
          shipping_postal_code: string
          shipping_state: string
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal_amount: number
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          delivered_at?: string | null
          discount_amount?: number | null
          guest_email?: string | null
          id?: string
          order_notes?: string | null
          order_number?: string
          shipped_at?: string | null
          shipping_address_line1?: string
          shipping_address_line2?: string | null
          shipping_amount?: number | null
          shipping_city?: string
          shipping_country?: string | null
          shipping_name?: string
          shipping_notes?: string | null
          shipping_phone?: string
          shipping_postal_code?: string
          shipping_state?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal_amount?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hk_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "hk_users"
            referencedColumns: ["id"]
          },
        ]
      }
      hk_payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          failed_at: string | null
          failure_reason: string | null
          id: string
          order_id: string
          payment_details: PaymentDetails | null
          payment_method: string
          payment_provider: string | null
          processed_at: string | null
          provider_payment_id: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          order_id: string
          payment_details?: PaymentDetails | null
          payment_method: string
          payment_provider?: string | null
          processed_at?: string | null
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          order_id?: string
          payment_details?: PaymentDetails | null
          payment_method?: string
          payment_provider?: string | null
          processed_at?: string | null
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "hk_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "hk_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      hk_product_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string
          sort_order: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id: string
          sort_order?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hk_product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "hk_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "vw_hk_products_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      hk_product_option_groups: {
        Row: {
          created_at: string | null
          display_type: string | null
          id: string
          is_required: boolean | null
          name: string
          product_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          display_type?: string | null
          id?: string
          is_required?: boolean | null
          name: string
          product_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          display_type?: string | null
          id?: string
          is_required?: boolean | null
          name?: string
          product_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hk_product_option_groups_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "hk_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_product_option_groups_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "vw_hk_products_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      hk_product_option_values: {
        Row: {
          additional_price: number | null
          color_code: string | null
          created_at: string | null
          display_name: string | null
          id: string
          is_active: boolean | null
          option_group_id: string
          sort_order: number | null
          value: string
        }
        Insert: {
          additional_price?: number | null
          color_code?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          option_group_id: string
          sort_order?: number | null
          value: string
        }
        Update: {
          additional_price?: number | null
          color_code?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          option_group_id?: string
          sort_order?: number | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "hk_product_option_values_option_group_id_fkey"
            columns: ["option_group_id"]
            isOneToOne: false
            referencedRelation: "hk_product_option_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      hk_product_reviews: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          content: string
          created_at: string | null
          helpful_count: number | null
          id: string
          image_urls: string[] | null
          is_approved: boolean | null
          is_recommended: boolean | null
          not_helpful_count: number | null
          order_item_id: string | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          content: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          image_urls?: string[] | null
          is_approved?: boolean | null
          is_recommended?: boolean | null
          not_helpful_count?: number | null
          order_item_id?: string | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          content?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          image_urls?: string[] | null
          is_approved?: boolean | null
          is_recommended?: boolean | null
          not_helpful_count?: number | null
          order_item_id?: string | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hk_product_reviews_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "hk_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_product_reviews_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "hk_order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "hk_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "vw_hk_products_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_product_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "hk_users"
            referencedColumns: ["id"]
          },
        ]
      }
      hk_product_variants: {
        Row: {
          additional_price: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          low_stock_threshold: number | null
          option_combinations: ProductOptionCombinations
          product_id: string
          reserved_quantity: number | null
          stock_quantity: number
          updated_at: string | null
          variant_sku: string
          weight: number | null
        }
        Insert: {
          additional_price?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          low_stock_threshold?: number | null
          option_combinations: ProductOptionCombinations
          product_id: string
          reserved_quantity?: number | null
          stock_quantity?: number
          updated_at?: string | null
          variant_sku: string
          weight?: number | null
        }
        Update: {
          additional_price?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          low_stock_threshold?: number | null
          option_combinations?: ProductOptionCombinations
          product_id?: string
          reserved_quantity?: number | null
          stock_quantity?: number
          updated_at?: string | null
          variant_sku?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hk_product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "hk_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "vw_hk_products_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      hk_product_views: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown
          product_id: string
          referrer_url: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown
          product_id: string
          referrer_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown
          product_id?: string
          referrer_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hk_product_views_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "hk_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_product_views_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "vw_hk_products_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_product_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "hk_users"
            referencedColumns: ["id"]
          },
        ]
      }
      hk_products: {
        Row: {
          base_price: number
          brand_id: string | null
          care_instructions: string | null
          category_id: string
          cost_price: number | null
          created_at: string | null
          created_by: string | null
          dimensions: ProductDimensions | null
          id: string
          is_active: boolean | null
          is_bestseller: boolean | null
          is_featured: boolean | null
          is_new: boolean | null
          long_description: string | null
          materials: string[] | null
          meta_description: string | null
          meta_title: string | null
          name: string
          sale_price: number | null
          search_keywords: string[] | null
          short_description: string | null
          sku: string
          slug: string
          updated_at: string | null
          updated_by: string | null
          warranty_period: number | null
          weight: number | null
        }
        Insert: {
          base_price: number
          brand_id?: string | null
          care_instructions?: string | null
          category_id: string
          cost_price?: number | null
          created_at?: string | null
          created_by?: string | null
          dimensions?: ProductDimensions | null
          id?: string
          is_active?: boolean | null
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          long_description?: string | null
          materials?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          sale_price?: number | null
          search_keywords?: string[] | null
          short_description?: string | null
          sku: string
          slug: string
          updated_at?: string | null
          updated_by?: string | null
          warranty_period?: number | null
          weight?: number | null
        }
        Update: {
          base_price?: number
          brand_id?: string | null
          care_instructions?: string | null
          category_id?: string
          cost_price?: number | null
          created_at?: string | null
          created_by?: string | null
          dimensions?: ProductDimensions | null
          id?: string
          is_active?: boolean | null
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          long_description?: string | null
          materials?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          sale_price?: number | null
          search_keywords?: string[] | null
          short_description?: string | null
          sku?: string
          slug?: string
          updated_at?: string | null
          updated_by?: string | null
          warranty_period?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hk_products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "hk_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "hk_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "hk_admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_products_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "hk_admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      hk_review_votes: {
        Row: {
          created_at: string | null
          id: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_helpful?: boolean
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hk_review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "hk_product_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_review_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "hk_users"
            referencedColumns: ["id"]
          },
        ]
      }
      hk_search_logs: {
        Row: {
          clicked_product_id: string | null
          created_at: string | null
          id: string
          results_count: number | null
          search_filters: SearchFilters | null
          search_query: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          clicked_product_id?: string | null
          created_at?: string | null
          id?: string
          results_count?: number | null
          search_filters?: SearchFilters | null
          search_query: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_product_id?: string | null
          created_at?: string | null
          id?: string
          results_count?: number | null
          search_filters?: SearchFilters | null
          search_query?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hk_search_logs_clicked_product_id_fkey"
            columns: ["clicked_product_id"]
            isOneToOne: false
            referencedRelation: "hk_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_search_logs_clicked_product_id_fkey"
            columns: ["clicked_product_id"]
            isOneToOne: false
            referencedRelation: "vw_hk_products_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_search_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "hk_users"
            referencedColumns: ["id"]
          },
        ]
      }
      hk_system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          setting_key: string
          setting_type: string | null
          setting_value: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key: string
          setting_type?: string | null
          setting_value: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key?: string
          setting_type?: string | null
          setting_value?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hk_system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "hk_admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      hk_user_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          address_name: string | null
          city: string
          country: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          postal_code: string
          recipient_name: string
          recipient_phone: string
          state: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          address_name?: string | null
          city: string
          country?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          postal_code: string
          recipient_name: string
          recipient_phone: string
          state: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          address_name?: string | null
          city?: string
          country?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          postal_code?: string
          recipient_name?: string
          recipient_phone?: string
          state?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hk_user_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "hk_users"
            referencedColumns: ["id"]
          },
        ]
      }
      hk_user_coupon_usage: {
        Row: {
          coupon_id: string
          discount_amount: number
          id: string
          order_id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          discount_amount: number
          id?: string
          order_id: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          discount_amount?: number
          id?: string
          order_id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hk_user_coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "hk_coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_user_coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "hk_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_user_coupon_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "hk_users"
            referencedColumns: ["id"]
          },
        ]
      }
      hk_users: {
        Row: {
          birth_date: string | null
          created_at: string | null
          first_name: string | null
          gender: string | null
          id: string
          last_login_at: string | null
          last_name: string | null
          marketing_consent: boolean | null
          phone: string | null
          profile_image_url: string | null
          sms_consent: boolean | null
          updated_at: string | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string | null
          first_name?: string | null
          gender?: string | null
          id: string
          last_login_at?: string | null
          last_name?: string | null
          marketing_consent?: boolean | null
          phone?: string | null
          profile_image_url?: string | null
          sms_consent?: boolean | null
          updated_at?: string | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          last_login_at?: string | null
          last_name?: string | null
          marketing_consent?: boolean | null
          phone?: string | null
          profile_image_url?: string | null
          sms_consent?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hk_wishlists: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hk_wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "hk_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "vw_hk_products_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "hk_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_hk_order_statistics: {
        Row: {
          avg_order_value: number | null
          delivered_orders: number | null
          order_count: number | null
          order_date: string | null
          total_revenue: number | null
        }
        Relationships: []
      }
      vw_hk_products_summary: {
        Row: {
          avg_rating: number | null
          base_price: number | null
          brand_id: string | null
          brand_name: string | null
          care_instructions: string | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          cost_price: number | null
          created_at: string | null
          created_by: string | null
          dimensions: ProductDimensions | null
          id: string | null
          is_active: boolean | null
          is_bestseller: boolean | null
          is_featured: boolean | null
          is_new: boolean | null
          long_description: string | null
          materials: string[] | null
          meta_description: string | null
          meta_title: string | null
          name: string | null
          primary_image_url: string | null
          review_count: number | null
          sale_price: number | null
          search_keywords: string[] | null
          short_description: string | null
          sku: string | null
          slug: string | null
          total_stock: number | null
          updated_at: string | null
          updated_by: string | null
          variant_count: number | null
          warranty_period: number | null
          weight: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hk_products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "hk_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "hk_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "hk_admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hk_products_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "hk_admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_hk_user_social_accounts: {
        Row: {
          created_at: string | null
          id: string | null
          provider: string | null
          provider_email: string | null
          provider_name: string | null
          provider_picture: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          provider?: never
          provider_email?: never
          provider_name?: never
          provider_picture?: never
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          provider?: never
          provider_email?: never
          provider_name?: never
          provider_picture?: never
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      immutable_to_tsvector_english: { Args: { "": string }; Returns: unknown }
    }
    Enums: {
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "cancelled"
        | "refunded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
        "refunded",
      ],
    },
  },
} as const
