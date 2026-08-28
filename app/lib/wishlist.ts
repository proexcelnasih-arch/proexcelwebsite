import { createClient } from "@/lib/supabase/client"

const LOCAL_STORAGE_KEY = "wishlist"

export async function getWishlistProductIds(): Promise<string[]> {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("product_id")
        .eq("user_id", session.user.id)

      if (!error && data) {
        const ids = data.map((item) => item.product_id)
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ids))
        }
        return ids
      }
    }
  } catch (err) {
    console.warn("[wishlist] Error fetching from Supabase:", err)
  }

  if (typeof window !== "undefined") {
    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? "[]")
      return Array.isArray(stored) ? stored : []
    } catch {
      return []
    }
  }
  return []
}

export async function toggleWishlistProduct(productId: string): Promise<boolean> {
  let isAdded = false
  if (typeof window === "undefined") return isAdded

  try {
    const current = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? "[]") as string[]
    const exists = current.includes(productId)
    const nextList = exists
      ? current.filter((id) => id !== productId)
      : [...current, productId]

    isAdded = !exists
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextList))
    window.dispatchEvent(new Event("wishlist-updated"))

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      if (isAdded) {
        await supabase
          .from("wishlist_items")
          .insert({ user_id: session.user.id, product_id: productId })
      } else {
        await supabase
          .from("wishlist_items")
          .delete()
          .eq("user_id", session.user.id)
          .eq("product_id", productId)
      }
    }
  } catch (err) {
    console.warn("[wishlist] Error toggling wishlist product:", err)
  }

  return isAdded
}

export async function clearWishlist(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]))
    window.dispatchEvent(new Event("wishlist-updated"))
  }

  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", session.user.id)
    }
  } catch (err) {
    console.warn("[wishlist] Error clearing Supabase wishlist:", err)
  }
}
