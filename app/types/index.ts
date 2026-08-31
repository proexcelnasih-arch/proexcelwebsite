// ============================================================
// APPLICATION TYPES
// ============================================================

import type { Database } from "./database"

// ── Row types (shortcuts) ────────────────────────────────────
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Category = Database["public"]["Tables"]["categories"]["Row"]
export type Brand = Database["public"]["Tables"]["brands"]["Row"]
export type Product = Database["public"]["Tables"]["products"]["Row"]
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"]
export type StockMovement = Database["public"]["Tables"]["stock_movements"]["Row"]
export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"]
export type Address = Database["public"]["Tables"]["addresses"]["Row"]
export type WishlistItem = Database["public"]["Tables"]["wishlist_items"]["Row"]
export type Review = Database["public"]["Tables"]["reviews"]["Row"]
export type Coupon = Database["public"]["Tables"]["coupons"]["Row"]
export type HeroSlide = Database["public"]["Tables"]["hero_slides"]["Row"]
export type PromoTile = Database["public"]["Tables"]["promo_tiles"]["Row"]
export type StoreSettings = Database["public"]["Tables"]["store_settings"]["Row"]

export interface ProductVariant {
  id: string
  product_id: string
  variant_type: "color" | "size" | "pack" | string
  label: string
  price_delta: number
  stock_quantity?: number
  display_order?: number
}

export interface RecentPurchase {
  id: string
  customer_first_name: string
  city: string
  product_name: string
  product_slug: string
  product_image?: string | null
  time_ago_text: string
}

// ── Enriched types ───────────────────────────────────────────

export type ProductWithDetails = Product & {
  category?: Category | null
  brand?: Brand | null
  images: ProductImage[]
  stock_movements?: StockMovement[]
  discount_percentage?: number | null
  average_rating: number
  video_url?: string | null
  variants?: ProductVariant[]
}

export type ProductListItem = Pick<
  Product,
  | "id"
  | "name"
  | "slug"
  | "product_type"
  | "price"
  | "compare_at_price"
  | "is_bestseller"
  | "is_new_arrival"
  | "is_featured"
  | "review_count"
  | "is_active"
> & {
  needs_manual_image?: boolean
  pending_image_source?: string | null
  rating_avg?: number
  average_rating: number
  primary_image?: string | null
  category_name?: string | null
  brand_name?: string | null
  stock?: number | null
  discount_percentage?: number | null
}

export type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[]
}

export type OrderWithItems = Order & {
  items: (OrderItem & { product?: ProductListItem | null })[]
}

// ── Cart ─────────────────────────────────────────────────────

export interface CartItem {
  id: string // product id
  name: string
  slug: string
  price: number
  compare_at_price: number | null
  image: string | null
  quantity: number
  max_quantity?: number
  variant?: string | null
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  item_count: number
}

// ── Checkout ─────────────────────────────────────────────────

export interface CheckoutAddress {
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  region?: string
  postal_code?: string
}

export interface CheckoutFormData {
  customer_name: string
  customer_email: string
  customer_phone: string
  address: CheckoutAddress
  payment_method: "cod" | "card" | "transfer"
  notes?: string
  coupon_code?: string
}

// ── Filters ──────────────────────────────────────────────────

export interface ProductFilters {
  category?: string
  brand?: string[]
  price_min?: number
  price_max?: number
  rating?: number
  in_stock?: boolean
  is_new_arrival?: boolean
  is_bestseller?: boolean
  is_featured?: boolean
  product_type?: string[]
  search?: string
}

export type SortOption =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "newest"
  | "bestselling"
  | "rating"
  | "name_asc"

// ── Navigation ───────────────────────────────────────────────

export interface NavCategory {
  id: string
  name: string
  slug: string
  icon?: string
  children?: {
    id: string
    name: string
    slug: string
    children?: { id: string; name: string; slug: string }[]
  }[]
}

// ── Product Specifications ────────────────────────────────────

export interface BookSpecs {
  author?: string
  isbn?: string
  publisher?: string
  language?: string
  pages?: number
  format?: "paperback" | "hardcover" | "digital"
  school_level?: "primary" | "middle" | "high" | "university" | "professional"
  subject?: string
  edition?: string
  year?: number
}

export interface StationerySpecs {
  color?: string
  material?: string
  size?: string
  quantity_in_pack?: number
}

export interface SchoolSupplySpecs {
  age_group?: string
  material?: string
  dimensions?: string
  weight?: string
  color?: string
}

export type ProductSpecs = BookSpecs | StationerySpecs | SchoolSupplySpecs | Record<string, unknown>

// ── Search ───────────────────────────────────────────────────

export interface SearchResult {
  products: ProductListItem[]
  categories: Pick<Category, "id" | "name" | "slug">[]
  brands: Pick<Brand, "id" | "name" | "slug">[]
  total: number
}

export interface SearchSuggestion {
  type: "product" | "category" | "brand"
  id: string
  name: string
  slug: string
  image?: string | null
  price?: number | null
}

// ── Pagination ───────────────────────────────────────────────

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// ── Moroccan cities ──────────────────────────────────────────

export const MOROCCAN_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Tanger",
  "Fès",
  "Meknès",
  "Agadir",
  "Oujda",
  "Kenitra",
  "Tétouan",
  "El Jadida",
  "Safi",
  "Mohammédia",
  "Khouribga",
  "Béni Mellal",
  "Nador",
  "Settat",
  "Larache",
  "Ksar El Kebir",
  "Khémisset",
  "Guelmim",
  "Taza",
  "Berrechid",
  "Sidi Kacem",
  "Errachidia",
  "Taroudant",
  "Essaouira",
  "Ifrane",
  "Ouarzazate",
  "Dakhla",
  "Laâyoune",
  "Al Hoceima",
  "Berkane",
  "Taourirt",
  "Tiznit",
  "Chefchaouen",
  "Martil",
  "Fnideq",
  "Skhirat",
  "Témara",
  "Bouskoura",
  "Dar Bouazza",
  "Nouaceur",
  "Autre ville (Livraison partout au Maroc)",
] as const

export type MoroccanCity = (typeof MOROCCAN_CITIES)[number]

// ── Order status labels ──────────────────────────────────────

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  processing: "En préparation",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  paid: "Payée",
  failed: "Échoué",
  refunded: "Remboursée",
}

// ── Toast ─────────────────────────────────────────────────────

export interface ToastMessage {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  description?: string
  duration?: number
}
