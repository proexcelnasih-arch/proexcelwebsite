"use server"

import { createAdminClient, createClient } from "@/lib/supabase/server"

export interface AdminAuditParams {
  adminId?: string | null
  action: string
  targetTable?: string | null
  targetId?: string | null
  details?: Record<string, any> | null
}

/**
 * Server-only audit logger using service-role client.
 * Safe to call from API routes or Server Actions.
 */
export async function logAdminAuditServer(params: AdminAuditParams) {
  try {
    const supabase = await createAdminClient()

    // Validate UUID format for targetId if provided
    const isValidUuid = params.targetId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.targetId)
    const targetUuid = isValidUuid ? params.targetId : null
    const details = {
      ...(params.details || {}),
      ...(params.targetId && !isValidUuid ? { raw_target_id: params.targetId } : {}),
    }

    const { error } = await supabase.from("admin_audit_log").insert({
      admin_id: params.adminId || null,
      action: params.action,
      target_table: params.targetTable || null,
      target_id: targetUuid,
      details,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.warn("[admin-audit] Warning inserting audit log:", error.message)
    }
  } catch (err) {
    console.error("[admin-audit] Unexpected error inserting audit log:", err)
  }
}

/**
 * Server Action callable from client or server components.
 * Automatically resolves the logged-in admin's profile and validates admin role.
 */
export async function recordAdminAuditAction(params: Omit<AdminAuditParams, "adminId">) {
  try {
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()

    if (!user) {
      console.warn("[admin-audit] Attempt to record action without authenticated user")
      return { success: false, error: "Unauthenticated" }
    }

    // Verify admin role in profiles
    const { data: profile } = await userClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    if (profile?.role !== "admin") {
      console.warn(`[admin-audit] Non-admin user (${user.id}) attempted to log admin action`)
      return { success: false, error: "Unauthorized" }
    }

    await logAdminAuditServer({
      adminId: user.id,
      action: params.action,
      targetTable: params.targetTable,
      targetId: params.targetId,
      details: params.details,
    })

    return { success: true }
  } catch (err) {
    console.error("[admin-audit] Action recording failed:", err)
    return { success: false }
  }
}
