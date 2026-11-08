import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin-guard"
import { checkRateLimit } from "@/lib/rate-limit"
import { revalidatePath } from "next/cache"

/**
 * POST /api/admin/revalidate
 * Body: { path: string, type?: "page" | "layout" }
 *
 * Called by admin CMS pages after saves to invalidate the storefront cache.
 * Requires the caller to be an authenticated admin.
 */
export async function POST(request: NextRequest) {
  try {
    // ── 1. Verify caller is an authenticated admin ─────────────
    const adminAuth = await requireAdmin(request)
    if (adminAuth.errorResponse) return adminAuth.errorResponse

    // Rate limit authenticated admin actions
    const rateCheck = await checkRateLimit("adminApi", adminAuth.user.id)
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Limite de requêtes atteinte. Veuillez patienter." },
        { status: 429 }
      )
    }

    // ── 2. Parse and validate body ─────────────────────────────
    let body: { path?: string; type?: "page" | "layout" }
    try {
      body = await request.json()
    } catch {
      body = {}
    }

    const path = typeof body.path === "string" ? body.path : "/"
    const type = body.type === "layout" ? "layout" : "page"

    // ── 3. Revalidate ──────────────────────────────────────────
    revalidatePath(path, type)

    // Also always revalidate the homepage itself
    if (path !== "/") {
      revalidatePath("/", "page")
    }

    return NextResponse.json({ revalidated: true, path, type })
  } catch (err) {
    console.error("[api/admin/revalidate] Error:", err)
    return NextResponse.json({ error: "Une erreur est survenue lors de la révalidation." }, { status: 500 })
  }
}
