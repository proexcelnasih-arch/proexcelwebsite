import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function testPhoneSync() {
  console.log("=== Testing Part C: Phone Number Sync End-to-End ===\n")

  const originalPhone = "+212 6 25 15 15 12"
  const testPhone = "06 11 11 11 11"

  // 1. Set to test phone
  console.log(`1. Setting store_settings.contact_phone to '${testPhone}' in database...`)
  const { error: err1 } = await supabase
    .from("store_settings")
    .update({ contact_phone: testPhone, updated_at: new Date().toISOString() })
    .eq("id", 1)

  if (err1) throw err1

  // 2. Fetch homepage HTML to check if new phone appears
  console.log("2. Fetching homepage (http://127.0.0.1:3000/)...")
  const res1 = await fetch("http://127.0.0.1:3000/", { cache: "no-store" })
  const html1 = await res1.text()

  const containsTestPhone = html1.includes(testPhone)
  console.log(` - Does homepage contain '${testPhone}'?`, containsTestPhone ? "[PASS] YES!" : "[FAIL] NO!")

  // 3. Restore original phone
  console.log(`\n3. Restoring store_settings.contact_phone to '${originalPhone}'...`)
  const { error: err2 } = await supabase
    .from("store_settings")
    .update({ contact_phone: originalPhone, updated_at: new Date().toISOString() })
    .eq("id", 1)

  if (err2) throw err2

  // 4. Fetch homepage HTML again
  console.log("4. Fetching homepage again to confirm restoration...")
  const res2 = await fetch("http://127.0.0.1:3000/", { cache: "no-store" })
  const html2 = await res2.text()

  const containsOriginalPhone = html2.includes(originalPhone)
  console.log(` - Does homepage contain '${originalPhone}'?`, containsOriginalPhone ? "[PASS] YES!" : "[FAIL] NO!")

  if (containsTestPhone && containsOriginalPhone) {
    console.log("\n[SUCCESS] Part C Phone Sync Test PASSED completely!")
  } else {
    console.error("\n[FAILURE] Phone Sync Test FAILED!")
    process.exit(1)
  }
}

testPhoneSync().catch(console.error)
