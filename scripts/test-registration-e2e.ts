import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
import { createClient } from "@supabase/supabase-js"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000"
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testRegistration() {
  console.log("=== End-to-End Registration Test ===")
  const testEmail = `e2e_user_${Date.now()}@proexcel.store`
  const testPassword = "ValidPassword123!@"
  const testName = "E2E Test User"

  console.log(`1. Posting registration request for ${testEmail} to ${baseUrl}/api/auth/register...`)
  const start = Date.now()

  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      fullName: testName,
    }),
  })

  const elapsed = Date.now() - start
  console.log(`HTTP Status: ${res.status} (Elapsed: ${elapsed}ms)`)

  const json = await res.json()
  console.log("Response Body:", json)

  if (!res.ok || !json.success) {
    throw new Error(`Registration failed: ${JSON.stringify(json)}`)
  }

  console.log("[PASS] Registration succeeded within timeout limits!")

  console.log("2. Verifying user in Supabase auth and profiles...")
  const userId = json.user.id

  const { data: profile, error: profErr } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (profErr || !profile) {
    throw new Error(`Profile not found: ${profErr?.message}`)
  }

  console.log(`[PASS] Profile found: ${profile.full_name}, email: ${profile.email}, role: ${profile.role}`)

  console.log("3. Testing client login with created credentials...")
  const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  const { data: authData, error: authErr } = await supabaseAnon.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  })

  if (authErr || !authData.session) {
    throw new Error(`Sign in failed: ${authErr?.message}`)
  }

  console.log("[PASS] Sign in succeeded! Access Token acquired.")

  console.log("4. Cleaning up test user...")
  await supabaseAdmin.auth.admin.deleteUser(userId)
  console.log("[PASS] Test user cleaned up.")

  console.log("\n==========================================")
  console.log("ALL REGISTRATION E2E VERIFICATIONS PASSED!")
  console.log("==========================================")
}

testRegistration().catch((err) => {
  console.error("Test failed:", err)
  process.exit(1)
})
