"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Check, Building2, Phone, Mail, MapPin, Upload, Loader2, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function StoreSettingsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [storeName, setStoreName] = useState("Papeterie Pro Excel")
  const [tagline, setTagline] = useState("Fournitures Scolaires, de Bureau & Librairie")
  const [logoUrl, setLogoUrl] = useState("/logo.png")
  const [email, setEmail] = useState("contact@proexcel.store")
  const [phone, setPhone] = useState("+212 522-123456")
  const [address, setAddress] = useState("Boulevard Al Massira Al Khadra, Casablanca, Maroc")
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true)
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("store_settings")
          .select("*")
          .eq("id", 1)
          .maybeSingle()

        if (data) {
          if (data.store_name) setStoreName(data.store_name)
          if (data.description) setTagline(data.description)
          if (data.logo_url) setLogoUrl(data.logo_url)
          if (data.contact_email) setEmail(data.contact_email)
          if (data.contact_phone) setPhone(data.contact_phone)
          if (data.address) setAddress(data.address)
        }
      } catch (err) {
        console.warn("[store-settings] Error loading:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [])

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingLogo(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("bucket", "site-assets")

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.error || "Erreur lors du téléchargement du logo")
      }

      setLogoUrl(data.url)
    } catch (err: any) {
      console.error("[store-settings] Logo upload failed:", err)
      setUploadError(err.message || "Erreur de téléchargement")
    } finally {
      setIsUploadingLogo(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    try {
      const supabase = createClient()
      await supabase
        .from("store_settings")
        .upsert({
          id: 1,
          store_name: storeName,
          description: tagline,
          logo_url: logoUrl,
          contact_email: email,
          contact_phone: phone,
          address: address,
          updated_at: new Date().toISOString(),
        })

      // Revalidate storefront cache without needing a hard browser refresh
      try {
        await fetch("/api/revalidate")
      } catch (revErr) {
        console.warn("[store-settings] Revalidation call failed:", revErr)
      }

      router.refresh()
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2500)
    } catch (err) {
      console.warn("[store-settings] Error saving:", err)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* ── Top Bar ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Paramètres de la Boutique</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Informations générales, coordonnées et identité légale affichées sur le site.
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

      {/* ── Form Body ─────────────────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-5 max-w-2xl">
        {/* ── Logo Section ───────────────────────────────────── */}
        <div className="space-y-2 pb-5 border-b border-[#F1F5F9]">
          <label className="text-xs font-bold text-slate-700 block">
            Logo officiel du site
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Logo Preview */}
            <div className="relative w-36 h-20 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center p-2 overflow-hidden shrink-0 shadow-inner">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Aperçu Logo"
                  width={140}
                  height={60}
                  className="max-h-full max-w-full object-contain"
                  priority
                />
              ) : (
                <span className="text-xs font-bold text-slate-400">Aucun logo</span>
              )}
            </div>

            {/* Upload Action */}
            <div className="flex flex-col gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                id="logo-file-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingLogo}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer w-fit"
              >
                {isUploadingLogo ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8C1A2B]" />
                    <span>Téléchargement...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 text-[#8C1A2B]" />
                    <span>Changer le logo</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-slate-500 leading-tight">
                Format PNG avec fond transparent recommandé (max 5 Mo). Stocké dans Supabase Storage (<code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded">site-assets</code>).
              </p>
              {uploadError && (
                <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> {uploadError}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Nom commercial</label>
          <input
            type="text"
            required
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-xs font-bold text-slate-900 outline-none focus:border-[#8C1A2B]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Slogan / Description courte</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-xs text-slate-700 outline-none focus:border-[#8C1A2B]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Email de contact</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-xs text-slate-700 outline-none focus:border-[#8C1A2B]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Téléphone service client</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-xs text-slate-700 outline-none focus:border-[#8C1A2B]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Adresse physique</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-xs text-slate-700 outline-none focus:border-[#8C1A2B]"
          />
        </div>
      </div>
    </form>
  )
}
