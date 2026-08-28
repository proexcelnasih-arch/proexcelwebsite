"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, BookOpen, Tag, Sparkles } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { CountdownTimer } from "./CountdownTimer"

// ── Slide data ─────────────────────────────────────────────────
interface SlideCta {
  href: string
  label: string
  primary: boolean
}

interface SlideBadge {
  icon: string
  label: string
}

interface Slide {
  id: string
  eyebrow: string
  titleLine1: string
  titleHighlight: string
  titleLine2?: string
  description: string
  ctas: SlideCta[]
  Icon: React.ComponentType<{ className?: string }>
  countdown?: boolean
  badges?: SlideBadge[]
}

const SLIDES: Slide[] = [
  {
    id: "main",
    eyebrow: "Librairie & Papeterie Premium",
    titleLine1: "Tout pour apprendre,",
    titleHighlight: "créer",
    titleLine2: "et réussir.",
    description:
      "Livres scolaires, papeterie et fournitures de qualité. Livraison partout au Maroc.",
    ctas: [
      { href: "/boutique", label: "Découvrir la boutique", primary: true },
      { href: "/category/livres-scolaires", label: "Livres scolaires", primary: false },
    ],
    Icon: BookOpen,
    badges: [
      { icon: "🚚", label: "Livraison Maroc" },
      { icon: "💳", label: "Paiement à la livraison" },
      { icon: "✓", label: "Qualité garantie" },
    ],
  },
  {
    id: "rentree",
    eyebrow: "Rentrée Scolaire 2025",
    titleLine1: "Préparez la rentrée.",
    titleHighlight: "Jusqu'à -30%",
    titleLine2: "sur tout.",
    description:
      "Kits scolaires complets, cahiers, manuels et fournitures. Offre à durée limitée.",
    ctas: [
      { href: "/category/kits-scolaires", label: "Voir les kits", primary: true },
      { href: "/meilleures-offres", label: "Toutes les offres", primary: false },
    ],
    Icon: Tag,
    countdown: true,
  },
  {
    id: "nouveautes",
    eyebrow: "Dernières Arrivées",
    titleLine1: "Nouvelles références",
    titleHighlight: "livres & papeterie",
    titleLine2: "fraîchement arrivés.",
    description:
      "Découvrez les nouvelles collections : romans, livres parascolaires et accessoires.",
    ctas: [
      { href: "/nouveautes", label: "Voir les nouveautés", primary: true },
      { href: "/boutique", label: "Toute la boutique", primary: false },
    ],
    Icon: Sparkles,
  },
]

const SLIDE_DURATION = 5000

// ── Animation variants ─────────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -32 : 32 }),
}

// ── Component ──────────────────────────────────────────────────
export function MainSlider() {
  const [current, setCurrent] = useState(0)
  const [dir, setDir] = useState(1)
  const [paused, setPaused] = useState(false)

  const go = useCallback(
    (next: number, direction: number) => {
      setDir(direction)
      setCurrent((next + SLIDES.length) % SLIDES.length)
    },
    []
  )

  // Auto-play
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => go(current + 1, 1), SLIDE_DURATION)
    return () => clearInterval(id)
  }, [current, paused, go])

  const slide = SLIDES[current]

  return (
    <div
      className="relative flex-1 min-h-[400px] lg:min-h-[460px] bg-[var(--color-primary-dark)] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Diaporama principal"
    >
      {/* ── Slide content ──────────────────────────────────── */}
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={slide.id}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.32, ease: "easeInOut" }}
          className="absolute inset-0 flex flex-col justify-center px-8 lg:px-12 py-10"
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded-sm bg-[var(--color-accent)] flex items-center justify-center shrink-0">
              <slide.Icon className="w-3 h-3 text-[var(--color-text-primary)]" />
            </div>
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[var(--color-accent)]">
              {slide.eyebrow}
            </span>
          </div>

          {/* Headline */}
          <h2
            className="font-display text-white mb-4 leading-[1.12] tracking-tight"
            style={{ fontSize: "clamp(1.55rem, 2.8vw, 2.55rem)", fontWeight: 600 }}
          >
            {slide.titleLine1}
            <br />
            <span className="text-[var(--color-accent-light)]">{slide.titleHighlight}</span>
            {slide.titleLine2 && (
              <>
                {" "}
                {slide.titleLine2}
              </>
            )}
          </h2>

          {/* Description */}
          <p className="text-[14px] text-white/70 mb-5 leading-relaxed max-w-[340px]">
            {slide.description}
          </p>

          {/* Countdown (slide 2 only) */}
          {slide.countdown && (
            <CountdownTimer className="mb-5" label="L'offre se termine dans" />
          )}

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            {slide.ctas.map((cta) =>
              cta.primary ? (
                <Link
                  key={cta.label}
                  href={cta.href}
                  className="inline-flex items-center gap-1.5 h-10 px-5 bg-[var(--color-accent)] text-[var(--color-text-primary)] text-sm font-bold rounded-[var(--radius-md)] hover:bg-[var(--color-accent-light)] transition-colors duration-150 shadow-sm"
                >
                  {cta.label}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <Link
                  key={cta.label}
                  href={cta.href}
                  className="inline-flex items-center h-10 px-4 text-sm font-medium text-white/85 border border-white/25 rounded-[var(--radius-md)] hover:bg-white/10 hover:border-white/45 transition-all duration-150"
                >
                  {cta.label}
                </Link>
              )
            )}
          </div>

          {/* Trust badges (slide 1 only) */}
          {slide.badges && (
            <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-white/12 w-full">
              {slide.badges.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-[11px] text-white/65"
                >
                  <span aria-hidden="true">{b.icon}</span>
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Arrow controls ─────────────────────────────────── */}
      <button
        type="button"
        onClick={() => go(current - 1, -1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/22 border border-white/18 flex items-center justify-center text-white transition-colors duration-150"
        aria-label="Diapositive précédente"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => go(current + 1, 1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/22 border border-white/18 flex items-center justify-center text-white transition-colors duration-150"
        aria-label="Diapositive suivante"
      >
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* ── Dot indicators ─────────────────────────────────── */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10"
        role="tablist"
        aria-label="Diapositives"
      >
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === current}
            onClick={() => go(i, i > current ? 1 : -1)}
            aria-label={`Diapositive ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 h-2 bg-[var(--color-accent)]"
                : "w-2 h-2 bg-white/35 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
