"use client"

import { useState } from "react"
import { Save, Check, ShoppingCart, ShieldAlert } from "lucide-react"

export default function OrderSettingsPage() {
  const [prefix, setPrefix] = useState("PE-2026-")
  const [defaultStatus, setDefaultStatus] = useState("pending")
  const [allowGuestCheckout, setAllowGuestCheckout] = useState(true)
  const [autoEmailNotify, setAutoEmailNotify] = useState(true)
  const [savedSuccess, setSavedSuccess] = useState(false)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2000)
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* ── Top Bar ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Paramètres des Commandes</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Format de numérotation, statut par défaut et options de commande invité.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Enregistré !
            </span>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#8C1A2B] hover:bg-[#5E0F1D] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer</span>
          </button>
        </div>
      </div>

      {/* ── Settings Form Body ────────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-5 max-w-2xl">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Préfixe du Numéro de Commande</label>
          <input
            type="text"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#8C1A2B]"
          />
          <p className="text-[11px] text-slate-400">Exemple de résultat généré : {prefix}1050</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Statut Initial à la Validation</label>
          <select
            value={defaultStatus}
            onChange={(e) => setDefaultStatus(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] text-xs font-bold text-slate-800 bg-white outline-none focus:border-[#8C1A2B]"
          >
            <option value="pending">En attente de confirmation téléphonique (Recommandé)</option>
            <option value="confirmed">Confirmée automatiquement</option>
          </select>
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Commande Invité Express</span>
              <span className="text-[11px] text-slate-500">Permettre aux acheteurs de commander sans créer de compte</span>
            </div>
            <input
              type="checkbox"
              checked={allowGuestCheckout}
              onChange={(e) => setAllowGuestCheckout(e.target.checked)}
              className="w-4 h-4 rounded text-[#8C1A2B] focus:ring-[#8C1A2B]"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Notification Email Client</span>
              <span className="text-[11px] text-slate-500">Envoyer un récapitulatif de commande automatique au client</span>
            </div>
            <input
              type="checkbox"
              checked={autoEmailNotify}
              onChange={(e) => setAutoEmailNotify(e.target.checked)}
              className="w-4 h-4 rounded text-[#8C1A2B] focus:ring-[#8C1A2B]"
            />
          </label>
        </div>
      </div>
    </form>
  )
}
