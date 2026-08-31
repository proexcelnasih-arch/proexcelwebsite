import type { Database } from "@/types/database"
import type { ProductListItem } from "@/types"

export type ProductRow = Database["public"]["Tables"]["products"]["Row"]

export function formatProductListItem(
  product: ProductRow & {
    product_images?: { url: string; is_primary?: boolean; display_order?: number }[] | null
    categories?: { name: string; slug: string } | null
    brands?: { name: string; slug: string } | null
  }
): ProductListItem {
  const primaryImg =
    product.product_images?.find((img) => img.is_primary)?.url ||
    product.product_images?.[0]?.url ||
    null

  const discountPercentage =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    product_type: product.product_type,
    price: product.price,
    compare_at_price: product.compare_at_price,
    is_bestseller: product.is_bestseller,
    is_new_arrival: product.is_new_arrival,
    is_featured: product.is_featured,
    rating_avg: product.rating_avg,
    average_rating: product.rating_avg,
    review_count: product.review_count,
    is_active: product.is_active,
    needs_manual_image: product.needs_manual_image ?? false,
    pending_image_source: product.pending_image_source ?? null,
    primary_image: primaryImg,
    category_name: product.categories?.name ?? null,
    brand_name: product.brands?.name ?? null,
    stock: product.stock_quantity,
    discount_percentage: discountPercentage,
  }
}
