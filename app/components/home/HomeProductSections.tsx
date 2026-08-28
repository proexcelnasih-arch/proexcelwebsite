"use client"

import { useState } from "react"
import Link from "next/link"
import { ProductCard, ProductCardSkeleton } from "@/components/products/ProductCard"
import { cn } from "@/lib/utils"
import type { ProductListItem } from "@/types"

// ── ProductGrid ────────────────────────────────────────────────
interface ProductGridProps {
  products: ProductListItem[]
  loading?: boolean
  skeletonCount?: number
}

function ProductGrid({ products, loading = false, skeletonCount = 4 }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-5">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-5">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 4}
        />
      ))}
    </div>
  )
}

// ── Section Header ─────────────────────────────────────────────
interface SectionHeaderProps {
  id?: string
  eyebrow?: string
  title: string
  href?: string
  linkLabel?: string
}

function SectionHeader({ id, eyebrow, title, href, linkLabel = "Voir tout" }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        {eyebrow && <p className="text-eyebrow mb-1.5">{eyebrow}</p>}
        <h2 id={id} className="text-section-title">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="hidden sm:inline-flex items-center gap-1 text-sm text-[var(--color-primary)] font-semibold hover:gap-2 hover:text-[var(--color-primary-dark)] transition-all duration-150 shrink-0"
        >
          {linkLabel}
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  )
}

// ── HomeBestSellers ────────────────────────────────────────────
interface HomeProductSectionProps {
  products: ProductListItem[]
  loading?: boolean
}

export function HomeBestSellers({ products, loading }: HomeProductSectionProps) {
  const [activeTab, setActiveTab] = useState("all")

  const tabs = [
    { id: "all", label: "Tous" },
    { id: "papeterie", label: "Papeterie" },
    { id: "livres", label: "Livres Scolaires" },
    { id: "fournitures", label: "Fournitures" },
  ]

  const filteredProducts =
    activeTab === "all"
      ? products
      : products.filter((p) => {
          const cat = (p.category_name ?? p.product_type).toLowerCase()
          return cat.includes(activeTab)
        })

  return (
    <section
      className="py-12 lg:py-16 bg-white border-t border-[var(--color-border)]"
      aria-labelledby="bestsellers-heading"
    >
      <div className="container-site">
        {/* DigiTech Header with Category Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-eyebrow mb-1">Sélection populaire</p>
            <h2 id="bestsellers-heading" className="text-section-title">
              Produits en Tendance
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 scroll-x pb-1 sm:pb-0">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-bold rounded-full transition-all whitespace-nowrap",
                  activeTab === t.id
                    ? "bg-[var(--color-primary)] text-white shadow-xs"
                    : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <ProductGrid products={filteredProducts} loading={loading} />

        {/* Mobile see-all link */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/boutique?sort=bestselling"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]"
          >
            Voir toute la sélection →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── HomeNewArrivals ───────────────────────────────────────────
export function HomeNewArrivals({ products, loading }: HomeProductSectionProps) {
  return (
    <section
      className="py-12 lg:py-16 bg-white border-t border-[var(--color-border)]"
      aria-labelledby="new-arrivals-heading"
    >
      <div className="container-site">
        <SectionHeader
          id="new-arrivals-heading"
          eyebrow="Dernières arrivées"
          title="Nouveautés"
          href="/nouveautes"
          linkLabel="Voir tout →"
        />
        <ProductGrid products={products} loading={loading} />
        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/nouveautes"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)]"
          >
            Voir toutes les nouveautés →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── HomeBestOffers ─────────────────────────────────────────────
export function HomeBestOffers({ products, loading }: HomeProductSectionProps) {
  return (
    <section
      className="py-12 lg:py-16 bg-white border-t border-[var(--color-border)]"
      aria-labelledby="offers-heading"
    >
      <div className="container-site">
        <SectionHeader
          id="offers-heading"
          eyebrow="Promotions &amp; Réductions"
          title="Meilleures offres"
          href="/meilleures-offres"
          linkLabel="Voir tout →"
        />
        <ProductGrid products={products} loading={loading} />
        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/meilleures-offres"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)]"
          >
            Voir toutes les offres →
          </Link>
        </div>
      </div>
    </section>
  )
}
