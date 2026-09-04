"use server"

import { headers } from "next/headers"
import { checkRateLimit } from "@/lib/rate-limit"

export interface PreLoginCheckResult {
  allowed: boolean
  error?: string
}

/**
 * Pre-login rate limiter action.
 * Enforces strict 5 attempts per 15 minutes per IP+email combination for login attempts.
 */
export async function verifyLoginRateLimit(email: string): Promise<PreLoginCheckResult> {
  let clientIp = "127.0.0.1"
  try {
    const reqHeaders = await headers()
    const forwardedFor = reqHeaders.get("x-forwarded-for")
    if (forwardedFor) {
      clientIp = forwardedFor.split(",")[0].trim()
    }
  } catch {
    // Outside request scope
  }

  const cleanEmail = (email || "").trim().toLowerCase()
  const identifier = `${clientIp}:${cleanEmail}`

  const result = await checkRateLimit("adminLogin", identifier)

  if (!result.success) {
    return {
      allowed: false,
      error: "Trop de tentatives de connexion. Pour des raisons de sécurité, veuillez patienter 15 minutes avant de réessayer.",
    }
  }

  return { allowed: true }
}
