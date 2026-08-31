// ============================================================
// DATABASE TYPES — Generated from Supabase PostgreSQL schema
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: "customer" | "admin"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: "customer" | "admin"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: "customer" | "admin"
          updated_at?: string
        }
        Relationships: []
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          full_name: string
          phone: string
          city: string
          address_line: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          phone: string
          city: string
          address_line: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          full_name?: string
          phone?: string
          city?: string
          address_line?: string
          is_default?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      brands: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          logo_url?: string | null
          description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          parent_id: string | null
          icon: string | null
          image_url: string | null
          description: string | null
          display_order: number
          is_featured: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          parent_id?: string | null
          icon?: string | null
          image_url?: string | null
          description?: string | null
          display_order?: number
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          parent_id?: string | null
          icon?: string | null
          image_url?: string | null
          description?: string | null
          display_order?: number
          is_featured?: boolean
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          product_type: "book" | "stationery" | "school_supply" | "office" | "art" | "pack" | "other"
          price: number
          compare_at_price: number | null
          cost_price: number | null
          sku: string
          category_id: string
          brand_id: string | null
          stock_quantity: number
          min_stock_threshold: number
          featured_display_order: number | null
          is_featured: boolean
          is_bestseller: boolean
          is_new_arrival: boolean
          is_active: boolean
          needs_manual_image: boolean
          pending_image_source: string | null
          rating_avg: number
          review_count: number
          seo_title: string | null
          seo_description: string | null
          search_vector: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          product_type?: "book" | "stationery" | "school_supply" | "office" | "art" | "pack" | "other"
          price: number
          compare_at_price?: number | null
          cost_price?: number | null
          sku: string
          category_id: string
          brand_id?: string | null
          stock_quantity?: number
          min_stock_threshold?: number
          featured_display_order?: number | null
          is_featured?: boolean
          is_bestseller?: boolean
          is_new_arrival?: boolean
          is_active?: boolean
          needs_manual_image?: boolean
          pending_image_source?: string | null
          rating_avg?: number
          review_count?: number
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          product_type?: "book" | "stationery" | "school_supply" | "office" | "art" | "pack" | "other"
          price?: number
          compare_at_price?: number | null
          cost_price?: number | null
          sku?: string
          category_id?: string
          brand_id?: string | null
          stock_quantity?: number
          min_stock_threshold?: number
          featured_display_order?: number | null
          is_featured?: boolean
          is_bestseller?: boolean
          is_new_arrival?: boolean
          is_active?: boolean
          needs_manual_image?: boolean
          pending_image_source?: string | null
          rating_avg?: number
          review_count?: number
          seo_title?: string | null
          seo_description?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          }
        ]
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text: string | null
          display_order: number
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt_text?: string | null
          display_order?: number
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          url?: string
          alt_text?: string | null
          display_order?: number
          is_primary?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      stock_movements: {
        Row: {
          id: string
          product_id: string
          change_amount: number
          reason: "restock" | "sale" | "return" | "adjustment"
          admin_id: string | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          change_amount: number
          reason: "restock" | "sale" | "return" | "adjustment"
          admin_id?: string | null
          note?: string | null
          created_at?: string
        }
        Update: {
          product_id?: string
          change_amount?: number
          reason?: "restock" | "sale" | "return" | "adjustment"
          admin_id?: string | null
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      carts: {
        Row: {
          id: string
          user_id: string | null
          session_token: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string | null
          session_token?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          product_id: string
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          cart_id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          customer_name: string
          customer_phone: string
          customer_email: string | null
          status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
          subtotal: number
          shipping_cost: number
          discount_amount: number
          total: number
          payment_method: "cod"
          payment_status: "pending" | "paid" | "failed"
          shipping_address: Json
          coupon_code: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          user_id?: string | null
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          status?: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
          subtotal: number
          shipping_cost?: number
          discount_amount?: number
          total: number
          payment_method?: "cod"
          payment_status?: "pending" | "paid" | "failed"
          shipping_address: Json
          coupon_code?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
          payment_status?: "pending" | "paid" | "failed"
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name_snapshot: string
          price_snapshot: number
          quantity: number
          subtotal: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name_snapshot: string
          price_snapshot: number
          quantity: number
          subtotal: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          product_name_snapshot?: string
          price_snapshot?: number
          quantity?: number
          subtotal?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      order_status_history: {
        Row: {
          id: string
          order_id: string
          status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
          changed_by: string | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
          changed_by?: string | null
          note?: string | null
          created_at?: string
        }
        Update: {
          status?: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
          changed_by?: string | null
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      wishlist_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          title: string | null
          comment: string | null
          status: "pending" | "approved" | "rejected"
          is_verified_purchase: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          rating: number
          title?: string | null
          comment?: string | null
          status?: "pending" | "approved" | "rejected"
          is_verified_purchase?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: "pending" | "approved" | "rejected"
          is_verified_purchase?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          subscribed_at: string
        }
        Insert: {
          id?: string
          email: string
          subscribed_at?: string
        }
        Update: {
          email?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          id: string
          code: string
          type: "percentage" | "fixed"
          value: number
          min_order_amount: number
          max_uses: number | null
          times_used: number
          applies_to_category_ids: string[] | null
          applies_to_product_ids: string[] | null
          starts_at: string | null
          ends_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          type: "percentage" | "fixed"
          value: number
          min_order_amount?: number
          max_uses?: number | null
          times_used?: number
          applies_to_category_ids?: string[] | null
          applies_to_product_ids?: string[] | null
          starts_at?: string | null
          ends_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          code?: string
          type?: "percentage" | "fixed"
          value?: number
          min_order_amount?: number
          max_uses?: number | null
          times_used?: number
          is_active?: boolean
          starts_at?: string | null
          ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          cta_text: string | null
          cta_link: string | null
          image_url: string | null
          background_style: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          cta_text?: string | null
          cta_link?: string | null
          image_url?: string | null
          background_style?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          subtitle?: string | null
          cta_text?: string | null
          cta_link?: string | null
          image_url?: string | null
          background_style?: string | null
          display_order?: number
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      promo_tiles: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          link: string | null
          icon: string | null
          background_style: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          link?: string | null
          icon?: string | null
          background_style?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          subtitle?: string | null
          link?: string | null
          icon?: string | null
          background_style?: string | null
          display_order?: number
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          id: number
          store_name: string
          description: string | null
          logo_url: string | null
          contact_email: string | null
          contact_phone: string | null
          address: string | null
          delivery_zones: Json | null
          free_shipping_threshold: number
          cod_enabled: boolean
          social_links: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          store_name?: string
          description?: string | null
          logo_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          delivery_zones?: Json | null
          free_shipping_threshold?: number
          cod_enabled?: boolean
          social_links?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          store_name?: string
          description?: string | null
          logo_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          delivery_zones?: Json | null
          free_shipping_threshold?: number
          cod_enabled?: boolean
          social_links?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      validate_coupon: {
        Args: {
          p_code: string
          p_subtotal: number
        }
        Returns: Json
      }
      process_checkout_order: {
        Args: {
          p_user_id: string | null
          p_customer_name: string
          p_customer_phone: string
          p_customer_email: string | null
          p_shipping_address: Json
          p_items: Json
          p_coupon_code?: string | null
          p_notes?: string | null
          p_cart_id?: string | null
        }
        Returns: Json
      }
      cancel_order_and_restore_stock: {
        Args: {
          p_order_id: string
          p_admin_id?: string | null
          p_note?: string | null
        }
        Returns: Json
      }
    }
    Enums: {
      user_role: "customer" | "admin"
      product_type: "book" | "stationery" | "school_supply" | "office" | "art" | "pack" | "other"
      stock_reason: "restock" | "sale" | "return" | "adjustment"
      order_status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
      payment_method: "cod"
      payment_status: "pending" | "paid" | "failed"
      review_status: "pending" | "approved" | "rejected"
      coupon_type: "percentage" | "fixed"
    }
  }
}
