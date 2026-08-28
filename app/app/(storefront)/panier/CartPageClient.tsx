"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatPrice } from "@/lib/utils"
import type { CartItem } from "@/types"

// ── Cart localStorage helpers ──────────────────────────────────
const CART_KEY = "cart"

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    const parsed = JSON.parse(raw ?? '{"items":[]}')
    return parsed.items ?? []
  } catch {
    return []
  }
}

function persistCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify({ items }))
    window.dispatchEvent(new Event("cart-updated"))
  } catch {
    // ignore storage error
  }
}

import { createClient } from "@/lib/supabase/client"

// ── Shipping ───────────────────────────────────────────────────
const SHIPPING = 25
const FREE_THRESHOLD = 299

// ── CartPageClient ─────────────────────────────────────────────
export function CartPageClient() {
  // null = not yet hydrated (avoid SSR mismatch)
  const [items, setItems] = useState<CartItem[] | null>(null)

  useEffect(() => {
    const initial = readCart()
    setItems(initial)
    if (initial.length > 0) {
      try {
        const supabase = createClient()
        const productIds = initial.map((i) => i.id)
        supabase
          .from("products")
          .select("id, price, compare_at_price, stock_quantity, is_active")
          .in("id", productIds)
          .then(({ data }) => {
            if (data && data.length > 0) {
              const priceMap = new Map(data.map((p) => [p.id, p]))
              const updated = initial.map((item) => {
                const dbProduct = priceMap.get(item.id)
                if (dbProduct) {
                  return {
                    ...item,
                    price: dbProduct.price,
                    compare_at_price: dbProduct.compare_at_price,
                    max_quantity: dbProduct.stock_quantity,
                  }
                }
                return item
              })
              setItems(updated)
              persistCart(updated)
            }
          })
      } catch {
        // ignore offline error
      }
    }
  }, [])

  const updateQty = useCallback((id: string, delta: number) => {
    setItems((prev) => {
      if (!prev) return prev
      const next = prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Math.min(item.quantity + delta, item.max_quantity ?? 99)) }
          : item
      )
      queueMicrotask(() => persistCart(next))
      return next
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      if (!prev) return prev
      const next = prev.filter((item) => item.id !== id)
      queueMicrotask(() => persistCart(next))
      return next
    })
  }, [])

  // ── Loading skeleton ───────────────────────────────────────
  if (items === null) {
    return (
      <div className="container-site py-16 flex justify-center">
        <div className="spinner" aria-label="Chargement du panier" />
      </div>
    )
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const shipping = subtotal >= FREE_THRESHOLD ? 0 : SHIPPING
  const total = subtotal + shipping
  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  // ── Empty cart ─────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="container-site py-20 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] flex items-center justify-center mb-6">
          <ShoppingBag className="w-9 h-9 text-[var(--color-primary)]" strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text-primary)] mb-3">
          Votre panier est vide
        </h1>
        <p className="text-[var(--color-text-secondary)] mb-8 max-w-sm leading-relaxed">
          Découvrez nos livres scolaires, papeterie et fournitures de qualité.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 h-12 px-7 bg-[var(--color-primary)] text-white font-bold rounded-[var(--radius-lg)] hover:bg-[var(--color-primary-dark)] transition-colors shadow-sm"
          >
            Découvrir la boutique
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/nouveautes"
            className="inline-flex items-center gap-2 h-12 px-6 border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold rounded-[var(--radius-lg)] hover:bg-[color-mix(in_srgb,var(--color-primary)_6%,transparent)] transition-colors"
          >
            Voir les nouveautés
          </Link>
        </div>
      </div>
    )
  }

  // ── Cart with items ────────────────────────────────────────
  return (
    <div className="container-site py-8 lg:py-12">
      {/* Title */}
      <div className="mb-8">
        <p className="text-eyebrow mb-1.5">Mes achats</p>
        <h1 className="text-section-title">
          Mon panier{" "}
          <span className="text-[var(--color-text-muted)] text-lg font-normal">
            ({itemCount} article{itemCount > 1 ? "s" : ""})
          </span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-10 items-start">
        {/* ── Items list ──────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex gap-4 sm:gap-5 p-4 sm:p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] hover:border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] transition-colors"
                aria-label={item.name}
              >
                {/* Image */}
                <Link href={`/product/${item.slug}`} tabIndex={-1} aria-hidden="true">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-surface-1)]">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ShoppingBag className="w-7 h-7 text-[var(--color-neutral-300)]" strokeWidth={1} />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.slug}`}
                    className="text-[13px] sm:text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-snug block mb-1.5"
                  >
                    {item.name}
                  </Link>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-[var(--color-primary)]">
                      {formatPrice(item.price)}
                    </span>
                    {item.compare_at_price && item.compare_at_price > item.price && (
                      <span className="text-xs text-[var(--color-text-muted)] line-through">
                        {formatPrice(item.compare_at_price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Controls: qty + total + remove */}
                <div className="flex flex-col items-end justify-between gap-3 shrink-0">
                  {/* Qty control */}
                  <div
                    className="flex items-center border border-[var(--color-border-strong)] rounded-[var(--radius-md)] overflow-hidden"
                    role="group"
                    aria-label={`Quantité pour ${item.name}`}
                  >
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, -1)}
                      disabled={item.quantity <= 1}
                      aria-label="Diminuer"
                      className="w-8 h-8 flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] hover:text-[var(--color-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-[var(--color-text-primary)] select-none">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, 1)}
                      disabled={item.quantity >= (item.max_quantity ?? 99)}
                      aria-label="Augmenter"
                      className="w-8 h-8 flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] hover:text-[var(--color-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  </div>

                  {/* Line total */}
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">
                    {formatPrice(item.price * item.quantity)}
                  </p>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Supprimer ${item.name}`}
                    className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span className="hidden sm:block">Supprimer</span>
                  </button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>

          {/* Continue shopping */}
          <Link
            href="/boutique"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors mt-2 self-start"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Continuer mes achats
          </Link>
        </div>

        {/* ── Order summary ────────────────────────────────── */}
        <div className="lg:sticky lg:top-[calc(var(--height-header)+1.5rem)] self-start">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[var(--color-border)]">
              <h2 className="font-display font-semibold text-[var(--color-text-primary)]">
                Résumé de commande
              </h2>
            </div>

            {/* Rows */}
            <div className="px-6 py-5 flex flex-col gap-3.5">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">
                  Sous-total ({itemCount} article{itemCount > 1 ? "s" : ""})
                </span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">Livraison</span>
                {shipping === 0 ? (
                  <span className="font-semibold text-[var(--color-success)]">Gratuite 🎉</span>
                ) : (
                  <span className="font-semibold">{formatPrice(shipping)}</span>
                )}
              </div>

              {shipping > 0 && (
                <div className="flex items-center gap-1.5 py-2 px-3 bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] rounded-[var(--radius-md)]">
                  <Tag className="w-3.5 h-3.5 text-[var(--color-accent-dark)] shrink-0" />
                  <p className="text-[11px] text-[var(--color-accent-dark)] font-medium">
                    Livraison gratuite dès {formatPrice(FREE_THRESHOLD)} —{" "}
                    <span className="font-bold">
                      il vous manque {formatPrice(FREE_THRESHOLD - subtotal)}
                    </span>
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between font-bold text-base pt-3 mt-0.5 border-t border-[var(--color-border)]">
                <span className="text-[var(--color-text-primary)]">Total estimé</span>
                <span className="text-[var(--color-primary)]">{formatPrice(total)}</span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)] -mt-1">
                Paiement à la livraison · Taxes incluses
              </p>
            </div>

            {/* CTA */}
            <div className="px-6 pb-6 flex flex-col gap-2.5">
              <Link
                href="/checkout"
                id="cart-to-checkout"
                className="flex items-center justify-center gap-2 w-full h-13 py-3.5 bg-[var(--color-primary)] text-white font-bold text-base rounded-[var(--radius-lg)] hover:bg-[var(--color-primary-dark)] transition-colors shadow-sm"
              >
                Passer la commande
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-center text-[11px] text-[var(--color-text-muted)]">
                🔒 Paiement sécurisé à la livraison
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
