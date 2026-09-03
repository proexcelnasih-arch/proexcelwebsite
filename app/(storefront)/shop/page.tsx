import type { Metadata } from "next"
import { getCatalogProducts, getAllCategories, getBrands } from "@/lib/supabase/queries"
import { ShopCatalog } from "@/components/shop/ShopCatalog"

export const metadata: Metadata = {
  title: "Toute la Boutique | ProExcel",
  description:
    "Explorez l'ensemble de notre catalogue : livres scolaires, papeterie de marque, fournitures scolaires et de bureau au Maroc.",
}

export const dynamic = "force-dynamic"

export default async function ShopPage() {
  const [catalogResult, categories, brands] = await Promise.all([
    getCatalogProducts({ pageSize: 0 }), // Load all products
    getAllCategories(),
    getBrands(),
  ])

  const categoryNames = categories.map((c) => c.name)
  const brandNames = brands.map((b) => b.name)

  return (
    <ShopCatalog
      title="Tous les Produits"
      subtitle="Découvrez notre sélection complète de livres, papeterie et fournitures de qualité."
      allProducts={catalogResult.products}
      availableCategories={categoryNames}
      availableBrands={brandNames}
      breadcrumbItems={[{ label: "Boutique" }]}
    />
  )
}
