"use client"

import { useState, useEffect, useRef } from "react"
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
  UploadCloud,
  X,
  Loader2,
  Check,
  ImageIcon,
} from "lucide-react"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { createClient } from "@/lib/supabase/client"

interface SubCategory {
  id: string
  name: string
  slug: string
  image_url: string | null
  description: string | null
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
  
  // Create Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatDesc, setNewCatDesc] = useState("")
  const [newCatImage, setNewCatImage] = useState("")
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)
  
  // Edit Modal State
  const [editCategory, setEditCategory] = useState<{
    id: string
    name: string
    description: string
    image_url: string
    is_sub: boolean
  } | null>(null)

  // Loading & Upload states
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadingTargetId, setUploadingTargetId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const cardFileInputRef = useRef<HTMLInputElement>(null)
  const [activeUploadCatId, setActiveUploadCatId] = useState<string | null>(null)

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
              image_url: c.image_url,
              description: c.description,
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

  function triggerSuccess(msg: string) {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  // Upload a file to storage via API route
  async function uploadFileToStorage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("bucket", "site-assets")

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()
    if (!res.ok || !data?.success) {
      throw new Error(data?.error || "Erreur de téléversement")
    }

    return (data.urls && data.urls[0]) || data.url
  }

  // Handle direct card file upload
  async function handleCardImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const categoryId = activeUploadCatId
    if (!file || !categoryId) return

    setUploadingTargetId(categoryId)
    try {
      const url = await uploadFileToStorage(file)
      const supabase = createClient()
      const { error } = await supabase
        .from("categories")
        .update({ image_url: url, updated_at: new Date().toISOString() })
        .eq("id", categoryId)

      if (error) throw error
      await loadCategories()
      fetch("/api/revalidate").catch(() => {})
      triggerSuccess("Image de la catégorie mise à jour avec succès !")
    } catch (err: any) {
      alert(err?.message || "Échec de l'enregistrement de l'image")
    } finally {
      setUploadingTargetId(null)
      setActiveUploadCatId(null)
      if (cardFileInputRef.current) cardFileInputRef.current.value = ""
    }
  }

  // Handle delete confirmation
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
      fetch("/api/revalidate").catch(() => {})
      triggerSuccess(`"${deleteTarget.name}" a été supprimée.`)
    } catch {
      // ignore
    }

    setDeleteTarget(null)
  }

  // Handle create Category or Subcategory
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
      const { error } = await supabase
        .from("categories")
        .insert({
          name: newCatName.trim(),
          slug,
          description: newCatDesc.trim() || null,
          image_url: newCatImage.trim() || null,
          parent_id: selectedParentId,
        })

      if (!error) {
        await loadCategories()
        fetch("/api/revalidate").catch(() => {})
        triggerSuccess(
          selectedParentId
            ? "Sous-catégorie créée avec succès !"
            : "Catégorie créée avec succès !"
        )
      } else {
        alert(error.message)
      }
    } catch (err: any) {
      alert(err.message || "Erreur lors de la création")
    }

    setNewCatName("")
    setNewCatDesc("")
    setNewCatImage("")
    setSelectedParentId(null)
    setShowAddModal(false)
  }

  // Handle edit category / subcategory submission
  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editCategory || !editCategory.name.trim()) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("categories")
        .update({
          name: editCategory.name.trim(),
          description: editCategory.description.trim() || null,
          image_url: editCategory.image_url.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editCategory.id)

      if (!error) {
        await loadCategories()
        fetch("/api/revalidate").catch(() => {})
        triggerSuccess("Modifications enregistrées avec succès !")
      } else {
        alert(error.message)
      }
    } catch (err: any) {
      alert(err.message || "Erreur de mise à jour")
    }

    setEditCategory(null)
  }

  return (
    <div className="space-y-6">
      {/* Hidden file input for card image upload */}
      <input
        ref={cardFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCardImageSelect}
      />

      {/* ── Notification Banner ─────────────────────────────────── */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Catégories &amp; Rayons
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez les images, noms, sous-catégories et rayons de votre boutique.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedParentId(null)
            setNewCatName("")
            setNewCatDesc("")
            setNewCatImage("")
            setShowAddModal(true)
          }}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#8C1A2B] hover:bg-[#5E0F1D] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>Nouvelle Catégorie</span>
        </button>
      </div>

      {/* ── Categories Grid ───────────────────────────────────── */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#8C1A2B]" />
          <span>Chargement des catégories...</span>
        </div>
      ) : (
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
                    {/* Category Image + Quick Upload Trigger */}
                    <div className="relative group/img w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-2xs">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setActiveUploadCatId(cat.id)
                          cardFileInputRef.current?.click()
                        }}
                        className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover/img:opacity-100 flex flex-col items-center justify-center transition-opacity text-[9px] font-bold cursor-pointer"
                        title="Changer l'image"
                      >
                        {uploadingTargetId === cat.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4 mb-0.5" />
                            <span>Photo</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-display font-bold text-base text-slate-900 truncate">
                          {cat.name}
                        </h2>
                        <button
                          type="button"
                          onClick={() => {
                            setEditCategory({
                              id: cat.id,
                              name: cat.name,
                              description: cat.description,
                              image_url: cat.image,
                              is_sub: false,
                            })
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Modifier le nom et l'image"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{cat.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedParentId(cat.id)
                        setNewCatName("")
                        setNewCatDesc("")
                        setNewCatImage("")
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
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Sous-catégories ({cat.subcategories.length})
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedParentId(cat.id)
                        setNewCatName("")
                        setNewCatDesc("")
                        setNewCatImage("")
                        setShowAddModal(true)
                      }}
                      className="text-[11px] font-semibold text-[#8C1A2B] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Ajouter</span>
                    </button>
                  </div>

                  {cat.subcategories.length > 0 ? (
                    <div className="space-y-1.5">
                      {cat.subcategories.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Subcategory thumbnail if present */}
                            {sub.image_url ? (
                              <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                <Image src={sub.image_url} alt={sub.name} fill className="object-cover" />
                              </div>
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            <span className="font-semibold text-slate-700 truncate">{sub.name}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                              {sub.products_count} prod.
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditCategory({
                                  id: sub.id,
                                  name: sub.name,
                                  description: sub.description || "",
                                  image_url: sub.image_url || "",
                                  is_sub: true,
                                })
                              }}
                              className="text-slate-400 hover:text-slate-700 hover:bg-white p-1 rounded transition-colors"
                              title="Modifier la sous-catégorie"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ id: sub.id, name: sub.name })}
                              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded transition-colors"
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
      )}

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

      {/* ── Add Category / Subcategory Modal ──────────────────── */}
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
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom de la catégorie *
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Image (Téléversement depuis le PC ou URL)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCatImage}
                    onChange={(e) => setNewCatImage(e.target.value)}
                    placeholder="URL de l'image..."
                    className="flex-1 h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-[#8C1A2B]"
                  />
                  <label className="h-11 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UploadCloud className="w-4 h-4" />
                    )}
                    <span>Choisir</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0]
                        if (!f) return
                        setIsUploading(true)
                        try {
                          const url = await uploadFileToStorage(f)
                          setNewCatImage(url)
                        } catch (err: any) {
                          alert(err?.message || "Erreur de téléversement")
                        } finally {
                          setIsUploading(false)
                        }
                      }}
                    />
                  </label>
                </div>
                {newCatImage && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200">
                      <Image src={newCatImage} alt="Aperçu" fill className="object-cover" />
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold truncate">
                      Image prête
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-[#8C1A2B] hover:bg-[#5E0F1D] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Category / Subcategory Modal ─────────────────── */}
      {editCategory && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="font-display font-bold text-base text-slate-900">
                {editCategory.is_sub ? "Modifier la Sous-catégorie" : "Modifier la Catégorie"}
              </h3>
              <button
                type="button"
                onClick={() => setEditCategory(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom de la catégorie *
                </label>
                <input
                  type="text"
                  value={editCategory.name}
                  onChange={(e) =>
                    setEditCategory({ ...editCategory, name: e.target.value })
                  }
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
                  value={editCategory.description}
                  onChange={(e) =>
                    setEditCategory({ ...editCategory, description: e.target.value })
                  }
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-[#8C1A2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Image (Téléverser ou URL)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editCategory.image_url}
                    onChange={(e) =>
                      setEditCategory({ ...editCategory, image_url: e.target.value })
                    }
                    placeholder="URL de l'image..."
                    className="flex-1 h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-[#8C1A2B]"
                  />
                  <label className="h-11 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UploadCloud className="w-4 h-4" />
                    )}
                    <span>Changer</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0]
                        if (!f) return
                        setIsUploading(true)
                        try {
                          const url = await uploadFileToStorage(f)
                          setEditCategory({ ...editCategory, image_url: url })
                        } catch (err: any) {
                          alert(err?.message || "Erreur de téléversement")
                        } finally {
                          setIsUploading(false)
                        }
                      }}
                    />
                  </label>
                </div>
                {editCategory.image_url && (
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                      <Image
                        src={editCategory.image_url}
                        alt="Aperçu"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs text-slate-500 truncate max-w-xs">
                      {editCategory.image_url}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditCategory(null)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-[#8C1A2B] hover:bg-[#5E0F1D] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
