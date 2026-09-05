import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/admin-guard"
import { checkRateLimit } from "@/lib/rate-limit"
import { logAdminAuditServer } from "@/lib/admin/audit"

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
    // 0. Verify Admin Role
    const adminAuth = await requireAdmin(req)
    if (adminAuth.errorResponse) return adminAuth.errorResponse

    // Rate limit authenticated admin actions (30/min)
    const rateCheck = await checkRateLimit("adminApi", adminAuth.user.id)
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: "Limite de requêtes atteinte pour les actions administrateur. Veuillez patienter." },
        { status: 429 }
      )
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Corps de requête invalide" }, { status: 400 })
    }

    const { formData, variants, isEdit } = body
    if (!formData || typeof formData !== "object") {
      return NextResponse.json({ success: false, error: "Données de formulaire requises" }, { status: 400 })
    }

    // Strict input validation
    const name = typeof formData.name === "string" ? formData.name.trim() : ""
    if (!name || name.length < 2 || name.length > 255) {
      return NextResponse.json({ success: false, error: "Le nom du produit doit comporter entre 2 et 255 caractères." }, { status: 400 })
    }

    const price = Number(formData.price)
    if (isNaN(price) || price <= 0 || price > 100000) {
      return NextResponse.json({ success: false, error: "Le prix doit être un nombre strictement positif inférieur à 100 000 DH." }, { status: 400 })
    }

    const stock = Number(formData.stock)
    if (isNaN(stock) || stock < 0 || !Number.isInteger(stock) || stock > 1000000) {
      return NextResponse.json({ success: false, error: "Le stock doit être un entier positif ou nul." }, { status: 400 })
    }

    if (formData.compare_at_price != null && formData.compare_at_price !== "") {
      const comparePrice = Number(formData.compare_at_price)
      if (isNaN(comparePrice) || comparePrice < 0) {
        return NextResponse.json({ success: false, error: "Le prix barré doit être un nombre positif." }, { status: 400 })
      }
    }

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
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue lors de l'enregistrement du produit." },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, is_active } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
    if (is_active !== undefined) {
      updateData.is_active = Boolean(is_active)
    }

    const { error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)

    if (error) {
      throw new Error(error.message || "Failed to update product status")
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[api/admin/products/patch] Error:", err)
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue lors de la mise à jour du produit." },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // 0. Verify Admin Role
    const adminAuth = await requireAdmin(req)
    if (adminAuth.errorResponse) return adminAuth.errorResponse

    // Rate limit authenticated admin actions (30/min)
    const rateCheck = await checkRateLimit("adminApi", adminAuth.user.id)
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: "Limite de requêtes atteinte pour les actions administrateur. Veuillez patienter." },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(req.url)
    let productId = searchParams.get("id")

    if (!productId) {
      try {
        const body = await req.json()
        productId = body?.id
      } catch {
        // query param used
      }
    }

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // 1. Delete associated stock movements (which have on delete restrict)
    try {
      await supabase.from("stock_movements").delete().eq("product_id", productId)
    } catch (e) {
      console.warn("[api/admin/products/delete] stock_movements warning:", e)
    }

    // 2. Delete cart items
    try {
      await supabase.from("cart_items").delete().eq("product_id", productId)
    } catch (e) {
      console.warn("[api/admin/products/delete] cart_items warning:", e)
    }

    // 3. Delete wishlist items
    try {
      await supabase.from("wishlist_items").delete().eq("product_id", productId)
    } catch (e) {
      console.warn("[api/admin/products/delete] wishlist_items warning:", e)
    }

    // 4. Delete product reviews
    try {
      await supabase.from("reviews").delete().eq("product_id", productId)
    } catch (e) {
      console.warn("[api/admin/products/delete] reviews warning:", e)
    }

    // 5. Delete variants
    try {
      await (supabase as any).from("product_variants").delete().eq("product_id", productId)
    } catch (e) {
      console.warn("[api/admin/products/delete] variants warning:", e)
    }

    // 6. Delete image files from storage if stored on Supabase, and remove product_images rows
    try {
      const { data: images } = await supabase
        .from("product_images")
        .select("url")
        .eq("product_id", productId)

      if (images && images.length > 0) {
        for (const img of images) {
          if (img.url && img.url.includes("product-images")) {
            try {
              const parts = img.url.split("/product-images/")
              if (parts[1]) {
                const storagePath = decodeURIComponent(parts[1].split("?")[0])
                await supabase.storage.from("product-images").remove([storagePath])
              }
            } catch (storageErr) {
              console.warn("[api/admin/products/delete] Storage image remove warning:", storageErr)
            }
          }
        }
        await supabase.from("product_images").delete().eq("product_id", productId)
      }
    } catch (imgErr) {
      console.warn("[api/admin/products/delete] Images cleanup warning:", imgErr)
    }

    // 7. Nullify product_id on order_items so historical orders remain valid without breaking constraint
    try {
      await supabase
        .from("order_items")
        .update({ product_id: null })
        .eq("product_id", productId)
    } catch (orderErr) {
      console.warn("[api/admin/products/delete] Order items nullify warning:", orderErr)
    }

    // 8. Delete the product itself from products table
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)

    if (deleteError) {
      throw new Error(deleteError.message || "Failed to delete product from database")
    }

    // Record audit log for product deletion
    await logAdminAuditServer({
      adminId: adminAuth.user.id,
      action: "product.delete",
      targetTable: "products",
      targetId: productId,
      details: { deleted_at: new Date().toISOString() },
    })

    return NextResponse.json({ success: true, message: "Produit supprimé avec succès" })
  } catch (err: any) {
    console.error("[api/admin/products/delete] Error:", err)
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue lors de la suppression du produit." },
      { status: 500 }
    )
  }
}