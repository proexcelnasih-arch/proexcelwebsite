import type { Metadata } from "next"
import { getCatalogProducts, getAllCategories, getBrands } from "@/lib/supabase/queries"
import { ShopCatalog } from "@/components/shop/ShopCatalog"

export const metadata: Metadata = {
  title: "Boutique & Rayons | ProExcel",
  description:
    "Découvrez notre catalogue complet de fournitures scolaires, livres et papeterie de marque.",
}

export const dynamic = "force-dynamic"

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; category?: string }>
}) {
  const { brand, category } = await searchParams

  const [catalogResult, categories, brands] = await Promise.all([
    getCatalogProducts({ pageSize: 100 }),
    getAllCategories(),
    getBrands(),
  ])

  const categoryNames = categories.map((c) => c.name)
  const brandNames = brands.map((b) => b.name)

  // Find exact brand name match if slug provided in query param
  let matchedBrandName: string | undefined
  if (brand) {
    const foundBrand = brands.find(
      (b) => b.slug.toLowerCase() === brand.toLowerCase() || b.name.toLowerCase() === brand.toLowerCase()
    )
    if (foundBrand) matchedBrandName = foundBrand.name
  }

  return (
    <ShopCatalog
      title="Boutique &amp; Rayons"
      subtitle="Explorez l'ensemble de nos collections et fournitures de bureau et scolaires."
      allProducts={catalogResult.products}
      availableCategories={categoryNames}
      availableBrands={brandNames}
      initialBrand={matchedBrandName}
      initialCategory={category}
      breadcrumbItems={[{ label: "Boutique" }]}
    />
  )
}
