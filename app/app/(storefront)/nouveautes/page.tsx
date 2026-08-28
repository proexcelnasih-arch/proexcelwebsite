import type { Metadata } from "next"
import { getNewArrivalProducts, getCatalogProducts, getAllCategories, getBrands } from "@/lib/supabase/queries"
import { ShopCatalog } from "@/components/shop/ShopCatalog"

export const metadata: Metadata = {
  title: "Nouveautés | ProExcel",
  description: "Découvrez toutes les nouveautés en livres scolaires, papeterie et fournitures au Maroc.",
}

export const dynamic = "force-dynamic"

export default async function NouveautesPage() {
  const [newProducts, allResult, categories, brands] = await Promise.all([
    getNewArrivalProducts(50),
    getCatalogProducts({ pageSize: 50 }),
    getAllCategories(),
    getBrands(),
  ])

  const productsToShow = newProducts.length > 0 ? newProducts : allResult.products

  return (
    <ShopCatalog
      title="Nouveautés"
      subtitle="Les derniers arrivages et nouvelles références sélectionnées pour vous."
      allProducts={productsToShow}
      availableCategories={categories.map((c) => c.name)}
      availableBrands={brands.map((b) => b.name)}
      breadcrumbItems={[{ label: "Nouveautés" }]}
    />
  )
}
