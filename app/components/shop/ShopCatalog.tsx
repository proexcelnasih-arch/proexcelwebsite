"use client"

import { useState, useMemo } from "react"
import { Filter, X, SlidersHorizontal, ArrowUpDown, Check, RotateCcw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { ProductCard } from "@/components/products/ProductCard"
import { Pagination } from "@/components/ui/Pagination"
import { formatPrice, cn } from "@/lib/utils"
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
  // 16 products per page (4x4 on desktop)
  const pageSize = 16

  // Dynamically calculate the highest price in the catalog (rounded up to nearest 100)
  const dynamicMaxPrice = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return 2000
    const highest = Math.max(...allProducts.map((p) => Number(p.price) || 0))
    return Math.max(500, Math.ceil(highest / 100) * 100)
  }, [allProducts])

  const [maxPrice, setMaxPrice] = useState<number>(dynamicMaxPrice)

  // Sync maxPrice when allProducts loads
  useEffect(() => {
    setMaxPrice(dynamicMaxPrice)
  }, [dynamicMaxPrice])

  const categoryOptions = availableCategories && availableCategories.length > 0
    ? availableCategories
    : DEFAULT_CATEGORIES

  const brandOptions = availableBrands && availableBrands.length > 0
    ? availableBrands
    : DEFAULT_BRANDS

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
          (!product.brand_name || !selectedBrands.some((b) => b.toLowerCase() === product.brand_name?.toLowerCase()))
        ) {
          return false
        }
        // Stock Filter
        const inStock = product.stock !== undefined && product.stock !== null ? product.stock > 0 : true
        if (inStockOnly && !inStock) {
          return false
        }
        // Price Filter
        if (product.price > maxPrice) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price
        if (sortBy === "price-desc") return b.price - a.price
        if (sortBy === "rating") return (b.average_rating ?? b.rating_avg ?? 0) - (a.average_rating ?? a.rating_avg ?? 0)
        if (sortBy === "newest") return (b.is_new_arrival ? 1 : 0) - (a.is_new_arrival ? 1 : 0)
        // Default popular / bestseller
        return (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0)
      })
  }, [allProducts, selectedCategories, selectedBrands, inStockOnly, maxPrice, sortBy])

  // Pagination slice (16 items)
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  function resetFilters() {
    setSelectedCategories([])
    setSelectedBrands([])
    setInStockOnly(false)
    setMaxPrice(dynamicMaxPrice)
    setSortBy("popular")
    setCurrentPage(1)
  }

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    inStockOnly ||
    maxPrice < dynamicMaxPrice

  // ── Filter Sidebar Content (Shared between desktop and mobile) ──
  const filterControls = (
    <div className="flex flex-col gap-6">
      {/* Reset Filter Button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline self-start cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>Réinitialiser tous les filtres ({selectedCategories.length + selectedBrands.length + (inStockOnly ? 1 : 0)})</span>
        </button>
      )}

      {/* Multi-Select Categories Group with Burgundy Checkboxes */}
      <div className="pb-5 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Catégories
          </h3>
          {selectedCategories.length > 0 && (
            <span className="text-[10px] font-bold text-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-2 py-0.5 rounded-full">
              {selectedCategories.length} sélec.
            </span>
          )}
        </div>
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {categoryOptions.map((cat) => {
            const isChecked = selectedCategories.includes(cat)
            return (
              <label
                key={cat}
                className="flex items-center gap-2.5 text-xs text-slate-600 hover:text-[var(--color-primary)] cursor-pointer select-none group"
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
                  className="w-4 h-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] accent-[var(--color-primary)] cursor-pointer transition-colors"
                />
                <span className={cn("transition-colors", isChecked && "font-bold text-[var(--color-primary)]")}>
                  {cat}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Brands Group with Checkboxes */}
      <div className="pb-5 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Marques officielles
          </h3>
          {selectedBrands.length > 0 && (
            <span className="text-[10px] font-bold text-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-2 py-0.5 rounded-full">
              {selectedBrands.length}
            </span>
          )}
        </div>
        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
          {brandOptions.map((brand) => {
            const isChecked = selectedBrands.includes(brand)
            return (
              <label
                key={brand}
                className="flex items-center gap-2.5 text-xs text-slate-600 hover:text-[var(--color-primary)] cursor-pointer select-none group"
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
                  className="w-4 h-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] accent-[var(--color-primary)] cursor-pointer transition-colors"
                />
                <span className={cn("transition-colors", isChecked && "font-bold text-[var(--color-primary)]")}>
                  {brand}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* In Stock Toggle */}
      <div className="pb-5 border-b border-[var(--color-border)]">
        <label className="flex items-center justify-between cursor-pointer select-none">
          <span className="text-xs font-bold text-slate-900">En stock uniquement</span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => {
              setInStockOnly(e.target.checked)
              setCurrentPage(1)
            }}
            className="w-4 h-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] accent-[var(--color-primary)] cursor-pointer"
          />
        </label>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Prix maximum
          </h3>
          <span className="text-xs font-bold text-[var(--color-primary)]">
            {maxPrice} DH
          </span>
        </div>
        <input
          type="range"
          min="10"
          max={dynamicMaxPrice}
          step="10"
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(Number(e.target.value))
            setCurrentPage(1)
          }}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1.5">
          <span>10 DH</span>
          <span>{dynamicMaxPrice} DH</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-[var(--color-background)] min-h-screen py-6 lg:py-10">
      <div className="container-site">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header Banner */}
        <div className="mt-4 mb-8 pb-6 border-b border-[var(--color-border)]">
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-slate-900 mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-500 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Catalog Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* ── Left Desktop Sidebar ── */}
          <aside className="hidden lg:block lg:col-span-1 bg-white p-6 rounded-2xl border border-[var(--color-border)] shadow-xs sticky top-24">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[var(--color-border)]">
              <SlidersHorizontal className="w-4 h-4 text-[var(--color-primary)]" />
              <h2 className="font-bold text-sm text-slate-900">Filtres du catalogue</h2>
            </div>
            {filterControls}
          </aside>

          {/* ── Right Content Area ── */}
          <main className="lg:col-span-3 flex flex-col gap-6">
            {/* Top Toolbar (Count + Mobile Filter Toggle + Sorting) */}
            <div className="bg-white p-4 rounded-xl border border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[var(--color-border)] bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Filter className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>Filtres</span>
                  {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                  )}
                </button>

                <p className="text-xs text-slate-500 font-medium">
                  Affichage de{" "}
                  <span className="font-bold text-slate-900">
                    {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                  </span>
                  -
                  <span className="font-bold text-slate-900">
                    {Math.min(currentPage * pageSize, filteredProducts.length)}
                  </span>{" "}
                  sur{" "}
                  <span className="font-bold text-slate-900">{filteredProducts.length}</span> produits
                </p>
              </div>

              {/* Sorting Dropdown */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort-by" className="text-xs text-slate-500 font-medium hidden sm:inline">
                  Trier par :
                </label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="text-xs font-semibold text-slate-800 bg-slate-50 border border-[var(--color-border)] rounded-lg px-3 py-2 outline-none focus:border-[var(--color-primary)] transition-colors cursor-pointer"
                >
                  <option value="popular">Popularité &amp; Ventes</option>
                  <option value="rating">Mieux notés</option>
                  <option value="price-asc">Prix : Croissant</option>
                  <option value="price-desc">Prix : Décroissant</option>
                  <option value="newest">Nouveautés 2026</option>
                </select>
              </div>
            </div>

            {/* Active Filters Badges */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Filtres actifs :</span>
                {selectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] text-xs font-bold"
                  >
                    <span>{cat}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCategories((prev) => prev.filter((c) => c !== cat))}
                      className="hover:opacity-75 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedBrands.map((brand) => (
                  <span
                    key={brand}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold"
                  >
                    <span>{brand}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedBrands((prev) => prev.filter((b) => b !== brand))}
                      className="hover:opacity-75 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                    <span>En stock</span>
                    <button
                      type="button"
                      onClick={() => setInStockOnly(false)}
                      className="hover:opacity-75 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {maxPrice < 500 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
                    <span>Max {maxPrice} DH</span>
                    <button
                      type="button"
                      onClick={() => setMaxPrice(500)}
                      className="hover:opacity-75 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Product Grid (4 columns on desktop: 4x4 = 16) */}
            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              /* Empty Search / Filter State */
              <div className="bg-white rounded-2xl p-12 text-center border border-[var(--color-border)] shadow-xs flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <Filter className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-800 mb-1">
                  Aucun produit trouvé
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
                  Aucun article ne correspond exactement à votre sélection. Essayez d&apos;élargir vos filtres ou de réinitialiser vos choix.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:bg-[var(--color-primary-dark)] transition-colors shadow-xs"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    setCurrentPage(p)
                    window.scrollTo({ top: 150, behavior: "smooth" })
                  }}
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile Filter Drawer (Slide over) ── */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl z-50 flex flex-col lg:hidden"
            >
              {/* Drawer Header */}
              <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[var(--color-primary)]" />
                  <h2 className="font-bold text-sm text-slate-900">Filtres du catalogue</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-5 overflow-y-auto flex-1">
                {filterControls}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-[var(--color-border)] bg-slate-50 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetFilters()
                    setIsMobileFilterOpen(false)
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
                >
                  Réinitialiser
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  Voir les résultats ({filteredProducts.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
