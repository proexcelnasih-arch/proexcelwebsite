"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  UploadCloud,
  Layers,
  BookOpen,
  DollarSign,
  Package,
  Loader2,
  X,
  Sparkles,
  HelpCircle,
  Tag,
  GraduationCap,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface VariantItem {
  id?: string
  variant_type: string
  label: string
  price_delta: number
  stock_quantity: number
}

export interface ProductFormData {
  id?: string
  name: string
  slug: string
  description: string
  price: number
  compare_at_price: number | null
  stock: number
  sku: string
  category_name: string
  school_level?: string
  subject?: string
  brand_name: string
  is_bestseller: boolean
  is_new_arrival: boolean
  is_featured: boolean
  is_active: boolean
  images: string[]
  variants?: VariantItem[]
}

interface ProductFormProps {
  initialData?: ProductFormData
  isEdit?: boolean
}

// ── Academic Levels for Moroccan School System ───────────────
const SCHOOL_LEVELS = [
  {
    group: "Primaire (Fondamental)",
    options: [
      { id: "cp", label: "CP / 1ère Année Primaire (1AP)" },
      { id: "ce1", label: "CE1 / 2ème Année Primaire (2AP)" },
      { id: "ce2", label: "CE2 / 3ème Année Primaire (3AP)" },
      { id: "cm1", label: "CM1 / 4ème Année Primaire (4AP)" },
      { id: "cm2", label: "CM2 / 5ème Année Primaire (5AP)" },
      { id: "6ap", label: "6ème Année Primaire (6AP)" },
    ],
  },
  {
    group: "Collège (Enseignement Secondaire Collégial)",
    options: [
      { id: "1ac", label: "1ère Année Collège (1AC)" },
      { id: "2ac", label: "2ème Année Collège (2AC)" },
      { id: "3ac", label: "3ème Année Collège (3AC) — Brevet" },
    ],
  },
  {
    group: "Lycée (Secondaire Qualifiant & Baccalauréat)",
    options: [
      { id: "tc", label: "Tronc Commun (Sciences / Lettres / Tech)" },
      { id: "1bac", label: "1ère Année Baccalauréat (Régional)" },
      { id: "2bac", label: "2ème Année Baccalauréat (National)" },
    ],
  },
  {
    group: "Maternelle & Éveil",
    options: [
      { id: "ps", label: "Petite Section (PS)" },
      { id: "ms", label: "Moyenne Section (MS)" },
      { id: "gs", label: "Grande Section (GS)" },
    ],
  },
  {
    group: "Autre / Supérieur",
    options: [
      { id: "univ", label: "Enseignement Supérieur / Université" },
      { id: "all", label: "Tous Niveaux / Parascolaire & Dictionnaires" },
    ],
  },
]

const SCHOOL_SUBJECTS = [
  "Toutes matières / Général",
  "Mathématiques",
  "Français (Lecture & Grammaire)",
  "Langue Arabe",
  "Sciences de la Vie et de la Terre (SVT)",
  "Physique - Chimie",
  "Histoire - Géographie",
  "Anglais",
  "Éducation Islamique",
  "Philosophie",
  "Informatique & Technologie",
  "Arts Plastiques & Musique",
]

const CATEGORY_CHOICES = [
  "Papeterie",
  "Fournitures Scolaires",
  "Livres Scolaires",
  "Arts & Créativité",
  "Livres",
  "Bureau",
  "Kits Scolaires",
]

const BRAND_CHOICES = [
  "Clairefontaine",
  "Oxford",
  "BIC",
  "Maped",
  "Faber-Castell",
  "Stabilo",
  "Casio",
  "Éditions Officielles",
  "Hachette",
  "Nathan",
  "Générique",
]

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<ProductFormData>(
    initialData ?? {
      name: "",
      slug: "",
      description: "",
      price: 0,
      compare_at_price: null,
      stock: 10,
      sku: "",
      category_name: "Papeterie",
      school_level: "cp",
      subject: "Français (Lecture & Grammaire)",
      brand_name: "Clairefontaine",
      is_bestseller: false,
      is_new_arrival: true,
      is_featured: false,
      is_active: true,
      images: [],
      variants: [],
    }
  )

  const [variants, setVariants] = useState<VariantItem[]>(
    initialData?.variants ?? []
  )

  const [imageUrlInput, setImageUrlInput] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [formError, setFormError] = useState("")

  const isBookOrKitCategory =
    formData.category_name === "Livres Scolaires" ||
    formData.category_name === "Kits Scolaires" ||
    formData.category_name === "Livres"

  // Auto-generate slug from name if creating
  function handleNameChange(name: string) {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")

    setFormData((prev) => ({
      ...prev,
      name,
      slug: isEdit ? prev.slug : slug,
    }))
  }

  // Handle local PC file upload directly to Storage via API
  async function handleFilesUpload(files: FileList | null) {
    if (!files || files.length === 0) return

    const validFiles = Array.from(files).filter((file) => file.type.startsWith("image/"))
    if (validFiles.length === 0) return

    setIsUploadingImages(true)
    setFormError("")

    try {
      const uploadFormData = new FormData()
      validFiles.forEach((file) => {
        uploadFormData.append("file", file)
      })

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: uploadFormData,
      })

      const text = await res.text()
      let data: any = null
      try {
        data = JSON.parse(text)
      } catch {
        if (!res.ok) {
          throw new Error(`Erreur de téléchargement (${res.status}): ${text.slice(0, 100)}`)
        }
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Échec du téléchargement des images sur le serveur.")
      }

      if (Array.isArray(data.urls) && data.urls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...data.urls],
        }))
      }
    } catch (uploadErr: any) {
      console.warn("[ProductForm] Storage upload failed, falling back to local preview:", uploadErr)
      setFormError(uploadErr?.message || "Erreur lors du transfert de l'image. Aperçu local activé.")

      // Fallback to local FileReader if storage route is offline
      validFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          if (result) {
            setFormData((prev) => ({
              ...prev,
              images: [...prev.images, result],
            }))
          }
        }
        reader.readAsDataURL(file)
      })
    } finally {
      setIsUploadingImages(false)
    }
  }

  function handleAddImageUrl() {
    if (!imageUrlInput.trim()) return
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, imageUrlInput.trim()],
    }))
    setImageUrlInput("")
  }

  function handleRemoveImage(index: number) {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  // ── Variant Handlers ─────────────────────────────────────────
  function handleAddVariant(type = "Taille", label = "", priceDelta = 0, stockQty = 10) {
    const newVariant: VariantItem = {
      id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      variant_type: type,
      label: label || `Option ${variants.length + 1}`,
      price_delta: priceDelta,
      stock_quantity: stockQty,
    }
    setVariants((prev) => [...prev, newVariant])
  }

  function handleUpdateVariant(index: number, field: keyof VariantItem, value: any) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    )
  }

  function handleRemoveVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  // Submission handler (Publish or Save Draft)
  async function submitProduct(publishState: boolean) {
    setIsSubmitting(true)
    setFormError("")

    const payloadData = {
      ...formData,
      is_active: publishState,
    }

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: payloadData,
          variants,
          isEdit,
        }),
      })

      const text = await res.text()
      let result: any = null
      try {
        result = JSON.parse(text)
      } catch {
        if (!res.ok) {
          if (res.status === 413 || text.toLowerCase().includes("too large")) {
            throw new Error("Les données ou photos envoyées dépassent la limite de taille autorisée.")
          }
          throw new Error(`Erreur serveur (${res.status}): ${text.slice(0, 150)}`)
        }
        throw new Error("Réponse inattendue du serveur lors de la sauvegarde.")
      }

      if (!res.ok || !result?.success) {
        throw new Error(result?.error || `Erreur (${res.status}) lors de l'enregistrement`)
      }

      const categorySlug = result.categorySlug || formData.category_name.toLowerCase().replace(/\s+/g, "-")

      // Revalidate storefront
      try {
        await fetch(`/api/revalidate?slug=${encodeURIComponent(formData.slug)}&category=${encodeURIComponent(categorySlug)}`)
      } catch {
        // non-blocking
      }

      setSavedSuccess(true)
      setTimeout(() => {
        router.push("/admin/products")
        router.refresh()
      }, 1000)
    } catch (err: any) {
      console.warn("[ProductForm] Save error:", err)
      setFormError(err?.message || "Erreur lors de l'enregistrement. Vérifiez les champs obligatoires.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handlePublish(e: React.FormEvent) {
    e.preventDefault()
    submitProduct(true)
  }

  function handleSaveDraft() {
    submitProduct(false)
  }

  return (
    <form onSubmit={handlePublish} className="space-y-6 max-w-[1500px] mx-auto antialiased">
      {/* Hidden file input for PC image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFilesUpload(e.target.files)}
      />

      {/* ── 1. Header (Add New Product + Save Draft + Publish) ────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3.5">
          <Link
            href="/admin/products"
            className="w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-2xs"
            aria-label="Retour aux produits"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {isEdit ? `Modifier : ${formData.name}` : "Ajouter un Nouveau Produit"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                {isEdit ? "Mode Édition" : "Catalogue Live"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Renseignez les détails, prix, variantes et images de votre produit.
            </p>
          </div>
        </div>

        {/* Action Buttons on Right */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mr-2">
              <Check className="w-4 h-4" /> Enregistré avec succès !
            </span>
          )}

          {/* Save Draft Button */}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="h-10 px-4 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
          >
            Enregistrer Brouillon
          </button>

          {/* Prominent Publish Product Button in Dark Red/Maroon */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#8C1A2B] hover:bg-[#701422] text-white text-xs font-bold shadow-sm shadow-[#8C1A2B]/25 hover:shadow-md hover:shadow-[#8C1A2B]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publication en cours…</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEdit ? "Mettre à jour le produit" : "Publier le produit"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {formError && (
        <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-start gap-2">
          <span className="shrink-0 mt-0.5">⚠</span>
          <span>{formError}</span>
        </div>
      )}

      {/* ── 2. Grid Layout: Main Column (2/3) + Sidebar Column (1/3) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ═════════════════════════════════════════════════════════════
            MAIN COLUMN (LEFT - 2/3)
           ═════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: General Information */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-5">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 tracking-tight">
                Informations Générales
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Intitulé commercial, slug URL et description détaillée du produit.
              </p>
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Nom du produit *</span>
                <span className="text-[11px] text-slate-400 font-normal">Requis</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Cahier Spirale Oxford Polypro A4 200p / Boîte 50 Stylos BIC"
                className="w-full h-11 px-3.5 rounded-lg bg-gray-50 border border-gray-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#8C1A2B] focus:ring-2 focus:ring-[#8C1A2B]/15 transition-all"
              />
            </div>

            {/* Slug URL Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Slug URL (Lien public du produit) *
              </label>
              <div className="flex items-center rounded-lg bg-gray-50 border border-gray-200 overflow-hidden focus-within:bg-white focus-within:border-[#8C1A2B] focus-within:ring-2 focus-within:ring-[#8C1A2B]/15 transition-all">
                <span className="px-3 text-xs text-slate-400 select-none font-mono bg-gray-100/70 py-3 border-r border-gray-200">
                  /product/
                </span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="cahier-spirale-oxford-a4"
                  className="w-full h-11 px-3 bg-transparent text-xs font-mono text-slate-700 outline-none"
                />
              </div>
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Description détaillée</span>
                <span className="text-[11px] text-slate-400 font-normal">Présentation & caractéristiques</span>
              </label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Rédigez ici une description claire : caractéristiques, format, grammage, réglure, usages recommandés…"
                className="w-full p-3.5 rounded-lg bg-gray-50 border border-gray-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#8C1A2B] focus:ring-2 focus:ring-[#8C1A2B]/15 transition-all resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Card 2: Pricing & Stock (2-column grid inside) */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-5">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 tracking-tight">
                Tarification &amp; Inventaire
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Fixez le prix de vente, les remises éventuelles et les quantités en stock.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Base Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Prix de base (DH) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full h-11 pl-3.5 pr-12 rounded-lg bg-gray-50 border border-gray-200 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#8C1A2B] focus:ring-2 focus:ring-[#8C1A2B]/15 transition-all"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400 select-none">
                    DH
                  </span>
                </div>
              </div>

              {/* Discount / Compare-at Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Prix barré (DH)</span>
                  <span className="text-[11px] text-slate-400 font-normal">Optionnel</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.compare_at_price ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        compare_at_price: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    placeholder="Ex: 35.00"
                    className="w-full h-11 pl-3.5 pr-12 rounded-lg bg-gray-50 border border-gray-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#8C1A2B] focus:ring-2 focus:ring-[#8C1A2B]/15 transition-all"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400 select-none">
                    DH
                  </span>
                </div>
              </div>

              {/* Stock Quantity */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Quantité en stock global *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                  placeholder="10"
                  className="w-full h-11 px-3.5 rounded-lg bg-gray-50 border border-gray-200 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#8C1A2B] focus:ring-2 focus:ring-[#8C1A2B]/15 transition-all"
                />
              </div>

              {/* SKU / Barcode */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Référence / SKU</span>
                  <span className="text-[11px] text-slate-400 font-normal">Code article</span>
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Ex: OXF-A4-200"
                  className="w-full h-11 px-3.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-mono text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#8C1A2B] focus:ring-2 focus:ring-[#8C1A2B]/15 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Variants / Options Card (Pill-Style Buttons) */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-base text-slate-900 tracking-tight">
                    Variantes &amp; Options de Produit
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    {variants.length}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proposez différentes tailles, formats, couleurs ou packs avec ajustement de prix.
                </p>
              </div>

              {/* Quick Preset Pill Buttons (Shopify / Modern Reference Style) */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleAddVariant("Format", "Grand Format (24x32 cm)", 5, 20)}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  + Format
                </button>
                <button
                  type="button"
                  onClick={() => handleAddVariant("Couleur", "Bleu", 0, 25)}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  + Couleur
                </button>
                <button
                  type="button"
                  onClick={() => handleAddVariant("Pack", "Lot de 3", 10, 15)}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  + Pack
                </button>
                <button
                  type="button"
                  onClick={() => handleAddVariant("Taille", "Taille Standard", 0, 10)}
                  className="px-3.5 py-1.5 rounded-full bg-[#8C1A2B] hover:bg-[#701422] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter</span>
                </button>
              </div>
            </div>

            {/* Variants Table / Grid */}
            {variants.length === 0 ? (
              <div className="text-center py-8 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 space-y-2">
                <Layers className="w-8 h-8 text-slate-400 mx-auto stroke-[1.5]" />
                <p className="text-xs font-bold text-slate-700">Aucune variante configurée pour ce produit</p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Le produit sera vendu en option unique. Utilisez les boutons ci-dessus pour ajouter des variantes avec prix spécifique.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="hidden sm:grid sm:grid-cols-12 gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  <div className="col-span-3">Type</div>
                  <div className="col-span-4">Intitulé de la variante</div>
                  <div className="col-span-2">Écart Prix (DH)</div>
                  <div className="col-span-2">Stock</div>
                  <div className="col-span-1 text-right">Suppr.</div>
                </div>

                {variants.map((v, index) => (
                  <div
                    key={v.id || index}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 bg-gray-50/80 rounded-xl border border-gray-200 items-center hover:border-gray-300 transition-colors"
                  >
                    {/* Variant Type */}
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={v.variant_type}
                        onChange={(e) => handleUpdateVariant(index, "variant_type", e.target.value)}
                        placeholder="Format / Couleur"
                        className="w-full h-9 px-3 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#8C1A2B]"
                      />
                    </div>

                    {/* Variant Label */}
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        value={v.label}
                        onChange={(e) => handleUpdateVariant(index, "label", e.target.value)}
                        placeholder="Ex: 24x32 cm / Bleu"
                        className="w-full h-9 px-3 rounded-lg bg-white border border-gray-200 text-xs font-medium text-slate-800 outline-none focus:border-[#8C1A2B]"
                      />
                    </div>

                    {/* Price Delta */}
                    <div className="sm:col-span-2">
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          value={v.price_delta}
                          onChange={(e) =>
                            handleUpdateVariant(index, "price_delta", parseFloat(e.target.value) || 0)
                          }
                          className="w-full h-9 px-2.5 pr-6 rounded-lg bg-white border border-gray-200 text-xs font-bold text-slate-900 outline-none focus:border-[#8C1A2B]"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                          DH
                        </span>
                      </div>
                    </div>

                    {/* Stock Quantity */}
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        min="0"
                        value={v.stock_quantity}
                        onChange={(e) =>
                          handleUpdateVariant(index, "stock_quantity", parseInt(e.target.value, 10) || 0)
                        }
                        className="w-full h-9 px-2.5 rounded-lg bg-white border border-gray-200 text-xs font-bold text-slate-900 outline-none focus:border-[#8C1A2B]"
                      />
                    </div>

                    {/* Remove Variant */}
                    <div className="sm:col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(index)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Supprimer la variante"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 4 (Optional): Academic Level & Subject (For Books & Kits) */}
          {isBookOrKitCategory && (
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#8C1A2B]/10 text-[#8C1A2B] flex items-center justify-center">
                    <GraduationCap className="w-4.5 h-4.5" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-slate-900 tracking-tight">
                      Niveau Scolaire &amp; Matière (Programme Marocain)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Classez ce manuel scolaire dans les filtres de niveau pour les parents et élèves.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C1A2B] bg-[#8C1A2B]/10 px-2.5 py-0.5 rounded-full">
                  Spécial Manuels
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Niveau / Classe *</label>
                  <select
                    value={formData.school_level ?? "cp"}
                    onChange={(e) => setFormData({ ...formData, school_level: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#8C1A2B] cursor-pointer"
                  >
                    {SCHOOL_LEVELS.map((grp) => (
                      <optgroup key={grp.group} label={grp.group}>
                        {grp.options.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Matière</label>
                  <select
                    value={formData.subject ?? "Toutes matières / Général"}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#8C1A2B] cursor-pointer"
                  >
                    {SCHOOL_SUBJECTS.map((subj) => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═════════════════════════════════════════════════════════════
            SIDEBAR COLUMN (RIGHT - 1/3)
           ═════════════════════════════════════════════════════════════ */}
        <div className="space-y-6">
          {/* Card 1: Upload Image Card (Drag-and-drop Zone + Thumbnails Row) */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-2">
                <ImageIcon className="w-4.5 h-4.5 text-[#8C1A2B]" />
                <span>Photos du Produit</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Image principale et galerie de présentation.
              </p>
            </div>

            {/* Large Square Drag-and-Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                handleFilesUpload(e.dataTransfer.files)
              }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative w-full aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200 overflow-hidden",
                isDragging
                  ? "border-[#8C1A2B] bg-[#8C1A2B]/5 scale-[0.99]"
                  : "border-gray-300 hover:border-[#8C1A2B] bg-gray-50/70 hover:bg-gray-50"
              )}
            >
              {formData.images.length > 0 ? (
                <div className="relative w-full h-full rounded-lg overflow-hidden group">
                  <Image
                    src={formData.images[0]}
                    alt="Photo principale"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1">
                    <UploadCloud className="w-5 h-5" />
                    <span>Changer l&apos;image</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2.5">
                  <div className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-2xs flex items-center justify-center text-[#8C1A2B]">
                    <UploadCloud className="w-6 h-6" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Glissez votre image ici
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      ou <span className="text-[#8C1A2B] underline">parcourez vos fichiers</span>
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    PNG, JPG, WebP jusqu&apos;à 5MB
                  </span>
                </div>
              )}
            </div>

            {/* Row of 3 Small Square Placeholders for Extra Images */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Galerie additionnelle (3 emplacements)
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {[1, 2, 3].map((slotIdx) => {
                  const img = formData.images[slotIdx]

                  return (
                    <div
                      key={slotIdx}
                      className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center group"
                    >
                      {img ? (
                        <>
                          <Image
                            src={img}
                            alt={`Photo ${slotIdx}`}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveImage(slotIdx)
                            }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xs"
                            title="Supprimer cette photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-full flex flex-col items-center justify-center text-slate-400 hover:text-[#8C1A2B] hover:bg-gray-100 transition-colors"
                          title="Ajouter une image"
                        >
                          <Plus className="w-4 h-4 mb-0.5" />
                          <span className="text-[10px] font-semibold">Photo {slotIdx}</span>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* External URL Input */}
            <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Ou coller une URL image HTTPS…"
                className="flex-1 h-9 px-3 rounded-lg bg-gray-50 border border-gray-200 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#8C1A2B]"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="h-9 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Ajouter
              </button>
            </div>
          </div>

          {/* Card 2: Category & Brand Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#8C1A2B]" />
                <span>Organisation &amp; Rayon</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Classez votre article pour la navigation du site.
              </p>
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Catégorie / Rayon *</label>
              <select
                value={formData.category_name}
                onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                className="w-full h-11 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#8C1A2B] focus:ring-2 focus:ring-[#8C1A2B]/15 cursor-pointer"
              >
                {CATEGORY_CHOICES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand / Publisher Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Marque / Éditeur</label>
              <select
                value={formData.brand_name}
                onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                className="w-full h-11 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#8C1A2B] focus:ring-2 focus:ring-[#8C1A2B]/15 cursor-pointer"
              >
                {BRAND_CHOICES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Card 3: Visibility & Badges */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-3.5">
            <h2 className="font-extrabold text-base text-slate-900 tracking-tight">
              Visibilité &amp; Badges
            </h2>

            <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-slate-100/80 cursor-pointer transition-colors">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Actif sur la boutique</span>
                <span className="text-[11px] text-slate-400 block">Visible et achetable par les clients</span>
              </div>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded text-[#8C1A2B] focus:ring-[#8C1A2B] accent-[#8C1A2B] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-slate-100/80 cursor-pointer transition-colors">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Badge Meilleure Vente</span>
                <span className="text-[11px] text-slate-400 block">Met en avant l&apos;article en top produit</span>
              </div>
              <input
                type="checkbox"
                checked={formData.is_bestseller}
                onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                className="w-4 h-4 rounded text-[#8C1A2B] focus:ring-[#8C1A2B] accent-[#8C1A2B] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-slate-100/80 cursor-pointer transition-colors">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Badge Nouveauté 2026</span>
                <span className="text-[11px] text-slate-400 block">Affiche l&apos;étiquette &apos;Nouveau&apos;</span>
              </div>
              <input
                type="checkbox"
                checked={formData.is_new_arrival}
                onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                className="w-4 h-4 rounded text-[#8C1A2B] focus:ring-[#8C1A2B] accent-[#8C1A2B] cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>
    </form>
  )
}
