"use client"

import Link from "next/link"
import { Eye } from "lucide-react"
import { DataTable, type Column } from "@/components/admin/DataTable"
import type { AdminCustomer } from "@/lib/admin/admin-queries"

export function CustomersTable({ customers }: { customers: AdminCustomer[] }) {
  const columns: Column<AdminCustomer>[] = [
    {
      key: "full_name",
      header: "Client",
      sortable: true,
      render: (cust) => (
        <div>
          <span className="font-bold text-slate-900 block">
            {cust.full_name || "Client ProExcel"}
          </span>
          <span className="text-[11px] text-slate-400">Inscrit le {cust.created_at}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Contact",
      sortable: true,
      render: (cust) => (
        <div>
          <span className="font-semibold text-slate-900 text-xs block">
            {cust.email || "Non renseigné"}
          </span>
          {cust.phone && cust.phone !== "Non renseigné" && (
            <span className="text-[11px] text-slate-500 mt-0.5 block">{cust.phone}</span>
          )}
        </div>
      ),
    },
    {
      key: "city",
      header: "Ville",
      sortable: true,
      render: (cust) => (
        <span className="font-semibold text-slate-700 text-xs">{cust.city}</span>
      ),
    },
    {
      key: "orders_count",
      header: "Commandes",
      sortable: true,
      render: (cust) => (
        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-xs">
          {cust.orders_count} cmd
        </span>
      ),
    },
    {
      key: "total_spent",
      header: "Dépenses Totales",
      sortable: true,
      render: (cust) => (
        <span className="font-extrabold text-sm text-[#8C1A2B]">
          {cust.total_spent.toLocaleString()} DH
        </span>
      ),
    },
    {
      key: "last_order_date",
      header: "Dernière Commande",
      sortable: true,
      render: (cust) => (
        <span className="text-xs text-slate-500">{cust.last_order_date}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (cust) => (
        <div className="flex items-center justify-end">
          <Link
            href={`/admin/customers/${cust.id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#8C1A2B] hover:bg-slate-100 transition-colors"
            title="Détails du client"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ]

  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0)
  const activeCustomers = customers.filter((c) => c.orders_count > 0).length

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clients</h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualisez vos clients enregistrés, leur historique d&apos;achats et leurs coordonnées réelles.
          </p>
        </div>
      </div>

      {/* ── 3 Summary KPI Cards ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 mb-1">Total Clients Inscrits</p>
          <p className="text-2xl font-bold text-slate-900">{customers.length}</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 mb-1">Clients Ayant Commandé</p>
          <p className="text-2xl font-bold text-emerald-600">{activeCustomers}</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 mb-1">Volume Total Dépensé</p>
          <p className="text-2xl font-bold text-[#8C1A2B]">{totalRevenue.toLocaleString()} DH</p>
        </div>
      </div>

      {/* ── Customers DataTable ───────────────────────────────── */}
      <DataTable
        data={customers}
        columns={columns}
        searchPlaceholder="Rechercher par nom, email, téléphone ou ville…"
        searchKeys={["full_name", "email", "phone", "city"]}
      />
    </div>
  )
}
