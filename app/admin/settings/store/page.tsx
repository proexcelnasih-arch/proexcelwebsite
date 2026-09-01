"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Save, Check, Building2, Phone, Mail, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function StoreSettingsPage() {
  const [storeName, setStoreName] = useState("Papeterie Pro Excel")
  const [tagline, setTagline] = useState("Fournitures Scolaires, de Bureau & Librairie")
  const [email, setEmail] = useState("contact@proexcel.store")
  const [phone, setPhone] = useState("+212 522-123456")
  const [address, setAddress] = useState("Boulevard Al Massira Al Khadra, Casablanca, Maroc")
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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
          contact_email: email,
          contact_phone: phone,
          address: address,
          updated_at: new Date().toISOString(),
        })
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2000)
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
