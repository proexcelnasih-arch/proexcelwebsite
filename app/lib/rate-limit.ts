import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"
import { NextRequest } from "next/server"

// Initialize Upstash Redis client if credentials are configured
const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

export const isRedisConfigured = Boolean(redisUrl && redisToken)

const redis = isRedisConfigured
  ? new Redis({
      url: redisUrl!,
      token: redisToken!,
    })
  : null

// Ephemeral in-memory fallback for local development or when Redis is not yet provisioned
class MemoryStoreFallback {
  private hits = new Map<string, { count: number; resetTime: number }>()

  async limit(identifier: string, max: number, windowMs: number) {
    const now = Date.now()
    const entry = this.hits.get(identifier)

    if (!entry || entry.resetTime < now) {
      this.hits.set(identifier, { count: 1, resetTime: now + windowMs })
      return { success: true, limit: max, remaining: max - 1, reset: now + windowMs }
    }

    if (entry.count >= max) {
      return { success: false, limit: max, remaining: 0, reset: entry.resetTime }
    }

    entry.count++
    return { success: true, limit: max, remaining: max - entry.count, reset: entry.resetTime }
  }
}

const memoryStore = new MemoryStoreFallback()

// Specific Rate Limiters backed by Upstash Redis
export const rateLimiters = {
  // 1. Admin login specifically: 5 attempts per 15 minutes per IP+email combination
  adminLogin: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        prefix: "rl:admin-login",
        analytics: true,
      })
    : null,

  // 2. General admin API actions (already-authenticated): 30 requests per minute
  adminApi: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, "1 m"),
        prefix: "rl:admin-api",
        analytics: true,
      })
    : null,

  // 3. Checkout: 10 orders per 15 minutes
  checkout: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "15 m"),
        prefix: "rl:checkout",
        analytics: true,
      })
    : null,

  // 4. Coupon validation: 15 attempts per 1 minute
  couponValidate: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(15, "1 m"),
        prefix: "rl:coupon",
        analytics: true,
      })
    : null,

  // 5. Newsletter subscription: 5 attempts per 10 minutes
  newsletter: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "10 m"),
        prefix: "rl:newsletter",
        analytics: true,
      })
    : null,
}

const LIMIT_CONFIGS: Record<keyof typeof rateLimiters, { limit: number; windowMs: number }> = {
  adminLogin: { limit: 5, windowMs: 15 * 60 * 1000 },
  adminApi: { limit: 30, windowMs: 60 * 1000 },
  checkout: { limit: 10, windowMs: 15 * 60 * 1000 },
  couponValidate: { limit: 15, windowMs: 60 * 1000 },
  newsletter: { limit: 5, windowMs: 10 * 60 * 1000 },
}

/**
 * Extracts a client IP from NextRequest
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }
  const realIp = req.headers.get("x-real-ip")
  if (realIp) return realIp.trim()
  return "127.0.0.1"
}

/**
 * Checks rate limit for a specific route/action
 */
export async function checkRateLimit(
  type: keyof typeof rateLimiters,
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const limiter = rateLimiters[type]
  if (limiter && isRedisConfigured) {
    try {
      const result = await limiter.limit(identifier)
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      }
    } catch (err) {
      console.warn(`[rate-limit] Upstash Redis check failed for ${type}, falling back to memory store:`, err)
    }
  }

  // Fallback to local memory limiter
  const config = LIMIT_CONFIGS[type]
  return memoryStore.limit(`${type}:${identifier}`, config.limit, config.windowMs)
}
