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
  RotateCcw,
  CreditCard,
  Plus,
  Minus,
  CheckCircle2,
  Share2,
  ZoomIn,
  Check,
  Sparkles,
  Award,
  Package,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { ProductCard } from "@/components/products/ProductCard"
import { formatPrice, calculateDiscount, cn } from "@/lib/utils"
import type { ProductListItem, ProductWithDetails } from "@/types"

interface ProductDetailViewProps {
  product: ProductWithDetails | any
  relatedProducts: ProductListItem[]
}

type TabKey = "description" | "specifications" | "details" | "shipping"

import { addToCart } from "@/lib/cart"
import { getWishlistProductIds, toggleWishlistProduct } from "@/lib/wishlist"

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>("description")

  useEffect(() => {
    getWishlistProductIds().then((ids) => {
      setIsWishlisted(ids.includes(product.id))
    })
  }, [product.id])

  const gallery: string[] =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.map((img: any) => (typeof img === "string" ? img : img.url)).filter(Boolean)
      : product.primary_image
      ? [product.primary_image]
      : ["https://images.unsplash.com/photo-1544816155-12df9643f363?w=800"]

  const currentImage = gallery[selectedImageIndex] || gallery[0] || ""
  const categoryName = product.category?.name || product.category_name || "Boutique"
  const categorySlug = product.category?.slug || product.category_name?.toLowerCase().replace(/\s+/g, "-") || "all"
  const brandName = product.brand?.name || product.brand_name
  const stockQty = product.stock_quantity ?? product.stock ?? 10
  const inStock = stockQty > 0

  const discountPct =
    product.compare_at_price && product.compare_at_price > product.price
      ? calculateDiscount(product.price, product.compare_at_price)
      : 0

  async function handleAddToCart() {
    setIsAddedToCart(true)
    await addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compare_at_price: product.compare_at_price,
      image: currentImage,
      quantity: quantity,
      max_quantity: stockQty,
    })
    setTimeout(() => setIsAddedToCart(false), 2000)
  }

  async function handleToggleWishlist() {
    const nextState = await toggleWishlistProduct(product.id)
    setIsWishlisted(nextState)
  }

  const breadcrumbItems = [
    { label: categoryName, href: `/category/${categorySlug}` },
    { label: product.name },
  ]

  const tabs: { key: TabKey; label: string }[] = [
    { key: "description", label: "Description détaillée" },
    { key: "specifications", label: "Caractéristiques" },
    { key: "details", label: "Détails & Avantages" },
    { key: "shipping", label: "Livraison & Retours" },
  ]

  return (
    <div className="bg-[var(--color-background)] min-h-screen py-6 lg:py-10">
      <div className="container-site max-w-7xl">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 lg:mb-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* ── Main Product Box (Shopify/WooCommerce Level Polish) ── */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 lg:p-12 shadow-xs mb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

            {/* ── LEFT: Image Gallery (5 cols) ──────────────── */}
            <div className="lg:col-span-6 flex flex-col gap-4 sticky top-24">
              {/* Main Display Image */}
              <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden group shadow-2xs">
                {discountPct > 0 && (
                  <span className="absolute top-3.5 left-3.5 z-10 px-3 py-1 text-xs font-black text-white bg-[var(--color-discount)] rounded-lg shadow-sm">
                    -{discountPct}%
                  </span>
                )}

                {currentImage ? (
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className={cn(
                      "object-cover transition-transform duration-300 ease-out",
                      isZoomed ? "scale-130 cursor-zoom-out" : "group-hover:scale-105 cursor-zoom-in"
                    )}
                    onClick={() => setIsZoomed(!isZoomed)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    Pas d&apos;image disponible
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="absolute bottom-3.5 right-3.5 p-2.5 rounded-full bg-white/90 text-slate-700 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Agrandir l'image"
                >
                  <ZoomIn className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>

              {/* Thumbnails strip */}
              {gallery.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={cn(
                        "relative w-20 h-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all duration-150 cursor-pointer",
                        selectedImageIndex === idx
                          ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 shadow-xs"
                          : "border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300"
                      )}
                      aria-label={`Afficher image ${idx + 1}`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: Product Info & Purchase (6 cols) ───── */}
            <div className="lg:col-span-6 flex flex-col pt-1">
              
              {/* Category, Brand & Stock Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {product.category_name && (
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-2.5 py-1 rounded-md">
                    {product.category_name}
                  </span>
                )}
                {product.brand_name && (
                  <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                    {product.brand_name}
                  </span>
                )}
                <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {product.in_stock ? "En stock au Maroc" : "Rupture"}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 leading-tight mb-3 tracking-tight">
                {product.name}
              </h1>

              {/* Ratings and SKU row */}
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-4 h-4",
                        star <= Math.round(product.average_rating)
                          ? "fill-[var(--color-accent)] text-[var(--color-accent)]"
                          : "fill-slate-200 text-slate-200"
                      )}
                      strokeWidth={1.75}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-800">
                  {product.average_rating}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  ({product.review_count} avis vérifiés)
                </span>
                {product.sku && (
                  <span className="ml-auto text-xs text-slate-400 font-mono">
                    SKU: {product.sku}
                  </span>
                )}
              </div>

              {/* Pricing Box (Elevated Shopify Card) */}
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 mb-6 flex flex-col gap-2">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[var(--color-primary)] tracking-tight">
                    {formatPrice(product.price)}
                  </span>
                  {discountPct > 0 && product.compare_at_price && (
                    <span className="text-lg text-slate-400 line-through font-medium">
                      {formatPrice(product.compare_at_price)}
                    </span>
                  )}
                  {discountPct > 0 && (
                    <span className="px-2.5 py-0.5 text-xs font-black text-white bg-[var(--color-discount)] rounded-md">
                      Économisez {formatPrice(product.compare_at_price! - product.price)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Livraison express à domicile • Paiement en espèces à la livraison</span>
                </p>
              </div>

              {/* Short Description */}
              {product.short_description && (
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {product.short_description}
                </p>
              )}

              {/* Quantity Stepper & Add to Cart (with Bounce Interactions) */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  {/* Quantity Stepper with Bounce tap */}
                  <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 h-12 shrink-0">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.82 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-11 h-full flex items-center justify-center text-slate-600 hover:text-[var(--color-primary)] disabled:opacity-30 cursor-pointer"
                      aria-label="Diminuer la quantité"
                    >
                      <Minus className="w-4 h-4" strokeWidth={2} />
                    </motion.button>
                    <span className="w-10 text-center font-bold text-sm text-slate-900 select-none">
                      {quantity}
                    </span>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.82 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-11 h-full flex items-center justify-center text-slate-600 hover:text-[var(--color-primary)] cursor-pointer"
                      aria-label="Augmenter la quantité"
                    >
                      <Plus className="w-4 h-4" strokeWidth={2} />
                    </motion.button>
                  </div>

                  {/* Primary Add To Cart Button with Bounce Press */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 350, damping: 14 }}
                    onClick={handleAddToCart}
                    className={cn(
                      "flex-1 h-12 px-6 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-colors duration-200 shadow-md cursor-pointer",
                      isAddedToCart
                        ? "bg-emerald-600 text-white"
                        : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
                    )}
                  >
                    {isAddedToCart ? (
                      <>
                        <Check className="w-4.5 h-4.5" strokeWidth={2.5} />
                        <span>Ajouté au panier !</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4.5 h-4.5" strokeWidth={1.75} />
                        <span>Ajouter au panier • {formatPrice(product.price * quantity)}</span>
                      </>
                    )}
                  </motion.button>

                  {/* Wishlist Heart Button with Bounce Pulse */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.82 }}
                    animate={{ scale: isWishlisted ? [1, 1.3, 0.95, 1] : 1 }}
                    transition={{ duration: 0.25 }}
                    onClick={handleToggleWishlist}
                    className={cn(
                      "w-12 h-12 rounded-xl border flex items-center justify-center transition-colors shrink-0 cursor-pointer shadow-2xs",
                      isWishlisted
                        ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                        : "border-slate-300 text-slate-500 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] bg-white"
                    )}
                    aria-label={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    <Heart className="w-5 h-5" strokeWidth={1.75} fill={isWishlisted ? "currentColor" : "none"} />
                  </motion.button>
                </div>

                {/* Direct COD Checkout Button with Smooth Bounce */}
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/panier"
                    onClick={handleAddToCart}
                    className="w-full h-12 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center bg-[#E5C158] hover:bg-[#d8b347] text-slate-900 transition-colors shadow-sm cursor-pointer"
                  >
                    Commander maintenant (Paiement à la livraison)
                  </Link>
                </motion.div>
              </div>

              {/* Reassurance Micro-Perks Box (Separated and Clean) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-[var(--color-primary)]">
                    <Truck className="w-3.5 h-3.5" strokeWidth={2} />
                  </div>
                  <span>Livraison gratuite dès 299 DH</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-[var(--color-primary)]">
                    <CreditCard className="w-3.5 h-3.5" strokeWidth={2} />
                  </div>
                  <span>Paiement en espèces à la livraison</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-[var(--color-primary)]">
                    <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                  </div>
                  <span>Retours faciles sous 7 jours</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-[var(--color-primary)]">
                    <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                  </div>
                  <span>Produits 100% originaux certifiés</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Below the Fold: Smooth Animated Tabs ───────────── */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs mb-14">
          {/* Tab Navigation Header */}
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
                    isActive
                      ? "text-[var(--color-primary)]"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeProductTab"
                      className="absolute bottom-0 inset-x-0 h-0.5 bg-[var(--color-primary)]"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Animated Tab Content Body */}
          <AnimatePresence mode="wait">
            {activeTab === "description" && (
              <motion.div
                key="desc-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="space-y-4 text-sm text-slate-600 leading-relaxed max-w-3xl"
              >
                <h3 className="text-base font-bold text-slate-900">
                  À propos de cet article
                </h3>
                <p>{product.description}</p>
                {product.short_description && <p>{product.short_description}</p>}
              </motion.div>
            )}

            {activeTab === "specifications" && (
              <motion.div
                key="spec-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="max-w-2xl overflow-hidden rounded-2xl border border-slate-200"
              >
                <table className="w-full text-xs sm:text-sm">
                  <tbody>
                    {Object.entries((product.specifications && typeof product.specifications === "object" ? product.specifications : { "Catégorie": categoryName, "Disponibilité": inStock ? "En Stock" : "Sur commande", "SKU": product.sku || "PRO-001" }) as Record<string, string>).map(([key, val], idx) => (
                      <tr
                        key={key}
                        className={idx % 2 === 0 ? "bg-slate-50/70" : "bg-white"}
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-900 border-b border-slate-200 w-1/3">
                          {key}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 border-b border-slate-200">
                          {String(val ?? "")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {activeTab === "details" && (
              <motion.div
                key="details-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="space-y-3"
              >
                <ul className="space-y-3 max-w-2xl">
                  {((Array.isArray(product.details) ? product.details : [product.short_description || "Article garanti de première qualité conforme aux normes scolaires."]) as string[]).map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" strokeWidth={2} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {activeTab === "shipping" && (
              <motion.div
                key="shipping-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="space-y-4 text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed"
              >
                <h3 className="text-base font-bold text-slate-900">
                  Délais et frais d&apos;expédition
                </h3>
                <p>
                  Toutes les commandes sont expédiées sous 24h ouvrées depuis notre plateforme logistique à Casablanca.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-1 text-sm">Casablanca &amp; Région</h4>
                    <p className="text-xs text-slate-500">Livraison express le jour même ou sous 24h. 25 DH (Gratuit dès 299 DH).</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-1 text-sm">Toutes les autres villes du Maroc</h4>
                    <p className="text-xs text-slate-500">Rabat, Marrakech, Tanger, Fès, Agadir, etc. sous 48h max. 35 DH (Gratuit dès 299 DH).</p>
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 pt-2">
                  Garantie Satisfait ou Remboursé
                </h3>
                <p>
                  Vous disposez d&apos;un délai légal de 7 jours après réception pour nous retourner tout article dans son emballage d&apos;origine en cas de non-conformité.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Bottom: Related Products Grid ──────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="mb-14">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-eyebrow mb-1">Complétez vos achats</p>
                <h2 className="text-section-title">Produits similaires</h2>
              </div>
              <Link
                href={`/category/${product.category_name?.toLowerCase().replace(/\s+/g, "-") || "all"}`}
                className="text-xs sm:text-sm font-bold text-[var(--color-primary)] hover:underline"
              >
                Voir toute la sélection →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 lg:gap-5">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
