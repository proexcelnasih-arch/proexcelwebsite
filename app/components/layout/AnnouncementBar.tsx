"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Truck, CreditCard, Phone } from "lucide-react"
import { ANNOUNCEMENT_MESSAGES } from "@/lib/navigation"

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Rotate messages every 4 seconds
  useEffect(() => {
    if (!visible) return
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % ANNOUNCEMENT_MESSAGES.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [visible])

  if (!visible) return null

  const icons = [
    <Truck key="truck" className="w-3.5 h-3.5 shrink-0" />,
    <CreditCard key="card" className="w-3.5 h-3.5 shrink-0" />,
    <Truck key="truck2" className="w-3.5 h-3.5 shrink-0" />,
  ]

  return (
    <div
      className="announcement-bar relative flex items-center justify-center px-8"
      role="banner"
      aria-label="Informations de livraison"
    >
      <div className="flex items-center justify-center gap-2 h-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-white/90"
          >
            <span className="text-[var(--color-accent)]">
              {icons[currentIndex]}
            </span>
            {ANNOUNCEMENT_MESSAGES[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation dots */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-1 flex gap-1">
        {ANNOUNCEMENT_MESSAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-1 h-1 rounded-full transition-all duration-300 ${
              i === currentIndex ? "bg-white/80 w-3" : "bg-white/30"
            }`}
            aria-label={`Message ${i + 1}`}
          />
        ))}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/50 hover:text-white/80 transition-colors"
        aria-label="Fermer l'annonce"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
