"use client"

import { useState } from "react"
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Phone,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { STORE_INFO } from "@/lib/navigation"
import { cn } from "@/lib/utils"

export function TrackOrderClient() {
  const [orderQuery, setOrderQuery] = useState("")
  const [phoneQuery, setPhoneQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [orderResult, setOrderResult] = useState<{
    orderNumber: string
    date: string
    estimatedDelivery: string
    status: "confirmed" | "preparing" | "shipped" | "delivered"
    customerName: string
    city: string
    itemsCount: number
    totalAmount: string
    paymentMethod: string
  } | null>(null)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!orderQuery.trim()) return

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSearched(true)
      const cleanNum = orderQuery.trim().toUpperCase()
      setOrderResult({
        orderNumber: cleanNum.startsWith("CMD-") ? cleanNum : `CMD-${cleanNum}`,
        date: "27 Août 2026",
        estimatedDelivery: "Sous 24h à 48h ouvrées",
        status: "shipped",
        customerName: "Client ProExcel",
        city: "Casablanca, Maroc",
        itemsCount: 3,
        totalAmount: "349 DH",
        paymentMethod: "Paiement en espèces à la livraison",
      })
    }, 600)
  }

  const steps = [
    {
      id: "confirmed",
      label: "Commande confirmée",
      desc: "Commande enregistrée et validée par notre équipe",
      icon: CheckCircle2,
      active: true,
      completed: true,
    },
    {
      id: "preparing",
      label: "En préparation",
      desc: "Colis soigneusement emballé dans notre entrepôt",
      icon: Package,
      active: true,
      completed: true,
    },
    {
      id: "shipped",
      label: "En cours d'acheminement",
      desc: "Pris en charge par notre transporteur express",
      icon: Truck,
      active: true,
      completed: false,
    },
    {
      id: "delivered",
      label: "Livré & Encaissé",
      desc: "Remise en main propre contre règlement",
      icon: MapPin,
      active: false,
      completed: false,
    },
  ]

  const whatsappClean = STORE_INFO.whatsapp.replace(/[^0-9]/g, "")

  return (
    <div className="bg-[var(--color-background)] min-h-screen py-6 lg:py-10">
      <div className="container-site max-w-4xl">
        <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Suivi de Commande" }]} />

        {/* Hero Header */}
        <div className="text-center mt-6 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider mb-3">
            <Truck className="w-4 h-4" />
            <span>Suivi d&apos;expédition en direct</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-text-primary)] tracking-tight">
            Suivre l&apos;état de ma commande
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-2 max-w-xl mx-auto">
            Renseignez votre numéro de commande reçu par SMS / Email pour connaître l&apos;état d&apos;acheminement de votre colis.
          </p>
        </div>

        {/* ── Search Form Card ── */}
        <div className="bg-white rounded-3xl border border-[var(--color-border)] p-6 sm:p-8 shadow-xs mb-10 max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="order-num" className="text-xs font-bold text-slate-700">
                  Numéro de commande <span className="text-[var(--color-primary)]">*</span>
                </label>
                <input
                  id="order-num"
                  type="text"
                  required
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  placeholder="Ex: CMD-1049 ou 1049"
                  className="h-12 px-4 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 font-mono uppercase"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="order-phone" className="text-xs font-bold text-slate-700">
                  Numéro de téléphone ou Email
                </label>
                <input
                  id="order-phone"
                  type="text"
                  value={phoneQuery}
                  onChange={(e) => setPhoneQuery(e.target.value)}
                  placeholder="06 XX XX XX XX"
                  className="h-12 px-4 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[var(--color-primary)] text-white font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-[var(--color-primary-dark)] active:scale-[0.98] disabled:opacity-50 transition-all duration-200 shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" strokeWidth={2} />
                  <span>Rechercher ma commande</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Tracking Result Timeline ── */}
        <AnimatePresence>
          {searched && orderResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-[var(--color-border)] p-6 sm:p-10 shadow-xs mb-14"
            >
              {/* Top order summary header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-2 inline-block">
                    En cours de livraison
                  </span>
                  <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900">
                    Commande {orderResult.orderNumber}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Date de commande : {orderResult.date} • {orderResult.city}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400 block font-medium">Montant à régler</span>
                  <span className="font-bold text-xl text-[var(--color-primary)]">
                    {orderResult.totalAmount}
                  </span>
                  <span className="text-[11px] text-slate-500 block">Paiement à la livraison</span>
                </div>
              </div>

              {/* Step Progression Timeline */}
              <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-8 my-8 ml-3 sm:ml-4">
                {steps.map((step, idx) => {
                  const Icon = step.icon
                  return (
                    <div key={step.id} className="relative">
                      {/* Step Indicator Dot */}
                      <div
                        className={cn(
                          "absolute -left-[31px] sm:-left-[39px] top-0 w-8 h-8 rounded-full flex items-center justify-center text-white border-2 border-white shadow-xs transition-colors",
                          step.completed
                            ? "bg-emerald-500"
                            : step.active
                            ? "bg-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/15"
                            : "bg-slate-200 text-slate-400"
                        )}
                      >
                        <Icon className="w-4 h-4" strokeWidth={2} />
                      </div>

                      <div>
                        <h4
                          className={cn(
                            "font-bold text-sm sm:text-base",
                            step.active ? "text-slate-900" : "text-slate-400"
                          )}
                        >
                          {step.label}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Delivery notice */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 mt-6">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Délai estimé :</strong> Votre colis sera livré d&apos;ici demain. Le livreur vous passera un appel téléphonique avant de se présenter à votre adresse.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Assistance Card ── */}
        <div className="bg-gradient-to-br from-[#8C1A2B] to-[#5E0F1D] rounded-3xl p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display font-bold text-xl sm:text-2xl tracking-tight">
              Un problème avec votre livraison ?
            </h3>
            <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-md">
              Notre équipe logistique vous aide à localiser votre colis en direct sur WhatsApp.
            </p>
          </div>

          <a
            href={`https://wa.me/${whatsappClean}?text=Bonjour%20Pro%20Excel,%20je%20souhaite%20suivre%20ma%20commande`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center justify-center gap-2.5 h-12 px-6 rounded-xl bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#1EBE5D] hover:shadow-[0_0_24px_rgba(37,211,102,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 shadow-md"
          >
            <span>Assistance WhatsApp</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
