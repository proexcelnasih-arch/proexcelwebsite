import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
})

async function inspectPolicies() {
  console.log("=== Inspecting RLS Policies in Supabase ===")
  
  // Use RPC or direct query via postgres if available, or query information_schema / pg_policies
  // We can query pg_policies using an rpc or a query if allowed, or check migrations
  const { data, error } = await supabase.rpc("exec_sql", {
    sql: `
      select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
      from pg_policies
      where tablename in ('products', 'product_images', 'objects', 'buckets')
      order by tablename, cmd;
    `
  })

  if (error) {
    console.log("RPC exec_sql not available:", error.message)
    // Let's test inserting directly with service role vs authenticated user
  } else {
    console.log("Policies found:")
    console.log(JSON.stringify(data, null, 2))
  }
}

inspectPolicies().catch(console.error)
