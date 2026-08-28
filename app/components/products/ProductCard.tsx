"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Heart, Eye, ShoppingCart, Star, ArrowRight, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { Variants } from "framer-motion"
import { cn, formatPrice, calculateDiscount } from "@/lib/utils"
import { Dialog } from "@/components/ui/Dialog"
import type { ProductListItem } from "@/types"

// ── Types ─────────────────────────────────────────────────────
interface ProductCardProps {
  product: ProductListItem
  className?: string
  onAddToCart?: (product: ProductListItem) => void
  onWishlist?: (product: ProductListItem) => void
  isWishlisted?: boolean
  priority?: boolean
}

// ── Animation variants for the icon stack ─────────────────────
const stackContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0 },
  },
}

const stackItemVariants: Variants = {
  hidden: { opacity: 0, x: 10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.16, ease: "easeOut" as const },
  },
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
                : "fill-[var(--color-neutral-200)] text-[var(--color-neutral-200)]"
            )}
          />
        ))}
      </div>
      {count > 0 && (
        <span className="text-[11px] text-[var(--color-text-secondary)]">({count})</span>
      )}
    </div>
  )
}

// ── Discount Badge ────────────────────────────────────────────
function DiscountBadge({ pct }: { pct: number }) {
  return (
    <span className="absolute top-2.5 left-2.5 z-10 px-1.5 py-0.5 text-[10px] font-bold text-white bg-[var(--color-discount)] rounded-[3px] shadow-sm leading-tight">
      -{pct}%
    </span>
  )
}

// ── New Badge ─────────────────────────────────────────────────
function NewBadge() {
  return (
    <span className="absolute top-2.5 left-2.5 z-10 px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-text-primary)] bg-[var(--color-accent)] rounded-[3px] shadow-sm leading-tight">
      NOUVEAU
    </span>
  )
}

// ── Image placeholder SVG ─────────────────────────────────────
function ImagePlaceholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface-2)]">
      <div className="w-10 h-10 text-[var(--color-neutral-300)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9l4-4 4 4 4-4 4 4" />
          <circle cx="8.5" cy="13.5" r="1.5" />
        </svg>
      </div>
    </div>
  )
}

// ── Icon circle button ────────────────────────────────────────
// White circle with primary-colored icon. Fills primary on hover/active.
interface IconCircleButtonProps {
  onClick: (e: React.MouseEvent) => void
  label: string
  active?: boolean
  activeColor?: "primary" | "accent"
  children: React.ReactNode
}

function IconCircleButton({
  onClick,
  label,
  active = false,
  children,
}: IconCircleButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileTap={{ scale: 0.88 }}
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shadow-md",
        "transition-colors duration-150",
        active
          ? "bg-[var(--color-primary)] text-white"
          : "bg-[var(--color-surface)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
      )}
    >
      {children}
    </motion.button>
  )
}

// ── Quick View Modal ──────────────────────────────────────────
// Rendered as a sibling of <Link> (NOT inside it) to prevent
// overlay click events from bubbling up through the anchor and
// triggering navigation.

interface QuickViewModalProps {
  open: boolean
  onClose: () => void
  product: ProductListItem
  discountPct: number
}

function QuickViewModal({ open, onClose, product, discountPct }: QuickViewModalProps) {
  const isOutOfStock =
    product.stock !== undefined && product.stock !== null && product.stock <= 0

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
        <div className="relative w-full sm:w-44 aspect-square bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] overflow-hidden shrink-0">
          {product.primary_image ? (
            <Image
              src={product.primary_image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="176px"
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
            <span className="text-2xl font-bold text-[var(--color-primary)] leading-none">
              {formatPrice(product.price)}
            </span>
            {discountPct > 0 && product.compare_at_price && (
              <span className="text-[13px] text-[var(--color-text-secondary)] line-through leading-none">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>

          {/* Stock status */}
          <p className="text-[12px] mb-5">
            {isOutOfStock ? (
              <span className="text-[var(--color-error)] font-medium">Rupture de stock</span>
            ) : (
              <span className="text-[var(--color-success)] font-medium">✓ En stock</span>
            )}
          </p>

          {/* CTA — link to full product page */}
          <div className="flex flex-col gap-2 mt-auto">
            <Link
              href={`/product/${product.slug}`}
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-[var(--radius-md)] hover:bg-[var(--color-primary-dark)] transition-colors duration-150"
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

import { addToCart } from "@/lib/cart"
import { getWishlistProductIds, toggleWishlistProduct } from "@/lib/wishlist"

// ── THE ONE AND ONLY ProductCard ──────────────────────────────
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
  const [hovered, setHovered] = useState(false)

  // Sync initial wishlist state
  useState(() => {
    if (typeof window !== "undefined" && !isWishlisted) {
      try {
        const stored = JSON.parse(localStorage.getItem("wishlist") ?? "[]")
        if (Array.isArray(stored) && stored.includes(product.id)) {
          setWishlisted(true)
        }
      } catch {
        // ignore
      }
    }
  })

  const discountPct =
    product.compare_at_price && product.compare_at_price > product.price
      ? calculateDiscount(product.price, product.compare_at_price)
      : 0

  const isOutOfStock =
    product.stock !== undefined && product.stock !== null && product.stock <= 0
  const hasImage = !!product.primary_image

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

  function handleQuickView(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setQuickViewOpen(true)
  }

  return (
    // Outer wrapper: holds both Link and QuickViewModal as siblings.
    // QuickViewModal MUST NOT be nested inside <Link> — fixed overlay
    // click events would bubble up through <a> and trigger navigation.
    <div className={cn("group relative block", className)}>
      <Link
        href={`/product/${product.slug}`}
        className="block"
        aria-label={`${product.name} — ${formatPrice(product.price)}`}
      >
        {/* Static Clean Outer Card Container */}
        <div className="bg-white rounded-2xl p-2 sm:p-2.5">
          {/* ── Framed Image container (Clean neutral frame, pure image zoom on hover) ── */}
          <div className="relative aspect-square bg-[#FBFBFB] rounded-xl border border-[var(--color-border)]/80 overflow-hidden">

            {/* Badges — top-left, unchanged position */}
            {discountPct > 0 ? (
              <DiscountBadge pct={discountPct} />
            ) : product.is_new_arrival ? (
              <NewBadge />
            ) : null}

            {/* Product image with smooth zoom in/out */}
            {hasImage ? (
              <Image
                src={product.primary_image!}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-108"
                priority={priority}
              />
            ) : (
              <ImagePlaceholder />
            )}

            {/* ── Top-right corner action buttons: Cart on top, Heart (9lb) below ── */}
            <div
              className="absolute right-2.5 top-2.5 flex flex-col gap-2 z-10"
              aria-label="Actions produit"
            >
              {/* 1 — Add to cart (Top corner) */}
              <IconCircleButton
                onClick={handleAddToCart}
                label={isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
                active={cartAdded}
              >
                {cartAdded ? (
                  <Check className="w-3.5 h-3.5 text-[var(--color-success)]" strokeWidth={2.5} />
                ) : (
                  <ShoppingCart
                    className={cn("w-3.5 h-3.5", isOutOfStock && "opacity-40")}
                    strokeWidth={1.75}
                  />
                )}
              </IconCircleButton>

              {/* 2 — Wishlist / 9lb (Below Cart) */}
              <IconCircleButton
                onClick={handleWishlist}
                label={wishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
                active={wishlisted}
              >
                <Heart
                  className="w-3.5 h-3.5"
                  strokeWidth={1.75}
                  fill={wishlisted ? "currentColor" : "none"}
                />
              </IconCircleButton>
            </div>

            {/* Out-of-stock overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                <span className="px-2.5 py-1 text-[11px] font-semibold text-[var(--color-text-muted)] bg-white border border-[var(--color-border)] rounded-full shadow-xs">
                  Rupture de stock
                </span>
              </div>
            )}
          </div>

          {/* ── Product info (Clean & classy without bottom button) ── */}
          <div className="pt-3 pb-1 px-1">
            {/* Category / brand */}
            {(product.category_name || product.brand_name) && (
              <p className="text-[11px] text-[var(--color-text-secondary)] font-medium mb-1 truncate">
                {product.brand_name ?? product.category_name}
              </p>
            )}

            {/* Name — Turns red/burgundy on hover */}
            <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)] leading-snug mb-1.5 line-clamp-2 min-h-[2.4em] group-hover:text-[var(--color-primary)] transition-colors duration-200">
              {product.name}
            </h3>

            {/* Price row */}
            <div className="flex items-baseline gap-2 flex-wrap mt-1.5">
              <span className="text-base font-bold leading-none text-[var(--color-primary)]">
                {formatPrice(product.price)}
              </span>
              {discountPct > 0 && product.compare_at_price && (
                <span className="text-[12px] text-[var(--color-text-secondary)] line-through leading-none">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Quick View Modal — sibling of Link, not nested inside it */}
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
    <div className="bg-white rounded-2xl p-2 sm:p-2.5">
      <div className="aspect-square skeleton rounded-xl border border-[var(--color-border)]/60" />
      <div className="pt-3 pb-1 px-1 flex flex-col gap-2">
        <div className="h-3 w-1/3 skeleton rounded" />
        <div className="h-4 w-full skeleton rounded" />
        <div className="h-3.5 w-2/3 skeleton rounded" />
        <div className="h-5 w-24 skeleton rounded mt-1" />
      </div>
    </div>
  )
}
