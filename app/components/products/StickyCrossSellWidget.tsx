"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, ArrowRight, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatPrice } from "@/lib/utils"
import type { ProductListItem } from "@/types"

interface StickyCrossSellWidgetProps {
  relatedProduct: ProductListItem | null
  currentProductId: string
}

export function StickyCrossSellWidget({ relatedProduct, currentProductId }: StickyCrossSellWidgetProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(true)

  useEffect(() => {
    if (!relatedProduct) return

    // Check if dismissed in this session
    const storageKey = `proexcel_crosssell_dismissed_${currentProductId}`
    const alreadyDismissed = sessionStorage.getItem(storageKey)
    if (alreadyDismissed) return

    // Show after slight scroll or 2 seconds delay
    setIsDismissed(false)
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [relatedProduct, currentProductId])

  function handleDismiss() {
    setIsVisible(false)
    setIsDismissed(true)
    const storageKey = `proexcel_crosssell_dismissed_${currentProductId}`
    try {
      sessionStorage.setItem(storageKey, "true")
    } catch {
      // ignore
    }
  }

  if (!relatedProduct || isDismissed) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-24 right-4 sm:right-6 z-30 max-w-[310px] w-full bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.12)] select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-primary)] uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[var(--color-accent)] fill-[var(--color-accent)]" />
              <span>Complétez votre pack</span>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Fermer la suggestion"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Product Mini Row */}
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
              {relatedProduct.primary_image ? (
                <Image
                  src={relatedProduct.primary_image}
                  alt={relatedProduct.name}
                  fill
                  unoptimized
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                  Photo
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1 mb-1">
                {relatedProduct.name}
              </h4>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-extrabold text-[var(--color-primary)]">
                  {formatPrice(relatedProduct.price)}
                </span>
                {relatedProduct.compare_at_price && relatedProduct.compare_at_price > relatedProduct.price && (
                  <span className="text-[10px] text-slate-400 line-through">
                    {formatPrice(relatedProduct.compare_at_price)}
                  </span>
                )}
              </div>
            </div>

            {/* View Button */}
            <Link
              href={`/product/${relatedProduct.slug}`}
              className="h-8 px-3 rounded-lg bg-[var(--color-primary)] text-white text-[11px] font-bold flex items-center gap-1 hover:bg-[var(--color-primary-dark)] transition-colors shrink-0 shadow-xs"
            >
              <span>Voir</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
