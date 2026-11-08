import crypto from "crypto"

/**
 * Server-only order token signer and verifier using HMAC-SHA256 and constant-time comparison.
 * Prevents unauthorized access and enumeration on /checkout/success?order=<uuid>.
 */
function getSecret(): string {
  const secret = process.env.ORDER_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) {
    // Development fallback to prevent fatal crashes if env var is missing during setup
    return "proexcel-default-order-token-secret-change-in-production"
  }
  return secret
}

/**
 * Signs an unforgeable, time-limited token for an order ID.
 * Format: `<expiresAt>.<hmacSignature>`
 */
export function signOrderToken(orderId: string, ttlSeconds = 3600): string {
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds
  const payload = `${orderId}:${expiresAt}`
  const hmac = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex")
  return `${expiresAt}.${hmac}`
}

/**
 * Verifies that the provided token was signed with the server secret for this exact order ID
 * and has not expired. Uses timingSafeEqual to prevent timing attacks.
 */
export function verifyOrderToken(orderId: string, token: string | undefined | null): boolean {
  if (!token || typeof token !== "string" || !orderId) return false

  const parts = token.split(".")
  if (parts.length !== 2) return false

  const [expiresAtStr, providedHmac] = parts
  const expiresAt = parseInt(expiresAtStr, 10)
  const now = Math.floor(Date.now() / 1000)

  // Expired or invalid integer
  if (isNaN(expiresAt) || expiresAt < now) {
    return false
  }

  const payload = `${orderId}:${expiresAt}`
  const expectedHmac = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex")

  try {
    const providedBuf = Buffer.from(providedHmac, "hex")
    const expectedBuf = Buffer.from(expectedHmac, "hex")

    if (providedBuf.length !== expectedBuf.length) {
      return false
    }

    return crypto.timingSafeEqual(providedBuf, expectedBuf)
  } catch {
    return false
  }
}

