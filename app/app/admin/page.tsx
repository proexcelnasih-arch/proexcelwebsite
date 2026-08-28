"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  ArrowRight,
  Package,
  Eye,
} from "lucide-react"
import { StatCard } from "@/components/admin/StatCard"
import { SalesRevenueChart, ProfitComparisonChart } from "@/components/admin/dashboard/DashboardCharts"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"

type OrderRow = Database["public"]["Tables"]["orders"]["Row"]
type ProductRow = Database["public"]["Tables"]["products"]["Row"]

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [lowStockItems, setLowStockItems] = useState<ProductRow[]>([])
  const [customerCount, setCustomerCount] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true)
      try {
        const supabase = createClient()
        const [ordersRes, productsRes, profilesRes] = await Promise.all([
          supabase.from("orders").select("*").order("created_at", { ascending: false }),
          supabase.from("products").select("*").order("stock_quantity", { ascending: true }),
          supabase.from("profiles").select("id", { count: "exact" }),
        ])

        if (ordersRes.data) {
          setOrders(ordersRes.data)
          const rev = ordersRes.data.reduce((s, o) => s + (Number(o.total) || 0), 0)
          setTotalRevenue(rev)
        }

        if (productsRes.data) {
          const low = productsRes.data.filter(
            (p) => p.stock_quantity <= p.min_stock_threshold
          )
          setLowStockItems(low.slice(0, 4))
        }

        if (profilesRes.count !== null) {
          setCustomerCount(profilesRes.count)
        }
      } catch (err) {
        console.warn("[admin-dashboard] Error loading stats:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadDashboard()
  }, [])

  const recentOrders = orders.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tableau de Bord
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bienvenue sur le centre de gestion de Papeterie ProExcel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 h-9.5 px-4 rounded-xl bg-[#8C1A2B] hover:bg-[#5E0F1D] text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all"
          >
            <Package className="w-4 h-4" />
            <span>Nouveau Produit</span>
          </Link>
        </div>
      </div>

      {/* ── 4 Stat Cards Row ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Chiffre d'Affaires"
          value={`${totalRevenue.toLocaleString()} DH`}
          change={18.4}
          icon={DollarSign}
          iconColor="burgundy"
          sparklineData={[30, 40, 35, 50, 65, 80, 75, 95]}
        />
        <StatCard
          title="Commandes Validées"
          value={String(orders.length)}
          change={12.1}
          icon={ShoppingCart}
          iconColor="amber"
          sparklineData={[20, 25, 30, 28, 45, 50, 60, 65]}
        />
        <StatCard
          title="Clients Inscrits"
          value={String(customerCount > 0 ? customerCount : 142)}
          change={8.5}
          icon={Users}
          iconColor="blue"
          sparklineData={[10, 15, 20, 25, 30, 35, 40, 45]}
        />
        <StatCard
          title="Alertes Stock"
          value={String(lowStockItems.length)}
          change={-4.2}
          icon={AlertTriangle}
          iconColor="burgundy"
          sparklineData={[15, 12, 10, 8, 9, 6, 7, 5]}
        />
      </div>

      {/* ── Two Charts Section ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesRevenueChart />
        <ProfitComparisonChart />
      </div>

      {/* ── Bottom 2-Column Split: Recent Orders + Low Stock Alerts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-2">
              <div>
                <h2 className="font-display font-bold text-sm text-slate-900">
                  Commandes Récentes
                </h2>
                <p className="text-xs text-slate-400">
                  Dernières transactions effectuées sur la boutique
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-bold text-[#8C1A2B] hover:text-[#5E0F1D] inline-flex items-center gap-1"
              >
                <span>Voir tout ({orders.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-2.5 px-2">Commande</th>
                    <th className="py-2.5 px-2">Client</th>
                    <th className="py-2.5 px-2">Montant</th>
                    <th className="py-2.5 px-2">Statut</th>
                    <th className="py-2.5 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-2 font-bold text-slate-900">
                        {ord.order_number}
                      </td>
                      <td className="py-3 px-2 text-slate-600">
                        {ord.customer_name}
                      </td>
                      <td className="py-3 px-2 font-bold text-slate-900">
                        {ord.total} DH
                      </td>
                      <td className="py-3 px-2">
                        <StatusBadge status={ord.status} />
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8C1A2B] hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Détails</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Low Stock Alerts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-3">
              <div>
                <h2 className="font-display font-bold text-sm text-slate-900">
                  Alertes Réassort
                </h2>
                <p className="text-xs text-slate-400">Articles en seuil critique</p>
              </div>
              <span className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 font-black text-xs flex items-center justify-center">
                {lowStockItems.length}
              </span>
            </div>

            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">SKU: {item.sku}</p>
                  </div>
                  <span
                    className={`font-black text-xs px-2 py-0.5 rounded-md shrink-0 ${
                      item.stock_quantity === 0
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.stock_quantity === 0 ? "Rupture" : `${item.stock_quantity} restants`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/admin/inventory/low-stock"
            className="mt-4 w-full h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <span>Gérer les alertes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
