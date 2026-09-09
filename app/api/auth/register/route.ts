import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req)
    const rateCheck = await checkRateLimit("register", clientIp)

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Trop de tentatives d'inscription. Veuillez réessayer dans quelques minutes." },
        { status: 429 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const { email, password, fullName, phone } = body

    if (!email || typeof email !== "string" || !isValidEmail(email.trim())) {
      return NextResponse.json(
        { error: "Adresse email invalide ou manquante." },
        { status: 400 }
      )
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit comporter au moins 8 caractères." },
        { status: 400 }
      )
    }

    const cleanName = typeof fullName === "string" ? fullName.trim() : ""
    if (cleanName.length < 2) {
      return NextResponse.json(
        { error: "Le nom complet est requis (min. 2 caractères)." },
        { status: 400 }
      )
    }

    const adminClient = await createAdminClient()
    const cleanEmail = email.trim().toLowerCase()

    const { data, error } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: cleanName,
        phone: typeof phone === "string" ? phone.trim() : "",
      },
    })

    if (error) {
      console.warn("[api/auth/register] Supabase error:", error.message)
      const msg = error.message.toLowerCase()
      if (msg.includes("already") || msg.includes("exists") || msg.includes("unique")) {
        return NextResponse.json(
          { error: "Un compte avec cette adresse email existe déjà. Veuillez vous connecter." },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: "Impossible de créer le compte. Veuillez vérifier vos informations." },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: cleanName,
      },
    })
  } catch (err: any) {
    console.error("[api/auth/register] Exception:", err)
    return NextResponse.json(
      { error: "Une erreur inattendue est survenue lors de l'inscription." },
      { status: 500 }
    )
  }
}
