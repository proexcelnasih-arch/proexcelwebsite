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
          className="relative w-full sm:w-48 aspect-[4/3] rounded-xl bg-[#F4EFEA] overflow-hidden shrink-0 flex items-center justify-center"
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
              sizes="192px"
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

            {/* Identical White Circular Buttons for Cart and Heart */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                aria-label={isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
                className={cn(
                  "w-8 h-8 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-md flex items-center justify-center cursor-pointer",
                  "text-[#1A1A1A] hover:text-[#8C1A2B] hover:scale-110 active:scale-95 transition-all duration-200",
                  cartAdded && "text-[#8C1A2B]"
                )}
              >
                {cartAdded ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                ) : (
                  <ShoppingCart className="w-3.5 h-3.5 stroke-[1.75]" />
                )}
              </button>

              {/* Heart */}
              <button
                type="button"
                onClick={handleWishlist}
                aria-label={wishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
                className={cn(
                  "w-8 h-8 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-md flex items-center justify-center cursor-pointer",
                  "text-[#1A1A1A] hover:text-[#8C1A2B] hover:scale-110 active:scale-95 transition-all duration-200",
                  wishlisted && "text-[#8C1A2B]"
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

  // ── GRID VIEW MODE (4/3 Aspect Ratio Image Frame) ────────────
  return (
    <div className={cn("group relative flex flex-col", className)}>
      {/* Product Image Frame: Aspect Ratio 4/3 */}
      <div className="relative aspect-[4/3] w-full rounded-2xl bg-[#F4EFEA] overflow-hidden flex items-center justify-center transition-shadow duration-300">
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
              className="object-contain p-3.5 sm:p-4 transition-transform duration-500 ease-out group-hover:scale-105"
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

        {/* ── Top-Right Icon Stack: Only Panier & 9alb (Identical Styling & Hover) ── */}
        <div
          className="absolute top-3 right-3 z-20 flex items-center gap-1.5"
          aria-label="Actions produit"
        >
          {/* Panier (Cart Button) — White Circle with Subtle Shadow */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
            className={cn(
              "w-8 h-8 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-md flex items-center justify-center cursor-pointer",
              "text-[#1A1A1A] hover:text-[#8C1A2B] hover:scale-110 active:scale-95 transition-all duration-200",
              cartAdded && "text-[#8C1A2B]"
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
              "w-8 h-8 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-md flex items-center justify-center cursor-pointer",
              "text-[#1A1A1A] hover:text-[#8C1A2B] hover:scale-110 active:scale-95 transition-all duration-200",
              wishlisted && "text-[#8C1A2B]"
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
    </div>
  )
}

// ── ProductCard Skeleton ───────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-[4/3] w-full rounded-2xl bg-stone-200/60 animate-pulse" />
      <div className="flex flex-col gap-2 px-0.5">
        <div className="h-3 w-1/3 bg-stone-200/70 rounded animate-pulse" />
        <div className="h-4 w-full bg-stone-200/70 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-stone-200/70 rounded animate-pulse" />
        <div className="h-4 w-20 bg-stone-200/70 rounded mt-1 animate-pulse" />
      </div>
    </div>
  )
}
