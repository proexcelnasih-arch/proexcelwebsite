import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function populateDiscounts() {
  console.log("=== Populating Promotional Compare-At Prices in Catalog ===\n")

  // Fetch active products
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, compare_at_price, is_bestseller, is_featured")
    .eq("is_active", true)

  if (error || !products) {
    console.error("Failed to fetch products:", error)
    return
  }

  console.log(`Total active products fetched: ${products.length}`)

  // Select candidates:
  // 1. All bestsellers and featured
  // 2. Plus every 5th product in the catalog to get a broad spread across all categories (~130 products)
  const candidates = products.filter((p, idx) => {
    return p.is_bestseller || p.is_featured || idx % 5 === 0
  })

  console.log(`Selected ${candidates.length} candidate products for discounts.`)

  let updatedCount = 0
  const discountRatios = [1.15, 1.20, 1.25, 1.30, 1.35] // 15%, 20%, 25%, 30%, 35% discount

  for (let i = 0; i < candidates.length; i++) {
    const p = candidates[i]
    if (p.price <= 0) continue

    const ratio = discountRatios[i % discountRatios.length]
    // Calculate compare_at_price
    let comparePrice = Math.round(p.price * ratio)
    if (comparePrice <= p.price) {
      comparePrice = Math.round((p.price + 5) * 10) / 10
    }

    const { error: upErr } = await supabase
      .from("products")
      .update({ compare_at_price: comparePrice })
      .eq("id", p.id)

    if (!upErr) {
      updatedCount++
    }
  }

  console.log(`[PASS] Successfully updated ${updatedCount} products with promotional compare_at_price!`)
}

populateDiscounts().catch(console.error)
