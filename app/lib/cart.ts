import { createClient } from "@/lib/supabase/client"

export interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  compare_at_price?: number | null
  image?: string | null
  quantity: number
  max_quantity?: number
  variant?: string | null
}

const CART_STORAGE_KEY = "cart"
const SESSION_TOKEN_KEY = "proexcel_guest_session"

export function getGuestSessionToken(): string {
  if (typeof window === "undefined") return ""
  let token = localStorage.getItem(SESSION_TOKEN_KEY)
  if (!token) {
    token = "gst_" + crypto.randomUUID()
    localStorage.setItem(SESSION_TOKEN_KEY, token)
  }
  return token
}

export function readLocalCart(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed.items) ? parsed.items : []
  } catch {
    return []
  }
}

export function persistLocalCart(items: CartItem[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items }))
    window.dispatchEvent(new Event("cart-updated"))
  } catch {
    // ignore
  }
}

export async function syncCartWithSupabase(): Promise<CartItem[]> {
  const localItems = readLocalCart()
  if (typeof window === "undefined") return localItems

  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const sessionToken = getGuestSessionToken()

    // 1. Revalidate latest prices and stock from Supabase products
    if (localItems.length > 0) {
      const productIds = localItems.map((i) => i.id)
      const { data: dbProducts } = await supabase
        .from("products")
        .select("id, price, compare_at_price, stock_quantity, is_active, name")
        .in("id", productIds)

      if (dbProducts && dbProducts.length > 0) {
        const prodMap = new Map(dbProducts.map((p) => [p.id, p]))
        const verifiedItems: CartItem[] = []

        for (const item of localItems) {
          const dbP = prodMap.get(item.id)
          if (dbP && dbP.is_active) {
            const availableStock = dbP.stock_quantity ?? 99
            verifiedItems.push({
              ...item,
              price: dbP.price,
              compare_at_price: dbP.compare_at_price,
              max_quantity: availableStock,
              quantity: Math.min(item.quantity, Math.max(1, availableStock)),
            })
          }
        }

        persistLocalCart(verifiedItems)
        return verifiedItems
      }
    }

    return localItems
  } catch (err) {
    console.warn("[cart] Error syncing with Supabase:", err)
    return localItems
  }
}

export async function addToCart(item: CartItem): Promise<void> {
  const current = readLocalCart()
  const idx = current.findIndex((i) => i.id === item.id)
  let updated: CartItem[]

  if (idx > -1) {
    const max = current[idx].max_quantity ?? 99
    updated = current.map((i, index) =>
      index === idx ? { ...i, quantity: Math.min(i.quantity + item.quantity, max) } : i
    )
  } else {
    updated = [...current, item]
  }

  persistLocalCart(updated)
  await syncCartWithSupabase()
}

export async function updateCartItemQuantity(id: string, delta: number): Promise<void> {
  const current = readLocalCart()
  const updated = current.map((item) => {
    if (item.id === id) {
      const max = item.max_quantity ?? 99
      const nextQty = Math.max(1, Math.min(item.quantity + delta, max))
      return { ...item, quantity: nextQty }
    }
    return item
  })

  persistLocalCart(updated)
}

export async function removeCartItem(id: string): Promise<void> {
  const current = readLocalCart()
  const updated = current.filter((item) => item.id !== id)
  persistLocalCart(updated)
}

export async function clearCart(): Promise<void> {
  persistLocalCart([])
}
