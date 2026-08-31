"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Heart, ShoppingCart, Star, Check, Package, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { cn, formatPrice, calculateDiscount } from "@/lib/utils"
import { Dialog } from "@/components/ui/Dialog"
import type { ProductListItem } from "@/types"
import { addToCart } from "@/lib/cart"
import { toggleWishlistProduct } from "@/lib/wishlist"

// ── Types ─────────────────────────────────────────────────────
interface ProductCardProps {
  product: ProductListItem
  className?: string
  onAddToCart?: (product: ProductListItem) => void
  onWishlist?: (product: ProductListItem) => void
  isWishlisted?: boolean
  priority?: boolean
}

// ── Star Rating ───────────────────────────────────────────────
function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5" aria-label={`Note: ${rating} sur 5`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "w-3.5 h-3.5",
              star <= Math.round(rating)
                ? "fill-[var(--color-accent)] text-[var(--color-accent)]"
                : "fill-slate-200 text-slate-200"
            )}
          />
        ))}
      </div>
      {count > 0 && (
        <span className="text-[11px] text-slate-500 font-medium">({count})</span>
      )}
    </div>
  )
}

// ── Discount Badge ────────────────────────────────────────────
function DiscountBadge({ pct }: { pct: number }) {
  return (
    <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 text-[10px] font-black text-white bg-[#C0392B] rounded-md shadow-xs leading-tight">
      -{pct}%
    </span>
  )
}

// ── New Badge ─────────────────────────────────────────────────
function NewBadge() {
  return (
    <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 text-[10px] font-bold text-slate-900 bg-[#C9A227] rounded-md shadow-xs leading-tight">
      NOUVEAU
    </span>
  )
}

// ── Image placeholder ─────────────────────────────────────────
function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100/90 text-slate-400 p-4 text-center select-none",
        className
      )}
    >
      <div className="w-11 h-11 rounded-xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center mb-1 text-slate-400">
        <Package className="w-5 h-5 stroke-[1.5]" />
      </div>
      <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">ProExcel</span>
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
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Image */}
        <div className="relative w-full sm:w-44 aspect-square bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-200/80">
          {hasImage ? (
            <Image
              src={product.primary_image!}
              alt={product.name}
              fill
              className="object-cover"
              sizes="176px"
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
          {/* Rating */}
          {product.review_count > 0 && (
            <div className="mb-3">
              <StarRating rating={product.average_rating} count={product.review_count} />
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2.5 mb-4 flex-wrap">
            <span className="text-2xl font-bold text-[#8C1A2B] leading-none">
              {formatPrice(product.price)}
            </span>
            {discountPct > 0 && product.compare_at_price && (
              <span className="text-[13px] text-slate-400 line-through leading-none">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>

          {/* Stock status */}
          <p className="text-[12px] mb-5">
            {isOutOfStock ? (
              <span className="text-rose-600 font-medium">Rupture de stock</span>
            ) : (
              <span className="text-emerald-600 font-medium">✓ En stock</span>
            )}
          </p>

          {/* CTA — link to full product page */}
          <div className="flex flex-col gap-2 mt-auto">
            <Link
              href={`/product/${product.slug}`}
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-[#8C1A2B] hover:bg-[#5E0F1D] text-white text-sm font-semibold rounded-xl transition-colors duration-150"
            >
              Voir le produit complet
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

// ── Reusable ProductCard Component ─────────────────────────────
export function ProductCard({
  product,
  className,
  onAddToCart,
  onWishlist,
  isWishlisted = false,
  priority = false,
}: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(isWishlisted)
  const [cartAdded, setCartAdded] = useState(false)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const [imgError, setImgError] = useState(false)

  // Sync initial wishlist state from localStorage after mount
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

  return (
    <div className={cn("group relative block", className)}>
      <Link
        href={`/product/${product.slug}`}
        className="block"
        aria-label={`${product.name} — ${formatPrice(product.price)}`}
      >
        {/* White background, rounded corners container */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300">
          
          {/* Framed Image Container with Hover Scale Zoom */}
          <div className="relative aspect-square bg-[#FBFBFB] rounded-xl border border-slate-200/70 overflow-hidden">

            {/* Badges — Top Left */}
            {discountPct > 0 ? (
              <DiscountBadge pct={discountPct} />
            ) : product.is_new_arrival ? (
              <NewBadge />
            ) : null}

            {/* Product Image with smooth scale zoom on hover */}
            {hasImage ? (
              <Image
                src={product.primary_image!}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                priority={priority}
                unoptimized
                onError={() => setImgError(true)}
              />
            ) : (
              <ImagePlaceholder />
            )}

            {/* ── Top-Right Icon Stack ────────────────────────────── */}
            {/* 1. Cart Icon: white circle with glow effect, reveals on hover positioned directly above Heart */}
            {/* 2. Heart Icon: Static red background with white stroke */}
            <div
              className="absolute top-2.5 right-2.5 z-20 flex flex-col items-center gap-1.5"
              aria-label="Actions produit"
            >
              {/* Cart Icon inside a white circle with glow effect — reveals on hover above heart */}
              <button
                type="button"
                onClick={handleAddToCart}
                aria-label={isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
                className={cn(
                  "w-8 h-8 rounded-full bg-white text-[#8C1A2B] flex items-center justify-center cursor-pointer",
                  "shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95",
                  "transition-all duration-200 ease-out",
                  cartAdded
                    ? "opacity-100 translate-y-0 pointer-events-auto bg-[#8C1A2B] text-white"
                    : "opacity-0 -translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto"
                )}
              >
                {cartAdded ? (
                  <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                ) : (
                  <ShoppingCart
                    className={cn("w-4 h-4 text-inherit", isOutOfStock && "opacity-40")}
                    strokeWidth={2}
                  />
                )}
              </button>

              {/* Static Heart Icon — Dark Red Background with White Stroke */}
              <button
                type="button"
                onClick={handleWishlist}
                aria-label={wishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
                className={cn(
                  "w-8 h-8 rounded-full bg-[#8C1A2B] hover:bg-[#5E0F1D] text-white flex items-center justify-center shadow-md",
                  "transition-all duration-200 active:scale-90 cursor-pointer"
                )}
              >
                <Heart
                  className="w-4 h-4 text-white stroke-white stroke-[2]"
                  fill={wishlisted ? "#FFFFFF" : "none"}
                />
              </button>
            </div>

            {/* Out-of-stock overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex items-center justify-center">
                <span className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-full shadow-xs">
                  Rupture de stock
                </span>
              </div>
            )}
          </div>

          {/* ── Product Info & Typography ───────────────────────── */}
          <div className="pt-3 pb-1 px-1">
            {/* Small Gray Text for Category */}
            <p className="text-xs text-gray-500 font-medium mb-1 truncate">
              {product.category_name || product.brand_name || "Fournitures"}
            </p>

            {/* Dark Red Text for Product Title */}
            <h3 className="text-sm font-semibold text-[#8C1A2B] leading-snug mb-1.5 line-clamp-2 min-h-[2.4em] group-hover:text-[#5E0F1D] transition-colors duration-200">
              {product.name}
            </h3>

            {/* Bold Dark Red Text for Price */}
            <div className="flex items-baseline gap-2 flex-wrap mt-1">
              <span className="text-base sm:text-lg font-bold text-[#8C1A2B] leading-none">
                {formatPrice(product.price)}
              </span>
              {discountPct > 0 && product.compare_at_price && (
                <span className="text-xs text-gray-400 line-through leading-none">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

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
    <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-100">
      <div className="aspect-square skeleton rounded-xl border border-slate-200/60" />
      <div className="pt-3 pb-1 px-1 flex flex-col gap-2">
        <div className="h-3 w-1/3 skeleton rounded" />
        <div className="h-4 w-full skeleton rounded" />
        <div className="h-3.5 w-2/3 skeleton rounded" />
        <div className="h-5 w-24 skeleton rounded mt-1" />
      </div>
    </div>
  )
}
