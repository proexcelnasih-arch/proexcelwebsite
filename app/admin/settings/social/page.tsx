"use client"

import { useState, useEffect } from "react"
import { Save, Check, Share2, Globe, MessageCircle, Loader2, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { recordAdminAuditAction } from "@/lib/admin/audit"

export default function SocialSettingsPage() {
  const [instagram, setInstagram] = useState("")
  const [facebook, setFacebook] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [tiktok, setTiktok] = useState("")
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadSocialSettings() {
      setIsLoading(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("store_settings")
          .select("*")
          .eq("id", 1)
          .maybeSingle()

        if (data) {
          const links = data.social_links || {}
          setInstagram(links.instagram || "https://instagram.com/proexcel.store")
          setFacebook(links.facebook || "https://facebook.com/proexcel.store")
          setWhatsappNumber(links.whatsapp || data.contact_phone || "+212 661-234567")
          setTiktok(links.tiktok || "https://tiktok.com/@proexcel.store")
        }
      } catch (err: any) {
        console.warn("[social-settings] Error loading:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadSocialSettings()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setErrorMessage(null)

    try {
      const supabase = createClient()
      const socialLinks = {
        instagram: instagram.trim(),
        facebook: facebook.trim(),
        whatsapp: whatsappNumber.trim(),
        tiktok: tiktok.trim(),
      }

      const { error } = await supabase
        .from("store_settings")
        .update({
          social_links: socialLinks,
          contact_phone: whatsappNumber.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1)

      if (error) {
        throw error
      }

      // Revalidate cache so storefront footer & chat button update immediately
      try {
        await fetch("/api/revalidate")
      } catch (revErr) {
        console.warn("[social-settings] Revalidation failed:", revErr)
      }

      recordAdminAuditAction({
        action: "settings.update_social",
        targetTable: "store_settings",
        details: { social_links: socialLinks, contact_phone: whatsappNumber.trim() },
      }).catch((auditErr) => console.warn("[admin-audit] Log failed:", auditErr))

      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2500)
    } catch (err: any) {
      console.error("[social-settings] Error saving:", err)
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
          <h1 className="text-xl font-bold text-slate-900">Réseaux Sociaux &amp; Canaux Directs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Liens des réseaux sociaux affichés dans le pied de page et le bouton WhatsApp flottant.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fade-in">
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
        /* ── Form Inputs ───────────────────────────────────────── */
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
              placeholder="https://instagram.com/proexcel.store"
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
              placeholder="https://facebook.com/proexcel.store"
              className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-xs text-slate-800 outline-none focus:border-[#8C1A2B]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Numéro WhatsApp Direct &amp; Contact</span>
            </label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+212 661-234567"
              className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-xs text-slate-800 outline-none focus:border-[#8C1A2B]"
            />
            <p className="text-[10px] text-slate-400">
              Ce numéro sera utilisé pour les boutons WhatsApp flottants et le numéro d&apos;assistance téléphonique du pied de page.
            </p>
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
              placeholder="https://tiktok.com/@proexcel.store"
              className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-xs text-slate-800 outline-none focus:border-[#8C1A2B]"
            />
          </div>
        </div>
      )}
    </form>
  )
}
