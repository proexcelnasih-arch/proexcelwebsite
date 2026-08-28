import type { Metadata } from "next"
import { getBestOfferProducts, getCatalogProducts, getAllCategories, getBrands } from "@/lib/supabase/queries"
import { ShopCatalog } from "@/components/shop/ShopCatalog"

export const metadata: Metadata = {
  title: "Meilleures Offres & Promotions | ProExcel",
  description: "Profitez des meilleures promotions et réductions sur les livres, cahiers et fournitures scolaires au Maroc.",
}

export const dynamic = "force-dynamic"

export default async function MeilleuresOffresPage() {
  const [offerProducts, allResult, categories, brands] = await Promise.all([
    getBestOfferProducts([], 50),
    getCatalogProducts({ pageSize: 50 }),
    getAllCategories(),
    getBrands(),
  ])

  const productsToShow = offerProducts.length > 0 ? offerProducts : allResult.products

  return (
    <ShopCatalog
      title="Meilleures Offres &amp; Promotions"
      subtitle="Économisez sur une large sélection d'articles scolaires et de bureau."
      allProducts={productsToShow}
      availableCategories={categories.map((c) => c.name)}
      availableBrands={brands.map((b) => b.name)}
      breadcrumbItems={[{ label: "Meilleures Offres" }]}
    />
  )
}
