"use client"

import { useState, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye } from "lucide-react"
import { DataTable, type Column, type FilterTab } from "@/components/admin/DataTable"
import { StatusBadge, type StatusType } from "@/components/admin/StatusBadge"
import { createClient } from "@/lib/supabase/client"
import type { AdminOrderRow } from "@/lib/admin/admin-queries"

// ── Client Component: interactive table with status changes ───

function OrdersContent({ initialOrders }: { initialOrders: AdminOrderRow[] }) {
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get("status") ?? "all"

  const [orders, setOrders] = useState<AdminOrderRow[]>(initialOrders)
  const [activeTab, setActiveTab] = useState<string>(initialStatus)

  const orderTabs: FilterTab[] = [
    { id: "all", label: "Toutes", count: orders.length },
    { id: "pending", label: "En attente", count: orders.filter((o) => o.status === "pending").length },
    { id: "confirmed", label: "Confirmées", count: orders.filter((o) => o.status === "confirmed").length },
    { id: "processing", label: "En préparation", count: orders.filter((o) => o.status === "processing").length },
    { id: "shipped", label: "Expédiées", count: orders.filter((o) => o.status === "shipped").length },
    { id: "delivered", label: "Livrées", count: orders.filter((o) => o.status === "delivered").length },
    { id: "cancelled", label: "Annulées", count: orders.filter((o) => o.status === "cancelled").length },
  ]

  async function handleStatusChange(orderId: string, newStatus: AdminOrderRow["status"]) {
    // Optimistic update
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

  const columns: Column<AdminOrderRow>[] = [
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
        const address =
          typeof ord.shipping_address === "object" && ord.shipping_address
            ? (ord.shipping_address as any)
            : null
        return (
          <div>
            <span className="font-bold text-slate-900 block">{ord.customer_name}</span>
            <div className="flex flex-col text-[11px] text-slate-500 mt-0.5 space-y-0.5">
              {ord.customer_email && (
                <span className="text-slate-600 font-medium">{ord.customer_email}</span>
              )}
              <div className="flex items-center gap-1.5 text-slate-400">
                <span>{ord.customer_phone}</span>
                {address?.city && (
                  <>
                    <span>•</span>
                    <span>{address.city}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      render: (ord) => (
        <div>
          <span className="font-bold text-slate-900 block">{ord.total} DH</span>
          <span className="text-[11px] text-slate-400">
            {ord.item_count} article{ord.item_count > 1 ? "s" : ""}
          </span>
        </div>
      ),
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
          onChange={(e) => handleStatusChange(ord.id, e.target.value as AdminOrderRow["status"])}
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
        searchPlaceholder="Rechercher par n° de commande, client, email ou téléphone…"
        searchKeys={["order_number", "customer_name", "customer_email", "customer_phone"]}
        filterTabs={orderTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  )
}

// ── Props passed from the Server Component parent ─────────────

export function OrdersTable({ orders }: { orders: AdminOrderRow[] }) {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 text-xs">Chargement des commandes…</div>}>
      <OrdersContent initialOrders={orders} />
    </Suspense>
  )
}
