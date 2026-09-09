import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as path from "path"
import * as fs from "fs"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function fixBicImage() {
  console.log("=== Fixing BIC Cristal Bleu Image ===")

  const productId = "fcf0bbde-270e-4e1d-9e69-871071359e1d"
  const localImagePath = "C:\\Users\\abdd6\\.gemini\\antigravity-ide\\brain\\c622f7bc-fa55-49f2-aa57-2b7bc1e60b73\\bic_cristal_bleu_1788700106060.jpg"

  if (!fs.existsSync(localImagePath)) {
    throw new Error(`File not found: ${localImagePath}`)
  }

  const fileBuffer = fs.readFileSync(localImagePath)
  const storageFileName = `products/bic-cristal-bleu-${Date.now()}.jpg`

  console.log(`1. Uploading image to 'product-images' storage bucket as '${storageFileName}'...`)
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from("product-images")
    .upload(storageFileName, fileBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    })

  if (uploadErr) {
    throw new Error(`Upload failed: ${uploadErr.message}`)
  }

  console.log("[PASS] Image uploaded successfully!")

  const { data: publicUrlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(storageFileName)

  const publicUrl = publicUrlData.publicUrl
  console.log(`2. Public URL: ${publicUrl}`)

  // 3. Insert or update row in product_images
  console.log(`3. Linking image to product ID ${productId}...`)
  const { data: imgRow, error: imgErr } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      url: publicUrl,
      is_primary: true,
      display_order: 0,
      alt_text: "STYLO À BILLE BIC CRISTAL BLEU",
    })
    .select()
    .single()

  if (imgErr) {
    throw new Error(`Failed to insert into product_images: ${imgErr.message}`)
  }

  console.log("[PASS] product_images row created successfully:", imgRow)

  // 4. Verify product now has an image
  const { data: verifyProd } = await supabase
    .from("products")
    .select("id, name, product_images(*)")
    .eq("id", productId)
    .single()

  console.log("4. Verification query:", JSON.stringify(verifyProd, null, 2))
}

fixBicImage().catch(console.error)
