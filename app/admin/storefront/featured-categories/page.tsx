"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Save, Check, MoveUp, MoveDown, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"]

export default function FeaturedCategoriesAdminPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  async function loadCategories() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("categories")
        .select("*")
        .is("parent_id", null)
        .order("display_order", { ascending: true })

      if (data) setCategories(data)
    } catch (err) {
      console.warn("[featured-categories] Error loading:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  function moveCategory(index: number, direction: "up" | "down") {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === categories.length - 1)
    ) {
      return
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1
    const updated = [...categories]
    const [moved] = updated.splice(index, 1)
    updated.splice(targetIndex, 0, moved)
    setCategories(updated)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    try {
      const supabase = createClient()
      for (let i = 0; i < categories.length; i++) {
        const cat = categories[i]
        await supabase
          .from("categories")
          .update({
            display_order: i + 1,
            is_featured: cat.is_featured,
          })
          .eq("id", cat.id)
      }
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2000)

      // Revalidate storefront so homepage categories grid updates
      fetch("/api/admin/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/", type: "page" }),
      }).catch(() => {/* non-critical */})
    } catch (err) {
      console.warn("[featured-categories] Error saving:", err)
    }
  }

  function toggleFeatured(id: string) {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_featured: !c.is_featured } : c))
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
              Catégories en Vedette (Grille Accueil)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Réorganisez l&apos;ordre et la visibilité des cartes catégories de la page d&apos;accueil.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Ordre enregistré !
            </span>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#8C1A2B] hover:bg-[#5E0F1D] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer l&apos;ordre</span>
          </button>
        </div>
      </div>

      {/* ── Draggable/Sortable List ────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] divide-y divide-[#E2E8F0] shadow-xs overflow-hidden">
        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => moveCategory(idx, "up")}
                  disabled={idx === 0}
                  className="p-1 rounded text-slate-400 hover:text-slate-900 disabled:opacity-20 cursor-pointer"
                  title="Monter"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveCategory(idx, "down")}
                  disabled={idx === categories.length - 1}
                  className="p-1 rounded text-slate-400 hover:text-slate-900 disabled:opacity-20 cursor-pointer"
                  title="Descendre"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="font-bold text-xs text-slate-400 w-5 text-center">
                #{idx + 1}
              </span>

              <div className="relative w-12 h-12 rounded-xl bg-slate-100 border border-[#E2E8F0] overflow-hidden shrink-0">
                {cat.image_url && (
                  <Image src={cat.image_url} alt={cat.name} fill className="object-cover" />
                )}
              </div>

              <div className="min-w-0">
                <p className="font-bold text-xs text-slate-900 truncate">{cat.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{cat.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cat.is_featured}
                  onChange={() => toggleFeatured(cat.id)}
                  className="w-4 h-4 rounded border-slate-300 text-[#8C1A2B] focus:ring-[#8C1A2B] accent-[#8C1A2B]"
                />
                <span>Afficher sur Accueil</span>
              </label>

              <Link
                href={`/category/${cat.slug}`}
                target="_blank"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Voir sur le site"
              >
                <Eye className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </form>
  )
}
