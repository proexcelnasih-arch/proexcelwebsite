// Server Component — no "use client"
// Fetches via createAdminClient() (service role) which bypasses RLS.
// The admin layout already sets dynamic = "force-dynamic", so this
// runs a fresh query on every request with server-side pagination (PERF-01).

import { getAdminOrders } from "@/lib/admin/admin-queries"
import { OrdersTable } from "./OrdersTable"

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || "1", 10) || 1
  const status = params.status || null
  const search = params.search || null

  const result = await getAdminOrders({ page, pageSize: 50, status, search })

  return <OrdersTable orders={result.data} />
}
