"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, Download, Phone, MapPin, CheckCircle, Clock } from "lucide-react"
import { DataTable, type Column, type FilterTab } from "@/components/admin/DataTable"
import { StatusBadge, type StatusType } from "@/components/admin/StatusBadge"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"

type OrderRow = Database["public"]["Tables"]["orders"]["Row"] & {
  order_items?: { id: string; quantity: number }[]
}

function OrdersContent() {
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get("status") ?? "all"

  const [orders, setOrders] = useState<OrderRow[]>([])
  const [activeTab, setActiveTab] = useState<string>(initialStatus)
  const [isLoading, setIsLoading] = useState(true)

  async function loadOrders() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(id, quantity)")
        .order("created_at", { ascending: false })

      if (data) setOrders(data as any)
    } catch (err) {
      console.warn("[admin-orders] Error loading orders:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const orderTabs: FilterTab[] = [
    { id: "all", label: "Toutes", count: orders.length },
    { id: "pending", label: "En attente", count: orders.filter((o) => o.status === "pending").length },
    { id: "confirmed", label: "Confirmées", count: orders.filter((o) => o.status === "confirmed").length },
    { id: "processing", label: "En préparation", count: orders.filter((o) => o.status === "processing").length },
    { id: "shipped", label: "Expédiées", count: orders.filter((o) => o.status === "shipped").length },
    { id: "delivered", label: "Livrées", count: orders.filter((o) => o.status === "delivered").length },
    { id: "cancelled", label: "Annulées", count: orders.filter((o) => o.status === "cancelled").length },
  ]

  async function handleStatusChange(orderId: string, newStatus: OrderRow["status"]) {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    )

    try {
      const supabase = createClient()
      if (newStatus === "cancelled") {
        await supabase.rpc("cancel_order_and_restore_stock", {
          p_order_id: orderId,
          p_note: "Annulation manuelle par l'administrateur",
        })
      } else {
        await supabase
          .from("orders")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq("id", orderId)

        await supabase.from("order_status_history").insert({
          order_id: orderId,
          status: newStatus,
          note: `Statut modifié vers ${newStatus}`,
        })
      }
    } catch (err) {
      console.warn("[admin-orders] Error updating order status:", err)
    }
  }

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders
    return orders.filter((o) => o.status === activeTab)
  }, [orders, activeTab])

  const columns: Column<OrderRow>[] = [
    {
      key: "order_number",
      header: "N° Commande",
      sortable: true,
      render: (ord) => (
        <div>
          <span className="font-bold text-slate-900 block">{ord.order_number}</span>
          <span className="text-[11px] text-slate-400">
            {new Date(ord.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ),
    },
    {
      key: "customer_name",
      header: "Client",
      sortable: true,
      render: (ord) => {
        const address = typeof ord.shipping_address === "object" && ord.shipping_address ? (ord.shipping_address as any) : null
        return (
          <div>
            <span className="font-bold text-slate-900 block">{ord.customer_name}</span>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span>{ord.customer_phone}</span>
              {address?.city && (
                <>
                  <span>•</span>
                  <span>{address.city}</span>
                </>
              )}
            </div>
          </div>
        )
      },
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      render: (ord) => {
        const totalItems = ord.order_items?.reduce((s, i) => s + (i.quantity || 1), 0) ?? 1
        return (
          <div>
            <span className="font-bold text-slate-900 block">{ord.total} DH</span>
            <span className="text-[11px] text-slate-400">
              {totalItems} article{totalItems > 1 ? "s" : ""}
            </span>
          </div>
        )
      },
    },
    {
      key: "payment",
      header: "Paiement",
      render: (ord) => (
        <div>
          <span className="text-xs font-semibold text-slate-700 block">
            {ord.payment_method === "cod" ? "Paiement à la livraison" : ord.payment_method}
          </span>
          <StatusBadge
            status={ord.payment_status === "paid" ? "paid" : "pending"}
            label={ord.payment_status === "paid" ? "Payé" : "À encaisser"}
          />
        </div>
      ),
    },
    {
      key: "status",
      header: "Statut Commande",
      render: (ord) => (
        <select
          value={ord.status}
          onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderRow["status"])}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 outline-none focus:border-[#8C1A2B] cursor-pointer"
        >
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmée</option>
          <option value="processing">En préparation</option>
          <option value="shipped">Expédiée</option>
          <option value="delivered">Livrée</option>
          <option value="cancelled">Annulée</option>
        </select>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (ord) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/orders/${ord.id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#8C1A2B] hover:bg-slate-100 transition-colors"
            title="Détails de la commande"
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Commandes</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez vos commandes clients, préparez les expéditions et suivez les livraisons.
          </p>
        </div>
      </div>

      {/* ── Orders DataTable ──────────────────────────────────── */}
      <DataTable
        data={filteredOrders}
        columns={columns}
        searchPlaceholder="Rechercher par n° de commande, client ou téléphone…"
        searchKeys={["order_number", "customer_name", "customer_phone"]}
        filterTabs={orderTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  )
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 text-xs">Chargement des commandes…</div>}>
      <OrdersContent />
    </Suspense>
  )
}
