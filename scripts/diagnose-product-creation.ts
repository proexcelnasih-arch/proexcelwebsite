import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!

const adminSupabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
})

const anonSupabase = createClient(supabaseUrl, anonKey)

async function testProductCreation() {
  console.log("=== DIAGNOSING PRODUCT CREATION RLS & STORAGE ===")

  // 1. Check storage bucket 'product-images'
  console.log("\n1. Testing Storage Upload to 'product-images'...")
  const testBuffer = Buffer.from("fake-image-data-test-rls")
  const fileName = `test/test-${Date.now()}.jpg`

  console.log(" - Uploading with service_role client...")
  const { data: uploadData, error: uploadErr } = await adminSupabase.storage
    .from("product-images")
    .upload(fileName, testBuffer, { contentType: "image/jpeg", upsert: true })

  if (uploadErr) {
    console.error(" [FAIL] Service role storage upload failed:", uploadErr)
  } else {
    console.log(" [PASS] Service role storage upload succeeded:", uploadData)
    // Clean up
    await adminSupabase.storage.from("product-images").remove([fileName])
  }

  // 2. Check storage upload with anon client (without auth)
  console.log(" - Uploading with anon client...")
  const { data: anonUploadData, error: anonUploadErr } = await anonSupabase.storage
    .from("product-images")
    .upload(fileName, testBuffer, { contentType: "image/jpeg", upsert: true })

  if (anonUploadErr) {
    console.log(" [INFO] Anon upload failed as expected (or unexpectedly):", anonUploadErr.message)
  } else {
    console.log(" [WARN] Anon upload succeeded without auth:", anonUploadData)
    await adminSupabase.storage.from("product-images").remove([fileName])
  }

  // 3. Check products table INSERT with service_role
  console.log("\n2. Testing products INSERT with service_role client...")
  const testSlug = `test-prod-${Date.now()}`
  const { data: prodData, error: prodErr } = await adminSupabase
    .from("products")
    .insert({
      name: "Test Diagnostic Product",
      slug: testSlug,
      price: 99,
      stock_quantity: 10,
      sku: `SKU-${Date.now()}`,
      is_active: true,
    })
    .select("id")
    .single()

  if (prodErr) {
    console.error(" [FAIL] Service role product insert failed:", prodErr)
  } else {
    console.log(" [PASS] Service role product insert succeeded, id:", prodData.id)

    // 4. Check product_images INSERT with service_role
    console.log("\n3. Testing product_images INSERT with service_role client...")
    const { data: imgData, error: imgErr } = await adminSupabase
      .from("product_images")
      .insert({
        product_id: prodData.id,
        url: "https://example.com/test.jpg",
        is_primary: true,
        display_order: 0,
        alt_text: "Test Image",
      })
      .select("id")
      .single()

    if (imgErr) {
      console.error(" [FAIL] Service role product_images insert failed:", imgErr)
    } else {
      console.log(" [PASS] Service role product_images insert succeeded, id:", imgData.id)
    }

    // Clean up test product
    await adminSupabase.from("products").delete().eq("id", prodData.id)
  }

  // 5. Test with an authenticated user (let's check admin profile)
  console.log("\n4. Finding admin user to test authenticated insert...")
  const { data: adminProfiles, error: pErr } = await adminSupabase
    .from("profiles")
    .select("id, email, role")
    .eq("role", "admin")
    .limit(5)

  console.log("Admin profiles found:", adminProfiles)
}

testProductCreation().catch(console.error)
