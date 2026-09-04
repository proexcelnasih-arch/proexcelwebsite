import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export interface AdminAuthResult {
  user?: any
  profile?: any
  errorResponse?: NextResponse
}

/**
 * Server-side guard to strictly enforce admin authentication on API routes.
 * Rejects unauthenticated requests with 401 and non-admin users with 403.
 */
export async function requireAdmin(req?: NextRequest): Promise<AdminAuthResult> {
  try {
    const supabase = await createClient()
    let {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    // Also support Bearer token in Authorization header for API calls
    if (!user && req) {
      const authHeader = req.headers.get("authorization")
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "").trim()
        const { data: tokenUser, error: tokenErr } = await supabase.auth.getUser(token)
        if (!tokenErr && tokenUser.user) {
          user = tokenUser.user
          userErr = null
        }
      }
    }

    if (userErr || !user) {
      return {
        errorResponse: NextResponse.json(
          { success: false, error: "Authentification requise pour accéder à cette ressource." },
          { status: 401 }
        ),
      }
    }

    const { createAdminClient } = await import("@/lib/supabase/server")
    const adminDb = await createAdminClient()
    const { data: profile, error: profileErr } = await adminDb
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle()

    if (profileErr || !profile || profile.role !== "admin") {
      console.warn("[requireAdmin] Access denied for user:", user.id, "profile:", profile, "err:", profileErr?.message)
      return {
        errorResponse: NextResponse.json(
          { success: false, error: "Accès interdit. Privilèges administrateur requis." },
          { status: 403 }
        ),
      }
    }

    return { user, profile }
  } catch (err) {
    console.error("[requireAdmin] Unexpected error:", err)
    return {
      errorResponse: NextResponse.json(
        { success: false, error: "Erreur serveur lors de la vérification des droits." },
        { status: 500 }
      ),
    }
  }
}
