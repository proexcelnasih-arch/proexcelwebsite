import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function sync() {
  console.log("=== Syncing Social Settings to Supabase store_settings ===")
  const socialLinks = {
    instagram: "https://instagram.com/proexcel.store",
    facebook: "https://facebook.com/proexcel.papeterie",
    whatsapp: "+212 661-234567",
    tiktok: "https://tiktok.com/@proexcel.store",
  }
  const contactPhone = "+212 661-234567"

  console.log("Updating store_settings row 1...")
  const { data, error } = await supabaseAdmin
    .from("store_settings")
    .update({
      social_links: socialLinks,
      contact_phone: contactPhone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1)
    .select()

  if (error) {
    console.error("Error updating settings:", error)
    process.exit(1)
  }

  console.log("[PASS] Successfully updated store_settings in DB:", JSON.stringify(data?.[0]?.social_links, null, 2))
  console.log("Contact Phone in DB:", data?.[0]?.contact_phone)

  console.log("\nVerifying storefront homepage fetch...")
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000"
  try {
    const res = await fetch(`${baseUrl}/`, { cache: "no-store" })
    const html = await res.text()

    const hasPhone = html.includes("+212 661-234567") || html.includes("212661234567")
    const hasFb = html.includes("proexcel.papeterie")
    const hasIg = html.includes("instagram.com/proexcel.store")

    console.log("Does rendered HTML contain phone/whatsapp (+212 661-234567)?", hasPhone ? "[PASS] YES" : "[FAIL] NO")
    console.log("Does rendered HTML contain facebook (proexcel.papeterie)?", hasFb ? "[PASS] YES" : "[FAIL] NO")
    console.log("Does rendered HTML contain instagram (proexcel.store)?", hasIg ? "[PASS] YES" : "[FAIL] NO")
  } catch (fetchErr) {
    console.warn("Could not fetch local storefront:", fetchErr)
  }
}

sync()
