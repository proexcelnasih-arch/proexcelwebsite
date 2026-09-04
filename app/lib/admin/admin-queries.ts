import { createAdminClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database"

// ── Types ──────────────────────────────────────────────────────

export type AdminOrderRow = Database["public"]["Tables"]["orders"]["Row"] & {
  item_count: number
  order_items?: { id: string; quantity: number }[]
}

export interface AdminCustomer {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  city: string
  orders_count: number
  total_spent: number
  created_at: string
  last_order_date: string
}

// ── Orders ────────────────────────────────────────────────────

/**
 * Fetch all orders with item counts — uses service role to bypass RLS.
 * MUST only be called from Server Components or API Routes.
 */
export async function getAdminOrders(): Promise<AdminOrderRow[]> {
  try {
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(id, quantity)")
      .order("created_at", { ascending: false })

    if (error || !data) {
      console.error("[admin-queries] getAdminOrders error:", error?.message)
      return []
    }

    return data.map((o: any) => ({
      ...o,
      item_count: (o.order_items ?? []).reduce(
        (sum: number, i: { quantity: number }) => sum + (i.quantity || 1),
        0
      ),
    }))
  } catch (err) {
    console.error("[admin-queries] getAdminOrders exception:", err)
    return []
  }
}

// ── Customers ────────────────────────────────────────────────

/**
 * Fetch all customer profiles with aggregated order stats.
 * Uses service role to bypass RLS on both profiles and orders.
 * MUST only be called from Server Components or API Routes.
 */
export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  try {
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, created_at, orders(id, total, created_at, shipping_address), addresses(city)")
      .eq("role", "customer")
      .order("created_at", { ascending: false })

    if (error || !data) {
      console.error("[admin-queries] getAdminCustomers error:", error?.message)
      return []
    }

    return data.map((p: any) => {
      const ords: any[] = p.orders ?? []
      const totalSpent = ords.reduce(
        (s: number, o: any) => s + (Number(o.total) || 0),
        0
      )
      const sortedOrders = [...ords].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      const lastDate = sortedOrders[0]?.created_at
        ? new Date(sortedOrders[0].created_at).toLocaleDateString("fr-FR")
        : "Aucune"

      const city =
        p.addresses?.[0]?.city ||
        sortedOrders[0]?.shipping_address?.city ||
        "Non renseignée"

      return {
        id: p.id,
        full_name: p.full_name || null,
        email: p.email || null,
        phone: p.phone || null,
        city,
        orders_count: ords.length,
        total_spent: totalSpent,
        created_at: new Date(p.created_at).toLocaleDateString("fr-FR"),
        last_order_date: lastDate,
      }
    })
  } catch (err) {
    console.error("[admin-queries] getAdminCustomers exception:", err)
    return []
  }
}
