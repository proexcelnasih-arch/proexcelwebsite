import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getProductBySlug,
  getRelatedProducts,
  getProductRecentPurchaseCount,
  getRecentStorePurchases,
} from "@/lib/supabase/queries"
import { ProductDetailView } from "@/components/products/ProductDetailView"

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return {
      title: "Produit non trouvé | ProExcel",
    }
  }

  const primaryImg = product.images?.[0]?.url

  return {
    title: `${product.name} | ProExcel`,
    description: product.seo_description || product.description || `Achetez ${product.name} chez ProExcel.`,
    openGraph: {
      title: `${product.name} | ProExcel`,
      description: product.seo_description || product.description || `Achetez ${product.name} chez ProExcel.`,
      images: primaryImg ? [{ url: primaryImg }] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const [relatedProducts, purchasesTodayCount, recentPurchases] = await Promise.all([
    getRelatedProducts(product.category_id, product.id, 4),
    getProductRecentPurchaseCount(product.id),
    getRecentStorePurchases(5),
  ])

  return (
    <ProductDetailView
      product={product}
      relatedProducts={relatedProducts}
      purchasesTodayCount={purchasesTodayCount}
      recentPurchases={recentPurchases}
    />
  )
}
