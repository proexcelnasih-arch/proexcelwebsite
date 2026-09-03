"use client"

import Image from "next/image"
import Link from "next/link"
import React, { useState, useEffect } from "react"
import { Heart, ShoppingCart, Star, Check, Package } from "lucide-react"
import { cn, formatPrice, calculateDiscount } from "@/lib/utils"
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

// ── Star Rating (Minimalist Compact Stars) ────────────────────
function StarRating({ rating, count }: { rating: number; count: number }) {
  const displayRating = rating > 0 ? rating.toFixed(1) : "4.8"
  const displayCount = count > 0 ? count : 12

  return (
    <div className="flex items-center gap-1 text-[11px] text-stone-500">
      <div className="flex items-center gap-0.5" aria-label={`Note: ${displayRating} sur 5`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "w-2.5 h-2.5 sm:w-3 sm:h-3",
              star <= Math.round(Number(displayRating))
                ? "fill-[#F59E0B] text-[#F59E0B]"
                : "fill-stone-200 text-stone-200"
            )}
          />
        ))}
      </div>
      <span className="font-semibold text-stone-900 text-[10px] sm:text-[11px] ml-0.5">{displayRating}</span>
      <span className="text-[10px] text-stone-400">({displayCount})</span>
    </div>
  )
}

// ── Clean Discount Pill Badge ─────────────────────────────────
function DiscountBadge({ pct }: { pct: number }) {
  return (
    <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white bg-[#D9383A] rounded-full shadow-2xs tracking-tight leading-tight">
      -{pct}%
    </span>
  )
}

// ── New Arrival Badge ─────────────────────────────────────────
function NewBadge() {
  return (
    <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-stone-800 bg-stone-100 rounded-full shadow-2xs tracking-tight leading-tight border border-stone-200">
      NOUVEAU
    </span>
  )
}

// ── Image Placeholder ─────────────────────────────────────────
function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center bg-stone-50 text-stone-400 p-3 text-center select-none",
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-white shadow-2xs flex items-center justify-center mb-1 text-stone-400 border border-stone-200/60">
        <Package className="w-4 h-4 stroke-[1.5]" />
      </div>
      <span className="text-[9px] font-medium tracking-widest text-stone-400 uppercase">ProExcel</span>
    </div>
  )
}

// ── Reusable ProductCard Component (Clean White Minimalist) ───
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
      <div className={cn("group relative flex flex-col sm:flex-row gap-4 p-3.5 rounded-2xl bg-white border border-stone-200/70 hover:border-stone-300 hover:shadow-md transition-all duration-300", className)}>
        <Link
          href={`/product/${product.slug}`}
          className="relative w-full sm:w-40 aspect-square rounded-xl bg-[#FAFAFA] border border-stone-100 overflow-hidden shrink-0 flex items-center justify-center"
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
              sizes="160px"
              className="object-contain p-3 group-hover:scale-105 transition-transform duration-300 ease-out"
              unoptimized
              onError={() => setImgError(true)}
            />
          ) : (
            <ImagePlaceholder />
          )}
        </Link>

        <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-stone-400 mb-0.5">
              {product.category_name || product.brand_name || "Fournitures"}
            </p>
            <Link href={`/product/${product.slug}`}>
              <h3 className="text-[14px] font-medium text-stone-900 hover:text-[#8C1A2B] leading-snug line-clamp-2 transition-colors">
                {product.name}
              </h3>
            </Link>
            <div className="mt-1.5">
              <StarRating
                rating={product.average_rating ?? product.rating_avg ?? 4.8}
                count={product.review_count ?? 12}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100">
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-bold text-stone-900">
                {formatPrice(product.price)}
              </span>
              {discountPct > 0 && product.compare_at_price && (
                <span className="text-xs text-stone-400 line-through font-normal">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>

            {/* Identical White Circular Buttons for Cart and Heart */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                aria-label={isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
                className={cn(
                  "w-7.5 h-7.5 rounded-full bg-white border border-stone-200 shadow-2xs hover:shadow-xs flex items-center justify-center cursor-pointer",
                  "text-stone-800 hover:text-[#8C1A2B] hover:scale-110 active:scale-95 transition-all duration-150",
                  cartAdded && "text-emerald-600 border-emerald-300"
                )}
              >
                {cartAdded ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                ) : (
                  <ShoppingCart className="w-3.5 h-3.5 stroke-[1.75]" />
                )}
              </button>

              <button
                type="button"
                onClick={handleWishlist}
                aria-label={wishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
                className={cn(
                  "w-7.5 h-7.5 rounded-full bg-white border border-stone-200 shadow-2xs hover:shadow-xs flex items-center justify-center cursor-pointer",
                  "text-stone-800 hover:text-[#8C1A2B] hover:scale-110 active:scale-95 transition-all duration-150",
                  wishlisted && "text-[#8C1A2B] border-[#8C1A2B]/30"
                )}
              >
                <Heart
                  className="w-3.5 h-3.5 stroke-[1.75]"
                  fill={wishlisted ? "#8C1A2B" : "none"}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── GRID VIEW MODE (Clean White 4/4 Aspect Ratio Image Frame) ─
  return (
    <div className={cn("group relative flex flex-col", className)}>
      {/* Product Image Frame: Aspect Ratio 4/4 (Square 1:1), Pure White with subtle border */}
      <div className="relative aspect-square w-full rounded-2xl bg-white border border-stone-100/90 overflow-hidden flex items-center justify-center shadow-2xs hover:shadow-md hover:border-stone-200 transition-all duration-300">
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
              className="object-contain p-3.5 sm:p-4 transition-transform duration-300 ease-out group-hover:scale-105"
              priority={priority}
              unoptimized
              onError={() => setImgError(true)}
            />
          ) : (
            <ImagePlaceholder />
          )}
        </Link>

        {/* Discount Badge — Top Left */}
        {discountPct > 0 ? (
          <DiscountBadge pct={discountPct} />
        ) : product.is_new_arrival ? (
          <NewBadge />
        ) : null}

        {/* ── Top-Right Icon Stack: Panier & 9alb (Identical Styling & Hover) ── */}
        <div
          className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5"
          aria-label="Actions produit"
        >
          {/* Panier (Cart Button) — White Circle with Subtle Shadow */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
            className={cn(
              "w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-xs border border-stone-200/80 shadow-2xs hover:shadow-sm flex items-center justify-center cursor-pointer",
              "text-stone-800 hover:text-[#8C1A2B] hover:scale-110 active:scale-95 transition-all duration-150",
              cartAdded && "text-emerald-600 border-emerald-300"
            )}
          >
            {cartAdded ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
            ) : (
              <ShoppingCart className="w-3.5 h-3.5 stroke-[1.75]" />
            )}
          </button>

          {/* 9alb (Heart Button) — White Circle with Subtle Shadow (Identical to Panier) */}
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={wishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
            className={cn(
              "w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-xs border border-stone-200/80 shadow-2xs hover:shadow-sm flex items-center justify-center cursor-pointer",
              "text-stone-800 hover:text-[#8C1A2B] hover:scale-110 active:scale-95 transition-all duration-150",
              wishlisted && "text-[#8C1A2B] border-[#8C1A2B]/30"
            )}
          >
            <Heart
              className="w-3.5 h-3.5 stroke-[1.75]"
              fill={wishlisted ? "#8C1A2B" : "none"}
            />
          </button>
        </div>

        {/* Out-of-stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <span className="px-3 py-1 text-[10px] font-bold text-stone-700 bg-stone-100 rounded-full shadow-2xs border border-stone-200">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      {/* ── Product Details (Below Image) ────────────────────── */}
      <div className="mt-2.5 flex flex-col gap-0.5 px-0.5">
        {/* Small Light Gray Category Text */}
        <p className="text-[10px] sm:text-[11px] font-medium text-stone-400 uppercase tracking-wider truncate">
          {product.category_name || product.brand_name || "Fournitures"}
        </p>

        {/* Product Title (Clean Sans-Serif, Compact, Truncated to 2 Lines) */}
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="text-[13px] sm:text-[13.5px] font-medium text-stone-900 leading-snug line-clamp-2 min-h-[2.4em] group-hover:text-[#8C1A2B] transition-colors duration-150">
            {product.name}
          </h3>
        </Link>

        {/* Star Rating Component */}
        <div className="mt-0.5">
          <StarRating
            rating={product.average_rating ?? product.rating_avg ?? 4.8}
            count={product.review_count ?? 12}
          />
        </div>

        {/* Price (Bold, Clean Dark Text) */}
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-[14px] sm:text-[15px] font-bold text-stone-900 tracking-tight">
            {formatPrice(product.price)}
          </span>
          {discountPct > 0 && product.compare_at_price && (
            <span className="text-[11px] text-stone-400 line-through font-normal">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── ProductCard Skeleton ───────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="aspect-square w-full rounded-2xl bg-stone-100 animate-pulse border border-stone-100" />
      <div className="flex flex-col gap-1.5 px-0.5">
        <div className="h-2.5 w-1/3 bg-stone-100 rounded animate-pulse" />
        <div className="h-3.5 w-full bg-stone-100 rounded animate-pulse" />
        <div className="h-2.5 w-1/2 bg-stone-100 rounded animate-pulse" />
        <div className="h-3.5 w-20 bg-stone-100 rounded mt-0.5 animate-pulse" />
      </div>
    </div>
  )
}
