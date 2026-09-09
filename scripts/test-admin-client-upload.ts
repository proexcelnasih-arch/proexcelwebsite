import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true })

async function testUpload() {
  console.log("=== Testing createAdminClient Upload ===")
  const { createAdminClient } = await import("../app/lib/supabase/server")
  const supabase = await createAdminClient()

  const testBuffer = Buffer.from("test-server-admin-client-upload")
  const testName = `test/server-admin-${Date.now()}.jpg`

  console.log("1. Uploading to 'product-images' via createAdminClient...")
  const { data: upData, error: upErr } = await supabase.storage
    .from("product-images")
    .upload(testName, testBuffer, { contentType: "image/jpeg", upsert: true })

  if (upErr) {
    console.error("[FAIL] createAdminClient upload failed:", upErr)
    process.exit(1)
  }

  console.log("[PASS] createAdminClient upload succeeded:", upData)

  console.log("2. Cleaning up test file...")
  await supabase.storage.from("product-images").remove([testName])
  console.log("[PASS] Cleaned up test file.")
}

testUpload().catch(console.error)
