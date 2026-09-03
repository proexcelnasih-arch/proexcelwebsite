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

  // 1. Resolve Parent Category if current category is a subcategory
  const parentCategory = category?.parent_id
    ? categories.find((c) => c.id === category.parent_id)
    : null

  // 2. Resolve Child Subcategories if current category is a parent
  const subcategories = category
    ? categories.filter((c) => c.parent_id === category.id)
    : []

  // 3. Build hierarchical breadcrumb items
  const breadcrumbItems = [
    { label: "Boutique", href: "/shop" },
    ...(parentCategory
      ? [{ label: parentCategory.name, href: `/category/${parentCategory.slug}` }]
      : []),
    { label: title },
  ]

  // 4. Available categories for filtering in this context:
  const contextCategories =
    subcategories.length > 0
      ? [category!.name, ...subcategories.map((s) => s.name)]
      : parentCategory
      ? [
          parentCategory.name,
          ...categories
            .filter((c) => c.parent_id === parentCategory.id)
            .map((s) => s.name),
        ]
      : categories.map((c) => c.name)

  return (
    <ShopCatalog
      title={title}
      subtitle={subtitle}
      initialCategory={category?.name}
      allProducts={catalogResult.products}
      availableCategories={contextCategories}
      availableBrands={brands.map((b) => b.name)}
      breadcrumbItems={breadcrumbItems}
      subcategories={subcategories.map((s) => ({ name: s.name, slug: s.slug }))}
      parentCategory={
        parentCategory
          ? { name: parentCategory.name, slug: parentCategory.slug }
          : undefined
      }
    />
  )
}
