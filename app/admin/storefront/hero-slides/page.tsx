"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Save, Plus, Trash2, Check, Sparkles, MoveVertical } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"

type HeroSlideRow = Database["public"]["Tables"]["hero_slides"]["Row"]

export default function HeroSlidesAdminPage() {
  const [slides, setSlides] = useState<HeroSlideRow[]>([])
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  async function loadSlides() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("hero_slides")
        .select("*")
        .order("display_order", { ascending: true })

      if (data) setSlides(data)
    } catch (err) {
      console.warn("[hero-slides] Error loading:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSlides()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    try {
      const supabase = createClient()
      for (const slide of slides) {
        await supabase
          .from("hero_slides")
          .upsert({
            id: slide.id,
            title: slide.title,
            subtitle: slide.subtitle,
            cta_text: slide.cta_text,
            cta_link: slide.cta_link,
            image_url: slide.image_url,
            is_active: slide.is_active,
            display_order: slide.display_order,
          })
      }
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2000)
    } catch (err) {
      console.warn("[hero-slides] Error saving:", err)
    }
  }

  function handleAddSlide() {
    const newSlide: HeroSlideRow = {
      id: crypto.randomUUID(),
      title: "Titre de la promotion",
      subtitle: "Description de la promotion mise en avant sur l'accueil.",
      cta_text: "En profiter",
      cta_link: "/boutique",
      background_style: null,
      image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80",
      is_active: true,
      display_order: slides.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setSlides((prev) => [...prev, newSlide])
  }

  async function handleDeleteSlide(id: string) {
    setSlides((prev) => prev.filter((s) => s.id !== id))
    try {
      const supabase = createClient()
      await supabase.from("hero_slides").delete().eq("id", id)
    } catch {
      // ignore
    }
  }

  function updateField(id: string, field: keyof HeroSlideRow, value: any) {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
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
              Bannières &amp; Slides Hero
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Gérez les diapositives et visuels d&apos;accroche de la page d&apos;accueil.
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
            type="button"
            onClick={handleAddSlide}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un slide</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#8C1A2B] hover:bg-[#5E0F1D] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer</span>
          </button>
        </div>
      </div>

      {/* ── Slides List ───────────────────────────────────────── */}
      <div className="space-y-6">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {slide.title || "Slide sans titre"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slide.is_active}
                    onChange={(e) => updateField(slide.id, "is_active", e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#8C1A2B] focus:ring-[#8C1A2B] accent-[#8C1A2B]"
                  />
                  <span>Actif</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleDeleteSlide(slide.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Supprimer ce slide"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Titre Principal
                  </label>
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => updateField(slide.id, "title", e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-slate-900 outline-none focus:border-[#8C1A2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sous-titre / Description
                  </label>
                  <textarea
                    value={slide.subtitle ?? ""}
                    onChange={(e) => updateField(slide.id, "subtitle", e.target.value)}
                    rows={2}
                    className="w-full p-3 rounded-xl border border-[#E2E8F0] text-xs text-slate-700 outline-none focus:border-[#8C1A2B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Texte du Bouton (CTA)
                    </label>
                    <input
                      type="text"
                      value={slide.cta_text ?? ""}
                      onChange={(e) => updateField(slide.id, "cta_text", e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] text-xs text-slate-700 outline-none focus:border-[#8C1A2B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lien de redirection
                    </label>
                    <input
                      type="text"
                      value={slide.cta_link ?? ""}
                      onChange={(e) => updateField(slide.id, "cta_link", e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] text-xs text-slate-700 outline-none focus:border-[#8C1A2B]"
                    />
                  </div>
                </div>
              </div>

              {/* Image Preview & URL */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Visuel du Slide
                </label>
                <div className="relative aspect-video rounded-xl bg-slate-100 border border-[#E2E8F0] overflow-hidden">
                  {slide.image_url && (
                    <Image
                      src={slide.image_url}
                      alt={slide.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <input
                  type="text"
                  value={slide.image_url ?? ""}
                  onChange={(e) => updateField(slide.id, "image_url", e.target.value)}
                  placeholder="URL de l'image (Unsplash ou Supabase Storage)"
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] text-[11px] text-slate-600 outline-none focus:border-[#8C1A2B]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </form>
  )
}
