import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as path from "path"
import { logAdminAuditServer } from "../app/lib/admin/audit"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, serviceKey)

async function testAuditLogging() {
  console.log("=== Testing Admin Audit Logging ===\n")

  const testAction = "test.security_hardening_round_2"
  const testDetails = {
    test_run_by: "security_subagent",
    timestamp: new Date().toISOString(),
    environment: "test_verification",
  }

  console.log(`1. Logging test admin action '${testAction}'...`)
  await logAdminAuditServer({
    adminId: null,
    action: testAction,
    targetTable: "store_settings",
    targetId: null,
    details: testDetails,
  })

  console.log("2. Querying admin_audit_log table to verify persistence...")
  const { data, error } = await supabase
    .from("admin_audit_log")
    .select("*")
    .eq("action", testAction)
    .order("created_at", { ascending: false })
    .limit(1)

  if (error) {
    console.error("[FAIL] Error querying admin_audit_log:", error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.error("[FAIL] No audit record found for test action!")
    process.exit(1)
  }

  console.log("[PASS] Audit record verified successfully in live database:")
  console.log(JSON.stringify(data[0], null, 2))
}

testAuditLogging().catch((err) => {
  console.error("Test failed:", err)
  process.exit(1)
})
