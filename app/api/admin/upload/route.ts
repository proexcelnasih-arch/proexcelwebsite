import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * POST /api/admin/upload
 * Handles multipart/form-data image upload to Supabase Storage (bucket: product-images)
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll("file") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: "Aucun fichier fourni" }, { status: 400 })
    }

    const requestedBucket = (formData.get("bucket") as string) || "product-images"
    const allowedBuckets = ["product-images", "site-assets"]
    const targetBucket = allowedBuckets.includes(requestedBucket) ? requestedBucket : "product-images"
    const folder = targetBucket === "site-assets" ? "brand" : "products"

    const supabase = await createAdminClient()
    const uploadedUrls: string[] = []

    for (const file of files) {
      if (!file || typeof file === "string") continue

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const ext = file.name ? file.name.split(".").pop()?.toLowerCase() || "jpg" : "jpg"
      const cleanName = file.name
        ? file.name.replace(/[^\w.-]/g, "_").toLowerCase()
        : `image.${ext}`
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${cleanName}`

      const { error } = await supabase.storage
        .from(targetBucket)
        .upload(fileName, buffer, {
          contentType: file.type || `image/${ext}`,
          upsert: true,
        })

      if (error) {
        console.error("[api/admin/upload] Storage upload error:", error)
        throw error
      }

      const { data: publicUrlData } = supabase.storage
        .from(targetBucket)
        .getPublicUrl(fileName)

      if (publicUrlData?.publicUrl) {
        uploadedUrls.push(publicUrlData.publicUrl)
      }
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      url: uploadedUrls[0] || null,
    })
  } catch (err: any) {
    console.error("[api/admin/upload] Error:", err)
    return NextResponse.json(
      { success: false, error: err?.message || "Erreur lors du telechargement de l image" },
      { status: 500 }
    )
  }
}