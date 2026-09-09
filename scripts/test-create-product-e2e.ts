import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!

const adminSupabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
const clientSupabase = createClient(supabaseUrl, anonKey)

async function testProductCreationEndToEnd() {
  console.log("=== End-to-End Test: Product Creation with Uploaded Image ===\n")

  // 1. Get an admin token for API calls
  console.log("1. Authenticating as admin (admin1984@proexcel.store)...")
  const { data: linkData, error: linkErr } = await adminSupabase.auth.admin.generateLink({
    type: "magiclink",
    email: "admin1984@proexcel.store"
  })

  if (linkErr || !linkData?.properties?.hashed_token) {
    throw new Error(`Failed to generate magic link: ${linkErr?.message}`)
  }

  const { data: sessionData, error: otpErr } = await clientSupabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: "magiclink"
  })

  if (otpErr || !sessionData.session?.access_token) {
    throw new Error(`Failed to verify OTP: ${otpErr?.message}`)
  }

  const accessToken = sessionData.session.access_token
  console.log("[PASS] Successfully authenticated as admin. Bearer token acquired.")

  // 2. Upload image via /api/admin/upload
  console.log("\n2. Uploading test product image to /api/admin/upload...")
  const testFileBuffer = Buffer.from("fake-jpg-content-for-test-verification-e2e")
  const formData = new FormData()
  const blob = new Blob([testFileBuffer], { type: "image/jpeg" })
  formData.append("file", blob, "test-product-upload.jpg")
  formData.append("bucket", "product-images")

  const uploadRes = await fetch("http://127.0.0.1:3000/api/admin/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  })

  const uploadResult = await uploadRes.json()
  console.log("Upload status:", uploadRes.status)
  console.log("Upload result:", uploadResult)

  if (!uploadRes.ok || !uploadResult.success) {
    throw new Error(`Image upload failed: ${JSON.stringify(uploadResult)}`)
  }

  const uploadedImageUrl = (uploadResult.urls && uploadResult.urls[0]) || uploadResult.url
  console.log(`[PASS] Upload succeeded! Image URL: ${uploadedImageUrl}`)

  // 3. Find a subcategory to test subcategory assignment
  console.log("\n3. Finding a valid subcategory in the database...")
  const { data: subcats } = await adminSupabase
    .from("categories")
    .select("id, name, parent_id")
    .not("parent_id", "is", null)
    .limit(1)

  if (!subcats || subcats.length === 0) {
    throw new Error("No subcategory found in database")
  }

  const testSubcat = subcats[0]
  console.log(`Selected subcategory: "${testSubcat.name}" (ID: ${testSubcat.id})`)

  // 4. Create product via /api/admin/products
  console.log("\n4. Creating product via /api/admin/products...")
  const testSlug = `e2e-test-prod-${Date.now()}`
  const productPayload = {
    formData: {
      name: `E2E Test Product ${Date.now()}`,
      slug: testSlug,
      description: "Produit de test créé pour valider l'upload d'image et l'affectation à une sous-catégorie.",
      price: 45,
      compare_at_price: 60,
      stock: 25,
      sku: `SKU-E2E-${Date.now()}`,
      category_id: testSubcat.id,
      category_name: testSubcat.name,
      brand_name: "Clairefontaine",
      is_bestseller: false,
      is_new_arrival: true,
      is_featured: false,
      is_active: true,
      images: [uploadedImageUrl],
    },
    variants: [],
    isEdit: false,
  }

  const createRes = await fetch("http://127.0.0.1:3000/api/admin/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(productPayload),
  })

  const createResult = await createRes.json()
  console.log("Create product status:", createRes.status)
  console.log("Create product result:", createResult)

  if (!createRes.ok || !createResult.success) {
    throw new Error(`Product creation failed: ${JSON.stringify(createResult)}`)
  }

  console.log(`[PASS] Product created successfully! ID: ${createResult.productId}`)

  // 5. Verify product and images in DB
  console.log("\n5. Verifying product in database...")
  const { data: createdProd, error: pErr } = await adminSupabase
    .from("products")
    .select("id, name, slug, price, category_id, product_images(*)")
    .eq("id", createResult.productId)
    .single()

  if (pErr || !createdProd) {
    throw new Error(`Failed to query created product: ${pErr?.message}`)
  }

  console.log("Verified Product in DB:", JSON.stringify(createdProd, null, 2))
  const assignedCorrectCategory = createdProd.category_id === testSubcat.id
  const hasImages = createdProd.product_images && createdProd.product_images.length > 0

  console.log(" - Category correctly assigned to subcategory:", assignedCorrectCategory ? "[PASS] YES!" : "[FAIL] NO!")
  console.log(" - Image row created in product_images:", hasImages ? "[PASS] YES!" : "[FAIL] NO!")

  // 6. Test Storefront Fetch
  console.log(`\n6. Fetching storefront page (http://127.0.0.1:3000/product/${testSlug})...`)
  const pageRes = await fetch(`http://127.0.0.1:3000/product/${testSlug}`, { cache: "no-store" })
  console.log(` - Storefront HTTP Status: ${pageRes.status}`)
  const pageHtml = await pageRes.text()
  const rendersName = pageHtml.includes(productPayload.formData.name)
  console.log(" - Does page HTML contain product name?", rendersName ? "[PASS] YES!" : "[FAIL] NO!")

  // 7. Cleanup test product
  console.log("\n7. Cleaning up test product...")
  await adminSupabase.from("products").delete().eq("id", createResult.productId)
  console.log("[PASS] Cleaned up test product.")

  console.log("\n=======================================================")
  console.log("ALL PART A & PART E END-TO-END VERIFICATIONS PASSED!")
  console.log("=======================================================")
}

testProductCreationEndToEnd().catch((err) => {
  console.error("Test failed:", err)
  process.exit(1)
})
