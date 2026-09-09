import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
})

async function checkStorage() {
  // Let's test checking buckets and objects
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets()
  console.log("Buckets:", buckets)

  // Try calling postgres function or inspecting via rpc
  // Let's see if we can create an authenticated client using the admin user
  const adminId = "27f9735c-ef43-4bf8-9023-ab52f515aa0e"
  
  // Test authenticated client upload
  const { data: signInData, error: signInErr } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: "admin1984@proexcel.store"
  })

  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!
  const client = createClient(supabaseUrl, anonKey)
  
  if (signInData?.properties?.hashed_token) {
    const { data: sessionData, error: verifyErr } = await client.auth.verifyOtp({
      token_hash: signInData.properties.hashed_token,
      type: "magiclink"
    })
    
    if (verifyErr) {
      console.log("Verify OTP error:", verifyErr.message)
    } else {
      console.log("Authenticated as:", sessionData.user?.email, "ID:", sessionData.user?.id)

      // Test upload to product-images with authenticated admin client!
      const testBuffer = Buffer.from("test-authenticated-upload")
      const testName = `test/auth-test-${Date.now()}.jpg`
      const { data: upData, error: upErr } = await client.storage
        .from("product-images")
        .upload(testName, testBuffer, { contentType: "image/jpeg" })

      if (upErr) {
        console.error("Authenticated client upload FAILED:", upErr)
      } else {
        console.log("Authenticated client upload SUCCEEDED:", upData)
        await client.storage.from("product-images").remove([testName])
      }

      // Test INSERT into products with authenticated admin client!
      const { data: pData, error: pErr } = await client
        .from("products")
        .insert({
          name: "Auth Test Product",
          slug: `auth-test-${Date.now()}`,
          price: 50,
          category_id: "00000000-0000-0000-0000-000000000000", // dummy, let's see
          sku: `SKU-AUTH-${Date.now()}`
        })
        .select("id")

      if (pErr) {
        console.error("Authenticated client products insert FAILED:", pErr)
      } else {
        console.log("Authenticated client products insert SUCCEEDED:", pData)
      }
    }
  }
}

checkStorage().catch(console.error)
