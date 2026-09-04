// Server Component — no "use client"
// Fetches via createAdminClient() (service role) which bypasses RLS.
// The admin layout already sets dynamic = "force-dynamic", so this
// runs a fresh query on every request — no stale cache issues.

import { getAdminCustomers } from "@/lib/admin/admin-queries"
import { CustomersTable } from "./CustomersTable"

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers()
  return <CustomersTable customers={customers} />
}
