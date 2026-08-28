"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, History, ArrowDownRight, ArrowUpRight, RotateCcw } from "lucide-react"
import { DataTable, type Column } from "@/components/admin/DataTable"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"

type MovementRow = Database["public"]["Tables"]["stock_movements"]["Row"] & {
  products?: { name: string; sku: string } | null
}

const REASON_MAP: Record<string, string> = {
  restock: "Réception fournisseur",
  sale: "Vente commande",
  adjustment: "Ajustement manuel",
  return: "Retour client",
}

export default function StockHistoryPage() {
  const [logs, setLogs] = useState<MovementRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function loadHistory() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("stock_movements")
        .select("*, products(name, sku)")
        .order("created_at", { ascending: false })

      if (data) setLogs(data as any)
    } catch (err) {
      console.warn("[inventory/history] Error loading:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const columns: Column<MovementRow>[] = [
    {
      key: "created_at",
      header: "Date & Heure",
      sortable: true,
      render: (log) => (
        <span className="font-semibold text-slate-800 text-xs">
          {new Date(log.created_at).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      key: "product_name",
      header: "Produit concerné",
      sortable: true,
      render: (log) => (
        <div>
          <p className="font-bold text-slate-900">{log.products?.name ?? "Produit"}</p>
          <p className="text-[11px] text-slate-400 font-mono">SKU: {log.products?.sku ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "change_amount",
      header: "Variation",
      sortable: true,
      render: (log) => {
        const isPositive = log.change_amount > 0
        return (
          <span
            className={`font-black text-xs px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
              isPositive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {isPositive ? `+${log.change_amount}` : log.change_amount}
          </span>
        )
      },
    },
    {
      key: "reason",
      header: "Motif",
      render: (log) => (
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
          {REASON_MAP[log.reason] ?? log.reason}
        </span>
      ),
    },
    {
      key: "note",
      header: "Remarque",
      render: (log) => (
        <span className="text-xs text-slate-500 italic">{log.note ?? "—"}</span>
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
            <History className="w-5 h-5 text-slate-600" />
            <span>Journal des Mouvements de Stock</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Historique d&apos;audit complet des entrées, ventes, ajustements et retours.
          </p>
        </div>
      </div>

      {/* ── Movement History Table ────────────────────────────── */}
      <DataTable
        data={logs}
        columns={columns}
        searchPlaceholder="Rechercher par produit ou référence…"
      />
    </div>
  )
}
