"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Star, Check, X, Trash2, ExternalLink, MessageSquare } from "lucide-react"
import { DataTable, type Column, type FilterTab } from "@/components/admin/DataTable"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"

type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"] & {
  products?: { name: string; slug: string; product_images?: { url: string; is_primary?: boolean }[] } | null
  profiles?: { full_name: string | null; avatar_url: string | null } | null
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  async function loadReviews() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("reviews")
        .select("*, products(name, slug, product_images(url, is_primary)), profiles(full_name, avatar_url)")
        .order("created_at", { ascending: false })

      if (data) setReviews(data as any)
    } catch (err) {
      console.warn("[admin-reviews] Error loading reviews:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  const reviewTabs: FilterTab[] = [
    { id: "all", label: "Tous", count: reviews.length },
    { id: "pending", label: "En attente", count: reviews.filter((r) => r.status === "pending").length },
    { id: "approved", label: "Approuvés", count: reviews.filter((r) => r.status === "approved").length },
    { id: "rejected", label: "Rejetés", count: reviews.filter((r) => r.status === "rejected").length },
  ]

  async function handleStatusChange(id: string, status: "pending" | "approved" | "rejected") {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    )

    try {
      const supabase = createClient()
      await supabase.from("reviews").update({ status }).eq("id", id)
    } catch {
      // ignore
    }
  }

  async function handleDelete(id: string) {
    setReviews((prev) => prev.filter((r) => r.id !== id))
    try {
      const supabase = createClient()
      await supabase.from("reviews").delete().eq("id", id)
    } catch {
      // ignore
    }
  }

  const filteredReviews =
    activeTab === "all" ? reviews : reviews.filter((r) => r.status === activeTab)

  const columns: Column<ReviewRow>[] = [
    {
      key: "product_name",
      header: "Produit concerné",
      sortable: true,
      render: (rev) => {
        const prodName = rev.products?.name ?? "Produit"
        const prodImg = rev.products?.product_images?.[0]?.url || "https://images.unsplash.com/photo-1544816155-12df9643f363?w=120"
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
              <Image src={prodImg} alt={prodName} fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 truncate max-w-xs">{prodName}</p>
              <p className="text-[11px] text-slate-400">
                {new Date(rev.created_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      key: "customer_name",
      header: "Auteur & Note",
      render: (rev) => (
        <div>
          <p className="font-bold text-slate-800">{rev.profiles?.full_name || "Client"}</p>
          <div className="flex items-center gap-0.5 text-amber-500 mt-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "comment",
      header: "Commentaire",
      render: (rev) => (
        <p className="text-xs text-slate-600 max-w-md line-clamp-2 italic">
          &ldquo;{rev.comment}&rdquo;
        </p>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (rev) => <StatusBadge status={rev.status} />,
    },
    {
      key: "actions",
      header: "Modération",
      render: (rev) => (
        <div className="flex items-center gap-1.5">
          {rev.status !== "approved" && (
            <button
              type="button"
              onClick={() => handleStatusChange(rev.id, "approved")}
              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
              title="Approuver"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
          {rev.status !== "rejected" && (
            <button
              type="button"
              onClick={() => handleStatusChange(rev.id, "rejected")}
              className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
              title="Rejeter"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
          <button
            type="button"
            onClick={() => handleDelete(rev.id)}
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
      {/* ── Page Header ───────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Avis &amp; Évaluations
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Modérez les avis soumis par vos clients sur les fiches produits.
        </p>
      </div>

      {/* ── Reviews DataTable ─────────────────────────────────── */}
      <DataTable
        data={filteredReviews}
        columns={columns}
        searchPlaceholder="Rechercher un avis ou produit…"
        filterTabs={reviewTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  )
}
