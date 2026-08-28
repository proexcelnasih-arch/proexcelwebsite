"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { ProductCard } from "@/components/products/ProductCard"
import { createClient } from "@/lib/supabase/client"
import { formatProductListItem } from "@/lib/supabase/formatters"
import type { ProductListItem } from "@/types"

import { getWishlistProductIds, clearWishlist } from "@/lib/wishlist"
import { addToCart } from "@/lib/cart"

export function WishlistClient() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [wishlistedProducts, setWishlistedProducts] = useState<ProductListItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  async function loadWishlist() {
    try {
      const ids = await getWishlistProductIds()
      setWishlistIds(ids)

      if (ids.length > 0) {
        const supabase = createClient()
        const { data } = await supabase
          .from("products")
          .select("*, product_images(url, is_primary, display_order), categories(name, slug), brands(name, slug)")
          .in("id", ids)
          .eq("is_active", true)

        if (data) {
          setWishlistedProducts(data.map((p) => formatProductListItem(p as any)))
        } else {
          setWishlistedProducts([])
        }
      } else {
        setWishlistedProducts([])
      }
    } catch {
      setWishlistIds([])
      setWishlistedProducts([])
    } finally {
      setIsLoaded(true)
    }
  }

  useEffect(() => {
    loadWishlist()
    function handleStorageChange() {
      loadWishlist()
    }
    window.addEventListener("wishlist-updated", handleStorageChange)
    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("wishlist-updated", handleStorageChange)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  async function handleClearWishlist() {
    await clearWishlist()
    setWishlistIds([])
    setWishlistedProducts([])
  }

  async function handleAddAllToCart() {
    for (const product of wishlistedProducts) {
      await addToCart({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compare_at_price: product.compare_at_price,
        image: product.primary_image,
        quantity: 1,
      })
    }
  }

  if (!isLoaded) {
    return (
      <div className="bg-[var(--color-background)] min-h-[60vh] py-12 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-[var(--color-background)] min-h-screen py-6 lg:py-10">
      <div className="container-site">
        <Breadcrumb items={[{ label: "Boutique", href: "/boutique" }, { label: "Liste de souhaits" }]} />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 mb-8 pb-6 border-b border-[var(--color-border)]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] flex items-center justify-center">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <h1 className="font-display font-bold text-2xl lg:text-3xl text-slate-900">
                Ma Liste de Souhaits
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Retrouvez et commandez facilement tous vos articles sauvegardés.
            </p>
          </div>

          {wishlistedProducts.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearWishlist}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-600 hover:border-red-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vider la liste</span>
              </button>

              <button
                type="button"
                onClick={handleAddAllToCart}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:bg-[var(--color-primary-dark)] transition-colors shadow-xs cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Tout ajouter au panier</span>
              </button>
            </div>
          )}
        </div>

        {/* Grid or Empty State */}
        {wishlistedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            <AnimatePresence>
              {wishlistedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 lg:p-16 text-center border border-[var(--color-border)] shadow-xs flex flex-col items-center max-w-xl mx-auto my-8">
            <div className="w-20 h-20 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] text-[var(--color-primary)] flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 stroke-[1.5]" />
            </div>

            <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 mb-2">
              Votre liste de souhaits est vide
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-8 leading-relaxed">
              Explorez notre catalogue et cliquez sur le cœur de vos articles préférés pour les retrouver ici à tout moment.
            </p>

            <Link
              href="/boutique"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-primary-dark)] transition-colors shadow-md hover:shadow-lg"
            >
              <span>Découvrir la boutique</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
