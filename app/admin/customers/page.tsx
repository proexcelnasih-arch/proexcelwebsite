// Server Component — no "use client"
// Fetches via createAdminClient() (service role) which bypasses RLS.
// The admin layout already sets dynamic = "force-dynamic", so this
// runs a fresh query on every request with server-side pagination (PERF-01).

import { getAdminCustomers } from "@/lib/admin/admin-queries"
import { CustomersTable } from "./CustomersTable"

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || "1", 10) || 1
  const search = params.search || null

  const result = await getAdminCustomers({ page, pageSize: 50, search })

  return <CustomersTable customers={result.data} />
}
