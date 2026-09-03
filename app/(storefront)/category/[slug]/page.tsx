import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCatalogProducts, getAllCategories, getBrands } from "@/lib/supabase/queries"
import { ShopCatalog } from "@/components/shop/ShopCatalog"

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const categories = await getAllCategories()
  const category = categories.find((c) => c.slug === slug)

  if (!category) {
    return {
      title: "Catégorie | ProExcel",
    }
  }

  return {
    title: `${category.name} | ProExcel`,
    description: category.description || `Achetez vos ${category.name} au meilleur prix chez ProExcel.`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params

  const [categories, brands, catalogResult] = await Promise.all([
    getAllCategories(),
    getBrands(),
    getCatalogProducts({ categorySlugs: [slug], pageSize: 0 }),
  ])

  const category = categories.find((c) => c.slug === slug)
  if (!category && catalogResult.products.length === 0) {
    // Check if any category exists
    const categoryExists = categories.some((c) => c.slug === slug)
    if (!categoryExists) {
      notFound()
    }
  }

  const title = category ? category.name : slug.replace(/-/g, " ")
  const subtitle = category?.description || "Découvrez notre catalogue dans cette catégorie."

  return (
    <ShopCatalog
      title={title}
      subtitle={subtitle}
      initialCategory={category?.name}
      allProducts={catalogResult.products}
      availableCategories={categories.map((c) => c.name)}
      availableBrands={brands.map((b) => b.name)}
      breadcrumbItems={[
        { label: "Boutique", href: "/shop" },
        { label: title },
      ]}
    />
  )
}
