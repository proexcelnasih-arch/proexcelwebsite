import { NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminDb = await createAdminClient()
    const { data: profile } = await adminDb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // ── 2. Parse and validate body ─────────────────────────────
    let body: { path?: string; type?: "page" | "layout" }
    try {
      body = await request.json()
    } catch {
      body = {}
    }

    const path = body.path ?? "/"
    const type = body.type ?? "page"

    // ── 3. Revalidate ──────────────────────────────────────────
    revalidatePath(path, type)

    // Also always revalidate the homepage itself
    if (path !== "/") {
      revalidatePath("/", "page")
    }

    return NextResponse.json({ revalidated: true, path, type })
  } catch (err) {
    console.error("[api/admin/revalidate] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
