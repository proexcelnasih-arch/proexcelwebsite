"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Eye, Mail, Phone, MapPin, UserCheck } from "lucide-react"
import { DataTable, type Column } from "@/components/admin/DataTable"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"

interface FormattedCustomer {
  id: string
  name: string
  email: string
  phone: string
  city: string
  orders_count: number
  total_spent: number
  created_at: string
  last_order_date: string
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<FormattedCustomer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function loadCustomers() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("profiles")
        .select("*, orders(id, total, created_at), addresses(city)")
        .order("created_at", { ascending: false })

      if (data) {
        const formatted: FormattedCustomer[] = data.map((p: any) => {
          const ords = p.orders || []
          const totalSpent = ords.reduce((s: number, o: any) => s + (Number(o.total) || 0), 0)
          const sortedOrders = [...ords].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          const lastDate = sortedOrders[0]?.created_at
            ? new Date(sortedOrders[0].created_at).toLocaleDateString("fr-FR")
            : "Aucune"

          return {
            id: p.id,
            name: p.full_name || "Client ProExcel",
            email: p.phone ? `${p.phone}@client.proexcel.ma` : "client@proexcel.ma",
            phone: p.phone || "Non renseigné",
            city: p.addresses?.[0]?.city || "Casablanca",
            orders_count: ords.length,
            total_spent: totalSpent,
            created_at: new Date(p.created_at).toLocaleDateString("fr-FR"),
            last_order_date: lastDate,
          }
        })
        setCustomers(formatted)
      }
    } catch (err) {
      console.warn("[admin-customers] Error loading customers:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const columns: Column<FormattedCustomer>[] = [
    {
      key: "name",
      header: "Client",
      sortable: true,
      render: (cust) => (
        <div>
          <span className="font-bold text-slate-900 block">{cust.name}</span>
          <span className="text-[11px] text-slate-400">Inscrit le {cust.created_at}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Contact",
      render: (cust) => (
        <div>
          <p className="font-medium text-slate-800 text-xs">{cust.phone}</p>
        </div>
      ),
    },
    {
      key: "city",
      header: "Ville",
      sortable: true,
      render: (cust) => <span className="font-semibold text-slate-700">{cust.city}</span>,
    },
    {
      key: "orders_count",
      header: "Commandes",
      sortable: true,
      render: (cust) => (
        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
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

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clients</h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualisez vos clients enregistrés, leur historique d&apos;achats et leurs coordonnées.
          </p>
        </div>
      </div>

      {/* ── Customers DataTable ───────────────────────────────── */}
      <DataTable
        data={customers}
        columns={columns}
        searchPlaceholder="Rechercher par nom, téléphone ou ville…"
        searchKeys={["name", "phone", "city"]}
      />
    </div>
  )
}
