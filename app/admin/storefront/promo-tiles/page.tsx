"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Save, Check, Sliders, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"

type PromoTileRow = Database["public"]["Tables"]["promo_tiles"]["Row"]

export default function PromoTilesAdminPage() {
  const [tiles, setTiles] = useState<PromoTileRow[]>([])
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  async function loadTiles() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("promo_tiles")
        .select("*")
        .order("display_order", { ascending: true })

      if (data) setTiles(data)
    } catch (err) {
      console.warn("[promo-tiles] Error loading:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTiles()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    try {
      const supabase = createClient()
      for (const tile of tiles) {
        await supabase
          .from("promo_tiles")
          .upsert({
            id: tile.id,
            title: tile.title,
            subtitle: tile.subtitle,
            link: tile.link,
            icon: tile.icon,
            is_active: tile.is_active,
            display_order: tile.display_order,
          })
      }
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2000)

      // Revalidate storefront cache so the homepage reflects changes immediately
      fetch("/api/admin/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/", type: "page" }),
      }).catch(() => {/* non-critical */})
    } catch (err) {
      console.warn("[promo-tiles] Error saving:", err)
    }
  }

  function updateField(id: string, field: keyof PromoTileRow, value: any) {
    setTiles((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* ── Top Bar ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/storefront"
            className="w-9 h-9 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Blocs Promotionnels (3 Tuiles)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Gérez les 3 cartes d&apos;accroche sous le grand banner de l&apos;accueil.
            </p>
          </div>
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
            <span>Enregistrer les tuiles</span>
          </button>
        </div>
      </div>

      {/* ── Tiles Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiles.map((tile, idx) => (
          <div
            key={tile.id}
            className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8C1A2B]">
                Tuile #{idx + 1}
              </span>
              <label className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={tile.is_active}
                  onChange={(e) => updateField(tile.id, "is_active", e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#8C1A2B] focus:ring-[#8C1A2B] accent-[#8C1A2B]"
                />
                <span>Actif</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Titre
              </label>
              <input
                type="text"
                value={tile.title}
                onChange={(e) => updateField(tile.id, "title", e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-slate-900 outline-none focus:border-[#8C1A2B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sous-titre / Appel à l&apos;action
              </label>
              <input
                type="text"
                value={tile.subtitle ?? ""}
                onChange={(e) => updateField(tile.id, "subtitle", e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] text-xs text-slate-700 outline-none focus:border-[#8C1A2B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lien de redirection
              </label>
              <input
                type="text"
                value={tile.link ?? ""}
                onChange={(e) => updateField(tile.id, "link", e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] text-xs text-slate-700 outline-none focus:border-[#8C1A2B]"
              />
            </div>
          </div>
        ))}
      </div>
    </form>
  )
}
