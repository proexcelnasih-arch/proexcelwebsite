"use client"

import { useState } from "react"
import { BarChart3, TrendingUp, Calendar, ArrowUpRight } from "lucide-react"

const MONTHS_DATA = [
  { month: "Jan", revenue: 24500, orders: 110, profit: 8200 },
  { month: "Fév", revenue: 28900, orders: 135, profit: 9800 },
  { month: "Mar", revenue: 31200, orders: 148, profit: 10500 },
  { month: "Avr", revenue: 27400, orders: 125, profit: 9100 },
  { month: "Mai", revenue: 35600, orders: 160, profit: 12200 },
  { month: "Juin", revenue: 42100, orders: 190, profit: 14500 },
  { month: "Juil", revenue: 58900, orders: 270, profit: 21000 },
  { month: "Août", revenue: 84500, orders: 395, profit: 31200 }, // Back to school peak
  { month: "Sep", revenue: 92000, orders: 440, profit: 34500 },
  { month: "Oct", revenue: 48000, orders: 220, profit: 16800 },
  { month: "Nov", revenue: 39000, orders: 175, profit: 13400 },
  { month: "Déc", revenue: 45000, orders: 205, profit: 15600 },
]

export function SalesRevenueChart() {
  const [activeMetric, setActiveMetric] = useState<"revenue" | "orders">("revenue")
  const maxRevenue = Math.max(...MONTHS_DATA.map((d) => d.revenue))

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-900">Évolution des Ventes &amp; Revenus</h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              +24.8% cette année
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Historique des 12 derniers mois (Pique de rentrée scolaire en Août/Septembre)
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveMetric("revenue")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMetric === "revenue"
                ? "bg-[#8C1A2B] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Chiffre d&apos;affaires (DH)
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric("orders")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMetric === "orders"
                ? "bg-[#8C1A2B] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Nombre de commandes
          </button>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="h-64 flex items-end gap-2 sm:gap-4 pt-8 pb-2 border-b border-slate-100">
        {MONTHS_DATA.map((item) => {
          const heightPct = (item.revenue / maxRevenue) * 100
          const isPeak = item.month === "Août" || item.month === "Sep"

          return (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg pointer-events-none whitespace-nowrap mb-1">
                {activeMetric === "revenue" ? `${item.revenue.toLocaleString()} DH` : `${item.orders} cmd`}
              </div>

              {/* Bar */}
              <div
                className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 group-hover:opacity-90 ${
                  isPeak
                    ? "bg-gradient-to-t from-[#8C1A2B] to-[#B3495A] shadow-sm"
                    : "bg-slate-200 group-hover:bg-[#8C1A2B]/40"
                }`}
                style={{ height: `${heightPct}%` }}
              />

              <span className="text-[11px] font-semibold text-slate-500 group-hover:text-slate-900">
                {item.month}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend & Summary */}
      <div className="flex items-center justify-between pt-4 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#8C1A2B]" />
            <span>Pic Rentrée Scolaire</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-200" />
            <span>Moyenne Mensuelle</span>
          </div>
        </div>

        <span className="font-bold text-slate-800">Total 2026: 557 100 DH</span>
      </div>
    </div>
  )
}

export function ProfitComparisonChart() {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-base text-slate-900">Revenus vs. Marge Nette</h3>
          <span className="text-xs font-bold text-[#8C1A2B]">Marge moy. 36%</span>
        </div>
        <p className="text-xs text-slate-500 mb-6">Comparatif de rentabilité trimestrielle</p>
      </div>

      <div className="space-y-4">
        {[
          { label: "T1 (Jan - Mar)", rev: 84600, profit: 28500, pct: 33 },
          { label: "T2 (Avr - Juin)", rev: 105100, profit: 35800, pct: 34 },
          { label: "T3 (Juil - Sep - Rentrée)", rev: 235400, profit: 86700, pct: 37 },
          { label: "T4 (Oct - Déc)", rev: 132000, profit: 45800, pct: 35 },
        ].map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">{item.label}</span>
              <span className="font-bold text-slate-900">
                {item.profit.toLocaleString()} DH / {item.rev.toLocaleString()} DH
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="bg-[#8C1A2B] h-full rounded-full"
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500">Bénéfice estimé 2026</span>
        <span className="font-bold text-emerald-700 text-sm">196 800 DH</span>
      </div>
    </div>
  )
}
