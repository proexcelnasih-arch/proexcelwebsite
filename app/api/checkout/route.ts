import { NextRequest, NextResponse } from "next/server"
import { createAdminClient, createClient } from "@/lib/supabase/server"

// ── Helpers ────────────────────────────────────────────────────
function validateMoroccanPhone(raw: string): boolean {
  const cleaned = raw.replace(/[\s\-\.\(\)]/g, "")
  return /^(?:(?:\+|00)212|0)[5-7]\d{8}$/.test(cleaned)
}

// ── Types ──────────────────────────────────────────────────────
interface CartItemPayload {
  id: string
  name: string
  price: number
  quantity: number
  image?: string | null
  slug?: string
  max_quantity?: number
}

interface CustomerInfo {
  name: string
  phone: string
  address: string
  city: string
  email?: string
  notes?: string
}

interface RequestPayload {
  items: CartItemPayload[]
  customerInfo: CustomerInfo
  couponCode?: string
}

function err(msg: string, field?: string, status = 400) {
  return NextResponse.json({ success: false, error: msg, field }, { status })
}

// ── POST /api/checkout ─────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // ── 1. Parse body ──────────────────────────────────────────
    let body: RequestPayload
    try {
      body = await request.json()
    } catch {
      return err("Corps de la requête invalide", undefined, 400)
    }

    const { items, customerInfo, couponCode } = body

    // ── 2. Validate cart payload ───────────────────────────────
    if (!Array.isArray(items) || items.length === 0) {
      return err("Votre panier est vide.")
    }
    for (const item of items) {
      if (!item.id || !item.name || typeof item.price !== "number" || !item.quantity) {
        return err("Données du panier invalides.")
      }
      if (item.quantity < 1 || item.quantity > 99) {
        return err(`Quantité invalide pour "${item.name}".`)
      }
    }

    // ── 3. Validate customer info ──────────────────────────────
    const name = customerInfo?.name?.trim() ?? ""
    const phone = customerInfo?.phone?.trim() ?? ""
    const address = customerInfo?.address?.trim() ?? ""
    const city = customerInfo?.city?.trim() ?? ""
    const email = customerInfo?.email?.trim() ?? ""

    if (name.length < 2) return err("Nom complet requis (au moins 2 caractères).", "name")
    if (!validateMoroccanPhone(phone)) return err("Numéro de téléphone invalide. Format attendu : 06XXXXXXXX", "phone")
    if (address.length < 5) return err("Adresse de livraison complète requise.", "address")
    if (!city) return err("Ville de livraison requise.", "city")
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return err("Adresse email invalide.", "email")
    }

    // ── 4. Determine authenticated user (if logged in) ────────
    let userId: string | null = null
    try {
      const userClient = await createClient()
      const { data: { user } } = await userClient.auth.getUser()
      if (user?.id) userId = user.id
    } catch {
      // Guest order
    }

    // ── 5. Execute Transactional Checkout RPC in PostgreSQL ─────
    const adminSupabase = await createAdminClient()

    const rpcPayload = {
      p_user_id: userId,
      p_customer_name: name,
      p_customer_phone: phone,
      p_customer_email: email || null,
      p_shipping_address: { full_name: name, phone, address, city },
      p_items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
      p_coupon_code: couponCode?.trim() || null,
      p_notes: customerInfo.notes?.trim() || null,
      p_cart_id: null,
    }

    const { data: rpcResult, error: rpcError } = await adminSupabase.rpc(
      "process_checkout_order",
      rpcPayload
    )

    if (rpcError) {
      console.warn("[checkout] process_checkout_order RPC error:", rpcError.message)
      // Extract user friendly message from Postgres raise exception
      const cleanMessage = rpcError.message
        .replace(/^.*EXCEPTION:\s*/i, "")
        .replace(/CONTEXT:[\s\S]*$/i, "")
        .trim()

      if (cleanMessage.toLowerCase().includes("stock")) {
        return err(cleanMessage || "Un ou plusieurs articles sont en rupture de stock.")
      }
      if (cleanMessage.toLowerCase().includes("coupon") || cleanMessage.toLowerCase().includes("code promo")) {
        return err(cleanMessage || "Code promo invalide ou inapplicable.", "coupon")
      }
      return err(cleanMessage || "Impossible de finaliser la commande. Veuillez vérifier votre panier.")
    }

    const result = rpcResult as {
      success: boolean
      order_id: string
      order_number: string
      subtotal: number
      shipping_cost: number
      discount_amount: number
      total: number
    }

    return NextResponse.json({
      success: true,
      orderId: result.order_id,
      orderNumber: result.order_number,
      subtotal: result.subtotal,
      shipping: result.shipping_cost,
      discount: result.discount_amount,
      total: result.total,
    })
  } catch (error) {
    console.error("[checkout] unexpected error:", error)
    return NextResponse.json(
      { success: false, error: "Une erreur inattendue s'est produite lors de la validation. Veuillez réessayer." },
      { status: 500 }
    )
  }
}
