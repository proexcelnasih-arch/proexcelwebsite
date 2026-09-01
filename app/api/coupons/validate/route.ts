import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
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
