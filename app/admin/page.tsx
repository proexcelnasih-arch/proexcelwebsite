"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ImageOff,
  Trash2,
  Check,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react"
import { StatCard } from "@/components/admin/StatCard"
import { AdminCard } from "@/components/admin/AdminCard"
import { StatusBadge, type StatusType } from "@/components/admin/StatusBadge"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface RecentOrder {
  id: string
  order_number: string
  customer_name: string
  total: number
  status: StatusType
  created_at: string
}

interface LowStockProduct {
  id: string
  name: string
  stock_quantity: number
  image?: string | null
}

interface AdminNote {
  id: string
  text: string
  completed: boolean
}

const DEFAULT_NOTES: AdminNote[] = [
  { id: "note-1", text: "Vérifier le stock de ramettes et cahiers Clairefontaine", completed: false },
  { id: "note-2", text: "Confirmer l'expédition des commandes en attente", completed: true },
  { id: "note-3", text: "Actualiser les tarifs des fournitures de bureau", completed: false },
]

export default function AdminDashboardPage() {
  const [adminName, setAdminName] = useState("Admin")
  const [isLoading, setIsLoading] = useState(true)

  // Real Database Metrics State
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalOrdersThisMonth, setTotalOrdersThisMonth] = useState(0)
  const [ordersTrend, setOrdersTrend] = useState<number | undefined>(undefined)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [revenueTrend, setRevenueTrend] = useState<number | undefined>(undefined)

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])

  // Status breakdown for donut ring widget
  const [statusCounts, setStatusCounts] = useState({
    delivered: 0,
    processing: 0,
    pending: 0,
    cancelled: 0,
    total: 0,
  })

  // Monthly revenue breakdown for chart
  const [monthlyChartData, setMonthlyChartData] = useState<Array<{ month: string; revenue: number; orders: number }>>([])

  // Admin Notes (persistent via localStorage)
  const [notes, setNotes] = useState<AdminNote[]>([])
  const [newNoteText, setNewNoteText] = useState("")

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("proexcel_admin_notes")
      if (saved) {
        setNotes(JSON.parse(saved))
      } else {
        setNotes(DEFAULT_NOTES)
      }
    } catch {
      setNotes(DEFAULT_NOTES)
    }
  }, [])

  // Save notes to localStorage on change
  function updateNotes(updated: AdminNote[]) {
    setNotes(updated)
    try {
      localStorage.setItem("proexcel_admin_notes", JSON.stringify(updated))
    } catch {
      // ignore
    }
  }

  function handleToggleNote(id: string) {
    updateNotes(
      notes.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n))
    )
  }

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault()
    if (!newNoteText.trim()) return
    const newNote: AdminNote = {
      id: `note-${Date.now()}`,
      text: newNoteText.trim(),
      completed: false,
    }
    updateNotes([newNote, ...notes])
    setNewNoteText("")
  }

  function handleDeleteNote(id: string) {
    updateNotes(notes.filter((n) => n.id !== id))
  }

  // Fetch real data from Supabase
  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true)
      try {
        const supabase = createClient()

        // 1. Get logged-in user profile
        try {
          const { data: userData } = await supabase.auth.getUser()
          if (userData?.user) {
            const fullName =
              userData.user.user_metadata?.full_name ||
              userData.user.email?.split("@")[0] ||
              "Admin"
            setAdminName(fullName)
          }
        } catch {
          // fallback to "Admin"
        }

        // 2. Query total products count
        const { count: prodCount } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
        setTotalProducts(prodCount ?? 0)

        // 3. Query total customers (profiles)
        const { count: customerCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
        setTotalCustomers(customerCount ?? 0)

        // 4. Query all orders for calculations
        const { data: ordersData } = await supabase
          .from("orders")
          .select("id, order_number, customer_name, total, status, created_at")
          .order("created_at", { ascending: false })

        if (ordersData && ordersData.length > 0) {
          const allOrders = ordersData as any[]

          // Recent 5 orders
          setRecentOrders(
            allOrders.slice(0, 5).map((o) => ({
              id: o.id,
              order_number: o.order_number,
              customer_name: o.customer_name || "Client ProExcel",
              total: Number(o.total) || 0,
              status: o.status as StatusType,
              created_at: o.created_at,
            }))
          )

          // Overall revenue
          const totalRev = allOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
          setTotalRevenue(totalRev)

          // This month vs last month calculation
          const now = new Date()
          const currentMonth = now.getMonth()
          const currentYear = now.getFullYear()
          const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
          const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear

          let thisMonthCount = 0
          let thisMonthRev = 0
          let lastMonthCount = 0
          let lastMonthRev = 0

          // Status breakdown
          let delivered = 0
          let processing = 0
          let pending = 0
          let cancelled = 0

          // Monthly chart aggregation (last 6 months)
          const monthBuckets: Record<string, { revenue: number; orders: number }> = {}
          const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]

          // Initialize last 6 months buckets
          for (let i = 5; i >= 0; i--) {
            const d = new Date(currentYear, currentMonth - i, 1)
            const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`
            monthBuckets[key] = { revenue: 0, orders: 0 }
          }

          allOrders.forEach((o) => {
            const orderDate = new Date(o.created_at)
            const oMonth = orderDate.getMonth()
            const oYear = orderDate.getFullYear()
            const oTotal = Number(o.total) || 0

            // Current vs last month
            if (oMonth === currentMonth && oYear === currentYear) {
              thisMonthCount++
              thisMonthRev += oTotal
            } else if (oMonth === prevMonth && oYear === prevYear) {
              lastMonthCount++
              lastMonthRev += oTotal
            }

            // Status count
            if (o.status === "delivered") delivered++
            else if (o.status === "processing" || o.status === "shipped" || o.status === "confirmed") processing++
            else if (o.status === "pending") pending++
            else if (o.status === "cancelled") cancelled++

            // Add to month bucket if exists
            const bucketKey = `${monthNames[oMonth]} ${oYear.toString().slice(-2)}`
            if (monthBuckets[bucketKey]) {
              monthBuckets[bucketKey].revenue += oTotal
              monthBuckets[bucketKey].orders += 1
            }
          })

          setTotalOrdersThisMonth(thisMonthCount)

          // Compute trends only if last month has meaningful comparison data
          if (lastMonthCount > 0) {
            const orderDiff = Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
            setOrdersTrend(orderDiff)
          } else {
            setOrdersTrend(undefined)
          }

          if (lastMonthRev > 0) {
            const revDiff = Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 100)
            setRevenueTrend(revDiff)
          } else {
            setRevenueTrend(undefined)
          }

          setStatusCounts({
            delivered,
            processing,
            pending,
            cancelled,
            total: allOrders.length,
          })

          setMonthlyChartData(
            Object.entries(monthBuckets).map(([month, data]) => ({
              month,
              revenue: Math.round(data.revenue),
              orders: data.orders,
            }))
          )
        }

        // 5. Query Low Stock Products (stock <= 5)
        const { data: lowStockData } = await supabase
          .from("products")
          .select("id, name, stock_quantity, product_images(url, is_primary)")
          .lte("stock_quantity", 5)
          .order("stock_quantity", { ascending: true })
          .limit(5)

        if (lowStockData) {
          setLowStockProducts(
            lowStockData.map((p: any) => {
              const img =
                p.product_images?.find((i: any) => i.is_primary)?.url ||
                p.product_images?.[0]?.url ||
                null
              return {
                id: p.id,
                name: p.name,
                stock_quantity: p.stock_quantity ?? 0,
                image: img,
              }
            })
          )
        }
      } catch (err) {
        console.warn("[AdminDashboard] Error loading live metrics:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Donut SVG Calculations
  const donutSegments = useMemo(() => {
    const { total, delivered, processing, pending, cancelled } = statusCounts
    if (total === 0) {
      return [
        { label: "Aucune commande", count: 0, percent: 100, color: "#E2E8F0", strokeDash: "100 0", strokeOffset: 0 },
      ]
    }

    const circumference = 2 * Math.PI * 40 // radius 40 -> circumference ~251.32
    let accumulatedPercent = 0

    const items = [
      { label: "Livrées", count: delivered, color: "#16A34A" },
      { label: "En cours / Expédiées", count: processing, color: "#2563EB" },
      { label: "En attente", count: pending, color: "#D97706" },
      { label: "Annulées", count: cancelled, color: "#EF4444" },
    ]

    return items.map((item) => {
      const percent = total > 0 ? (item.count / total) * 100 : 0
      const strokeLength = (percent / 100) * circumference
      const strokeDash = `${strokeLength} ${circumference - strokeLength}`
      const strokeOffset = -(accumulatedPercent / 100) * circumference
      accumulatedPercent += percent

      return {
        ...item,
        percent: Math.round(percent),
        strokeDash,
        strokeOffset,
      }
    })
  }, [statusCounts])

  // Chart Max value computation
  const maxChartRevenue = useMemo(() => {
    if (monthlyChartData.length === 0) return 1000
    const maxVal = Math.max(...monthlyChartData.map((d) => d.revenue), 100)
    return Math.ceil(maxVal / 500) * 500 || 1000
  }, [monthlyChartData])

  return (
    <div className="space-y-6 sm:space-y-8 antialiased">
      {/* ── 1. Top Greeting Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Bonjour, {adminName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Voici l&apos;état en temps réel de votre boutique ProExcel aujourd&apos;hui.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#8C1A2B] hover:bg-[#701422] text-white text-xs font-bold shadow-sm shadow-[#8C1A2B]/20 hover:shadow-md hover:shadow-[#8C1A2B]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Nouveau Produit</span>
          </Link>
        </div>
      </div>

      {/* ── 2. Stat Cards Row (4 Cards — Real Ecommerce Data) ────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Produits */}
        <StatCard
          title="Total Produits"
          value={isLoading ? "…" : totalProducts.toLocaleString("fr-FR")}
          icon={Package}
          iconColor="burgundy"
          showChange={false}
          subtitle="Références au catalogue"
          sparklineData={[12, 14, 18, 22, 25, 28, 32]}
        />

        {/* Commandes (ce mois) */}
        <StatCard
          title="Commandes (ce mois)"
          value={isLoading ? "…" : totalOrdersThisMonth.toLocaleString("fr-FR")}
          icon={ShoppingCart}
          iconColor="amber"
          change={ordersTrend}
          period="vs mois dernier"
          subtitle="Commandes passées ce mois"
          sparklineData={[5, 8, 12, 10, 15, 18, 20]}
        />

        {/* Nouveaux Clients */}
        <StatCard
          title="Clients Inscrits"
          value={isLoading ? "…" : totalCustomers.toLocaleString("fr-FR")}
          icon={Users}
          iconColor="blue"
          showChange={false}
          subtitle="Comptes clients enregistrés"
          sparklineData={[8, 10, 11, 14, 16, 19, 22]}
        />

        {/* Chiffre d'Affaires */}
        <StatCard
          title="Chiffre d'Affaires Total"
          value={
            isLoading
              ? "…"
              : `${totalRevenue.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH`
          }
          icon={DollarSign}
          iconColor="emerald"
          change={revenueTrend}
          period="vs mois dernier"
          subtitle="Revenus cumulés encaissés"
          sparklineData={[100, 150, 180, 240, 310, 390, 480]}
        />
      </div>

      {/* ── 3. Middle Row: Sales Chart (~65%) + Order Status Ring (~35%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Sales & Revenue Chart (~65%) */}
        <div className="lg:col-span-8 flex flex-col">
          <AdminCard
            title="Évolution des Ventes & Revenus"
            subtitle="Volume des commandes et chiffre d'affaires sur les derniers mois"
            accentColor="bg-[#8C1A2B]"
            className="h-full"
            action={
              <div className="flex items-center gap-3 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-3 rounded-md bg-[#8C1A2B]" />
                  <span>Revenus (DH)</span>
                </div>
              </div>
            }
          >
            {monthlyChartData.length > 0 ? (
              <div className="h-72 flex flex-col justify-between pt-4">
                {/* SVG Visual Bar/Curve Chart */}
                <div className="flex-1 flex items-end justify-between gap-3 sm:gap-6 border-b border-slate-100 pb-3">
                  {monthlyChartData.map((d, idx) => {
                    const heightPercent = maxChartRevenue > 0
                      ? Math.max(8, Math.min(100, Math.round((d.revenue / maxChartRevenue) * 100)))
                      : 8

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end"
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute -top-10 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-10">
                          {d.revenue.toLocaleString("fr-FR")} DH ({d.orders} cmd)
                        </div>

                        {/* Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-[#8C1A2B] to-[#B3495A] group-hover:brightness-110 transition-all shadow-2xs"
                        />

                        {/* Month Label */}
                        <span className="text-[11px] font-bold text-slate-500 truncate w-full text-center">
                          {d.month}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Bottom Chart Summary Bar */}
                <div className="pt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                  <span>Moyenne mensuelle :</span>
                  <span className="font-bold text-slate-900">
                    {monthlyChartData.length > 0
                      ? `${Math.round(totalRevenue / monthlyChartData.length).toLocaleString("fr-FR")} DH / mois`
                      : "0.00 DH"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                <Calendar className="w-8 h-8 mb-2 stroke-[1.5]" />
                <span>Les données d&apos;évolution s&apos;afficheront au fil des commandes</span>
              </div>
            )}
          </AdminCard>
        </div>

        {/* Right: Donut Ring Widget (~35%) */}
        <div className="lg:col-span-4 flex flex-col">
          <AdminCard
            title="Répartition des Commandes"
            subtitle="État d'avancement des commandes"
            accentColor="bg-amber-500"
            className="h-full"
            action={
              <Link
                href="/admin/orders"
                className="text-xs font-bold text-[#8C1A2B] hover:underline inline-flex items-center gap-1"
              >
                <span>Détails</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <div className="flex flex-col items-center justify-center py-2">
              {/* Donut SVG Ring */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background base track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#F1F5F9"
                    strokeWidth="12"
                  />

                  {/* Colored segments */}
                  {donutSegments.map((seg, i) => (
                    <circle
                      key={i}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="12"
                      strokeDasharray={seg.strokeDash}
                      strokeDashoffset={seg.strokeOffset}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  ))}
                </svg>

                {/* Center metric */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {statusCounts.total}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Total
                  </span>
                </div>
              </div>

              {/* Counts listed below the ring (Reference Layout) */}
              <div className="w-full grid grid-cols-2 gap-2.5 mt-5 pt-4 border-t border-slate-100 text-xs">
                {donutSegments.map((seg, i) => (
                  <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50/70">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-slate-500 truncate leading-tight">
                        {seg.label}
                      </p>
                      <p className="font-bold text-slate-800 leading-tight">
                        {seg.count} <span className="text-slate-400 font-normal">({seg.percent}%)</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AdminCard>
        </div>
      </div>

      {/* ── 4. Three-Column Widget Row Below ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Widget 1: Commandes Récentes */}
        <AdminCard
          title="Commandes Récentes"
          subtitle="Dernières transactions enregistrées"
          accentColor="bg-blue-600"
          action={
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#8C1A2B] hover:underline inline-flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {recentOrders.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentOrders.map((ord) => {
                const initials = ord.customer_name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()

                return (
                  <Link
                    key={ord.id}
                    href={`/admin/orders/${ord.id}`}
                    className="flex items-center justify-between py-3 hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar Circle with Initials */}
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-[#8C1A2B]/10 group-hover:text-[#8C1A2B] transition-colors">
                        {initials || "CL"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {ord.customer_name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          #{ord.order_number}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-slate-900">
                        {ord.total.toFixed(2)} DH
                      </p>
                      <div className="mt-0.5">
                        <StatusBadge status={ord.status} />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              <ShoppingCart className="w-6 h-6 mx-auto mb-1.5 stroke-[1.5]" />
              <span>Aucune commande récente</span>
            </div>
          )}
        </AdminCard>

        {/* Widget 2: Stock Faible */}
        <AdminCard
          title="Stock Faible"
          subtitle="Articles nécessitant réapprovisionnement"
          accentColor="bg-rose-500"
          action={
            <Link
              href="/admin/inventory/low-stock"
              className="text-xs font-bold text-[#8C1A2B] hover:underline inline-flex items-center gap-1"
            >
              <span>Inventaire</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {lowStockProducts.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {lowStockProducts.map((prod) => (
                <Link
                  key={prod.id}
                  href="/admin/inventory/low-stock"
                  className="flex items-center justify-between py-2.5 hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-9 h-9 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shrink-0 shadow-2xs">
                      {prod.image ? (
                        <Image
                          src={prod.image}
                          alt={prod.name}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageOff className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[160px] group-hover:text-[#8C1A2B]">
                      {prod.name}
                    </p>
                  </div>

                  <span
                    className={cn(
                      "text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0 border",
                      prod.stock_quantity === 0
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    )}
                  >
                    {prod.stock_quantity > 0 ? `${prod.stock_quantity} restants` : "Rupture"}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-1.5 text-emerald-500" />
              <span>Tous les niveaux de stock sont optimaux</span>
            </div>
          )}
        </AdminCard>

        {/* Widget 3: Notes & Tâches Internes (Genuine Interactive Checklist) */}
        <AdminCard
          title="Notes & Tâches"
          subtitle="Pense-bête interne pour la gestion"
          accentColor="bg-emerald-600"
          action={
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {notes.filter((n) => !n.completed).length} restantes
            </span>
          }
        >
          <div className="space-y-3">
            {/* Add note input form */}
            <form onSubmit={handleAddNote} className="flex items-center gap-1.5">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="+ Ajouter une tâche ou note…"
                className="flex-1 h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#8C1A2B]"
              />
              <button
                type="submit"
                className="h-9 px-3 rounded-xl bg-[#8C1A2B] hover:bg-[#701422] text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Ajouter
              </button>
            </form>

            {/* Checklist of notes */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 transition-colors group"
                >
                  <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={note.completed}
                      onChange={() => handleToggleNote(note.id)}
                      className="w-4 h-4 rounded text-[#8C1A2B] accent-[#8C1A2B] cursor-pointer shrink-0"
                    />
                    <span
                      className={cn(
                        "text-xs transition-all truncate",
                        note.completed
                          ? "line-through text-slate-400"
                          : "text-slate-700 font-medium"
                      )}
                    >
                      {note.text}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 rounded-lg text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    title="Supprimer la note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
  )
}
