"use client"

import Image from "next/image"
import Link from "next/link"
import React, { useState, useEffect } from "react"
import { Heart, ShoppingCart, Star, Check, Package, ArrowRight, Eye } from "lucide-react"
import { cn, formatPrice, calculateDiscount } from "@/lib/utils"
import { Dialog } from "@/components/ui/Dialog"
import type { ProductListItem } from "@/types"
import { addToCart } from "@/lib/cart"
import { toggleWishlistProduct } from "@/lib/wishlist"

// ── Types ─────────────────────────────────────────────────────
export interface ProductCardProps {
  product: ProductListItem
  className?: string
  onAddToCart?: (product: ProductListItem) => void
  onWishlist?: (product: ProductListItem) => void
  isWishlisted?: boolean
  priority?: boolean
  viewMode?: "grid" | "list"
}

// ── Star Rating (Minimalist Yellow Stars) ──────────────────────
function StarRating({ rating, count }: { rating: number; count: number }) {
  const displayRating = rating > 0 ? rating.toFixed(1) : "4.8"
  const displayCount = count > 0 ? count : 12

  return (
    <div className="flex items-center gap-1.5 text-xs text-[#737373]">
      <div className="flex items-center gap-0.5" aria-label={`Note: ${displayRating} sur 5`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "w-3 h-3",
              star <= Math.round(Number(displayRating))
                ? "fill-[#F59E0B] text-[#F59E0B]"
                : "fill-stone-200 text-stone-200"
            )}
          />
        ))}
      </div>
      <span className="font-semibold text-[#1A1A1A] text-[11px] ml-0.5">{displayRating}</span>
      <span className="text-[11px] text-[#8C827A]">({displayCount})</span>
    </div>
  )
}

// ── Clean Discount Pill Badge ─────────────────────────────────
function DiscountBadge({ pct }: { pct: number }) {
  return (
    <span className="absolute top-3 left-3 z-10 px-2.5 py-0.5 text-[10px] font-bold text-white bg-[#D9383A] rounded-full shadow-xs tracking-tight leading-tight">
      -{pct}%
    </span>
  )
}

// ── New Arrival Badge ─────────────────────────────────────────
function NewBadge() {
  return (
    <span className="absolute top-3 left-3 z-10 px-2.5 py-0.5 text-[10px] font-bold text-[#1A1A1A] bg-[#E8DFD1] rounded-full shadow-xs tracking-tight leading-tight">
      NOUVEAU
    </span>
  )
}

// ── Image Placeholder ─────────────────────────────────────────
function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center bg-[#F4EFEA] text-stone-400 p-4 text-center select-none",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-white/80 shadow-xs flex items-center justify-center mb-1 text-stone-400">
        <Package className="w-5 h-5 stroke-[1.5]" />
      </div>
      <span className="text-[10px] font-medium tracking-widest text-stone-500 uppercase">ProExcel</span>
    </div>
  )
}

// ── Quick View Modal ──────────────────────────────────────────
interface QuickViewModalProps {
  open: boolean
  onClose: () => void
  product: ProductListItem
  discountPct: number
}

function QuickViewModal({ open, onClose, product, discountPct }: QuickViewModalProps) {
  const [modalImgError, setModalImgError] = useState(false)
  const isOutOfStock =
    product.stock !== undefined && product.stock !== null && product.stock <= 0
  const hasImage = Boolean(product.primary_image) && !modalImgError

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={product.name}
      description={product.brand_name ?? product.category_name ?? undefined}
      size="xl"
    >
      <div className="flex flex-col sm:flex-row gap-6 p-2">
        {/* Image */}
        <div className="relative w-full sm:w-56 aspect-square bg-[#F4EFEA] rounded-2xl overflow-hidden shrink-0 flex items-center justify-center">
          {hasImage ? (
            <Image
              src={product.primary_image!}
              alt={product.name}
              fill
              className="object-contain p-4"
              sizes="224px"
              unoptimized
              onError={() => setModalImgError(true)}
            />
          ) : (
            <ImagePlaceholder />
          )}
          {discountPct > 0 && <DiscountBadge pct={discountPct} />}
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-[#8C827A] mb-1">
            {product.category_name || product.brand_name || "Fournitures"}
          </p>

          <h3 className="text-lg font-semibold text-[#1A1A1A] leading-snug mb-3">
            {product.name}
          </h3>

          <div className="mb-4">
            <StarRating
              rating={product.average_rating ?? product.rating_avg ?? 4.8}
              count={product.review_count ?? 12}
            />
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2.5 mb-4 flex-wrap">
            <span className="text-2xl font-bold text-[#1A1A1A] leading-none">
              {formatPrice(product.price)}
            </span>
            {discountPct > 0 && product.compare_at_price && (
              <span className="text-sm text-stone-400 line-through leading-none">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>

          {/* Stock status */}
          <p className="text-xs mb-6">
            {isOutOfStock ? (
              <span className="text-rose-600 font-medium">Rupture de stock</span>
            ) : (
              <span className="text-emerald-700 font-medium">✓ En stock — Livraison rapide au Maroc</span>
            )}
          </p>

          {/* CTA — link to full product page */}
          <div className="flex flex-col gap-2 mt-auto">
            <Link
              href={`/product/${product.slug}`}
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-[#1A1A1A] hover:bg-[#8C1A2B] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors duration-200"
            >
              Voir la fiche complète
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

// ── Reusable ProductCard Component (Luma & Living Aesthetic) ───
export function ProductCard({
  product,
  className,
  onAddToCart,
  onWishlist,
  isWishlisted = false,
  priority = false,
  viewMode = "grid",
}: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(isWishlisted)
  const [cartAdded, setCartAdded] = useState(false)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const [imgError, setImgError] = useState(false)

  // Sync initial wishlist state from localStorage
  useEffect(() => {
    if (!isWishlisted) {
      try {
        const stored = JSON.parse(localStorage.getItem("wishlist") ?? "[]")
        if (Array.isArray(stored) && stored.includes(product.id)) {
          setWishlisted(true)
        }
      } catch {
        // ignore
      }
    }
  }, [product.id, isWishlisted])

  const discountPct =
    product.compare_at_price && product.compare_at_price > product.price
      ? calculateDiscount(product.price, product.compare_at_price)
      : 0

  const isOutOfStock =
    product.stock !== undefined && product.stock !== null && product.stock <= 0
  const hasImage = Boolean(product.primary_image) && !imgError

  // ── Handlers ──────────────────────────────────────────────
  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const nextState = await toggleWishlistProduct(product.id)
    setWishlisted(nextState)
    onWishlist?.(product)
  }

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return
    setCartAdded(true)
    await addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compare_at_price: product.compare_at_price,
      image: product.primary_image,
      quantity: 1,
      max_quantity: product.stock ?? 99,
    })
    onAddToCart?.(product)
    setTimeout(() => setCartAdded(false), 1500)
  }

  // ── LIST VIEW MODE ─────────────────────────────────────────
  if (viewMode === "list") {
    return (
      <div className={cn("group relative flex flex-col sm:flex-row gap-5 p-4 rounded-2xl bg-white/70 hover:bg-white border border-stone-200/60 hover:shadow-md transition-all duration-300", className)}>
        <Link
          href={`/product/${product.slug}`}
          className="relative w-full sm:w-44 aspect-square rounded-xl bg-[#F4EFEA] overflow-hidden shrink-0 flex items-center justify-center"
        >
          {discountPct > 0 ? (
            <DiscountBadge pct={discountPct} />
          ) : product.is_new_arrival ? (
            <NewBadge />
          ) : null}

          {hasImage ? (
            <Image
              src={product.primary_image!}
              alt={product.name}
              fill
              sizes="176px"
              className="object-contain p-3 group-hover:scale-105 transition-transform duration-500 ease-out"
              unoptimized
              onError={() => setImgError(true)}
            />
          ) : (
            <ImagePlaceholder />
          )}
        </Link>

        <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#8C827A] mb-1">
              {product.category_name || product.brand_name || "Fournitures"}
            </p>
            <Link href={`/product/${product.slug}`}>
              <h3 className="text-base font-medium text-[#1A1A1A] hover:text-[#8C1A2B] leading-snug line-clamp-2 transition-colors">
                {product.name}
              </h3>
            </Link>
            <div className="mt-2">
              <StarRating
                rating={product.average_rating ?? product.rating_avg ?? 4.8}
                count={product.review_count ?? 12}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-[#1A1A1A]">
                {formatPrice(product.price)}
              </span>
              {discountPct > 0 && product.compare_at_price && (
                <span className="text-xs text-stone-400 line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleWishlist}
                className={cn(
                  "w-9 h-9 rounded-full bg-white shadow-xs border border-stone-200/80 flex items-center justify-center transition-all cursor-pointer",
                  wishlisted ? "text-[#8C1A2B] border-[#8C1A2B]/30" : "text-stone-600 hover:text-[#1A1A1A]"
                )}
                aria-label={wishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Heart className="w-4 h-4" fill={wishlisted ? "#8C1A2B" : "none"} />
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="h-9 px-4 rounded-xl bg-[#1A1A1A] hover:bg-[#8C1A2B] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {cartAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Ajouté</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Ajouter</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── GRID VIEW MODE (Matching image_a4f146.jpg) ──────────────
  return (
    <div className={cn("group relative flex flex-col", className)}>
      {/* Product Image Frame */}
      <div className="relative aspect-square w-full rounded-2xl bg-[#F4EFEA] overflow-hidden flex items-center justify-center transition-shadow duration-300">
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 flex items-center justify-center"
          aria-label={`${product.name} — ${formatPrice(product.price)}`}
        >
          {hasImage ? (
            <Image
              src={product.primary_image!}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-4 sm:p-5 transition-transform duration-500 ease-out group-hover:scale-105"
              priority={priority}
              unoptimized
              onError={() => setImgError(true)}
            />
          ) : (
            <ImagePlaceholder />
          )}
        </Link>

        {/* Badges — Top Left */}
        {discountPct > 0 ? (
          <DiscountBadge pct={discountPct} />
        ) : product.is_new_arrival ? (
          <NewBadge />
        ) : null}

        {/* ── Top-Right Icon Stack ────────────────────────────── */}
        <div
          className="absolute top-3 right-3 z-20 flex flex-col items-center gap-1.5"
          aria-label="Actions produit"
        >
          {/* Heart / Wishlist Icon — Clean White Circle with Subtle Shadow */}
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={wishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
            className={cn(
              "w-8 h-8 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center cursor-pointer",
              "transition-all duration-200 hover:scale-110 active:scale-95",
              wishlisted ? "text-[#8C1A2B]" : "text-[#1A1A1A] hover:text-[#8C1A2B]"
            )}
          >
            <Heart
              className="w-4 h-4 stroke-[1.75]"
              fill={wishlisted ? "#8C1A2B" : "none"}
            />
          </button>

          {/* Quick Add to Cart — White Circle with Glow that reveals on card hover */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center cursor-pointer",
              "shadow-[0_2px_10px_rgba(0,0,0,0.12)] transition-all duration-200",
              "opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0",
              cartAdded
                ? "bg-[#8C1A2B] text-white opacity-100 translate-y-0"
                : "bg-white text-[#1A1A1A] hover:bg-[#8C1A2B] hover:text-white hover:scale-110 active:scale-95"
            )}
          >
            {cartAdded ? (
              <Check className="w-4 h-4" strokeWidth={2.5} />
            ) : (
              <ShoppingCart className="w-3.5 h-3.5 stroke-[1.75]" />
            )}
          </button>

          {/* Quick View Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setQuickViewOpen(true)
            }}
            aria-label="Aperçu rapide"
            className="w-8 h-8 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center text-[#1A1A1A] hover:text-[#8C1A2B] transition-all duration-200 hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 stroke-[1.75]" />
          </button>
        </div>

        {/* Out-of-stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-[#F4EFEA]/80 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <span className="px-3 py-1 text-[11px] font-bold text-stone-700 bg-white/90 rounded-full shadow-xs">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      {/* ── Product Details (Below Image) ────────────────────── */}
      <div className="mt-3 flex flex-col gap-1 px-0.5">
        {/* Small Light Gray Category Text */}
        <p className="text-[11px] font-medium text-[#8C827A] uppercase tracking-wider truncate">
          {product.category_name || product.brand_name || "Fournitures"}
        </p>

        {/* Product Title (Dark, Clean Sans-Serif, Truncated to 1-2 Lines) */}
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="text-[14px] font-medium text-[#1A1A1A] leading-snug line-clamp-2 min-h-[2.5em] group-hover:text-[#8C1A2B] transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        {/* Star Rating Component (Yellow Stars + Score + Review Count) */}
        <div className="mt-0.5">
          <StarRating
            rating={product.average_rating ?? product.rating_avg ?? 4.8}
            count={product.review_count ?? 12}
          />
        </div>

        {/* Price (Bold, Dark Text) */}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-[15px] sm:text-[16px] font-bold text-[#1A1A1A] tracking-tight">
            {formatPrice(product.price)}
          </span>
          {discountPct > 0 && product.compare_at_price && (
            <span className="text-xs text-stone-400 line-through font-normal">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        product={product}
        discountPct={discountPct}
      />
    </div>
  )
}

// ── ProductCard Skeleton ───────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square w-full rounded-2xl bg-stone-200/60 animate-pulse" />
      <div className="flex flex-col gap-2 px-0.5">
        <div className="h-3 w-1/3 bg-stone-200/70 rounded animate-pulse" />
        <div className="h-4 w-full bg-stone-200/70 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-stone-200/70 rounded animate-pulse" />
        <div className="h-4 w-20 bg-stone-200/70 rounded mt-1 animate-pulse" />
      </div>
    </div>
  )
}
