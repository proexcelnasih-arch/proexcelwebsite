"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Trash2,
  ExternalLink,
  ImageOff,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Package,
  Layers,
  Sparkles,
  ArrowUpDown,
  Check,
  X,
  RefreshCw,
} from "lucide-react"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { createClient } from "@/lib/supabase/client"
import { formatProductListItem } from "@/lib/supabase/formatters"
import type { ProductListItem } from "@/types"
import { cn } from "@/lib/utils"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "out_of_stock">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  const [deleteProduct, setDeleteProduct] = useState<ProductListItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // Load products from Supabase
  async function loadProducts() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(url, is_primary, display_order), categories(name, slug), brands(name, slug)")
        .order("created_at", { ascending: false })

      if (error) throw error
      if (data) {
        setProducts(data.map((p) => formatProductListItem(p as any)))
      }
    } catch (err: any) {
      console.warn("[admin-products] Error loading products:", err)
      setToastMessage({ type: "error", text: "Erreur lors du chargement des produits." })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  // Unique categories for the dropdown filter
  const categoryOptions = useMemo(() => {
    const cats = new Set<string>()
    products.forEach((p) => {
      if (p.category_name) cats.add(p.category_name)
    })
    return Array.from(cats)
  }, [products])

  // Filtered products based on search, category, and status
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search matching (name, SKU, category, slug)
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category_name && p.category_name.toLowerCase().includes(q))

      // Category matching
      const matchesCategory = selectedCategory === "all" || p.category_name === selectedCategory

      // Status matching
      let matchesStatus = true
      if (statusFilter === "active") matchesStatus = p.is_active && (p.stock ?? 0) > 0
      else if (statusFilter === "inactive") matchesStatus = !p.is_active
      else if (statusFilter === "out_of_stock") matchesStatus = (p.stock ?? 0) === 0

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [products, searchQuery, selectedCategory, statusFilter])

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, statusFilter])

  // Pagination slice
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredProducts.slice(start, start + pageSize)
  }, [filteredProducts, currentPage, pageSize])

  // Permanent Delete Handler
  async function handleDeleteConfirm() {
    if (!deleteProduct) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(deleteProduct.id)}`, {
        method: "DELETE",
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de la suppression")
      }

      const deletedName = deleteProduct.name
      setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id))
      setDeleteProduct(null)
      setToastMessage({
        type: "success",
        text: `"${deletedName}" a été définitivement supprimé.`,
      })
    } catch (err: any) {
      console.error("[admin-products] Delete failed:", err)
      setToastMessage({
        type: "error",
        text: `Échec de la suppression: ${err?.message || "Erreur serveur"}`,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Toggle Active Status
  async function handleToggleActive(id: string) {
    const target = products.find((p) => p.id === id)
    if (!target) return
    const nextState = !target.is_active

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: nextState } : p))
    )

    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: nextState }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors du changement de statut")
      }
    } catch (err) {
      // Revert optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: !nextState } : p))
      )
      setToastMessage({
        type: "error",
        text: "Impossible de modifier le statut du produit.",
      })
    }
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto antialiased">
      {/* ── 1. Page Header (Shopify / Modern SaaS Style) ─────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Produits
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#8C1A2B]/10 text-[#8C1A2B] border border-[#8C1A2B]/15">
              {products.length} références
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gérez votre catalogue de fournitures, livres, prix et niveaux de stock.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadProducts}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
            title="Rafraîchir les données"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-slate-500", isLoading && "animate-spin text-[#8C1A2B]")} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#8C1A2B] hover:bg-[#701422] text-white text-xs font-bold shadow-sm shadow-[#8C1A2B]/20 hover:shadow-md hover:shadow-[#8C1A2B]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Nouveau Produit</span>
          </Link>
        </div>
      </div>

      {/* ── 2. Top Controls Bar: Search & Filter Pills ───────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input on Left */}
        <div className="relative flex-1 max-w-md">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={2}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, SKU, catégorie…"
            className="w-full h-10 pl-10 pr-9 rounded-xl bg-slate-50 border border-gray-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#8C1A2B] focus:ring-2 focus:ring-[#8C1A2B]/15 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Buttons on Right */}
        <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end">
          {/* Status Filter Pills */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 text-xs font-semibold text-slate-600">
            {(
              [
                { id: "all", label: "Tous" },
                { id: "active", label: "Actifs" },
                { id: "out_of_stock", label: "Rupture" },
                { id: "inactive", label: "Inactifs" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer",
                  statusFilter === tab.id
                    ? "bg-white text-[#8C1A2B] font-bold shadow-2xs"
                    : "hover:text-slate-900"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 px-3 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-slate-700 outline-none focus:border-[#8C1A2B] focus:ring-2 focus:ring-[#8C1A2B]/15 shadow-2xs cursor-pointer"
          >
            <option value="all">Toutes les catégories</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 3. The Edge-to-Edge Data Table ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">Produit</th>
                <th className="px-5 py-3.5">Catégorie</th>
                <th className="px-5 py-3.5">SKU</th>
                <th className="px-5 py-3.5">Prix</th>
                <th className="px-5 py-3.5">Stock</th>
                <th className="px-5 py-3.5">Statut</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-7 h-7 rounded-full border-2 border-[#8C1A2B] border-t-transparent animate-spin" />
                      <span className="text-xs font-medium text-slate-500">Chargement du catalogue...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map((prod) => {
                  const qty = prod.stock ?? 0
                  const isOutOfStock = qty === 0

                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-slate-50/75 transition-colors group"
                    >
                      {/* Product Name + Square Thumbnail */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Square Thumbnail */}
                          <div className="relative w-11 h-11 rounded-lg border border-gray-200 overflow-hidden bg-slate-50 shrink-0 shadow-2xs">
                            {prod.primary_image ? (
                              <Image
                                src={prod.primary_image}
                                alt={prod.name}
                                fill
                                unoptimized
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-amber-50/80 flex flex-col items-center justify-center text-[9px] text-amber-700 font-bold">
                                <ImageOff className="w-3.5 h-3.5 mb-0.5 text-amber-500" />
                                <span>No img</span>
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/admin/products/${prod.id}/edit`}
                                className="font-bold text-sm text-slate-900 hover:text-[#8C1A2B] transition-colors truncate max-w-[240px] block"
                                title={prod.name}
                              >
                                {prod.name}
                              </Link>
                              {prod.needs_manual_image && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 shrink-0">
                                  Sans image
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[200px]">
                              {prod.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-lg">
                          {prod.category_name || "—"}
                        </span>
                      </td>

                      {/* SKU */}
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-slate-500 bg-gray-50 border border-gray-200/70 px-2 py-0.5 rounded-md">
                          {prod.sku || prod.slug.slice(0, 10).toUpperCase()}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-sm text-slate-900">
                            {Number(prod.price).toFixed(2)} DH
                          </span>
                          {prod.compare_at_price && (
                            <span className="text-[11px] text-slate-400 line-through">
                              {Number(prod.compare_at_price).toFixed(2)} DH
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock Quantity */}
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border",
                            qty > 10
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                              : qty > 0
                              ? "bg-amber-50 text-amber-700 border-amber-200/60"
                              : "bg-rose-50 text-rose-700 border-rose-200/60"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0",
                              qty > 10 ? "bg-emerald-500" : qty > 0 ? "bg-amber-500" : "bg-rose-500"
                            )}
                          />
                          <span>{qty > 0 ? `${qty} en stock` : "Rupture"}</span>
                        </span>
                      </td>

                      {/* Status Toggle Pill */}
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(prod.id)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer",
                            prod.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
                              : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/70"
                          )}
                          title="Cliquer pour basculer le statut"
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              prod.is_active ? "bg-emerald-500" : "bg-rose-500"
                            )}
                          />
                          <span>{prod.is_active ? "Actif" : "Inactif"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          <Link
                            href={`/product/${prod.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Voir sur la boutique"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/admin/products/${prod.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#8C1A2B] hover:bg-[#8C1A2B]/10 transition-colors"
                            title="Modifier ce produit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteProduct(prod)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                        <Package className="w-6 h-6" strokeWidth={1.5} />
                      </div>
                      <p className="text-sm font-bold text-slate-800 mb-1">Aucun produit trouvé</p>
                      <p className="text-xs text-slate-500">
                        Essayez de modifier votre recherche ou vos filtres de catégorie.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── 4. Table Pagination Footer ──────────────────────────────── */}
        <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
          <div>
            Affichage de{" "}
            <span className="font-bold text-slate-800">
              {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            à{" "}
            <span className="font-bold text-slate-800">
              {Math.min(currentPage * pageSize, filteredProducts.length)}
            </span>{" "}
            sur <span className="font-bold text-slate-800">{filteredProducts.length}</span> produits
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                aria-label="Page précédente"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((page, idx, arr) => {
                  const prev = arr[idx - 1]
                  const showEllipsis = prev && page - prev > 1

                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && <span className="px-1.5 text-slate-400">…</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "w-8 h-8 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer",
                          currentPage === page
                            ? "bg-[#8C1A2B] text-white shadow-xs"
                            : "border border-gray-200 bg-white text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        {page}
                      </button>
                    </div>
                  )
                })}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                aria-label="Page suivante"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 5. Permanent Delete Confirm Dialog ────────────────────────── */}
      <ConfirmDialog
        open={deleteProduct !== null}
        onCancel={() => !isDeleting && setDeleteProduct(null)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        title="Supprimer définitivement ce produit ?"
        description={`Le produit "${deleteProduct?.name}" sera définitivement supprimé de la base de données et de l'inventaire. Cette action est irréversible.`}
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        variant="danger"
      />

      {/* ── 6. Toast Notification ────────────────────────────────────── */}
      {toastMessage && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold border transition-all duration-300 animate-in fade-in slide-in-from-bottom-3",
            toastMessage.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
          )}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  )
}
