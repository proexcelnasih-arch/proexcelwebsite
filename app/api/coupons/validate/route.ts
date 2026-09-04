import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    const rateCheck = await checkRateLimit("couponValidate", clientIp)
    if (!rateCheck.success) {
      return NextResponse.json(
        { valid: false, message: "Trop de tentatives de validation. Veuillez patienter avant de réessayer." },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => null)
    if (!body || !body.code) {
      return NextResponse.json(
        { valid: false, message: "Code promo manquant." },
        { status: 400 }
      )
    }

    const code = String(body.code).trim().toUpperCase()
    const subtotal = Number(body.subtotal) || 0

    const supabase = await createClient()
    const { data, error } = await supabase.rpc("validate_coupon", {
      p_code: code,
      p_subtotal: subtotal,
    })

    if (error) {
      console.warn("[coupons/validate] RPC error:", error.message)
      return NextResponse.json({
        valid: false,
        message: "Code promo invalide ou expiré.",
      })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error("[coupons/validate] unexpected error:", err)
    return NextResponse.json(
      { valid: false, message: "Erreur lors de la validation du code promo." },
      { status: 500 }
    )
  }
}
