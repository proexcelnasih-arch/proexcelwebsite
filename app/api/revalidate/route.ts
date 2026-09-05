import { revalidatePath } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin-guard"

/**
 * GET /api/revalidate?slug=<product-slug>&category=<category-slug>
 * Called by the admin ProductForm after successful product create/update
 * to purge the Next.js page cache so changes appear immediately on the storefront.
 */
export async function GET(request: NextRequest) {
  const adminAuth = await requireAdmin(request)
  if (adminAuth.errorResponse) return adminAuth.errorResponse

  const { searchParams } = new URL(request.url)
  const slug = searchParams.get("slug")
  const category = searchParams.get("category")

  try {
    // Revalidate root layout (navbar cart count, homepage product sections)
    revalidatePath("/", "layout")

    // Revalidate the shop/catalog pages
    revalidatePath("/shop", "page")
    revalidatePath("/all", "page")

    // Revalidate the specific category page
    if (category) {
      revalidatePath(`/category/${category}`, "page")
    }

    // Revalidate the specific product page
    if (slug) {
      revalidatePath(`/product/${slug}`, "page")
    }

    return NextResponse.json({ revalidated: true, slug, category })
  } catch (err) {
    console.error("[api/revalidate] Error:", err)
    return NextResponse.json({ revalidated: false, error: "Erreur lors de la revalidation du cache." }, { status: 500 })
  }
}

export const POST = GET
