"use client"

import { useState } from "react"
import { Save, Check, Share2, Globe, MessageCircle } from "lucide-react"

export default function SocialSettingsPage() {
  const [instagram, setInstagram] = useState("https://instagram.com/proexcel.store")
  const [facebook, setFacebook] = useState("https://facebook.com/proexcel.papeterie")
  const [whatsappNumber, setWhatsappNumber] = useState("+212 661-234567")
  const [tiktok, setTiktok] = useState("https://tiktok.com/@proexcel.store")
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
          <h1 className="text-xl font-bold text-slate-900">Réseaux Sociaux &amp; Canaux Directs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Liens des réseaux sociaux affichés dans le pied de page et le bouton WhatsApp flottant.
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

      {/* ── Form Inputs ───────────────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4 max-w-2xl">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-pink-600" />
            <span>Page Instagram</span>
          </label>
          <input
            type="url"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-xs text-slate-800 outline-none focus:border-[#8C1A2B]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-blue-600" />
            <span>Page Facebook</span>
          </label>
          <input
            type="url"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-xs text-slate-800 outline-none focus:border-[#8C1A2B]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Numéro WhatsApp Direct</span>
          </label>
          <input
            type="text"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-xs text-slate-800 outline-none focus:border-[#8C1A2B]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-600" />
            <span>Compte TikTok (Optionnel)</span>
          </label>
          <input
            type="url"
            value={tiktok}
            onChange={(e) => setTiktok(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-xs text-slate-800 outline-none focus:border-[#8C1A2B]"
          />
        </div>
      </div>
    </form>
  )
}
