import { createClient } from "./server"
import { formatProductListItem } from "./formatters"
import type { Database } from "@/types/database"
import type {
  ProductListItem,
  ProductWithDetails,
  ProductVariant,
  RecentPurchase,
  Category,
  Brand,
  Review,
  HeroSlide,
  PromoTile,
  StoreSettings,
} from "@/types"

export type ProductRow = Database["public"]["Tables"]["products"]["Row"]
export type ProductImageRow = Database["public"]["Tables"]["product_images"]["Row"]
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"]
export type BrandRow = Database["public"]["Tables"]["brands"]["Row"]

export const PRODUCT_LIST_SELECT =
  "*, product_images(url, is_primary, display_order), categories(name, slug), brands(name, slug)"

export { formatProductListItem }

// ── 1. HOMEPAGE QUERIES ────────────────────────────────────────

/**
 * Fetch active root categories for homepage grid & nav
 */
export async function getRootCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .is("parent_id", null)
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (error || !data) {
      console.warn("[queries] getRootCategories error:", error?.message)
      return []
    }
    return data
  } catch (err) {
    console.warn("[queries] getRootCategories exception:", err)
    return []
  }
}

/**
 * Fetch all active categories (including subcategories)
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (error || !data) {
      console.warn("[queries] getAllCategories error:", error?.message)
      return []
    }
    return data
  } catch (err) {
    console.warn("[queries] getAllCategories exception:", err)
    return []
  }
}

/**
 * Fetch active brands
 */
export async function getBrands(): Promise<Brand[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("name", { ascending: true })

    if (error || !data) {
      console.warn("[queries] getBrands error:", error?.message)
      return []
    }
    return data
  } catch (err) {
    console.warn("[queries] getBrands exception:", err)
    return []
  }
}

/**
 * Fetch active hero slides ordered by display_order
 */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (error || !data) {
      console.warn("[queries] getHeroSlides error:", error?.message)
      return []
    }
    return data
  } catch (err) {
    console.warn("[queries] getHeroSlides exception:", err)
    return []
  }
}

/**
 * Fetch active promo tiles ordered by display_order
 */
export async function getPromoTiles(): Promise<PromoTile[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("promo_tiles")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (error || !data) {
      console.warn("[queries] getPromoTiles error:", error?.message)
      return []
    }
    return data
  } catch (err) {
    console.warn("[queries] getPromoTiles exception:", err)
    return []
  }
}

/**
 * Fetch store settings singleton (id = 1)
 */
export async function getStoreSettings(): Promise<StoreSettings | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle()

    if (error || !data) {
      console.warn("[queries] getStoreSettings error:", error?.message)
      return null
    }
    return data
  } catch (err) {
    console.warn("[queries] getStoreSettings exception:", err)
    return null
  }
}

/**
 * Fetch approved customer reviews
 */
export async function getApprovedReviews(limit = 6): Promise<
  (Review & {
    profiles?: { full_name: string | null; avatar_url: string | null } | null
    products?: { name: string; slug: string } | null
  })[]
> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("reviews")
      .select("*, profiles(full_name, avatar_url), products(name, slug)")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error || !data) {
      console.warn("[queries] getApprovedReviews error:", error?.message)
      return []
    }
    return data as any
  } catch (err) {
    console.warn("[queries] getApprovedReviews exception:", err)
    return []
  }
}

// ── 2. HOMEPAGE PRODUCT SECTIONS (Duplicate-Free) ──────────────

/**
 * Fetch bestseller products
 */
export async function getBestsellerProducts(limit = 8): Promise<ProductListItem[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_LIST_SELECT)
      .eq("is_active", true)
      .eq("is_bestseller", true)
      .order("rating_avg", { ascending: false })
      .limit(limit)

    if (error || !data) {
      console.warn("[queries] getBestsellerProducts error:", error?.message)
      return []
    }
    return data.map((p) => formatProductListItem(p as any))
  } catch (err) {
    console.warn("[queries] getBestsellerProducts exception:", err)
    return []
  }
}

/**
 * Fetch new arrival products
 */
export async function getNewArrivalProducts(limit = 8): Promise<ProductListItem[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_LIST_SELECT)
      .eq("is_active", true)
      .eq("is_new_arrival", true)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error || !data) {
      console.warn("[queries] getNewArrivalProducts error:", error?.message)
      return []
    }
    return data.map((p) => formatProductListItem(p as any))
  } catch (err) {
    console.warn("[queries] getNewArrivalProducts exception:", err)
    return []
  }
}

/**
 * Fetch best discounted offers, excluding already shown IDs where possible
 */
export async function getBestOfferProducts(excludeIds: string[] = [], limit = 8): Promise<ProductListItem[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from("products")
      .select(PRODUCT_LIST_SELECT)
      .eq("is_active", true)
      .not("compare_at_price", "is", null)

    if (excludeIds.length > 0) {
      query = query.not("id", "in", `(${excludeIds.join(",")})`)
    }

    const { data, error } = await query.limit(limit * 2)

    if (error || !data) {
      console.warn("[queries] getBestOfferProducts error:", error?.message)
      return []
    }

    // Filter compare_at_price > price and sort by highest discount %
    const formatted = data
      .filter((p) => (p.compare_at_price ?? 0) > p.price)
      .map((p) => formatProductListItem(p as any))
      .sort((a, b) => (b.discount_percentage ?? 0) - (a.discount_percentage ?? 0))
      .slice(0, limit)

    return formatted
  } catch (err) {
    console.warn("[queries] getBestOfferProducts exception:", err)
    return []
  }
}

// ── 3. CATALOG & FILTERING QUERIES ─────────────────────────────

export interface CatalogQueryParams {
  categorySlugs?: string[]
  brandSlugs?: string[]
  maxPrice?: number
  inStockOnly?: boolean
  sortBy?: "popularity" | "price-asc" | "price-desc" | "newest" | "rating" | string
  page?: number
  pageSize?: number
  searchQuery?: string
}

export interface CatalogQueryResult {
  products: ProductListItem[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * High-performance paginated catalog query supporting multi-category, multi-brand, price, stock & sorting
 */
export async function getCatalogProducts(params: CatalogQueryParams): Promise<CatalogQueryResult> {
  const {
    categorySlugs = [],
    brandSlugs = [],
    maxPrice,
    inStockOnly = false,
    sortBy = "popularity",
    page = 1,
    pageSize = 16,
    searchQuery,
  } = params

  try {
    const supabase = await createClient()

    // 1. Resolve category slugs (including subcategories) to UUIDs
    let categoryIds: string[] = []
    if (categorySlugs.length > 0) {
      const { data: matchedCats } = await supabase
        .from("categories")
        .select("id, slug")
        .in("slug", categorySlugs)

      if (matchedCats && matchedCats.length > 0) {
        const parentIds = matchedCats.map((c) => c.id)
        // Also fetch any child subcategories
        const { data: childCats } = await supabase
          .from("categories")
          .select("id")
          .in("parent_id", parentIds)

        const childIds = childCats ? childCats.map((c) => c.id) : []
        categoryIds = [...new Set([...parentIds, ...childIds])]
      }
    }

    // 2. Resolve brand slugs to UUIDs
    let brandIds: string[] = []
    if (brandSlugs.length > 0) {
      const { data: matchedBrands } = await supabase
        .from("brands")
        .select("id")
        .in("slug", brandSlugs)

      if (matchedBrands) {
        brandIds = matchedBrands.map((b) => b.id)
      }
    }

    // 3. Build main query
    let query = supabase
      .from("products")
      .select(PRODUCT_LIST_SELECT, { count: "exact" })
      .eq("is_active", true)

    // Full-text search with tsvector GIN index
    if (searchQuery && searchQuery.trim().length > 0) {
      const cleanTerm = searchQuery.trim().replace(/[^\w\s\u0600-\u06FF]/gi, "")
      if (cleanTerm) {
        query = query.textSearch("search_vector", cleanTerm, {
          type: "websearch",
          config: "french",
        })
      }
    }

    // Apply category filter (IN / ANY)
    if (categoryIds.length > 0) {
      query = query.in("category_id", categoryIds)
    }

    // Apply brand filter (IN / ANY)
    if (brandIds.length > 0) {
      query = query.in("brand_id", brandIds)
    }

    // Apply price filter
    if (maxPrice !== undefined && maxPrice > 0) {
      query = query.lte("price", maxPrice)
    }

    // Apply stock filter
    if (inStockOnly) {
      query = query.gt("stock_quantity", 0)
    }

    // Apply sorting
    switch (sortBy) {
      case "price-asc":
        query = query.order("price", { ascending: true })
        break
      case "price-desc":
        query = query.order("price", { ascending: false })
        break
      case "newest":
        query = query.order("created_at", { ascending: false })
        break
      case "rating":
        query = query.order("rating_avg", { ascending: false })
        break
      case "popularity":
      default:
        query = query.order("review_count", { ascending: false }).order("rating_avg", { ascending: false })
        break
    }

    // Apply exact pagination range: from -> to
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, count, error } = await query

    if (error) {
      console.warn("[queries] getCatalogProducts error:", error.message)
      return { products: [], totalCount: 0, page, pageSize, totalPages: 1 }
    }

    const totalCount = count ?? 0
    const totalPages = Math.ceil(totalCount / pageSize) || 1
    const products = (data || []).map((p) => formatProductListItem(p as any))

    return {
      products,
      totalCount,
      page,
      pageSize,
      totalPages,
    }
  } catch (err) {
    console.warn("[queries] getCatalogProducts exception:", err)
    return { products: [], totalCount: 0, page, pageSize, totalPages: 1 }
  }
}

// ── 4. PRODUCT DETAIL & SOCIAL PROOF QUERIES ──────────────────

/**
 * Query product variants for a product
 */
export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await (supabase as any)
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("display_order", { ascending: true })

    if (error || !data) return []
    return data as ProductVariant[]
  } catch {
    return []
  }
}

/**
 * Query actual order items in last 24h for a specific product (real data only, 0 if none)
 */
export async function getProductRecentPurchaseCount(productId: string): Promise<number> {
  try {
    const supabase = await createClient()
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count, error } = await supabase
      .from("order_items")
      .select("id, orders!inner(created_at)", { count: "exact", head: true })
      .eq("product_id", productId)
      .gte("orders.created_at", twentyFourHoursAgo)

    if (error) return 0
    return count ?? 0
  } catch {
    return 0
  }
}

/**
 * Query recent real orders across the store for floating purchase toast (real data only)
 */
export async function getRecentStorePurchases(limit = 4): Promise<RecentPurchase[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("order_items")
      .select("id, product_name_snapshot, quantity, orders!inner(customer_name, shipping_address, created_at), products(slug, product_images(url))")
      .order("created_at", { ascending: false, foreignTable: "orders" })
      .limit(limit)

    if (error || !data || data.length === 0) return []

    return data.map((item: any) => {
      const order = item.orders
      const fullName = order?.customer_name || "Client"
      const firstName = fullName.split(" ")[0] || "Client"
      const address = order?.shipping_address
      const city = address?.city || address?.region || "Maroc"
      const productSlug = item.products?.slug || ""
      const productImg = item.products?.product_images?.[0]?.url || null

      const createdTime = new Date(order?.created_at || Date.now())
      const diffMinutes = Math.max(1, Math.round((Date.now() - createdTime.getTime()) / (1000 * 60)))
      const timeText = diffMinutes < 60 ? `Il y a ${diffMinutes} min` : `Il y a ${Math.round(diffMinutes / 60)} h`

      return {
        id: item.id,
        customer_first_name: firstName,
        city,
        product_name: item.product_name_snapshot,
        product_slug: productSlug,
        product_image: productImg,
        time_ago_text: timeText,
      }
    })
  } catch {
    return []
  }
}

/**
 * Fetch product by slug with images, brand, category, variants, and approved reviews
 */
export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .select("*, product_images(*), categories(*), brands(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle()

    if (error || !data) {
      return null
    }

    // Sort images by display_order
    const imagesRaw = ((data as any).product_images || []) as ProductImageRow[]
    const sortedImages = [...imagesRaw].sort(
      (a: ProductImageRow, b: ProductImageRow) => (a.display_order ?? 0) - (b.display_order ?? 0)
    )

    const discountPercentage =
      data.compare_at_price && data.compare_at_price > data.price
        ? Math.round(((data.compare_at_price - data.price) / data.compare_at_price) * 100)
        : null

    const variants = await getProductVariants(data.id)

    return {
      ...data,
      images: sortedImages,
      category: data.categories as any,
      brand: data.brands as any,
      discount_percentage: discountPercentage,
      average_rating: data.rating_avg,
      video_url: (data as any).video_url ?? null,
      variants,
    }
  } catch (err) {
    console.warn("[queries] getProductBySlug exception:", err)
    return null
  }
}

/**
 * Fetch related products from same category (up to 4, excluding current product)
 */
export async function getRelatedProducts(
  categoryId: string,
  excludeProductId: string,
  limit = 4
): Promise<ProductListItem[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_LIST_SELECT)
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .neq("id", excludeProductId)
      .limit(limit)

    if (error || !data) {
      return []
    }
    return data.map((p) => formatProductListItem(p as any))
  } catch (err) {
    console.warn("[queries] getRelatedProducts exception:", err)
    return []
  }
}

/**
 * Fetch approved reviews for a specific product
 */
export async function getProductReviews(productId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("reviews")
      .select("*, profiles(full_name, avatar_url)")
      .eq("product_id", productId)
      .eq("status", "approved")
      .order("created_at", { ascending: false })

    if (error || !data) {
      return []
    }
    return data
  } catch (err) {
    console.warn("[queries] getProductReviews exception:", err)
    return []
  }
}

// ── 5. WISHLIST PRODUCTS BATCH ─────────────────────────────────

/**
 * Fetch products matching a list of IDs (for wishlist hydration)
 */
export async function getProductsByIds(ids: string[]): Promise<ProductListItem[]> {
  if (!ids || ids.length === 0) return []

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_LIST_SELECT)
      .in("id", ids)
      .eq("is_active", true)

    if (error || !data) {
      return []
    }
    return data.map((p) => formatProductListItem(p as any))
  } catch (err) {
    console.warn("[queries] getProductsByIds exception:", err)
    return []
  }
}
