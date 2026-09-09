import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function inspectBic() {
  console.log("=== Inspecting BIC Cristal Bleu ===")
  const { data: prod } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("id", "fcf0bbde-270e-4e1d-9e69-871071359e1d")
    .single()

  console.log("Product:", prod)

  console.log("\n=== Checking Broader Sample for Missing Images ===")
  // How many active products have 0 product_images?
  const { data: allProds } = await supabase
    .from("products")
    .select("id, name, slug, product_images(id, url)")
    .eq("is_active", true)

  const missingImages = (allProds || []).filter(p => !p.product_images || p.product_images.length === 0)
  console.log(`Total active products: ${allProds?.length}`)
  console.log(`Products with NO images in product_images table: ${missingImages.length}`)
  if (missingImages.length > 0) {
    console.log("Sample of products missing images (up to 10):", missingImages.slice(0, 10).map(p => ({ id: p.id, name: p.name })))
  }

  // Check products with images that might have broken or empty URLs
  const withImages = (allProds || []).filter(p => p.product_images && p.product_images.length > 0)
  const emptyUrls = withImages.filter(p => p.product_images.some((img: any) => !img.url || img.url.trim() === ""))
  console.log(`Products with empty image URLs: ${emptyUrls.length}`)
}

inspectBic().catch(console.error)
