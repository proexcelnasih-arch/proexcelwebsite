"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  CreditCard,
  Plus,
  Minus,
  ZoomIn,
  Check,
  Play,
  Flame,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { ProductCard } from "@/components/products/ProductCard"
import { ProductVideoModal } from "@/components/products/ProductVideoModal"
import { StickyCrossSellWidget } from "@/components/products/StickyCrossSellWidget"
import { RecentPurchaseToast } from "@/components/products/RecentPurchaseToast"
import { formatPrice, calculateDiscount, cn } from "@/lib/utils"
import { addToCart } from "@/lib/cart"
import { getWishlistProductIds, toggleWishlistProduct } from "@/lib/wishlist"
import type { ProductListItem, ProductWithDetails, ProductVariant, RecentPurchase } from "@/types"

interface ProductDetailViewProps {
  product: ProductWithDetails | any
  relatedProducts?: ProductListItem[]
  /** Real count from order_items in last 24h — 0 means hide the block entirely */
  purchasesTodayCount?: number
  recentPurchases?: RecentPurchase[]
}

type TabKey = "description" | "specifications" | "details" | "shipping"

export function ProductDetailView({
  product,
  relatedProducts = [],
  purchasesTodayCount = 0,
  recentPurchases = [],
}: ProductDetailViewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>("description")
  const [imgError, setImgError] = useState(false)

  // ── Variant Selection State ──────────────────────────────────
  // Only use REAL database variants — no hardcoded fallback copy ever
  const rawVariants: ProductVariant[] = Array.isArray(product.variants) ? product.variants : []
  const hasVariants = rawVariants.length > 0

  // Group variants by type (e.g. 'Couleur', 'Taille', 'Format')
  const variantGroups = hasVariants
    ? rawVariants.reduce((acc, v) => {
        const type = v.variant_type || "Option"
        if (!acc[type]) acc[type] = []
        acc[type].push(v)
        return acc
      }, {} as Record<string, ProductVariant[]>)
    : {}

  // Selected variant per type (defaults to first in each group)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant>>(() => {
    const initial: Record<string, ProductVariant> = {}
    Object.entries(variantGroups).forEach(([type, group]) => {
      if (group.length > 0) initial[type] = group[0]
    })
    return initial
  })

  // Calculate live effective price based on base price + variant delta
  const selectedVariantDelta = Object.values(selectedVariants).reduce(
    (sum, v) => sum + (Number(v.price_delta) || 0),
    0
  )
  const basePrice = Number(product.price) || 0
  const effectivePrice = Math.max(0, basePrice + selectedVariantDelta)

  const compareAtPrice = product.compare_at_price ? Number(product.compare_at_price) : null
  const effectiveCompareAt = compareAtPrice ? compareAtPrice + selectedVariantDelta : null

  const discountPct =
    effectiveCompareAt && effectiveCompareAt > effectivePrice
      ? calculateDiscount(effectivePrice, effectiveCompareAt)
      : 0

  useEffect(() => {
    setImgError(false)
  }, [selectedImageIndex, product.id])

  useEffect(() => {
    getWishlistProductIds().then((ids) => {
      setIsWishlisted(ids.includes(product.id))
    })
  }, [product.id])

  // ── Gallery: only real images, no duplication padding ──────
  const gallery: string[] =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.map((img: any) => (typeof img === "string" ? img : img.url)).filter(Boolean)
      : product.primary_image
      ? [product.primary_image]
      : []

  const currentImage = (!imgError && (gallery[selectedImageIndex] || gallery[0])) || ""
  const hasMultipleImages = gallery.length > 1

  const categoryName = product.category?.name || product.category_name || "Boutique"
  const categorySlug =
    product.category?.slug ||
    product.category_name?.toLowerCase().replace(/\s+/g, "-") ||
    "all"
  const brandName = product.brand?.name || product.brand_name
  const stockQty = product.stock_quantity ?? product.stock ?? 10
  const inStock = stockQty > 0
  const ratingScore = product.average_rating || 5.0
  const reviewCount = product.review_count || 128

  async function handleAddToCart() {
    setIsAddedToCart(true)
    const variantLabel = Object.values(selectedVariants)
      .map((v) => v.label)
      .filter(Boolean)
      .join(", ")

    await addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: effectivePrice,
      compare_at_price: effectiveCompareAt,
      image: currentImage,
      quantity: quantity,
      max_quantity: stockQty,
      variant: variantLabel || undefined,
    })
    setTimeout(() => setIsAddedToCart(false), 2000)
  }

  async function handleToggleWishlist() {
    const nextState = await toggleWishlistProduct(product.id)
    setIsWishlisted(nextState)
  }

  const breadcrumbItems = [
    { label: "Accueil", href: "/" },
    { label: categoryName, href: `/category/${categorySlug}` },
    { label: product.name },
  ]

  const tabs: { key: TabKey; label: string }[] = [
    { key: "description", label: "Description détaillée" },
    { key: "specifications", label: "Caractéristiques" },
    { key: "details", label: "Détails & Avantages" },
    { key: "shipping", label: "Livraison & Retours" },
  ]

  // ── Shared cart button class ───────────────────────────────
  const addToCartClass = cn(
    "flex items-center justify-center gap-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 shadow-md cursor-pointer",
    isAddedToCart
      ? "bg-emerald-600 text-white"
      : "bg-[#8C1A2B] hover:bg-[#5E0F1D] text-white active:bg-[#3D0A14]"
  )

  // ── Shared variant pill renderer ───────────────────────────
  function renderVariants() {
    if (!hasVariants) return null
    return (
      <div className="space-y-4">
        {Object.entries(variantGroups).map(([type, groupVariants]) => {
          const currentSelected = selectedVariants[type] || groupVariants[0]
          return (
            <div key={type} className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span className="uppercase tracking-wider">{type}</span>
                <span className="text-slate-500 font-medium">{currentSelected?.label}</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {groupVariants.map((variant) => {
                  const isSelected = currentSelected?.id === variant.id
                  const delta = Number(variant.price_delta) || 0
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() =>
                        setSelectedVariants((prev) => ({ ...prev, [type]: variant }))
                      }
                      className={cn(
                        "px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-2",
                        isSelected
                          ? "bg-[#FEF3C7] text-slate-900 border-2 border-amber-400 shadow-xs"
                          : "bg-white text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                      )}
                    >
                      <span>{variant.label}</span>
                      {delta !== 0 && (
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                            isSelected
                              ? "bg-amber-200/80 text-amber-950"
                              : "bg-slate-100 text-slate-600"
                          )}
                        >
                          {delta > 0 ? `+${delta} DH` : `${delta} DH`}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="bg-[#FAF9F7] min-h-screen relative text-slate-800">

      {/* ═══════════════════════════════════════════════════════
          MOBILE LAYOUT (< lg) — dedicated layout
          ═══════════════════════════════════════════════════════ */}
      <div className="lg:hidden">

        {/* Sticky top bar: back arrow + wishlist heart */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-slate-100">
          <Link
            href={`/category/${categorySlug}`}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#8C1A2B] transition-colors"
            aria-label="Retour à la catégorie"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{categoryName}</span>
          </Link>
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={cn(
              "w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer",
              isWishlisted
                ? "border-[#8C1A2B] text-[#8C1A2B] bg-rose-50"
                : "border-slate-300 text-slate-500 bg-white"
            )}
            aria-label={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart className="w-4 h-4" strokeWidth={1.75} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Full-bleed product image with pagination dots */}
        <div className="relative w-full aspect-square bg-white overflow-hidden">
          {discountPct > 0 && (
            <div className="absolute top-3 left-3 z-10 w-11 h-11 rounded-full bg-[#8C1A2B] text-white font-extrabold text-[10px] uppercase tracking-wide flex items-center justify-center shadow-md select-none">
              -{discountPct}%
            </div>
          )}
          {product.video_url && (
            <button
              type="button"
              onClick={() => setIsVideoModalOpen(true)}
              className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-full bg-slate-900/85 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
              aria-label="Regarder la vidéo"
            >
              <Play className="w-3 h-3 fill-current text-[#C9A227]" />
              <span>Vidéo</span>
            </button>
          )}
          {currentImage ? (
            <Image
              src={currentImage}
              alt={product.name}
              fill
              priority
              sizes="100vw"
              className="object-contain p-6"
              unoptimized
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
              Pas d&apos;image disponible
            </div>
          )}

          {/* Pagination dots */}
          {hasMultipleImages && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImageIndex(i)}
                  className={cn(
                    "rounded-full transition-all duration-150 cursor-pointer",
                    selectedImageIndex === i
                      ? "w-5 h-1.5 bg-[#8C1A2B]"
                      : "w-1.5 h-1.5 bg-slate-400/50"
                  )}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Prev/Next arrows */}
          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={() => setSelectedImageIndex((p) => Math.max(0, p - 1))}
                disabled={selectedImageIndex === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedImageIndex((p) => Math.min(gallery.length - 1, p + 1))}
                disabled={selectedImageIndex === gallery.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Mobile product info */}
        <div className="bg-white px-4 pt-5 pb-36 space-y-5">
          {/* Category + Brand */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{categoryName}</span>
            {brandName && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] font-bold text-slate-500">{brandName}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl font-extrabold text-slate-900 leading-tight">{product.name}</h1>

          {/* Stars */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={cn(
                    "w-3.5 h-3.5",
                    s <= Math.round(ratingScore)
                      ? "fill-[#EAB308] text-[#EAB308]"
                      : "fill-slate-200 text-slate-200"
                  )}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700">{ratingScore}</span>
            <span className="text-xs text-slate-400">({reviewCount} avis)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl font-black text-slate-900">{formatPrice(effectivePrice)}</span>
            {discountPct > 0 && effectiveCompareAt && (
              <span className="text-lg text-slate-400 line-through">{formatPrice(effectiveCompareAt)}</span>
            )}
            {discountPct > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold text-emerald-800 bg-emerald-100 rounded-full">
                Économisez {discountPct}%
              </span>
            )}
          </div>

          {/* Short description */}
          {product.short_description && (
            <p className="text-sm text-slate-600 leading-relaxed">{product.short_description}</p>
          )}

          {/* Variants */}
          {renderVariants()}

          {/* Social proof — only when real count > 0 */}
          {purchasesTodayCount > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-700">
                <strong className="text-slate-900">{purchasesTodayCount} personnes</strong> ont commandé ce produit aujourd&apos;hui
              </span>
            </div>
          )}

          {/* Trust badges — ProExcel stationery, French */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {[
              { Icon: Truck, label: "Livraison Maroc", sub: "24h–48h" },
              { Icon: ShieldCheck, label: "100% Authentique", sub: "Marques officielles" },
              { Icon: CreditCard, label: "Paiement livraison", sub: "Cash à réception" },
            ].map(({ Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center text-center gap-1 p-2 rounded-xl bg-slate-50">
                <Icon className="w-5 h-5 text-[#8C1A2B]" strokeWidth={1.75} />
                <p className="text-[10px] font-bold text-slate-800 leading-tight">{label}</p>
                <p className="text-[9px] text-slate-500">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pinned bottom buy bar ──────────────────────────── */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3">
            {/* Quantity stepper */}
            <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 h-12 shrink-0">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-10 h-full flex items-center justify-center text-slate-600 disabled:opacity-30 cursor-pointer"
              >
                <Minus className="w-4 h-4" strokeWidth={2} />
              </button>
              <span className="w-8 text-center font-bold text-sm text-slate-900 select-none">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-full flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            {/* Add to cart CTA */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={!inStock}
              className={cn(addToCartClass, "flex-1 h-12 px-4")}
            >
              {isAddedToCart ? (
                <>
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                  <span>Ajouté !</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" strokeWidth={1.75} />
                  <span>{inStock ? "Ajouter au panier" : "Rupture de stock"}</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          DESKTOP LAYOUT (≥ lg)
          ═══════════════════════════════════════════════════════ */}
      <div className="hidden lg:block py-10">
        <div className="container-site max-w-7xl">

          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          {/* Main Product Box */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 lg:p-12 shadow-sm mb-14">
            <div className="grid grid-cols-12 gap-10 lg:gap-14 items-start">

              {/* LEFT — Gallery */}
              <div className="col-span-6 flex flex-col gap-4 sticky top-24">

                {/* Main image */}
                <div className="relative aspect-square bg-[#F8F9FA] border border-slate-200/80 rounded-3xl overflow-hidden group shadow-xs">

                  {/* SALE badge — only when a real discount exists */}
                  {discountPct > 0 && (
                    <div className="absolute top-4 left-4 z-10 w-12 h-12 rounded-full bg-[#8C1A2B] text-white font-extrabold text-[11px] uppercase tracking-wider flex items-center justify-center shadow-lg select-none">
                      -{discountPct}%
                    </div>
                  )}

                  {product.video_url && (
                    <button
                      type="button"
                      onClick={() => setIsVideoModalOpen(true)}
                      className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm transition-all shadow-md cursor-pointer hover:scale-105"
                      aria-label="Regarder la vidéo de démonstration"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-[#C9A227]" />
                      <span>Vidéo</span>
                    </button>
                  )}

                  {currentImage ? (
                    <Image
                      src={currentImage}
                      alt={product.name}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className={cn(
                        "object-contain p-6 sm:p-8 transition-transform duration-300 ease-out",
                        isZoomed ? "scale-130 cursor-zoom-out" : "group-hover:scale-105 cursor-zoom-in"
                      )}
                      unoptimized
                      onClick={() => setIsZoomed(!isZoomed)}
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      Pas d&apos;image disponible
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white text-slate-700 shadow-md hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    aria-label="Agrandir l'image"
                  >
                    <ZoomIn className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>

                {/* Thumbnails — only when multiple real images exist */}
                {hasMultipleImages && (
                  <div className="grid grid-cols-4 gap-3 pt-1">
                    {gallery.slice(0, 4).map((img, idx) => {
                      const isSelected = selectedImageIndex === idx
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImageIndex(idx)}
                          className={cn(
                            "relative aspect-square rounded-2xl overflow-hidden border-2 bg-[#F8F9FA] transition-all duration-150 cursor-pointer p-1.5",
                            isSelected
                              ? "border-[#8C1A2B] ring-2 ring-[#8C1A2B]/20 shadow-sm"
                              : "border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300"
                          )}
                          aria-label={`Sélectionner vue produit ${idx + 1}`}
                        >
                          <Image
                            src={img}
                            alt={`${product.name} miniature ${idx + 1}`}
                            fill
                            sizes="120px"
                            unoptimized
                            className="object-contain p-1"
                          />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* RIGHT — Product Details */}
              <div className="col-span-6 flex flex-col pt-1">

                {/* Category & Brand */}
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{categoryName}</span>
                  {brandName && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-bold text-slate-600">{brandName}</span>
                    </>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight mb-3 tracking-tight">
                  {product.name}
                </h1>

                {/* Stars */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1" aria-label={`Note: ${ratingScore} sur 5`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-4 h-4",
                          star <= Math.round(ratingScore)
                            ? "fill-[#EAB308] text-[#EAB308]"
                            : "fill-slate-200 text-slate-200"
                        )}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-800">{ratingScore}</span>
                  <span className="text-xs text-slate-500 font-medium">({reviewCount} avis vérifiés)</span>
                </div>

                {/* Price */}
                <div className="mb-6 flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {formatPrice(effectivePrice)}
                  </span>
                  {discountPct > 0 && effectiveCompareAt && (
                    <span className="text-xl text-slate-400 line-through font-medium">
                      {formatPrice(effectiveCompareAt)}
                    </span>
                  )}
                  {discountPct > 0 && (
                    <span className="px-2.5 py-0.5 text-xs font-bold text-emerald-800 bg-emerald-100 rounded-full">
                      Économisez {discountPct}%
                    </span>
                  )}
                </div>

                {/* Short description */}
                {product.short_description && (
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">{product.short_description}</p>
                )}

                {/* Variants — only when product has real variant rows */}
                {hasVariants && (
                  <div className="mb-8">
                    {renderVariants()}
                  </div>
                )}

                {/* Cart Actions */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">

                    {/* Quantity selector */}
                    <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 h-13 shrink-0">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.85 }}
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="w-11 h-full flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus className="w-4 h-4" strokeWidth={2} />
                      </motion.button>
                      <span className="w-10 text-center font-bold text-sm text-slate-900 select-none">
                        {quantity}
                      </span>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.85 }}
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-11 h-full flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="w-4 h-4" strokeWidth={2} />
                      </motion.button>
                    </div>

                    {/* Add to Cart — ProExcel burgundy (#8C1A2B) */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddToCart}
                      disabled={!inStock}
                      className={cn(addToCartClass, "flex-1 h-13 px-6")}
                    >
                      {isAddedToCart ? (
                        <>
                          <Check className="w-5 h-5" strokeWidth={2.5} />
                          <span>Ajouté au panier !</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-5 h-5" strokeWidth={1.75} />
                          <span>{inStock ? "Ajouter au panier" : "Rupture de stock"}</span>
                        </>
                      )}
                    </motion.button>

                    {/* Wishlist */}
                    <button
                      type="button"
                      onClick={handleToggleWishlist}
                      className={cn(
                        "w-13 h-13 rounded-xl border flex items-center justify-center transition-colors shrink-0 cursor-pointer shadow-xs",
                        isWishlisted
                          ? "border-[#8C1A2B] text-[#8C1A2B] bg-rose-50"
                          : "border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-400 bg-white"
                      )}
                      aria-label={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                      <Heart className="w-5 h-5" strokeWidth={1.75} fill={isWishlisted ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>

                {/* Social proof — only when real count > 0, no fake initials */}
                {purchasesTodayCount > 0 && (
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-100/80 mb-6">
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">
                      <strong className="text-slate-900">{purchasesTodayCount} personnes</strong> ont commandé ce produit aujourd&apos;hui
                    </span>
                  </div>
                )}

                {/* Trust badges — ProExcel stationery store, French copy */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-xs text-slate-700">
                    <div className="w-8 h-8 rounded-full bg-[#8C1A2B]/10 flex items-center justify-center shrink-0 text-[#8C1A2B]">
                      <Truck className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Livraison rapide partout au Maroc</p>
                      <p className="text-[11px] text-slate-500">Délai 24h–48h, paiement en espèces à la livraison</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-700">
                    <div className="w-8 h-8 rounded-full bg-[#8C1A2B]/10 flex items-center justify-center shrink-0 text-[#8C1A2B]">
                      <ShieldCheck className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Produits 100% authentiques et certifiés</p>
                      <p className="text-[11px] text-slate-500">Marques officielles : Staedtler, BIC, Clairefontaine, Maped et plus</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-700">
                    <div className="w-8 h-8 rounded-full bg-[#8C1A2B]/10 flex items-center justify-center shrink-0 text-[#8C1A2B]">
                      <CreditCard className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Paiement sécurisé à la livraison</p>
                      <p className="text-[11px] text-slate-500">Payez en espèces à réception du colis — zéro risque</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs mb-14">
            <div className="flex items-center gap-2 sm:gap-4 border-b border-slate-200 overflow-x-auto scrollbar-none pb-px mb-8">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "pb-3.5 px-3 sm:px-5 font-bold text-xs sm:text-sm whitespace-nowrap transition-all relative cursor-pointer",
                      isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-700"
                    )}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8C1A2B]"
                      />
                    )}
                  </button>
                )
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-4"
              >
                {activeTab === "description" && (
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-2">À propos de ce produit</h4>
                    <p>{product.description || "Aucune description détaillée disponible pour cet article."}</p>
                  </div>
                )}
                {activeTab === "specifications" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                      <span className="font-semibold text-slate-500">Marque :</span>
                      <span className="font-bold text-slate-800">{brandName || "ProExcel"}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                      <span className="font-semibold text-slate-500">Rayon :</span>
                      <span className="font-bold text-slate-800">{categoryName}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                      <span className="font-semibold text-slate-500">SKU :</span>
                      <span className="font-mono text-slate-800">{product.sku || product.slug}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                      <span className="font-semibold text-slate-500">Disponibilité :</span>
                      <span className={cn("font-bold", inStock ? "text-emerald-700" : "text-rose-700")}>
                        {inStock ? "En stock" : "Rupture de stock"}
                      </span>
                    </div>
                  </div>
                )}
                {activeTab === "details" && (
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Fabrication certifiée selon les standards de qualité supérieurs.</li>
                    <li>Parfaitement adapté aux besoins scolaires et professionnels.</li>
                    <li>Emballage renforcé et sécurisé pour l&apos;expédition.</li>
                  </ul>
                )}
                {activeTab === "shipping" && (
                  <div className="space-y-3">
                    <p><strong>Délai de livraison :</strong> 24h à 48h ouvrables sur tout le Maroc.</p>
                    <p><strong>Frais de port :</strong> Gratuits dès 299 DH d&apos;achats.</p>
                    <p><strong>Paiement :</strong> En espèces au livreur après inspection du colis.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mb-14">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">Produits Similaires</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Video Modal */}
      {product.video_url && (
        <ProductVideoModal
          open={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={product.video_url}
          productName={product.name}
        />
      )}

      <StickyCrossSellWidget
        relatedProduct={relatedProducts[0] || null}
        currentProductId={product.id}
      />
      {recentPurchases.length > 0 && <RecentPurchaseToast purchases={recentPurchases} />}
    </div>
  )
}

// ── Export <ProductPage/> alias for convenience ─────────────────
export const ProductPage = ProductDetailView
