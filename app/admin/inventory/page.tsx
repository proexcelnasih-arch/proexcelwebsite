"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Plus, Minus, AlertTriangle, History, ArrowRight, Check } from "lucide-react"
import { DataTable, type Column, type FilterTab } from "@/components/admin/DataTable"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"

type ProductRow = Database["public"]["Tables"]["products"]["Row"] & {
  product_images?: { url: string; is_primary?: boolean }[] | null
  categories?: { name: string } | null
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  async function loadInventory() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("products")
        .select("*, product_images(url, is_primary), categories(name)")
        .order("stock_quantity", { ascending: true })

      if (data) setProducts(data as any)
    } catch (err) {
      console.warn("[inventory] Error loading inventory:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  const stockTabs: FilterTab[] = [
    { id: "all", label: "Tout le stock", count: products.length },
    {
      id: "low_stock",
      label: "Stock Faible",
      count: products.filter((i) => i.stock_quantity > 0 && i.stock_quantity <= i.min_stock_threshold).length,
    },
    {
      id: "out_of_stock",
      label: "Rupture",
      count: products.filter((i) => i.stock_quantity === 0).length,
    },
    {
      id: "in_stock",
      label: "En Stock",
      count: products.filter((i) => i.stock_quantity > i.min_stock_threshold).length,
    },
  ]

  async function handleAdjustStock(id: string, delta: number) {
    const target = products.find((p) => p.id === id)
    if (!target) return

    const newStock = Math.max(0, target.stock_quantity + delta)
    const actualDelta = newStock - target.stock_quantity
    if (actualDelta === 0) return

    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock_quantity: newStock } : item))
    )

    try {
      const supabase = createClient()
      // 1. Update product stock
      await supabase
        .from("products")
        .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
        .eq("id", id)

      // 2. Record stock movement
      await supabase.from("stock_movements").insert({
        product_id: id,
        change_amount: actualDelta,
        reason: "adjustment",
        note: `Ajustement rapide manuel (${actualDelta > 0 ? "+" : ""}${actualDelta})`,
      })
    } catch (err) {
      console.warn("[inventory] Error adjusting stock:", err)
    }
  }

  const filteredItems = products.filter((i) => {
    if (activeTab === "all") return true
    if (activeTab === "out_of_stock") return i.stock_quantity === 0
    if (activeTab === "low_stock") return i.stock_quantity > 0 && i.stock_quantity <= i.min_stock_threshold
    if (activeTab === "in_stock") return i.stock_quantity > i.min_stock_threshold
    return true
  })

  const columns: Column<ProductRow>[] = [
    {
      key: "name",
      header: "Article & Référence",
      sortable: true,
      render: (item) => {
        const img = item.product_images?.[0]?.url || "https://images.unsplash.com/photo-1544816155-12df9643f363?w=120"
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
              <Image src={img} alt={item.name} fill unoptimized className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 truncate max-w-xs">{item.name}</p>
              <p className="text-[11px] text-slate-400 font-mono">SKU: {item.sku}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: "category",
      header: "Catégorie",
      sortable: true,
      render: (item) => (
        <span className="text-xs text-slate-600 font-medium">{item.categories?.name ?? "—"}</span>
      ),
    },
    {
      key: "stock_quantity",
      header: "Stock Actuel",
      sortable: true,
      render: (item) => {
        const isOutOfStock = item.stock_quantity === 0
        const isLow = item.stock_quantity > 0 && item.stock_quantity <= item.min_stock_threshold
        return (
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-bold ${
                isOutOfStock ? "text-red-600" : isLow ? "text-amber-600" : "text-slate-900"
              }`}
            >
              {item.stock_quantity}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleAdjustStock(item.id, -1)}
                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs"
                title="Diminuer stock (-1)"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleAdjustStock(item.id, 1)}
                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs"
                title="Augmenter stock (+1)"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        )
      },
    },
    {
      key: "min_stock_threshold",
      header: "Seuil d'Alerte",
      render: (item) => (
        <span className="text-xs text-slate-500 font-medium">≤ {item.min_stock_threshold} unités</span>
      ),
    },
    {
      key: "status",
      header: "État",
      render: (item) => {
        const isOutOfStock = item.stock_quantity === 0
        const isLow = item.stock_quantity > 0 && item.stock_quantity <= item.min_stock_threshold
        const status = isOutOfStock ? "out_of_stock" : isLow ? "low_stock" : "in_stock"
        const label = isOutOfStock ? "Rupture" : isLow ? "Stock Faible" : "En Stock"
        return <StatusBadge status={status} label={label} />
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestion des Stocks
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Suivez les niveaux d&apos;inventaire en temps réel, ajustez les quantités et recevez des alertes de réapprovisionnement.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/inventory/history"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all"
          >
            <History className="w-4 h-4" />
            <span>Historique des Mouvements</span>
          </Link>
          <Link
            href="/admin/inventory/low-stock"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Alertes Stock Faible</span>
          </Link>
        </div>
      </div>

      {/* ── Inventory DataTable ───────────────────────────────── */}
      <DataTable
        data={filteredItems}
        columns={columns}
        searchPlaceholder="Rechercher par article ou SKU…"
        searchKeys={["name", "sku"]}
        filterTabs={stockTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  )
}
