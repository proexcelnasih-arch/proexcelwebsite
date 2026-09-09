import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function check() {
  const { data, error } = await supabase.from("store_settings").select("*")
  if (error) {
    console.error("Error:", error)
  } else {
    console.log("store_settings in DB:", JSON.stringify(data, null, 2))
  }
}

check().catch(console.error)
