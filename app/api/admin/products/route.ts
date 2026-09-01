import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Uploads a base64 or URL image to Supabase Storage and returns its public URL
 */
async function processImageUrl(supabase: any, imageSource: string, productName: string, index: number): Promise<string | null> {
  if (!imageSource || typeof imageSource !== "string") return null

  // If it is already an HTTP URL, return as is
  if (imageSource.startsWith("http://") || imageSource.startsWith("https://")) {
    return imageSource
  }

  // If it is a data URL / Base64 string
  if (imageSource.startsWith("data:image/")) {
    try {
      const matches = imageSource.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
      if (!matches || matches.length !== 3) return null

      const mimeType = matches[1]
      const base64Data = matches[2]
      const buffer = Buffer.from(base64Data, "base64")
      const ext = mimeType.split("/")[1] || "jpg"
      const cleanName = productName.toLowerCase().replace(/[^\w-]/g, "_").slice(0, 30)
      const fileName = `products/${Date.now()}-${cleanName}-${index}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from("product-images")
        .upload(fileName, buffer, {
          contentType: mimeType,
          upsert: true,
        })

      if (uploadErr) {
        console.warn("[api/admin/products] Storage upload error for base64:", uploadErr)
        return null
      }

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName)

      return urlData?.publicUrl || null
    } catch (err) {
      console.warn("[api/admin/products] Base64 decoding error:", err)
      return null
    }
  }

  return null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { formData, variants, isEdit } = body

    const supabase = await createAdminClient()

    // 1. Resolve category and brand IDs
    const { data: catRow } = await supabase
      .from("categories")
      .select("id, slug")
      .ilike("name", formData.category_name)
      .maybeSingle()

    const { data: brandRow } = await supabase
      .from("brands")
      .select("id")
      .ilike("name", formData.brand_name)
      .maybeSingle()

    const categoryId = catRow?.id ?? null
    const brandId = brandRow?.id ?? null
    const categorySlug = catRow?.slug ?? (formData.category_name ? formData.category_name.toLowerCase().replace(/\s+/g, "-") : "all")

    let productId = formData.id

    // 2. Process images (upload base64 to Storage or keep valid URLs)
    const rawImages: string[] = Array.isArray(formData.images) ? formData.images : []
    const processedImageUrls: string[] = []

    for (let i = 0; i < rawImages.length; i++) {
      const url = await processImageUrl(supabase, rawImages[i], formData.name || "product", i)
      if (url) processedImageUrls.push(url)
    }

    if (isEdit && formData.id) {
      // UPDATE existing product
      const { error: updateError } = await supabase
        .from("products")
        .update({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          price: formData.price,
          compare_at_price: formData.compare_at_price ?? null,
          stock_quantity: formData.stock,
          sku: formData.sku,
          ...(categoryId ? { category_id: categoryId } : {}),
          ...(brandId ? { brand_id: brandId } : {}),
          is_bestseller: formData.is_bestseller,
          is_new_arrival: formData.is_new_arrival,
          is_featured: formData.is_featured,
          is_active: formData.is_active,
        })
        .eq("id", formData.id)

      if (updateError) throw updateError

      // Replace product images if new ones provided
      if (processedImageUrls.length > 0) {
        try {
          await supabase.from("product_images").delete().eq("product_id", formData.id)
          await supabase.from("product_images").insert(
            processedImageUrls.map((url, idx) => ({
              product_id: formData.id,
              url,
              is_primary: idx === 0,
              display_order: idx,
              alt_text: formData.name,
            }))
          )
        } catch (imgErr) {
          console.warn("[api/admin/products] Images update warning:", imgErr)
        }
      }

      // Update variants
      try {
        await (supabase as any).from("product_variants").delete().eq("product_id", formData.id)
        if (variants && variants.length > 0) {
          await (supabase as any).from("product_variants").insert(
            variants.map((v: any, idx: number) => ({
              product_id: formData.id,
              variant_type: v.variant_type,
              label: v.label,
              price_delta: Number(v.price_delta) || 0,
              stock_quantity: Number(v.stock_quantity) || 0,
              display_order: idx,
            }))
          )
        }
      } catch (vErr) {
        console.warn("[api/admin/products] Variants update warning:", vErr)
      }
    } else {
      // INSERT new product
      const insertPayload: Record<string, any> = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        price: formData.price,
        compare_at_price: formData.compare_at_price ?? null,
        stock_quantity: formData.stock,
        sku: formData.sku || formData.slug.toUpperCase(),
        is_bestseller: formData.is_bestseller,
        is_new_arrival: formData.is_new_arrival,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
      }
      if (categoryId) insertPayload.category_id = categoryId
      if (brandId) insertPayload.brand_id = brandId

      const { data: newProduct, error: insertError } = await supabase
        .from("products")
        .insert(insertPayload)
        .select("id")
        .single()

      if (insertError || !newProduct) {
        throw new Error(insertError?.message || "Erreur lors de la creation du produit")
      }

      productId = newProduct.id

      // Insert product images
      if (processedImageUrls.length > 0) {
        await supabase.from("product_images").insert(
          processedImageUrls.map((url, idx) => ({
            product_id: productId,
            url,
            is_primary: idx === 0,
            display_order: idx,
            alt_text: formData.name,
          }))
        )
      }

      // Insert variants
      if (variants && variants.length > 0) {
        try {
          await (supabase as any).from("product_variants").insert(
            variants.map((v: any, idx: number) => ({
              product_id: productId,
              variant_type: v.variant_type,
              label: v.label,
              price_delta: Number(v.price_delta) || 0,
              stock_quantity: Number(v.stock_quantity) || 0,
              display_order: idx,
            }))
          )
        } catch (vErr) {
          console.warn("[api/admin/products] Variants insert warning:", vErr)
        }
      }
    }

    return NextResponse.json({ success: true, productId, categorySlug })
  } catch (err: any) {
    console.error("[api/admin/products] Error:", err)
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 })
  }
}