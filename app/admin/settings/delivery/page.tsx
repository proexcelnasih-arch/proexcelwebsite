"use client"

import { useState, useEffect } from "react"
import { Save, Check, Truck, Loader2, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { recordAdminAuditAction } from "@/lib/admin/audit"

export default function DeliverySettingsPage() {
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(299)
  const [standardRate, setStandardRate] = useState(35)
  const [codEnabled, setCodEnabled] = useState(true)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [cities, setCities] = useState([
    { name: "Casablanca & Environs", delay: "24h ouvrées", price: 25 },
    { name: "Grandes Villes (Rabat, Marrakech, Tanger, Fès...)", delay: "24h à 48h", price: 35 },
    { name: "Autres Villes du Royaume", delay: "48h à 72h", price: 35 },
  ])

  useEffect(() => {
    async function loadDeliverySettings() {
      setIsLoading(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("store_settings")
          .select("*")
          .eq("id", 1)
          .maybeSingle()

        if (data) {
          if (typeof data.free_shipping_threshold === "number") {
            setFreeShippingThreshold(data.free_shipping_threshold)
          }
          if (typeof data.cod_enabled === "boolean") {
            setCodEnabled(data.cod_enabled)
          }
          if (Array.isArray(data.delivery_zones) && data.delivery_zones.length > 0) {
            setCities(data.delivery_zones)
            if (data.delivery_zones[0]?.price) {
              setStandardRate(data.delivery_zones[1]?.price || data.delivery_zones[0].price)
            }
          }
        }
      } catch (err: any) {
        console.warn("[delivery-settings] Error loading:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadDeliverySettings()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setErrorMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("store_settings")
        .update({
          free_shipping_threshold: freeShippingThreshold,
          cod_enabled: codEnabled,
          delivery_zones: cities,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1)

      if (error) throw error

      try {
        await fetch("/api/revalidate")
      } catch (revErr) {
        console.warn("[delivery-settings] Revalidation failed:", revErr)
      }

      recordAdminAuditAction({
        action: "settings.update_delivery",
        targetTable: "store_settings",
        details: { freeShippingThreshold, codEnabled, zonesCount: cities.length },
      }).catch((auditErr) => console.warn("[admin-audit] Log failed:", auditErr))

      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2500)
    } catch (err: any) {
      console.error("[delivery-settings] Save error:", err)
      setErrorMessage(err?.message || "Erreur lors de l'enregistrement.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* ── Top Bar ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Paramètres de Livraison &amp; Tarifs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurez les seuils de gratuité, frais d&apos;expédition et villes desservies au Maroc.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Enregistré dans la base de données !
            </span>
          )}

          {errorMessage && (
            <span className="text-xs font-bold text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errorMessage}
            </span>
          )}

          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#8C1A2B] hover:bg-[#5E0F1D] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enregistrement…</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enregistrer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12 bg-white border border-[#E2E8F0] rounded-2xl">
          <Loader2 className="w-6 h-6 animate-spin text-[#8C1A2B]" />
        </div>
      ) : (
        <>
          {/* ── Global Shipping Rules ─────────────────────────────── */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-5 max-w-2xl">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#8C1A2B]" />
              <span>Règles Tarifaires Générales</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Seuil de Livraison Gratuite (DH)</label>
                <input
                  type="number"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(parseFloat(e.target.value) || 0)}
                  className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-xs font-bold text-slate-900 outline-none focus:border-[#8C1A2B]"
                />
                <p className="text-[11px] text-slate-400">Offerte automatiquement au-dessus de ce montant.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Frais Standard par défaut (DH)</label>
                <input
                  type="number"
                  value={standardRate}
                  onChange={(e) => setStandardRate(parseFloat(e.target.value) || 0)}
                  className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-xs font-bold text-slate-900 outline-none focus:border-[#8C1A2B]"
                />
              </div>
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Paiement à la livraison (Cash on Delivery)</span>
                <span className="text-[11px] text-slate-500">Autoriser l&apos;encaissement en espèces à la remise du colis</span>
              </div>
              <input
                type="checkbox"
                checked={codEnabled}
                onChange={(e) => setCodEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-[#8C1A2B] focus:ring-[#8C1A2B]"
              />
            </label>
          </div>

          {/* ── Cities Rates Table ────────────────────────────────── */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4 max-w-2xl">
            <h3 className="font-bold text-sm text-slate-900">Délais &amp; Tarifs par Zone</h3>

            <div className="divide-y divide-slate-100">
              {cities.map((city, idx) => (
                <div key={city.name || idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{city.name}</p>
                    <p className="text-[11px] text-slate-400">Délai: {city.delay}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{city.price} DH</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </form>
  )
}
