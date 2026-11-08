"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  User,
  MapPin,
  Save,
  CreditCard,
  Ban,
} from "lucide-react"
import { StatusBadge } from "@/components/admin/StatusBadge"
import type { Database } from "@/types/database"

export type OrderDetails = Database["public"]["Tables"]["orders"]["Row"] & {
  order_items?: (Database["public"]["Tables"]["order_items"]["Row"] & {
    products?: { name: string; slug: string; product_images?: { url: string; is_primary?: boolean }[] } | null
  })[]
  order_status_history?: Database["public"]["Tables"]["order_status_history"]["Row"][]
}

const STATUS_STEPS = [
  { id: "pending", label: "En attente", icon: Clock },
  { id: "confirmed", label: "Confirmée", icon: CheckCircle2 },
  { id: "processing", label: "En préparation", icon: Package },
  { id: "shipped", label: "Expédiée", icon: Truck },
  { id: "delivered", label: "Livrée", icon: CheckCircle2 },
]

export function OrderDetailClient({ initialOrder }: { initialOrder: OrderDetails }) {
  const [order, setOrder] = useState<OrderDetails>(initialOrder)
  const [notes, setNotes] = useState(initialOrder.notes ?? "")
  const [savedNote, setSavedNote] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.id === order.status)
  const isCancelled = order.status === "cancelled"
  const shippingAddress =
    typeof order.shipping_address === "object" && order.shipping_address
      ? (order.shipping_address as { address?: string; city?: string; notes?: string })
      : null

  async function handleStatusUpdate(newStatus: Database["public"]["Enums"]["order_status"]) {
    if (isUpdating) return
    setIsUpdating(true)

    // Optimistic status update
    setOrder((prev) => ({ ...prev, status: newStatus }))

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await res.json()
      if (data.success && data.order) {
        setOrder(data.order)
      } else {
        alert(data.error || "Erreur lors de la mise à jour du statut.")
        setOrder(initialOrder)
      }
    } catch (err) {
      console.error("[order-detail] Status update failed:", err)
      setOrder(initialOrder)
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleSaveNotes() {
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      })

      const data = await res.json()
      if (data.success) {
        setSavedNote(true)
        setTimeout(() => setSavedNote(false), 2000)
      } else {
        alert(data.error || "Erreur lors de l'enregistrement de la note.")
      }
    } catch {
      alert("Erreur lors de l'enregistrement de la note.")
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Top Bar with Back Link & Status ───────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 font-display">
                {order.order_number}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Passée le{" "}
              {new Date(order.created_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          {order.status !== "cancelled" && order.status !== "delivered" && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleStatusUpdate("cancelled")}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Annuler la commande</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Status Progression Stepper ────────────────────────── */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
            Progression de la commande
          </h2>

          <div className="relative flex items-center justify-between">
            {/* Background Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 w-full z-0" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#8C1A2B] z-0 transition-all duration-500"
              style={{
                width: `${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 100}%`,
              }}
            />

            {/* Stepper Circles */}
            {STATUS_STEPS.map((step, idx) => {
              const isPast = idx <= currentStepIndex
              const isCurrent = idx === currentStepIndex
              const IconComp = step.icon

              return (
                <button
                  key={step.id}
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusUpdate(step.id as Database["public"]["Enums"]["order_status"])}
                  className="relative z-10 flex flex-col items-center group cursor-pointer disabled:cursor-not-allowed"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isCurrent
                        ? "bg-[#8C1A2B] text-white shadow-md ring-4 ring-[#8C1A2B]/20"
                        : isPast
                        ? "bg-[#8C1A2B] text-white"
                        : "bg-white border-2 border-slate-200 text-slate-400 group-hover:border-slate-300"
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-2 ${
                      isCurrent ? "text-[#8C1A2B]" : isPast ? "text-slate-800" : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Main Layout: 2 Columns ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Products + Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-display font-bold text-sm text-slate-900">
                Articles commandés ({order.order_items?.length ?? 0})
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {order.order_items?.map((item) => {
                const prodImg =
                  item.products?.product_images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1544816155-12df9643f363?w=120"
                return (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                        <Image
                          src={prodImg}
                          alt={item.product_name_snapshot}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-900 truncate">
                          {item.product_name_snapshot}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {item.price_snapshot} DH × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-slate-900 shrink-0">
                      {item.subtotal} DH
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Financial Summary */}
            <div className="p-5 bg-slate-50/70 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total articles</span>
                <span className="font-semibold">{order.subtotal} DH</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Frais de livraison</span>
                <span className="font-semibold">
                  {order.shipping_cost === 0 ? "Gratuite" : `${order.shipping_cost} DH`}
                </span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Réduction ({order.coupon_code ?? "Promo"})</span>
                  <span>-{order.discount_amount} DH</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total à encaisser</span>
                <span className="text-[#8C1A2B]">{order.total} DH</span>
              </div>
            </div>
          </div>

          {/* Admin Internal Notes */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h2 className="font-display font-bold text-sm text-slate-900 mb-3">
              Notes de commande &amp; suivi
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ajouter une consigne de livraison ou remarque interne…"
              className="w-full p-3 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#8C1A2B] transition-colors"
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-[11px] text-slate-400">
                {savedNote ? "✓ Notes enregistrées avec succès" : "Visible par les administrateurs"}
              </span>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Customer & Shipping Information */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>Informations client</span>
            </h2>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Nom</span>
                <span className="font-bold text-slate-900">{order.customer_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Téléphone</span>
                <a
                  href={`tel:${order.customer_phone}`}
                  className="font-semibold text-[#8C1A2B] hover:underline"
                >
                  {order.customer_phone}
                </a>
              </div>
              {order.customer_email && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                  <span className="text-slate-700">{order.customer_email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>Adresse de livraison</span>
            </h2>

            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-semibold text-slate-900">{shippingAddress?.address || "Adresse non spécifiée"}</p>
              <p>{shippingAddress?.city || "Maroc"}</p>
              {shippingAddress?.notes && (
                <p className="mt-2 text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
                  <strong>Indication :</strong> {shippingAddress.notes}
                </p>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-400" />
              <span>Mode de paiement</span>
            </h2>

            <div className="text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Méthode :</span>
                <span className="font-bold text-slate-900">
                  {order.payment_method === "cod" ? "Paiement à la livraison" : order.payment_method}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Statut :</span>
                <StatusBadge
                  status={order.payment_status === "paid" ? "paid" : "pending"}
                  label={order.payment_status === "paid" ? "Payé" : "À encaisser"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

