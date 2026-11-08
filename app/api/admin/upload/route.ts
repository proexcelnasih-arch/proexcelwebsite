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
])

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Validates real file type by magic bytes header instead of trusting client MIME type or extension.
 * Rejects SVGs to prevent Stored Cross-Site Scripting (XSS).
 */
function detectImageType(buffer: Buffer): { mime: string; ext: string } | null {
  if (buffer.length < 12) return null

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" }
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { mime: "image/png", ext: "png" }
  }

  // WEBP: RIFF....WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { mime: "image/webp", ext: "webp" }
  }

  return null
}

/**
 * POST /api/admin/upload
 * Handles multipart/form-data image upload to Supabase Storage with strict admin authorization,
 * MIME type allowlisting, magic byte inspection, file size enforcement, and random UUID filename sanitization.
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

      // Claimed MIME type validation
      const claimedMime = (file.type || "").toLowerCase().trim()
      if (!ALLOWED_MIME_TYPES.has(claimedMime)) {
        return NextResponse.json(
          {
            success: false,
            error: "Type de fichier non autorisé. Seuls les formats JPEG, PNG et WEBP sont acceptés.",
          },
          { status: 400 }
        )
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Strict Magic Byte verification (SEC-06: prevents SVG XSS and extension spoofing)
      const detected = detectImageType(buffer)
      if (!detected) {
        return NextResponse.json(
          {
            success: false,
            error: "Contenu de fichier invalide. Le fichier doit être une image valide (JPEG, PNG ou WEBP). Les fichiers SVG ne sont pas autorisés.",
          },
          { status: 400 }
        )
      }

      // Random UUID filename sanitization (eliminates path traversal and user-controlled names)
      const safeRandomId = crypto.randomUUID().replace(/-/g, "")
      const fileName = `${folder}/${Date.now()}-${safeRandomId}.${detected.ext}`

      const { error } = await supabase.storage
        .from(targetBucket)
        .upload(fileName, buffer, {
          contentType: detected.mime,
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
  } catch (err: unknown) {
    console.error("[api/admin/upload] Error:", err)
    return NextResponse.json(
      { success: false, error: "Erreur lors du téléchargement du fichier. Veuillez réessayer." },
      { status: 500 }
    )
  }
}
