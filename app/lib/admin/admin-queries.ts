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

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface GetAdminOrdersParams {
  page?: number
  pageSize?: number
  status?: string | null
  search?: string | null
}

export interface GetAdminCustomersParams {
  page?: number
  pageSize?: number
  search?: string | null
}

// ── Orders ────────────────────────────────────────────────────

/**
 * Fetch paginated orders with item counts — uses service role to bypass RLS.
 * Enforces server-side pagination with .range() and count: "exact" (PERF-01).
 * MUST only be called from Server Components or API Routes.
 */
export async function getAdminOrders(
  params?: GetAdminOrdersParams
): Promise<PaginatedResult<AdminOrderRow>> {
  const page = Math.max(1, params?.page || 1)
  const pageSize = Math.min(100, Math.max(1, params?.pageSize || 25))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  try {
    const supabase = await createAdminClient()

    let query = supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        status,
        payment_status,
        payment_method,
        subtotal,
        shipping_cost,
        discount_amount,
        total,
        notes,
        created_at,
        updated_at,
        shipping_address,
        order_items (id, quantity)
      `,
        { count: "exact" }
      )

    // Optional status filter
    if (params?.status && params.status !== "all") {
      query = query.eq("status", params.status as Database["public"]["Enums"]["order_status"])
    }

    // Optional search filter
    if (params?.search && params.search.trim()) {
      const q = params.search.trim()
      query = query.or(
        `order_number.ilike.%${q}%,customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%,customer_email.ilike.%${q}%`
      )
    }

    // Stable sort and pagination range
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to)

    if (error || !data) {
      console.error("[admin-queries] getAdminOrders error:", error?.message)
      return { data: [], total: 0, page, pageSize, totalPages: 0 }
    }

    const total = count || 0
    const totalPages = Math.ceil(total / pageSize)

    const mappedData: AdminOrderRow[] = (data as unknown as (Database["public"]["Tables"]["orders"]["Row"] & { order_items: { id: string; quantity: number }[] })[]).map((o) => ({
      ...o,
      item_count: (o.order_items ?? []).reduce(
        (sum: number, i: { quantity: number }) => sum + (i.quantity || 1),
        0
      ),
    }))

    return {
      data: mappedData,
      total,
      page,
      pageSize,
      totalPages,
    }
  } catch (err) {
    console.error("[admin-queries] getAdminOrders exception:", err)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }
}

/**
 * Fetch a single order with details, items and status history.
 * Uses service role to bypass RLS (BUG-04).
 */
export async function getAdminOrder(orderId: string) {
  try {
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        status,
        payment_status,
        payment_method,
        subtotal,
        shipping_cost,
        discount_amount,
        total,
        notes,
        created_at,
        updated_at,
        shipping_address,
        order_items (
          id,
          product_id,
          product_name_snapshot,
          price_snapshot,
          quantity,
          subtotal,
          products (
            name,
            slug,
            product_images (
              url,
              is_primary
            )
          )
        ),
        order_status_history (
          id,
          status,
          changed_by,
          note,
          created_at
        )
      `)
      .eq("id", orderId)
      .maybeSingle()

    if (error) {
      console.error("[admin-queries] getAdminOrder error:", error.message)
      return null
    }

    return data
  } catch (err) {
    console.error("[admin-queries] getAdminOrder exception:", err)
    return null
  }
}

// ── Customers ────────────────────────────────────────────────

/**
 * Fetch paginated customer profiles with aggregated order stats.
 * Uses service role to bypass RLS on both profiles and orders (PERF-01).
 * MUST only be called from Server Components or API Routes.
 */
export async function getAdminCustomers(
  params?: GetAdminCustomersParams
): Promise<PaginatedResult<AdminCustomer>> {
  const page = Math.max(1, params?.page || 1)
  const pageSize = Math.min(100, Math.max(1, params?.pageSize || 25))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  try {
    const supabase = await createAdminClient()

    let query = supabase
      .from("profiles")
      .select(
        "id, full_name, email, phone, created_at, orders(id, total, created_at, shipping_address), addresses(city)",
        { count: "exact" }
      )
      .eq("role", "customer")

    if (params?.search && params.search.trim()) {
      const q = params.search.trim()
      query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to)

    if (error || !data) {
      console.error("[admin-queries] getAdminCustomers error:", error?.message)
      return { data: [], total: 0, page, pageSize, totalPages: 0 }
    }

    const total = count || 0
    const totalPages = Math.ceil(total / pageSize)

    const mappedData: AdminCustomer[] = (data as unknown as {
      id: string
      full_name: string | null
      email: string | null
      phone: string | null
      created_at: string
      orders: { id: string; total: number; created_at: string; shipping_address: { city?: string } | null }[]
      addresses: { city: string }[]
    }[]).map((p) => {
      const ords = p.orders ?? []
      const totalSpent = ords.reduce(
        (s: number, o: { total: number }) => s + (Number(o.total) || 0),
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

    return {
      data: mappedData,
      total,
      page,
      pageSize,
      totalPages,
    }
  } catch (err) {
    console.error("[admin-queries] getAdminCustomers exception:", err)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }
}

/**
 * Fetch a single customer profile with all addresses and order history.
 * Uses service role to bypass RLS (BUG-04).
 */
export async function getAdminCustomer(customerId: string) {
  try {
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        phone,
        avatar_url,
        role,
        created_at,
        updated_at,
        addresses (
          id,
          full_name,
          phone,
          city,
          address_line,
          is_default,
          created_at
        ),
        orders (
          id,
          order_number,
          status,
          total,
          created_at,
          payment_method,
          payment_status
        )
      `)
      .eq("id", customerId)
      .maybeSingle()

    if (error) {
      console.error("[admin-queries] getAdminCustomer error:", error.message)
      return null
    }

    return data
  } catch (err) {
    console.error("[admin-queries] getAdminCustomer exception:", err)
    return null
  }
}
