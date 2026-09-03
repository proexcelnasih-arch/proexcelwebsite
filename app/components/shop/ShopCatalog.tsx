"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  RotateCcw,
  X,
  ChevronDown,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ProductCard } from "@/components/products/ProductCard"
import { cn } from "@/lib/utils"
import type { ProductListItem } from "@/types"

export interface ShopCatalogProps {
  title: string
  subtitle?: string
  initialCategory?: string
  initialBrand?: string
  allProducts: ProductListItem[]
  availableCategories?: string[]
  availableBrands?: string[]
  breadcrumbItems: { label: string; href?: string }[]
}

const DEFAULT_CATEGORIES = [
  "Livres Scolaires",
  "Papeterie",
  "Fournitures Scolaires",
  "Arts & Créativité",
  "Livres",
  "Bureau",
  "Kits Scolaires",
]

const DEFAULT_BRANDS = [
  "Clairefontaine",
  "BIC",
  "Maped",
  "Faber-Castell",
  "Casio",
  "Oxford",
  "Stabilo",
  "Hachette",
  "Pilot",
]

export function ShopCatalog({
  title,
  subtitle,
  initialCategory,
  initialBrand,
  allProducts,
  availableCategories,
  availableBrands,
  breadcrumbItems,
}: ShopCatalogProps) {
  // Multi-select categories state
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  )
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    initialBrand ? [initialBrand] : []
  )
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState<string>("popular")
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)

  // 12 products per page (4 horizontal columns x 3 vertical rows)
  const pageSize = 12

  // Dynamically calculate the highest price in the catalog (rounded up to nearest 100)
  const dynamicMaxPrice = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return 2000
    const highest = Math.max(...allProducts.map((p) => Number(p.price) || 0))
    return Math.max(500, Math.ceil(highest / 100) * 100)
  }, [allProducts])

  // Custom user-selected max price (null = default to dynamicMaxPrice)
  const [userMaxPrice, setUserMaxPrice] = useState<number | null>(null)
  const effectiveMaxPrice = userMaxPrice ?? dynamicMaxPrice

  const categoryOptions =
    availableCategories && availableCategories.length > 0
      ? availableCategories
      : DEFAULT_CATEGORIES

  const brandOptions =
    availableBrands && availableBrands.length > 0 ? availableBrands : DEFAULT_BRANDS

  // ── Multi-select Category Filter with OR Logic ────────────────
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((product) => {
        // Multi-select Category (OR Logic)
        if (
          selectedCategories.length > 0 &&
          !selectedCategories.some(
            (cat) => cat.toLowerCase() === product.category_name?.toLowerCase()
          )
        ) {
          return false
        }
        // Brand Filter
        if (
          selectedBrands.length > 0 &&
          (!product.brand_name ||
            !selectedBrands.some(
              (b) => b.toLowerCase() === product.brand_name?.toLowerCase()
            ))
        ) {
          return false
        }
        // Stock Filter
        const inStock =
          product.stock !== undefined && product.stock !== null
            ? product.stock > 0
            : true
        if (inStockOnly && !inStock) {
          return false
        }
        // Price Filter
        if (product.price > effectiveMaxPrice) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price
        if (sortBy === "price-desc") return b.price - a.price
        if (sortBy === "rating")
          return (
            (b.average_rating ?? b.rating_avg ?? 0) -
            (a.average_rating ?? a.rating_avg ?? 0)
          )
        if (sortBy === "newest")
          return (b.is_new_arrival ? 1 : 0) - (a.is_new_arrival ? 1 : 0)
        // Default popular / bestseller
        return (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0)
      })
  }, [
    allProducts,
    selectedCategories,
    selectedBrands,
    inStockOnly,
    effectiveMaxPrice,
    sortBy,
  ])

  // Pagination slice (12 items: 4 columns x 3 rows)
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  function resetFilters() {
    setSelectedCategories([])
    setSelectedBrands([])
    setInStockOnly(false)
    setUserMaxPrice(null)
    setSortBy("popular")
    setCurrentPage(1)
  }

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    inStockOnly ||
    (userMaxPrice !== null && userMaxPrice < dynamicMaxPrice)

  // Quick category toggle from pills
  function handleQuickCategoryPill(cat: string | null) {
    if (!cat) {
      setSelectedCategories([])
    } else {
      setSelectedCategories([cat])
    }
    setCurrentPage(1)
  }

  // ── Filter Sidebar Content (Minimalist & Warm) ────────────────
  const filterControls = (
    <div className="flex flex-col gap-8">
      {/* Reset Filter Button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="flex items-center gap-1.5 text-xs font-medium text-[#8C1A2B] hover:text-[#5E0F1D] self-start cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>
            Réinitialiser tous les filtres (
            {selectedCategories.length +
              selectedBrands.length +
              (inStockOnly ? 1 : 0) +
              (userMaxPrice !== null ? 1 : 0)}
            )
          </span>
        </button>
      )}

      {/* Categories Group */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
            Catégories
          </h3>
          {selectedCategories.length > 0 && (
            <span className="text-[10px] font-medium text-[#8C1A2B] bg-[#8C1A2B]/10 px-2 py-0.5 rounded-full">
              {selectedCategories.length}
            </span>
          )}
        </div>
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
          {categoryOptions.map((cat) => {
            const isChecked = selectedCategories.includes(cat)
            return (
              <label
                key={cat}
                className="flex items-center gap-2.5 text-xs text-[#525252] hover:text-[#1A1A1A] cursor-pointer select-none group transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    setSelectedCategories((prev) =>
                      isChecked ? prev.filter((c) => c !== cat) : [...prev, cat]
                    )
                    setCurrentPage(1)
                  }}
                  className="w-4 h-4 rounded-[5px] border-stone-300 text-[#1A1A1A] focus:ring-[#1A1A1A] accent-[#1A1A1A] cursor-pointer"
                />
                <span
                  className={cn(
                    "transition-colors",
                    isChecked ? "font-semibold text-[#1A1A1A]" : "font-normal"
                  )}
                >
                  {cat}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Brands Group */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
            Marques
          </h3>
          {selectedBrands.length > 0 && (
            <span className="text-[10px] font-medium text-[#8C1A2B] bg-[#8C1A2B]/10 px-2 py-0.5 rounded-full">
              {selectedBrands.length}
            </span>
          )}
        </div>
        <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
          {brandOptions.map((brand) => {
            const isChecked = selectedBrands.includes(brand)
            return (
              <label
                key={brand}
                className="flex items-center gap-2.5 text-xs text-[#525252] hover:text-[#1A1A1A] cursor-pointer select-none group transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    setSelectedBrands((prev) =>
                      isChecked ? prev.filter((b) => b !== brand) : [...prev, brand]
                    )
                    setCurrentPage(1)
                  }}
                  className="w-4 h-4 rounded-[5px] border-stone-300 text-[#1A1A1A] focus:ring-[#1A1A1A] accent-[#1A1A1A] cursor-pointer"
                />
                <span
                  className={cn(
                    "transition-colors",
                    isChecked ? "font-semibold text-[#1A1A1A]" : "font-normal"
                  )}
                >
                  {brand}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* In Stock Filter */}
      <div>
        <label className="flex items-center justify-between cursor-pointer select-none group">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
            En stock uniquement
          </span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => {
              setInStockOnly(e.target.checked)
              setCurrentPage(1)
            }}
            className="w-4 h-4 rounded-[5px] border-stone-300 text-[#1A1A1A] focus:ring-[#1A1A1A] accent-[#1A1A1A] cursor-pointer"
          />
        </label>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
            Prix maximum
          </h3>
          <span className="text-xs font-semibold text-[#1A1A1A]">
            {effectiveMaxPrice} DH
          </span>
        </div>
        <input
          type="range"
          min="10"
          max={dynamicMaxPrice}
          step="10"
          value={effectiveMaxPrice}
          onChange={(e) => {
            setUserMaxPrice(Number(e.target.value))
            setCurrentPage(1)
          }}
          className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#1A1A1A]"
        />
        <div className="flex justify-between text-[11px] text-[#8C827A] mt-2">
          <span>10 DH</span>
          <span>{dynamicMaxPrice} DH</span>
        </div>
      </div>
    </div>
  )

  // ── Pagination Page Numbers Range ────────────────────────────
  const paginationRange = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages: (number | "...")[] = []
    if (currentPage <= 3) {
      pages.push(1, 2, 3, "...", totalPages)
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, "...", currentPage, "...", totalPages)
    }
    return pages
  }, [currentPage, totalPages])

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-8 lg:py-12 w-full">
      {/* FULL SCREEN WIDTH CONTAINER (Takes the entire width with elegant margins) */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        
        {/* ── 1. Page Header (Breadcrumbs + Title + Subtitle) ───── */}
        <div className="mb-6">
          {/* Breadcrumbs */}
          <nav aria-label="Fil d'Ariane" className="mb-3">
            <ol className="flex items-center gap-2 text-xs text-[#8C827A] flex-wrap">
              {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1
                return (
                  <li key={index} className="flex items-center gap-2">
                    {index > 0 && <span className="text-stone-300">/</span>}
                    {item.href && !isLast ? (
                      <Link
                        href={item.href}
                        className="hover:text-[#1A1A1A] transition-colors"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className={cn(isLast ? "text-[#1A1A1A] font-medium" : "")}>
                        {item.label}
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>

          {/* Large, Elegant Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] tracking-tight font-display">
            {title}
          </h1>

          {/* Subtle Subtitle */}
          {subtitle && (
            <p className="text-sm sm:text-base text-[#737373] mt-2 max-w-3xl font-normal leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* ── 2. Top Toolbar & Quick Categories (Luma & Living layout) ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 mb-8 border-y border-stone-200/60">
          
          {/* Left: [ Filters ] Pill + Category Pills Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
            {/* [ Filters ] Button */}
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer shadow-xs",
                hasActiveFilters
                  ? "bg-[#1A1A1A] text-white"
                  : "bg-white border border-stone-200/80 text-[#1A1A1A] hover:bg-stone-50"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtres</span>
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#8C1A2B]" />
              )}
            </button>

            {/* "Tous" Pill */}
            <button
              type="button"
              onClick={() => handleQuickCategoryPill(null)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer",
                selectedCategories.length === 0
                  ? "bg-[#1A1A1A] text-white shadow-xs"
                  : "bg-white/80 hover:bg-white text-[#525252] hover:text-[#1A1A1A] border border-stone-200/80"
              )}
            >
              Tous
            </button>

            {/* Category Pills */}
            {categoryOptions.slice(0, 10).map((cat) => {
              const isSelected =
                selectedCategories.length === 1 && selectedCategories[0] === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleQuickCategoryPill(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer",
                    isSelected
                      ? "bg-[#1A1A1A] text-white shadow-xs"
                      : "bg-white/80 hover:bg-white text-[#525252] hover:text-[#1A1A1A] border border-stone-200/80"
                  )}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Right: Results Count + Sort by + Grid/List Icons */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0 ml-auto">
            {/* Results Count Text */}
            <p className="text-xs sm:text-sm text-[#737373] hidden md:block">
              Affichage de{" "}
              <span className="font-semibold text-[#1A1A1A]">
                {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </span>
              -
              <span className="font-semibold text-[#1A1A1A]">
                {Math.min(currentPage * pageSize, filteredProducts.length)}
              </span>{" "}
              sur{" "}
              <span className="font-semibold text-[#1A1A1A]">{filteredProducts.length}</span> résultats
            </p>

            {/* Minimalist Sort by dropdown */}
            <div className="relative flex items-center">
              <span className="text-xs text-[#737373] mr-2 hidden sm:inline font-normal">
                Trier par :
              </span>
              <div className="relative">
                <select
                  id="catalog-sort-by"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="appearance-none bg-transparent text-xs font-semibold text-[#1A1A1A] pr-6 pl-1 py-1 cursor-pointer outline-none focus:ring-0 transition-colors"
                >
                  <option value="popular">Popularité &amp; Ventes</option>
                  <option value="rating">Mieux notés</option>
                  <option value="price-asc">Prix : Croissant</option>
                  <option value="price-desc">Prix : Décroissant</option>
                  <option value="newest">Nouveautés</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#737373] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Grid / List View Toggle Icons */}
            <div className="flex items-center gap-1 pl-3 border-l border-stone-200">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Vue grille"
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer",
                  viewMode === "grid"
                    ? "bg-[#1A1A1A] text-white shadow-2xs"
                    : "text-stone-400 hover:text-[#1A1A1A] hover:bg-stone-100/60"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="Vue liste"
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer",
                  viewMode === "list"
                    ? "bg-[#1A1A1A] text-white shadow-2xs"
                    : "text-stone-400 hover:text-[#1A1A1A] hover:bg-stone-100/60"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-xs text-[#8C827A]">Filtres actifs :</span>
            {selectedCategories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200 text-xs font-medium text-[#1A1A1A] shadow-2xs"
              >
                <span>{cat}</span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedCategories((prev) => prev.filter((c) => c !== cat))
                  }
                  className="hover:text-[#8C1A2B] transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedBrands.map((brand) => (
              <span
                key={brand}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200 text-xs font-medium text-[#1A1A1A] shadow-2xs"
              >
                <span>{brand}</span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedBrands((prev) => prev.filter((b) => b !== brand))
                  }
                  className="hover:text-[#8C1A2B] transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs font-medium text-emerald-800 shadow-2xs">
                <span>En stock</span>
                <button
                  type="button"
                  onClick={() => setInStockOnly(false)}
                  className="hover:text-emerald-950 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {userMaxPrice !== null && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200 text-xs font-medium text-[#1A1A1A] shadow-2xs">
                <span>Max {userMaxPrice} DH</span>
                <button
                  type="button"
                  onClick={() => setUserMaxPrice(null)}
                  className="hover:text-[#8C1A2B] transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* ── 3. Product Grid (Full Screen Width: 4 Columns x 3 Rows = 12 Items) ── */}
        <main className="w-full">
          {paginatedProducts.length > 0 ? (
            viewMode === "grid" ? (
              /* 4 COLUMNS HORIZONTAL x 3 ROWS VERTICAL */
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 sm:gap-x-6 lg:gap-x-7 xl:gap-x-8 gap-y-10 sm:gap-y-12">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode="grid" />
                ))}
              </div>
            ) : (
              /* List Mode */
              <div className="flex flex-col gap-4 max-w-5xl mx-auto">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode="list" />
                ))}
              </div>
            )
          ) : (
            /* Empty State */
            <div className="bg-white/80 rounded-2xl p-16 text-center border border-stone-200/60 shadow-xs flex flex-col items-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#F4EFEA] flex items-center justify-center text-stone-400 mb-4">
                <SlidersHorizontal className="w-7 h-7 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-semibold text-[#1A1A1A] mb-1">
                Aucun produit trouvé
              </h3>
              <p className="text-xs text-[#737373] max-w-sm mb-6 leading-relaxed">
                Aucun article ne correspond exactement à vos critères. Essayez d&apos;élargir vos filtres ou de réinitialiser vos choix.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-6 py-2.5 rounded-full bg-[#1A1A1A] text-white text-xs font-semibold hover:bg-[#8C1A2B] transition-colors shadow-xs"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}

          {/* ── 4. Minimalist Pagination (4x3: 12 Products Per Page) ── */}
          {totalPages > 1 && (
            <nav
              aria-label="Pagination du catalogue"
              className="mt-14 pt-8 border-t border-stone-200/60 flex items-center justify-center gap-1.5 sm:gap-2"
            >
              {/* Previous Page Arrow */}
              <button
                type="button"
                onClick={() => {
                  if (currentPage > 1) {
                    setCurrentPage((p) => p - 1)
                    window.scrollTo({ top: 120, behavior: "smooth" })
                  }
                }}
                disabled={currentPage === 1}
                aria-label="Page précédente"
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#525252] hover:text-[#1A1A1A] hover:bg-stone-200/50 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Numbers */}
              {paginationRange.map((page, index) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="w-9 h-9 flex items-center justify-center text-xs text-[#8C827A]"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    onClick={() => {
                      setCurrentPage(page as number)
                      window.scrollTo({ top: 120, behavior: "smooth" })
                    }}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                    className={cn(
                      "w-9 h-9 rounded-full text-xs transition-all flex items-center justify-center cursor-pointer",
                      currentPage === page
                        ? "bg-[#1A1A1A] text-white font-semibold shadow-xs"
                        : "text-[#525252] hover:text-[#1A1A1A] hover:bg-stone-200/50 font-medium"
                    )}
                  >
                    {page}
                  </button>
                )
              )}

              {/* Next Page Arrow */}
              <button
                type="button"
                onClick={() => {
                  if (currentPage < totalPages) {
                    setCurrentPage((p) => p + 1)
                    window.scrollTo({ top: 120, behavior: "smooth" })
                  }
                }}
                disabled={currentPage === totalPages}
                aria-label="Page suivante"
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#525252] hover:text-[#1A1A1A] hover:bg-stone-200/50 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          )}
        </main>
      </div>

      {/* ── 5. Slide-Over Filters Drawer (Opens via [ Filtres ] Pill) ── */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterDrawerOpen(false)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#FAF8F5] shadow-2xl z-50 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-stone-200/60 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#1A1A1A]" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
                    Filtres du catalogue
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-6 overflow-y-auto flex-1">
                {filterControls}
              </div>

              {/* Drawer Footer */}
              <div className="p-5 border-t border-stone-200/60 bg-white flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetFilters()
                    setIsFilterDrawerOpen(false)
                  }}
                  className="flex-1 py-2.5 rounded-full border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Réinitialiser
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex-1 py-2.5 rounded-full bg-[#1A1A1A] text-white text-xs font-semibold hover:bg-[#8C1A2B] transition-colors cursor-pointer"
                >
                  Voir ({filteredProducts.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
