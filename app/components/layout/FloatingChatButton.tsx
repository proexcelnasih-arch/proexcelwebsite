"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import { STORE_INFO } from "@/lib/navigation"

export function FloatingChatButton() {
  const [hasInteracted, setHasInteracted] = useState(false)

  // Real WhatsApp number configured in STORE_INFO
  const cleanPhone = STORE_INFO.whatsapp.replace(/[^0-9]/g, "")
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=Bonjour%20Pro%20Excel,%20je%20souhaite%20un%20renseignement.`

  return (
    <aside aria-label="Support client en direct">
      <motion.div
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.5 }}
        className="fixed bottom-6 right-6 z-[var(--z-drawer)]"
      >
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setHasInteracted(true)}
          className="relative w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(37,211,102,0.35)] hover:shadow-[0_0_28px_rgba(37,211,102,0.55),0_8px_24px_rgba(37,211,102,0.4)] hover:scale-105 active:scale-95 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 group"
          aria-label="Contacter le service client sur WhatsApp"
          title="Besoin d'aide ? Discutez avec nous sur WhatsApp"
        >
          {/* Main icon with smooth subtle bounce on group hover */}
          <MessageCircle className="w-6 h-6 text-white transition-transform duration-200 group-hover:scale-110" strokeWidth={1.75} />

          {/* Gentle pulsing notification dot */}
          {!hasInteracted && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <motion.span
                animate={{ scale: [1, 1.35, 1], opacity: [0.9, 0.4, 0.9] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-discount)] opacity-75"
              />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[var(--color-discount)] border-2 border-white shadow-sm" />
            </span>
          )}

          <span className="sr-only">Discuter sur WhatsApp</span>
        </a>
      </motion.div>
    </aside>
  )
}
