"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, X, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { RecentPurchase } from "@/types"

interface RecentPurchaseToastProps {
  purchases: RecentPurchase[]
}

export function RecentPurchaseToast({ purchases }: RecentPurchaseToastProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // If no real purchases exist, remain completely dormant
    if (!purchases || purchases.length === 0 || isDismissed) return

    // Show after initial delay of 3.5s
    const initialTimer = setTimeout(() => {
      setIsVisible(true)
    }, 3500)

    // Cycle through purchases every 9 seconds (show 5s, hide 4s)
    const cycleInterval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % purchases.length)
        setIsVisible(true)
      }, 3500)
    }, 9000)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(cycleInterval)
    }
  }, [purchases, isDismissed])

  if (!purchases || purchases.length === 0 || isDismissed) {
    return null
  }

  const current = purchases[currentIndex]
  if (!current) return null

  return (
    <aside aria-label="Commandes récentes vérifiées">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 left-4 sm:left-6 z-30 max-w-[320px] w-full bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.12)] select-none"
          >
            <div className="flex items-start gap-3">
              {/* Product Thumbnail */}
              <div className="relative w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 mt-0.5">
                {current.product_image ? (
                  <Image
                    src={current.product_image}
                    alt={current.product_name}
                    fill
                    unoptimized
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Purchase Details */}
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 mb-0.5">
                  <span>{current.customer_first_name}</span>
                  <span className="text-slate-400">à</span>
                  <span className="text-slate-600">{current.city}</span>
                  <CheckCircle className="w-3 h-3 text-emerald-600 ml-0.5" />
                </div>
                <Link
                  href={current.product_slug ? `/product/${current.product_slug}` : "#"}
                  className="text-xs font-semibold text-[var(--color-primary)] line-clamp-1 hover:underline"
                >
                  {current.product_name}
                </Link>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {current.time_ago_text} • Achat vérifié
                </p>
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={() => {
                  setIsVisible(false)
                  setIsDismissed(true)
                }}
                className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Fermer la notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  )
}
