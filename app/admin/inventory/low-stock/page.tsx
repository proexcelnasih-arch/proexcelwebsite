"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, AlertTriangle, RefreshCw } from "lucide-react"
import { DataTable, type Column } from "@/components/admin/DataTable"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"

type ProductRow = Database["public"]["Tables"]["products"]["Row"] & {
  product_images?: { url: string; is_primary?: boolean }[] | null
  categories?: { name: string } | null
}

export default function LowStockPage() {
  const [items, setItems] = useState<ProductRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function loadLowStock() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("products")
        .select("*, product_images(url, is_primary), categories(name)")
        .order("stock_quantity", { ascending: true })

      if (data) {
        // Filter where stock <= min_stock_threshold
        const lowStock = (data as any[]).filter(
          (p) => p.stock_quantity <= p.min_stock_threshold
        )
        setItems(lowStock)
      }
    } catch (err) {
      console.warn("[low-stock] Error loading:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLowStock()
  }, [])

  const columns: Column<ProductRow>[] = [
    {
      key: "name",
      header: "Article en Rupture / Faible",
      sortable: true,
      render: (item) => {
        const img = item.product_images?.[0]?.url || "https://images.unsplash.com/photo-1544816155-12df9643f363?w=120"
        return (
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
              <Image src={img} alt={item.name} fill unoptimized className="object-cover" />
            </div>
            <div>
              <p className="font-bold text-slate-900">{item.name}</p>
              <p className="text-[11px] text-slate-400 font-mono">SKU: {item.sku}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: "stock_quantity",
      header: "Stock Restant",
      sortable: true,
      render: (item) => (
        <span
          className={`font-black text-sm px-2.5 py-1 rounded-lg ${
            item.stock_quantity === 0 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {item.stock_quantity} unité(s)
        </span>
      ),
    },
    {
      key: "min_stock_threshold",
      header: "Seuil Minimum",
      render: (item) => <span className="font-semibold text-slate-600">{item.min_stock_threshold} unités</span>,
    },
    {
      key: "status",
      header: "Urgence",
      render: (item) => (
        <StatusBadge
          status={item.stock_quantity === 0 ? "out_of_stock" : "low_stock"}
          label={item.stock_quantity === 0 ? "Rupture" : "Stock Faible"}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      render: (item) => (
        <Link
          href={`/admin/products/${item.id}/edit`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Réapprovisionner</span>
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* ── Top Bar ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#E2E8F0]">
        <Link
          href="/admin/inventory"
          className="w-9 h-9 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Alertes Stock Faible &amp; Ruptures</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Articles prioritaires nécessitant un réassort urgent auprès des fournisseurs.
          </p>
        </div>
      </div>

      {/* ── Low Stock Table ───────────────────────────────────── */}
      <DataTable
        data={items}
        columns={columns}
        searchPlaceholder="Rechercher parmi les alertes…"
        searchKeys={["name", "sku"]}
      />
    </div>
  )
}
