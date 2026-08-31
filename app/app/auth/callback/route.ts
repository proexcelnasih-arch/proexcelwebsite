import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/account"
  const type = requestUrl.searchParams.get("type")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      if (next === "/reset-password" || type === "recovery") {
        return NextResponse.redirect(`${requestUrl.origin}/reset-password`)
      }
      return NextResponse.redirect(`${requestUrl.origin}/login?confirmed=true`)
    }
  }

  // Fallback to login with error state
  return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_callback_failed`)
}
