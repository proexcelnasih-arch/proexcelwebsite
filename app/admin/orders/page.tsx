// Server Component — no "use client"
// Fetches via createAdminClient() (service role) which bypasses RLS.
// The admin layout already sets dynamic = "force-dynamic", so this
// runs a fresh query on every request — no stale cache issues.

import { getAdminOrders } from "@/lib/admin/admin-queries"
import { OrdersTable } from "./OrdersTable"

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders()
  return <OrdersTable orders={orders} />
}
