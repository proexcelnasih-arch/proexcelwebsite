"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, BookOpen, Sparkles, Tag, TrendingDown, Clock, PackageCheck } from "lucide-react"
import { useInView } from "framer-motion"

// ── Smooth Animated Counter Hook ──────────────────────────────
function AnimatedCounter({
  target,
  prefix = "",
  suffix = "",
  duration = 1800,
}: {
  target: number
  prefix?: string
  suffix?: string
  duration?: number
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })

  useEffect(() => {
    if (!isInView) return
    let startTime: number | null = null
    let frameId: number

    function step(timestamp: number) {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // Ease out exponential curve for ultra-smooth easing
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCount(Math.floor(ease * target))

      if (progress < 1) {
        frameId = requestAnimationFrame(step)
      } else {
        setCount(target)
      }
    }

    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [isInView, target, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {count}
      {suffix}
    </span>
  )
}

export function HomePromoBanner() {
  return (
    <section
      className="py-10 bg-white border-t border-[var(--color-border)]"
      aria-label="Promotion rentrée scolaire"
    >
      <div className="container-site">
        <Link
          href="/category/kits-scolaires"
          className="group relative flex flex-col lg:flex-row items-center justify-between overflow-hidden rounded-3xl bg-gradient-to-r from-[#4A0A16] via-[#7B1525] to-[#5E0F1D] px-8 py-8 sm:py-10 lg:px-12 gap-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-white/10"
          aria-label="Préparez la rentrée — Découvrir les kits scolaires"
        >
          {/* Subtle Background Radial Glow & Watermark */}
          <div
            className="absolute top-0 right-1/4 w-80 h-80 bg-[var(--color-accent)]/15 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <BookOpen
            className="w-72 h-72 text-white/[0.04] absolute -right-6 -bottom-10 pointer-events-none rotate-12"
            aria-hidden="true"
          />

          {/* Left Block: Heading & Promo Description */}
          <div className="relative z-10 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-[var(--color-accent-light)] text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span>Offre Spéciale Rentrée 2026</span>
            </div>

            <h2 className="font-display text-white text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-2">
              Préparez la rentrée scolaire
            </h2>

            <p className="text-white/85 text-xs sm:text-sm md:text-base leading-relaxed mb-6">
              Packs complets, manuels certifiés et fournitures de marque avec des remises exceptionnelles.
            </p>

            {/* ── 3 Smooth Animated Counter Stats (Harmonized with site font) ── */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0">
              {/* Stat 1: Max Discount */}
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl py-3 px-2 sm:px-4 border border-white/15 text-center">
                <span className="font-sans font-extrabold text-2xl sm:text-3xl text-[var(--color-accent-light)] block leading-tight tracking-tight">
                  <AnimatedCounter target={30} prefix="-" suffix="%" />
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-white/85 leading-tight block mt-0.5">
                  De réduction
                </span>
              </div>

              {/* Stat 2: Items in promo */}
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl py-3 px-2 sm:px-4 border border-white/15 text-center">
                <span className="font-sans font-extrabold text-2xl sm:text-3xl text-white block leading-tight tracking-tight">
                  <AnimatedCounter target={500} prefix="+" />
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-white/85 leading-tight block mt-0.5">
                  Articles en promo
                </span>
              </div>

              {/* Stat 3: Fast Shipping */}
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl py-3 px-2 sm:px-4 border border-white/15 text-center">
                <span className="font-sans font-extrabold text-2xl sm:text-3xl text-[var(--color-accent-light)] block leading-tight tracking-tight">
                  <AnimatedCounter target={24} suffix="h" />
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-white/85 leading-tight block mt-0.5">
                  Livraison Maroc
                </span>
              </div>
            </div>
          </div>

          {/* Right CTA Button */}
          <div className="relative z-10 shrink-0">
            <span className="inline-flex items-center justify-center gap-2.5 h-13 px-8 sm:px-9 rounded-full bg-[var(--color-accent)] text-[var(--color-text-primary)] text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-lg hover:bg-[var(--color-accent-light)] hover:shadow-[0_0_25px_rgba(230,175,46,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
              <span>Profiter des offres</span>
              <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1.5 transition-transform duration-200" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  )
}
