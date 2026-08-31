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
  Sparkles,
  Layers,
  Tag,
  Boxes,
  UploadCloud,
  GraduationCap,
  BookOpen,
  Info,
  DollarSign,
  Package,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export interface VariantItem {
  id?: string
  variant_type: string // "Taille" | "Couleur" | "Goût" | "Format" | "Pack" | "size" | "color" | string
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

const VARIANT_TYPE_PRESETS = [
  { label: "Format / Dimension", value: "Format" },
  { label: "Couleur / Teinte", value: "Couleur" },
  { label: "Conditionnement / Pack", value: "Pack" },
  { label: "Réglure / Quadrillage", value: "Réglure" },
  { label: "Taille", value: "Taille" },
  { label: "Autre option", value: "Option" },
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

  // Handle local PC file upload
  function handleFilesUpload(files: FileList | null) {
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError("")

    try {
      const supabase = createClient()

      // ── Resolve category_id and brand_id by name ────────────
      const { data: catRow } = await supabase
        .from("categories")
        .select("id, slug")
        .ilike("name", formData.category_name)
        .maybeSingle()

      const { data: brandRow } = await supabase
        .from("brands")
        .select("id")
        .ilike("name", formData.brand_name)
        .maybeSingle()

      const categoryId: string | null = catRow?.id ?? null
      const brandId: string | null = brandRow?.id ?? null
      const categorySlug: string = catRow?.slug ?? formData.category_name.toLowerCase().replace(/\s+/g, "-")

      if (isEdit && formData.id) {
        // ── UPDATE existing product ────────────────────────────
        await supabase
          .from("products")
          .update({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            price: formData.price,
            compare_at_price: formData.compare_at_price,
            stock_quantity: formData.stock,
            sku: formData.sku,
            ...(categoryId ? { category_id: categoryId } : {}),
            ...(brandId ? { brand_id: brandId } : {}),
            is_bestseller: formData.is_bestseller,
            is_new_arrival: formData.is_new_arrival,
            is_featured: formData.is_featured,
            is_active: formData.is_active,
          })
          .eq("id", formData.id)

        // Save variants (delete-and-reinsert)
        if (variants.length > 0) {
          try {
            await (supabase as any).from("product_variants").delete().eq("product_id", formData.id)
            await (supabase as any).from("product_variants").insert(
              variants.map((v, idx) => ({
                product_id: formData.id,
                variant_type: v.variant_type,
                label: v.label,
                price_delta: Number(v.price_delta) || 0,
                stock_quantity: Number(v.stock_quantity) || 0,
                display_order: idx,
              }))
            )
          } catch (varErr) {
            console.warn("[ProductForm] Error updating variants:", varErr)
          }
        }

      } else {
        // ── INSERT new product ──────────────────────────────────
        const insertPayload: Record<string, any> = {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          price: formData.price,
          compare_at_price: formData.compare_at_price ?? null,
          stock_quantity: formData.stock,
          sku: formData.sku || formData.slug.toUpperCase(),
          is_bestseller: formData.is_bestseller,
          is_new_arrival: formData.is_new_arrival,
          is_featured: formData.is_featured,
          is_active: formData.is_active,
        }
        if (categoryId) insertPayload.category_id = categoryId
        if (brandId) insertPayload.brand_id = brandId

        const { data: newProduct, error: insertError } = await supabase
          .from("products")
          .insert(insertPayload)
          .select("id")
          .single()

        if (insertError || !newProduct) {
          throw new Error(insertError?.message ?? "Erreur lors de la création du produit")
        }

        const newProductId: string = newProduct.id

        // Insert product images (filter out placeholder/base64 for external URLs only)
        const imageUrls = formData.images.filter(
          (url) => url && url.startsWith("http")
        )
        if (imageUrls.length > 0) {
          await supabase.from("product_images").insert(
            imageUrls.map((url, idx) => ({
              product_id: newProductId,
              url,
              is_primary: idx === 0,
              display_order: idx,
              alt_text: formData.name,
            }))
          )
        }

        // Insert variants if any were added
        if (variants.length > 0) {
          try {
            await (supabase as any).from("product_variants").insert(
              variants.map((v, idx) => ({
                product_id: newProductId,
                variant_type: v.variant_type,
                label: v.label,
                price_delta: Number(v.price_delta) || 0,
                stock_quantity: Number(v.stock_quantity) || 0,
                display_order: idx,
              }))
            )
          } catch (varErr) {
            console.warn("[ProductForm] Error inserting variants:", varErr)
          }
        }
      }

      // ── Revalidate storefront cache so new/updated products appear immediately ──
      try {
        await fetch(`/api/revalidate?slug=${encodeURIComponent(formData.slug)}&category=${encodeURIComponent(categorySlug)}`)
      } catch {
        // Non-blocking — cache will eventually expire on its own
      }

      setSavedSuccess(true)
      setTimeout(() => {
        router.push("/admin/products")
        router.refresh()
      }, 1000)
    } catch (err: any) {
      console.warn("[ProductForm] Save error:", err)
      setFormError(err?.message || "Erreur lors de l'enregistrement. Vérifiez votre connexion et réessayez.")
      setIsSubmitting(false)
      return
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Hidden file input for PC upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFilesUpload(e.target.files)}
      />

      {/* ── Top Bar ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="w-9 h-9 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Retour aux produits"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEdit ? `Modifier : ${formData.name}` : "Ajouter un Nouveau Produit"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Renseignez les détails techniques, tarifs, variantes et photos du produit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Produit enregistré !
            </span>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#8C1A2B] hover:bg-[#5E0F1D] text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all disabled:opacity-60 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Publier le produit"}</span>
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

      {/* ── 2 Columns Form Layout ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: General Info, Variants & Images (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Info */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Informations Générales</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Nom du produit *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Taille crayon Staedtler / Cahier Séyès 96p"
                className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-xs font-medium text-slate-800 outline-none focus:border-[#8C1A2B]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Slug URL *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-xs font-mono text-slate-600 outline-none focus:border-[#8C1A2B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Référence / SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Ex: LIV-CP-FR-01"
                  className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-xs font-medium text-slate-800 outline-none focus:border-[#8C1A2B]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Description détaillée</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description complète, caractéristiques, matériaux, usage..."
                className="w-full p-3 rounded-xl border border-[#E2E8F0] text-xs font-medium text-slate-800 outline-none focus:border-[#8C1A2B] resize-none"
              />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              DYNAMIC PRODUCT VARIANTS SECTION
              Allows adding, editing, and deleting variant options
              (Size, Color, Flavor, Pack, etc.) with custom prices & stock
             ══════════════════════════════════════════════════════ */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#8C1A2B]/10 text-[#8C1A2B] flex items-center justify-center">
                  <Layers className="w-4.5 h-4.5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span>Variantes &amp; Options</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-extrabold">
                      {variants.length}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Définissez les options au choix (format, couleur, pack, réglure) avec prix et stock dédiés.
                  </p>
                </div>
              </div>

              {/* Quick Add Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleAddVariant("Format", "Grand Format (24x32 cm)", 5, 20)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  + Format
                </button>
                <button
                  type="button"
                  onClick={() => handleAddVariant("Couleur", "Bleu", 0, 25)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  + Couleur
                </button>
                <button
                  type="button"
                  onClick={() => handleAddVariant("Pack", "Lot de 3", 10, 15)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  + Pack
                </button>
                <button
                  type="button"
                  onClick={() => handleAddVariant("Option", "Standard", 0, 10)}
                  className="px-3 py-1 rounded-lg bg-[#8C1A2B] hover:bg-[#5E0F1D] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter</span>
                </button>
              </div>
            </div>

            {/* Variants List Table / Grid */}
            {variants.length === 0 ? (
              <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
                <Boxes className="w-8 h-8 text-slate-400 mx-auto stroke-[1.5]" />
                <p className="text-xs font-bold text-slate-700">Aucune variante configurée pour ce produit</p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Le produit sera vendu en option unique. Ajoutez des variantes si vous souhaitez proposer plusieurs tailles, couleurs, saveurs ou packs.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleAddVariant("Taille", "Format Standard", 0, 10)}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 hover:border-[#8C1A2B] shadow-2xs transition-colors cursor-pointer"
                  >
                    + Créer ma première variante
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="hidden sm:grid sm:grid-cols-12 gap-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">
                  <div className="col-span-3">Type d&apos;option</div>
                  <div className="col-span-4">Nom / Intitulé</div>
                  <div className="col-span-2">Ajustement Prix (DH)</div>
                  <div className="col-span-2">Stock disponible</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                {variants.map((v, index) => (
                  <div
                    key={v.id || index}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 sm:p-2 bg-slate-50/80 rounded-xl border border-slate-200 items-center hover:border-slate-300 transition-colors"
                  >
                    {/* Option Type */}
                    <div className="sm:col-span-3">
                      <label className="sm:hidden text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Type d&apos;option
                      </label>
                      <input
                        type="text"
                        value={v.variant_type}
                        onChange={(e) => handleUpdateVariant(index, "variant_type", e.target.value)}
                        placeholder="Ex: Taille, Couleur, Goût"
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:border-[#8C1A2B]"
                      />
                    </div>

                    {/* Variant Label */}
                    <div className="sm:col-span-4">
                      <label className="sm:hidden text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Intitulé de l&apos;option
                      </label>
                      <input
                        type="text"
                        value={v.label}
                        onChange={(e) => handleUpdateVariant(index, "label", e.target.value)}
                        placeholder="Ex: Pouch 250g, Bleu, Chocolat"
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 outline-none focus:border-[#8C1A2B]"
                      />
                    </div>

                    {/* Price Delta */}
                    <div className="sm:col-span-2">
                      <label className="sm:hidden text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Ajustement Prix (DH)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          value={v.price_delta}
                          onChange={(e) =>
                            handleUpdateVariant(index, "price_delta", parseFloat(e.target.value) || 0)
                          }
                          placeholder="0"
                          className="w-full h-8 px-2.5 pr-6 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:border-[#8C1A2B]"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                          DH
                        </span>
                      </div>
                    </div>

                    {/* Stock Quantity */}
                    <div className="sm:col-span-2">
                      <label className="sm:hidden text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={v.stock_quantity}
                        onChange={(e) =>
                          handleUpdateVariant(index, "stock_quantity", parseInt(e.target.value, 10) || 0)
                        }
                        placeholder="10"
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:border-[#8C1A2B]"
                      />
                    </div>

                    {/* Delete Variant Button */}
                    <div className="sm:col-span-1 flex justify-end sm:justify-center pt-1 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(index)}
                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Supprimer cette variante"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Summary bar */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 px-1">
                  <span>
                    Total des variantes : <strong className="text-slate-800">{variants.length}</strong>
                  </span>
                  <span>
                    Stock total combiné :{" "}
                    <strong className="text-slate-800">
                      {variants.reduce((acc, v) => acc + (Number(v.stock_quantity) || 0), 0)} unités
                    </strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── Dynamic Academic Level (Appears for Livres / Kits) ── */}
          {isBookOrKitCategory && (
            <div className="bg-white border-2 border-[#8C1A2B]/20 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#8C1A2B]/10 text-[#8C1A2B] flex items-center justify-center">
                    <GraduationCap className="w-4.5 h-4.5" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Niveau Scolaire &amp; Matière (Programme Marocain)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Sélectionnez la classe et la discipline pour classer ce manuel dans les filtres de recherche.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C1A2B] bg-[#8C1A2B]/10 px-2 py-0.5 rounded-full">
                  Spécial Livres
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* School Level Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#8C1A2B]" />
                    <span>Niveau / Classe *</span>
                  </label>
                  <select
                    value={formData.school_level ?? "cp"}
                    onChange={(e) => setFormData({ ...formData, school_level: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none focus:border-[#8C1A2B] cursor-pointer"
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

                {/* Subject Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Matière / Discipline</label>
                  <select
                    value={formData.subject ?? "Toutes matières / Général"}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none focus:border-[#8C1A2B] cursor-pointer"
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

          {/* ── Media Images & PC Upload ─────────────────────────── */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#8C1A2B]" />
                <span>Photos du Produit ({formData.images.length})</span>
              </h3>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8C1A2B] hover:bg-[#5E0F1D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Importer depuis PC</span>
              </button>
            </div>

            {/* Drag & Drop Zone */}
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
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                isDragging
                  ? "border-[#8C1A2B] bg-[#8C1A2B]/5 scale-[0.99]"
                  : "border-slate-200 hover:border-[#8C1A2B] bg-slate-50/50 hover:bg-slate-50"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-[#8C1A2B] mb-2.5">
                <UploadCloud className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Glissez-déposez vos photos ici ou{" "}
                <span className="text-[#8C1A2B] underline">parcourez votre ordinateur</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Formats acceptés : JPG, PNG, WEBP, GIF (plusieurs photos autorisées)
              </p>
            </div>

            {/* Image Preview Grid */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {formData.images.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl bg-slate-50 border border-slate-200 overflow-hidden group shadow-2xs"
                  >
                    <Image src={url} alt="Photo produit" fill unoptimized className="object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                      aria-label="Supprimer photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-2 left-2 text-[9px] font-extrabold uppercase bg-slate-900/85 text-white px-2 py-0.5 rounded shadow-sm">
                        Principale
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Image via URL (Alternative) */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Ou coller une URL d'image externe (HTTPS)…"
                className="flex-1 h-9.5 px-3.5 rounded-xl border border-[#E2E8F0] text-xs text-slate-800 outline-none focus:border-[#8C1A2B]"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="h-9.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors shrink-0 cursor-pointer"
              >
                Ajouter URL
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Inventory, Organization & Flags (1 col) */}
        <div className="space-y-6">
          {/* Pricing & Stock */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Tarification &amp; Stock de Base</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Prix de vente (DH) *</label>
              <input
                type="number"
                step="0.5"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-xs font-bold text-slate-900 outline-none focus:border-[#8C1A2B]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Prix barré (DH)</label>
              <input
                type="number"
                step="0.5"
                value={formData.compare_at_price ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    compare_at_price: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                placeholder="Optionnel (pour afficher promo)"
                className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-xs text-slate-600 outline-none focus:border-[#8C1A2B]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Quantité en Stock Global *</label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-xs font-bold text-slate-900 outline-none focus:border-[#8C1A2B]"
              />
            </div>
          </div>

          {/* Categorization */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Rayon &amp; Marque</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Catégorie *</label>
              <select
                value={formData.category_name}
                onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] text-xs font-bold text-slate-800 bg-white outline-none focus:border-[#8C1A2B] cursor-pointer"
              >
                <option value="Livres Scolaires">Livres Scolaires (Manuels)</option>
                <option value="Papeterie">Papeterie</option>
                <option value="Fournitures Scolaires">Fournitures Scolaires</option>
                <option value="Arts & Créativité">Arts &amp; Créativité</option>
                <option value="Livres">Livres &amp; Romans</option>
                <option value="Bureau">Bureau</option>
                <option value="Kits Scolaires">Kits Scolaires</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Marque / Éditeur</label>
              <select
                value={formData.brand_name}
                onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] text-xs font-bold text-slate-800 bg-white outline-none focus:border-[#8C1A2B] cursor-pointer"
              >
                <option value="Éditions Officielles">Éditions Officielles (Ministère)</option>
                <option value="Hachette">Hachette</option>
                <option value="Nathan">Nathan</option>
                <option value="Clairefontaine">Clairefontaine</option>
                <option value="BIC">BIC</option>
                <option value="Faber-Castell">Faber-Castell</option>
                <option value="Maped">Maped</option>
                <option value="Oxford">Oxford</option>
                <option value="Casio">Casio</option>
                <option value="Stabilo">Stabilo</option>
                <option value="Générique">Autre / Générique</option>
              </select>
            </div>
          </div>

          {/* Visibility & Badges */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Visibilité &amp; Badges</h3>

            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
              <span className="text-xs font-bold text-slate-800">Actif sur la boutique</span>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded text-[#8C1A2B] focus:ring-[#8C1A2B]"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
              <span className="text-xs font-bold text-slate-800">Badge Meilleure Vente</span>
              <input
                type="checkbox"
                checked={formData.is_bestseller}
                onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                className="w-4 h-4 rounded text-[#8C1A2B] focus:ring-[#8C1A2B]"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
              <span className="text-xs font-bold text-slate-800">Badge Nouveauté 2026</span>
              <input
                type="checkbox"
                checked={formData.is_new_arrival}
                onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                className="w-4 h-4 rounded text-[#8C1A2B] focus:ring-[#8C1A2B]"
              />
            </label>
          </div>
        </div>
      </div>
    </form>
  )
}
