"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Plus,
  Layers,
  ChevronRight,
  Edit2,
  Trash2,
  FolderPlus,
  BookOpen,
  PenLine,
  Ruler,
  Palette,
  Book,
  Briefcase,
  Package,
  X,
} from "lucide-react"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"

interface SubCategory {
  id: string
  name: string
  slug: string
  products_count: number
}

interface AdminCategory {
  id: string
  name: string
  slug: string
  description: string
  icon_name: string
  image: string
  products_count: number
  subcategories: SubCategory[]
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatDesc, setNewCatDesc] = useState("")
  const [newCatIcon, setNewCatIcon] = useState("BookOpen")
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function loadCategories() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("categories")
        .select("*, products(id)")
        .order("display_order", { ascending: true })

      if (data) {
        const parents = data.filter((c) => !c.parent_id)
        const children = data.filter((c) => c.parent_id)

        const formatted: AdminCategory[] = parents.map((p) => {
          const subs = children
            .filter((c) => c.parent_id === p.id)
            .map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              products_count: Array.isArray(c.products) ? c.products.length : 0,
            }))

          const parentCount = Array.isArray(p.products) ? p.products.length : 0
          const subCounts = subs.reduce((s, c) => s + c.products_count, 0)

          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description || "Rayon de la boutique",
            icon_name: p.icon || "BookOpen",
            image: p.image_url || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&auto=format&fit=crop&q=80",
            products_count: parentCount + subCounts,
            subcategories: subs,
          }
        })
        setCategories(formatted)
      }
    } catch (err) {
      console.warn("[admin-categories] Error loading categories:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    const id = deleteTarget.id

    setCategories((prev) =>
      prev
        .filter((c) => c.id !== id)
        .map((c) => ({
          ...c,
          subcategories: c.subcategories.filter((s) => s.id !== id),
        }))
    )

    try {
      const supabase = createClient()
      await supabase.from("categories").delete().eq("id", id)
    } catch {
      // ignore
    }

    setDeleteTarget(null)
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newCatName.trim()) return

    const slug = newCatName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: newCatName.trim(),
          slug,
          description: newCatDesc.trim() || null,
          icon: newCatIcon,
          parent_id: selectedParentId,
        })
        .select()
        .single()

      if (!error && data) {
        await loadCategories()
      }
    } catch {
      // ignore
    }

    setNewCatName("")
    setNewCatDesc("")
    setSelectedParentId(null)
    setShowAddModal(false)
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Catégories &amp; Rayons
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organisez la structure de vos rayons, sous-catégories et niveaux scolaires.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedParentId(null)
            setShowAddModal(true)
          }}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#8C1A2B] hover:bg-[#5E0F1D] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>Nouvelle Catégorie</span>
        </button>
      </div>

      {/* ── Categories Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div>
              {/* Category Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                    <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display font-bold text-base text-slate-900 truncate">
                      {cat.name}
                    </h2>
                    <p className="text-xs text-slate-500 line-clamp-1">{cat.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedParentId(cat.id)
                      setShowAddModal(true)
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    title="Ajouter une sous-catégorie"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Supprimer la catégorie"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subcategories List */}
              <div className="py-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Sous-catégories ({cat.subcategories.length})
                </p>
                {cat.subcategories.length > 0 ? (
                  <div className="space-y-1.5">
                    {cat.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-700">{sub.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {sub.products_count} prod.
                          </span>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ id: sub.id, name: sub.name })}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Supprimer sous-catégorie"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Aucune sous-catégorie rattachée.</p>
                )}
              </div>
            </div>

            {/* Bottom count badge */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Total articles associés :</span>
              <span className="font-bold text-[#8C1A2B]">{cat.products_count} références</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Delete Confirmation Dialog ────────────────────────── */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer cette catégorie ?"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="danger"
      />

      {/* ── Add Category Modal ────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="font-display font-bold text-base text-slate-900">
                {selectedParentId ? "Ajouter une Sous-catégorie" : "Créer une Catégorie Racine"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom de la catégorie
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ex: Cahiers & Blocs"
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-[#8C1A2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Description courte pour le site"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-[#8C1A2B]"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-[#8C1A2B] hover:bg-[#5E0F1D] text-white text-xs font-bold transition-colors"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
