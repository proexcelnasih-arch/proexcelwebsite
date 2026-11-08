import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

const trackSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .min(3, "Numéro de commande trop court")
    .max(50, "Numéro de commande trop long"),
  phone: z
    .string()
    .trim()
    .min(8, "Numéro de téléphone invalide")
    .max(25, "Numéro de téléphone trop long"),
})

function normalizePhone(raw: string): string {
  let cleaned = raw.replace(/[\s\-\.\(\)]/g, "")
  if (cleaned.startsWith("+212")) cleaned = "0" + cleaned.slice(4)
  else if (cleaned.startsWith("00212")) cleaned = "0" + cleaned.slice(5)
  else if (cleaned.startsWith("212")) cleaned = "0" + cleaned.slice(3)
  return cleaned
}

const GENERIC_NOT_FOUND_MSG = "Commande introuvable. Veuillez vérifier votre numéro de commande et votre numéro de téléphone."

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting per IP (5 requests / minute to prevent brute-force and enumeration)
    const clientIp = getClientIp(req)
    const rateCheck = await checkRateLimit("orderTrack", clientIp)
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: "Trop de tentatives de recherche. Veuillez patienter une minute avant de réessayer." },
        { status: 429 }
      )
    }

    // 2. Parse & Validate body with zod
    const body = await req.json().catch(() => null)
    const parseResult = trackSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: GENERIC_NOT_FOUND_MSG },
        { status: 400 }
      )
    }

    const { orderNumber, phone } = parseResult.data
    const normalizedInputPhone = normalizePhone(phone)
    const cleanOrderNum = orderNumber.toUpperCase().replace(/\s+/g, "")
    const fullOrderNum = cleanOrderNum.startsWith("CMD-") ? cleanOrderNum : `CMD-${cleanOrderNum}`

    // 3. Query order by exact order number using service role
    const supabase = await createAdminClient()
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        customer_phone,
        status,
        total,
        created_at,
        order_items (
          product_name_snapshot,
          quantity
        ),
        order_status_history (
          status,
          created_at
        )
      `)
      .or(`order_number.eq.${cleanOrderNum},order_number.eq.${fullOrderNum}`)
      .maybeSingle()

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: GENERIC_NOT_FOUND_MSG },
        { status: 404 }
      )
    }

    // 4. Verify phone matches to prevent enumeration by guessing order numbers
    const normalizedDbPhone = normalizePhone(order.customer_phone || "")
    const inputDigits = normalizedInputPhone.replace(/\D/g, "")
    const dbDigits = normalizedDbPhone.replace(/\D/g, "")

    const isPhoneMatch =
      inputDigits.length >= 8 &&
      (dbDigits === inputDigits ||
        dbDigits.endsWith(inputDigits.slice(-8)) ||
        inputDigits.endsWith(dbDigits.slice(-8)))

    if (!isPhoneMatch) {
      return NextResponse.json(
        { success: false, error: GENERIC_NOT_FOUND_MSG },
        { status: 404 }
      )
    }

    // 5. Return sanitized tracking details (NO name, NO address, NO notes)
    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.order_number,
        status: order.status,
        total: order.total,
        createdAt: order.created_at,
        items: (order.order_items || []).map((i) => ({
          name: i.product_name_snapshot,
          quantity: i.quantity,
        })),
        history: (order.order_status_history || [])
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((h) => ({
            status: h.status,
            createdAt: h.created_at,
          })),
      },
    })
  } catch (err: unknown) {
    console.error("[api/orders/track] Unexpected error:", err)
    return NextResponse.json(
      { success: false, error: GENERIC_NOT_FOUND_MSG },
      { status: 500 }
    )
  }
}

