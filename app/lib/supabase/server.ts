import { createServerClient } from "@supabase/ssr"
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import type { Database } from "@/types/database"

export async function createClient() {
  let cookieStore: any = null
  try {
    cookieStore = await cookies()
  } catch {
    // Outside request store (e.g. background tasks, scripts, build-time)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!

  if (cookieStore) {
    return createServerClient<Database>(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, {
                  ...options,
                  sameSite: "lax",
                  secure: process.env.NODE_ENV === "production",
                  path: "/",
                })
              })
            } catch {
              // Server Component — can't set cookies, handled by middleware
            }
          },
        },
      }
    )
  }

  return createSupabaseJsClient<Database>(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })
}

export async function createAdminClient() {
  return createSupabaseJsClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
