"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Save, Check, Package, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatProductListItem } from "@/lib/supabase/formatters"
import type { ProductListItem } from "@/types"

export default function FeaturedProductsAdminPage() {
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("products")
          .select("*, product_images(url, is_primary, display_order), categories(name, slug), brands(name, slug)")
          .order("name", { ascending: true })

        if (data) {
          setProducts(data.map((p) => formatProductListItem(p as any)))
        }
      } catch (err) {
        console.warn("[featured-products] Error loading:", err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  function toggleFlag(id: string, flag: "is_bestseller" | "is_new_arrival" | "is_featured") {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [flag]: !p[flag] } : p))
    )
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    try {
      const supabase = createClient()
      for (const p of products) {
        await supabase
          .from("products")
          .update({
            is_bestseller: p.is_bestseller,
            is_new_arrival: p.is_new_arrival,
            is_featured: p.is_featured,
          })
          .eq("id", p.id)
      }
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2000)

      // Revalidate storefront so homepage bestsellers/new arrivals sections update
      fetch("/api/admin/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/", type: "page" }),
      }).catch(() => {/* non-critical */})
    } catch {
      // ignore
    }
  }

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center items-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
      </div>
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
              Produits en Vedette sur l&apos;Accueil
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Cochez les produits à mettre en avant dans les sections &quot;Meilleures Ventes&quot;, &quot;Nouveautés&quot; et &quot;Offres&quot;.
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
            <span>Enregistrer la sélection</span>
          </button>
        </div>
      </div>

      {/* ── Products Table ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-[#E2E8F0] text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Produit</th>
                <th className="py-3.5 px-4">Prix</th>
                <th className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Meilleure Vente
                  </span>
                </th>
                <th className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center gap-1">
                    <Package className="w-3 h-3 text-blue-500" />
                    Nouveauté
                  </span>
                </th>
                <th className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-500" />
                    En Vedette (Home)
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        {p.primary_image ? (
                          <Image src={p.primary_image} alt={p.name} fill unoptimized className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-400">
                            IMG
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.category_name ?? "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {p.price} DH
                  </td>
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={p.is_bestseller ?? false}
                      onChange={() => toggleFlag(p.id, "is_bestseller")}
                      className="w-4 h-4 rounded border-slate-300 text-[#8C1A2B] focus:ring-[#8C1A2B] accent-[#8C1A2B] cursor-pointer"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={p.is_new_arrival ?? false}
                      onChange={() => toggleFlag(p.id, "is_new_arrival")}
                      className="w-4 h-4 rounded border-slate-300 text-[#8C1A2B] focus:ring-[#8C1A2B] accent-[#8C1A2B] cursor-pointer"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={p.is_featured ?? false}
                      onChange={() => toggleFlag(p.id, "is_featured")}
                      className="w-4 h-4 rounded border-slate-300 text-[#8C1A2B] focus:ring-[#8C1A2B] accent-[#8C1A2B] cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </form>
  )
}
