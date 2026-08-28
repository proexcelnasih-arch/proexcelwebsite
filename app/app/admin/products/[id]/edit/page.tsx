"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ProductForm, type ProductFormData } from "@/components/admin/products/ProductForm"
import { createClient } from "@/lib/supabase/client"

export default function EditProductPage() {
  const params = useParams()
  const id = params.id as string
  const [productData, setProductData] = useState<ProductFormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProduct() {
      if (!id) return
      setIsLoading(true)
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("products")
          .select("*, product_images(url, is_primary, display_order), categories(name), brands(name)")
          .eq("id", id)
          .maybeSingle()

        if (data) {
          const imgs = (((data as any).product_images || []) as Array<{ url: string }>).map((i) => i.url)
          setProductData({
            id: data.id,
            name: data.name,
            slug: data.slug,
            description: data.description || "",
            price: data.price,
            compare_at_price: data.compare_at_price ?? null,
            stock: data.stock_quantity ?? 15,
            sku: data.sku || data.slug.toUpperCase(),
            category_name: (data.categories as any)?.name ?? "Papeterie",
            brand_name: (data.brands as any)?.name ?? "Clairefontaine",
            is_bestseller: data.is_bestseller ?? false,
            is_new_arrival: data.is_new_arrival ?? false,
            is_featured: data.is_featured ?? false,
            is_active: data.is_active !== false,
            images: imgs,
          })
        }
      } catch (err) {
        console.warn("[edit-product] Error loading product:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadProduct()
  }, [id])

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center items-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!productData) {
    return (
      <div className="p-8 text-center text-slate-500">
        Produit introuvable.
      </div>
    )
  }

  return <ProductForm initialData={productData} isEdit={true} />
}
