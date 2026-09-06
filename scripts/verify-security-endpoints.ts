import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!
const supabase = createClient(supabaseUrl, anonKey)

async function verifySecurityPosture() {
  console.log("=== Verifying Password Policy & Error Sanitization ===\n")

  // 1. Password Policy Test
  console.log("1. Testing Supabase Auth Password Policy (short password '123')...")
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: "security-audit-test@proexcel.store",
    password: "123",
  })

  if (authError) {
    console.log(`[PASS] Supabase Auth rejected short password as expected: "${authError.message}" (Status: ${authError.status})`)
  } else {
    console.warn(`[WARN] Short password was accepted unexpectedly:`, authData)
  }

  // 2. Error Sanitization Test: Call /api/revalidate with invalid secret/payload
  console.log("\n2. Testing /api/revalidate error sanitization...")
  try {
    const res = await fetch("http://127.0.0.1:3000/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/bogus-path", secret: "wrong-secret" }),
    })
    const body = await res.json()
    console.log(`Response status: ${res.status}`)
    console.log(`Response body:`, body)
    
    // Ensure no stack trace or internal path is exposed
    const bodyStr = JSON.stringify(body)
    const hasLeakage = bodyStr.includes("node_modules") || bodyStr.includes("Postgres") || bodyStr.includes("Error:")
    if (!hasLeakage) {
      console.log("[PASS] /api/revalidate returns clean, sanitized response without stack traces or leaks.")
    } else {
      console.error("[FAIL] Leakage detected in /api/revalidate response:", body)
    }
  } catch (err: any) {
    console.error("Fetch failed:", err.message)
  }

  // 3. Error Sanitization Test: Call /api/admin/products with DELETE without admin session
  console.log("\n3. Testing /api/admin/products unauthenticated DELETE error sanitization...")
  try {
    const res = await fetch("http://127.0.0.1:3000/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "non-existent-uuid" }),
    })
    const body = await res.json()
    console.log(`Response status: ${res.status}`)
    console.log(`Response body:`, body)

    const bodyStr = JSON.stringify(body)
    const hasLeakage = bodyStr.includes("SELECT") || bodyStr.includes("DELETE FROM") || bodyStr.includes("column")
    if (!hasLeakage && (res.status === 401 || res.status === 403)) {
      console.log("[PASS] /api/admin/products properly guards unauthorized access and returns sanitized JSON.")
    } else {
      console.log(`Result: status=${res.status}, sanitized=${!hasLeakage}`)
    }
  } catch (err: any) {
    console.error("Fetch failed:", err.message)
  }
}

verifySecurityPosture().catch(console.error)
