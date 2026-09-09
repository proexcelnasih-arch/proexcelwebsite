import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!

console.log("Supabase URL:", supabaseUrl)
console.log("Anon Key present:", !!supabaseAnon)

const supabase = createClient(supabaseUrl, supabaseAnon)

async function test() {
  console.log("Starting signup test...")
  const start = Date.now()
  const testEmail = `test_${Date.now()}@proexcel-test.com`

  try {
    const res = await supabase.auth.signUp({
      email: testEmail,
      password: "TestPassword123!@",
      options: {
        data: { full_name: "Test User" },
      },
    })
    const duration = Date.now() - start
    console.log(`Signup finished in ${duration}ms`)
    if (res.error) {
      console.log("Response Error:", res.error)
    } else {
      console.log("User ID:", res.data.user?.id)
      console.log("Session:", res.data.session ? "Yes" : "No")
      console.log("Identities count:", res.data.user?.identities?.length)
    }
  } catch (err) {
    console.error(`Caught exception after ${Date.now() - start}ms:`, err)
  }
}

test()
