import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/admin-guard"
import { checkRateLimit } from "@/lib/rate-limit"
import { logAdminAuditServer } from "@/lib/admin/audit"
import { getAdminOrder } from "@/lib/admin/admin-queries"
import type { Database } from "@/types/database"

export const dynamic = "force-dynamic"

/**
 * GET /api/admin/orders/[id]
 * Fetch single order with details, items, and status history using service role.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminAuth = await requireAdmin(req)
    if (adminAuth.errorResponse) return adminAuth.errorResponse

    const rateCheck = await checkRateLimit("adminApi", adminAuth.user.id)
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: "Limite de requêtes atteinte. Veuillez patienter." },
        { status: 429 }
      )
    }

    const { id: orderId } = await params
    if (!orderId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
      return NextResponse.json({ success: false, error: "Identifiant de commande invalide." }, { status: 400 })
    }

    const order = await getAdminOrder(orderId)
    if (!order) {
      return NextResponse.json({ success: false, error: "Commande introuvable." }, { status: 404 })
    }

    return NextResponse.json({ success: true, order })
  } catch (err: unknown) {
    console.error("[api/admin/orders/[id]/get] Unexpected error:", err)
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue lors de la récupération de la commande." },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/orders/[id]
 * Update status or internal notes for an order.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminAuth = await requireAdmin(req)
    if (adminAuth.errorResponse) return adminAuth.errorResponse

    const rateCheck = await checkRateLimit("adminApi", adminAuth.user.id)
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: "Limite de requêtes atteinte. Veuillez patienter." },
        { status: 429 }
      )
    }

    const { id: orderId } = await params
    if (!orderId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
      return NextResponse.json({ success: false, error: "Identifiant de commande invalide." }, { status: 400 })
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Corps de requête invalide" }, { status: 400 })
    }

    const { status, notes, note } = body
    const supabase = await createAdminClient()

    // 1. Handle Status Update / Cancellation
    if (status !== undefined) {
      const allowedStatuses: Database["public"]["Enums"]["order_status"][] = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ]

      if (!allowedStatuses.includes(status)) {
        return NextResponse.json({ success: false, error: "Statut de commande invalide." }, { status: 400 })
      }

      if (status === "cancelled") {
        // Use transactional cancellation RPC
        const { error: cancelError } = await supabase.rpc("cancel_order_and_restore_stock", {
          p_order_id: orderId,
          p_note: note || "Annulation manuelle par l'administrateur",
        })

        if (cancelError) {
          console.error("[api/admin/orders/[id]/patch] Cancel RPC error:", cancelError.message)
          return NextResponse.json(
            { success: false, error: "Impossible d'annuler la commande." },
            { status: 500 }
          )
        }
      } else {
        const { error: updateError } = await supabase
          .from("orders")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", orderId)

        if (updateError) {
          console.error("[api/admin/orders/[id]/patch] Status update error:", updateError.message)
          return NextResponse.json(
            { success: false, error: "Impossible de mettre à jour le statut." },
            { status: 500 }
          )
        }

        // Add history entry
        await supabase.from("order_status_history").insert({
          order_id: orderId,
          status,
          changed_by: adminAuth.user.id,
          note: note || `Statut modifié vers ${status}`,
        })
      }

      await logAdminAuditServer({
        adminId: adminAuth.user.id,
        action: "order.status_change",
        targetTable: "orders",
        targetId: orderId,
        details: { new_status: status },
      })
    }

    // 2. Handle Notes Update
    if (notes !== undefined) {
      const { error: noteError } = await supabase
        .from("orders")
        .update({ notes: typeof notes === "string" ? notes.trim() : null })
        .eq("id", orderId)

      if (noteError) {
        console.error("[api/admin/orders/[id]/patch] Notes update error:", noteError.message)
        return NextResponse.json(
          { success: false, error: "Impossible d'enregistrer la note." },
          { status: 500 }
        )
      }

      await logAdminAuditServer({
        adminId: adminAuth.user.id,
        action: "order.update_notes",
        targetTable: "orders",
        targetId: orderId,
        details: { updated_at: new Date().toISOString() },
      })
    }

    // Fetch and return fresh order data
    const updatedOrder = await getAdminOrder(orderId)
    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (err: unknown) {
    console.error("[api/admin/orders/[id]/patch] Unexpected error:", err)
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue lors de la mise à jour." },
      { status: 500 }
    )
  }
}

