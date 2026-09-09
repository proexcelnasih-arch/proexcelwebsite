import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true })

async function testOffers() {
  console.log("=== Testing getBestOfferProducts ===")
  const { getBestOfferProducts } = await import("../app/lib/supabase/queries")
  const offers = await getBestOfferProducts([], 8)

  console.log(`Offers fetched: ${offers.length}`)
  console.log(JSON.stringify(offers.map(o => ({
    name: o.name,
    price: o.price,
    compare_at_price: o.compare_at_price,
    discount_percentage: o.discount_percentage,
    image: o.primary_image?.url
  })), null, 2))
}

testOffers().catch(console.error)
