"use client"

import { useState, useEffect } from "react"
import { Plus, Tag, Calendar, Percent, DollarSign, Check, Trash2, X } from "lucide-react"
import { DataTable, type Column } from "@/components/admin/DataTable"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { createClient } from "@/lib/supabase/client"
import { recordAdminAuditAction } from "@/lib/admin/audit"
import type { Database } from "@/types/database"

type CouponRow = Database["public"]["Tables"]["coupons"]["Row"]

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponRow[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [code, setCode] = useState("")
  const [type, setType] = useState<"percentage" | "fixed">("percentage")
  const [value, setValue] = useState(10)
  const [minOrder, setMinOrder] = useState(200)
  const [limit, setLimit] = useState(100)
  const [isLoading, setIsLoading] = useState(true)

  async function loadCoupons() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false })

      if (data) setCoupons(data)
    } catch (err) {
      console.warn("[admin-coupons] Error loading coupons:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCoupons()
  }, [])

  async function handleToggleActive(id: string) {
    const target = coupons.find((c) => c.id === id)
    if (!target) return
    const nextState = !target.is_active

    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: nextState } : c))
    )

    try {
      const supabase = createClient()
      await supabase.from("coupons").update({ is_active: nextState }).eq("id", id)

      recordAdminAuditAction({
        action: "coupon.toggle_status",
        targetTable: "coupons",
        targetId: id,
        details: { is_active: nextState },
      }).catch((e) => console.warn("[admin-audit] Coupon toggle log failed:", e))
    } catch {
      // ignore
    }
  }

  async function handleCreateCoupon(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return

    const newCode = code.trim().toUpperCase()

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("coupons")
        .insert({
          code: newCode,
          type,
          value,
          min_order_amount: minOrder,
          max_uses: limit,
          times_used: 0,
          is_active: true,
        })
        .select()
        .single()

      if (!error && data) {
        setCoupons((prev) => [data, ...prev])

        recordAdminAuditAction({
          action: "coupon.create",
          targetTable: "coupons",
          targetId: data.id,
          details: { code: newCode, type, value, min_order_amount: minOrder },
        }).catch((e) => console.warn("[admin-audit] Coupon create log failed:", e))
      }
    } catch {
      // ignore
    }

    setCode("")
    setShowAddModal(false)
  }

  const columns: Column<CouponRow>[] = [
    {
      key: "code",
      header: "Code Promo",
      sortable: true,
      render: (coup) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
            {coup.code}
          </span>
        </div>
      ),
    },
    {
      key: "value",
      header: "Réduction",
      sortable: true,
      render: (coup) => (
        <span className="font-extrabold text-sm text-[#8C1A2B]">
          {coup.type === "percentage" ? `-${coup.value}%` : `-${coup.value} DH`}
        </span>
      ),
    },
    {
      key: "min_order_amount",
      header: "Minimum Commande",
      render: (coup) => <span className="font-semibold text-slate-700">{coup.min_order_amount} DH</span>,
    },
    {
      key: "times_used",
      header: "Utilisations",
      render: (coup) => (
        <div>
          <span className="font-bold text-slate-900">
            {coup.times_used} / {coup.max_uses ?? "∞"}
          </span>
          {coup.max_uses && (
            <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-[#8C1A2B] h-full rounded-full"
                style={{ width: `${Math.min(100, (coup.times_used / coup.max_uses) * 100)}%` }}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "ends_at",
      header: "Validité",
      render: (coup) => (
        <span className="text-xs text-slate-500">
          {coup.ends_at ? `Jusqu'au ${new Date(coup.ends_at).toLocaleDateString("fr-FR")}` : "Illimité"}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Statut",
      render: (coup) => (
        <button
          type="button"
          onClick={() => handleToggleActive(coup.id)}
          className="cursor-pointer"
        >
          <StatusBadge status={coup.is_active ? "active" : "inactive"} />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Codes Promo &amp; Réductions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez vos offres promotionnelles, coupons d&apos;influenceurs et réductions paniers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#8C1A2B] hover:bg-[#5E0F1D] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>Créer un Code Promo</span>
        </button>
      </div>

      {/* ── Coupons DataTable ─────────────────────────────────── */}
      <DataTable
        data={coupons}
        columns={columns}
        searchPlaceholder="Rechercher par code promo…"
        searchKeys={["code"]}
      />

      {/* ── Add Coupon Modal ──────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="font-display font-bold text-base text-slate-900">
                Créer un Nouveau Code Promo
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Code Promo (Ex: RENTREE20)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="EXCEL2026"
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 uppercase font-mono font-bold text-sm outline-none focus:border-[#8C1A2B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Type de remise
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-[#8C1A2B]"
                  >
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (DH)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Valeur remise
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    min={1}
                    required
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-[#8C1A2B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Minimum commande (DH)
                  </label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    min={0}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-[#8C1A2B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Limite d&apos;utilisations
                  </label>
                  <input
                    type="number"
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    min={1}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-[#8C1A2B]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-[#8C1A2B] hover:bg-[#5E0F1D] text-white text-xs font-bold transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
