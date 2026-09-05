import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/admin-guard"
import { checkRateLimit } from "@/lib/rate-limit"
import crypto from "crypto"

export const dynamic = "force-dynamic"
export const maxDuration = 60

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "image/svg+xml",
])

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * POST /api/admin/upload
 * Handles multipart/form-data image upload to Supabase Storage with strict admin authorization,
 * MIME type allowlisting, file size enforcement, and random UUID filename sanitization.
 */
export async function POST(req: NextRequest) {
  try {
    // 0. Verify Admin Role
    const adminAuth = await requireAdmin(req)
    if (adminAuth.errorResponse) return adminAuth.errorResponse

    // Rate limit authenticated admin actions
    const rateCheck = await checkRateLimit("adminApi", adminAuth.user.id)
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: "Limite de requêtes atteinte. Veuillez patienter." },
        { status: 429 }
      )
    }

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

      // File size validation (5MB max)
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: `Le fichier "${file.name || 'image'}" dépasse la taille maximale autorisée (5 Mo).` },
          { status: 400 }
        )
      }

      // MIME type validation
      const mimeType = (file.type || "").toLowerCase().trim()
      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        return NextResponse.json(
          {
            success: false,
            error: `Type de fichier non autorisé : "${mimeType}". Seuls JPEG, PNG, WEBP et SVG sont acceptés.`,
          },
          { status: 400 }
        )
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Random UUID filename sanitization (eliminates path traversal and user-controlled names)
      const ext = MIME_TO_EXT[mimeType] || "jpg"
      const safeRandomId = crypto.randomUUID().replace(/-/g, "")
      const fileName = `${folder}/${Date.now()}-${safeRandomId}.${ext}`

      const { error } = await supabase.storage
        .from(targetBucket)
        .upload(fileName, buffer, {
          contentType: mimeType,
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
      { success: false, error: "Erreur lors du téléchargement du fichier. Veuillez réessayer." },
      { status: 500 }
    )
  }
}