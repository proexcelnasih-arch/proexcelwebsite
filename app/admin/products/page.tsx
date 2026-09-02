"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Plus, Edit2, Trash2, Copy, Eye, ExternalLink, ImageOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { DataTable, type Column, type FilterTab } from "@/components/admin/DataTable"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { createClient } from "@/lib/supabase/client"
import { formatProductListItem } from "@/lib/supabase/formatters"
import type { ProductListItem } from "@/types"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [deleteProduct, setDeleteProduct] = useState<ProductListItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  async function loadProducts() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("products")
        .select("*, product_images(url, is_primary, display_order), categories(name, slug), brands(name, slug)")
        .order("created_at", { ascending: false })

      if (data && data.length > 0) {
        setProducts(data.map((p) => formatProductListItem(p as any)))
      }
    } catch (err) {
      console.warn("[admin-products] Error loading products:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const categoryTabs: FilterTab[] = [
    { id: "all", label: "Tous", count: products.length },
    {
      id: "needs_image",
      label: "Besoin d'image",
      count: products.filter((p) => p.needs_manual_image).length,
    },
    { id: "Papeterie", label: "Papeterie", count: products.filter((p) => p.category_name === "Papeterie").length },
    { id: "Livres Scolaires", label: "Livres Scolaires", count: products.filter((p) => p.category_name === "Livres Scolaires").length },
    { id: "Fournitures Scolaires", label: "Fournitures", count: products.filter((p) => p.category_name === "Fournitures Scolaires").length },
    { id: "Arts & Créativité", label: "Arts", count: products.filter((p) => p.category_name === "Arts & Créativité").length },
    { id: "Kits Scolaires", label: "Kits", count: products.filter((p) => p.category_name === "Kits Scolaires").length },
  ]

  const filteredProducts =
    activeTab === "all"
      ? products
      : activeTab === "needs_image"
      ? products.filter((p) => p.needs_manual_image)
      : products.filter((p) => p.category_name === activeTab)

  async function handleDeleteConfirm() {
    if (!deleteProduct) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(deleteProduct.id)}`, {
        method: "DELETE",
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de la suppression du produit")
      }

      const deletedName = deleteProduct.name
      // Update local state immediately so it vanishes without reload
      setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id))
      setDeleteProduct(null)
      setToastMessage({
        type: "success",
        text: `"${deletedName}" a été définitivement supprimé de la base de données.`,
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
      console.warn("[admin-products] Toggle status error, reverting:", err)
      // Revert if error
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: !nextState } : p))
      )
      setToastMessage({
        type: "error",
        text: "Impossible de modifier le statut du produit.",
      })
    }
  }

  const columns: Column<ProductListItem>[] = [
    {
      key: "name",
      header: "Produit",
      sortable: true,
      render: (prod) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
            {prod.primary_image ? (
              <Image src={prod.primary_image} alt={prod.name} fill unoptimized className="object-cover" />
            ) : (
              <div className="w-full h-full bg-amber-50/70 border border-amber-200/50 flex flex-col items-center justify-center text-[9px] text-amber-700 font-bold">
                <ImageOff className="w-3.5 h-3.5 mb-0.5 text-amber-500" />
                <span>Image</span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-800 text-xs truncate max-w-[200px]">{prod.name}</p>
              {prod.needs_manual_image && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 shrink-0">
                  Sans image
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{prod.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category_name",
      header: "Catégorie",
      sortable: true,
      render: (prod) => (
        <span className="text-xs text-slate-600 font-medium">
          {prod.category_name ?? "—"}
        </span>
      ),
    },
    {
      key: "brand_name",
      header: "Marque",
      sortable: true,
      render: (prod) => (
        <span className="text-xs text-slate-500 font-medium">
          {prod.brand_name ?? "—"}
        </span>
      ),
    },
    {
      key: "price",
      header: "Prix",
      sortable: true,
      render: (prod) => (
        <div>
          <span className="font-bold text-slate-800 text-xs">{prod.price} DH</span>
          {prod.compare_at_price && (
            <span className="text-[10px] text-slate-400 line-through ml-1.5">
              {prod.compare_at_price} DH
            </span>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      sortable: true,
      render: (prod) => {
        const qty = prod.stock ?? 0
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
              qty > 10
                ? "bg-emerald-50 text-emerald-700"
                : qty > 0
                ? "bg-amber-50 text-amber-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {qty} en stock
          </span>
        )
      },
    },
    {
      key: "is_active",
      header: "Statut",
      render: (prod) => (
        <button
          type="button"
          onClick={() => handleToggleActive(prod.id)}
          className="cursor-pointer"
          title="Cliquer pour changer le statut"
        >
          <StatusBadge
            status={prod.is_active ? "active" : "inactive"}
            label={prod.is_active ? "Actif" : "Inactif"}
          />
        </button>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (prod) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/product/${prod.slug}`}
            target="_blank"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Voir sur le site"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/admin/products/${prod.id}/edit`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[var(--color-primary)] hover:bg-slate-100 transition-colors"
            title="Modifier"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setDeleteProduct(prod)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-display">Produits</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gérez votre catalogue de fournitures, livres et papeterie.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:bg-[var(--color-primary-dark)] transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau produit</span>
        </Link>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        searchKeys={["name", "slug", "category_name", "brand_name"]}
        searchPlaceholder="Rechercher par nom de produit…"
        filterTabs={categoryTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Delete dialog */}
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

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold border transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
          }`}
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
