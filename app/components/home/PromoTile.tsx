"use client"

import Link from "next/link"
import { ArrowRight, PenLine, Ruler, BookOpen } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// ── Types ──────────────────────────────────────────────────────
export type PromoTileVariant = "dark" | "ivory" | "primary"

export interface PromoTileProps {
  title: string
  subtitle: string
  badge?: string
  href: string
  variant: PromoTileVariant
  icon?: React.ReactNode
  id?: string
}

// ── Variant style maps ─────────────────────────────────────────
const tileStyles: Record<PromoTileVariant, string> = {
  dark: "bg-[var(--color-primary-dark)] text-white",
  ivory:
    "bg-[var(--color-background)] border-2 border-[var(--color-primary)] text-[var(--color-text-primary)]",
  primary: "bg-[var(--color-primary)] text-white",
}

const badgeStyles: Record<PromoTileVariant, string> = {
  dark: "bg-[var(--color-accent)] text-[var(--color-text-primary)]",
  ivory: "bg-[var(--color-primary)] text-white",
  primary: "bg-white/20 text-white border border-white/30",
}

const subtitleStyles: Record<PromoTileVariant, string> = {
  dark: "text-white/65",
  ivory: "text-[var(--color-text-secondary)]",
  primary: "text-white/70",
}

const arrowStyles: Record<PromoTileVariant, string> = {
  dark: "text-[var(--color-accent)]",
  ivory: "text-[var(--color-primary)]",
  primary: "text-white/80",
}

// ── Spring bounce animation ─────────────────────────────────────
// stiffness 420 + damping 14 gives a satisfying micro-bounce overshoot
const springTransition = { type: "spring" as const, stiffness: 420, damping: 14 }

// ── PromoTile ──────────────────────────────────────────────────
export function PromoTile({
  title,
  subtitle,
  badge,
  href,
  variant,
  icon,
  id,
}: PromoTileProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={springTransition}
      className="h-full"
    >
      <Link
        href={href}
        id={id}
        className={cn(
          "group relative flex flex-col justify-between h-full overflow-hidden",
          "px-4 py-3.5 lg:px-5 lg:py-4 rounded-[var(--radius-lg)]",
          "min-h-[100px] lg:min-h-[110px]",
          tileStyles[variant]
        )}
        aria-label={`${title} — ${subtitle}`}
      >
        {/* Decorative background shape */}
        <div
          className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-white/5 pointer-events-none"
          aria-hidden="true"
        />

        {/* Top section: badge + icon */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            {badge && (
              <span
                className={cn(
                  "inline-block px-1.5 py-0.5 text-[9px] font-bold rounded-[3px] mb-1.5 tracking-[0.06em] uppercase leading-tight",
                  badgeStyles[variant]
                )}
              >
                {badge}
              </span>
            )}
            <h3 className="text-[13px] font-bold leading-tight truncate">{title}</h3>
          </div>
          {icon && (
            <div className="shrink-0 opacity-75 group-hover:opacity-100 transition-opacity duration-150 mt-0.5">
              {icon}
            </div>
          )}
        </div>

        {/* Bottom section: subtitle + arrow */}
        <div className="flex items-center justify-between gap-2">
          <p className={cn("text-[11px] leading-tight", subtitleStyles[variant])}>{subtitle}</p>
          <ArrowRight
            className={cn(
              "w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform duration-150",
              arrowStyles[variant]
            )}
            aria-hidden="true"
          />
        </div>
      </Link>
    </motion.div>
  )
}

// ── PromoTilesRow ──────────────────────────────────────────────
// Pre-configured 3-tile row for the hero bottom bar.
// Mobile: horizontal scroll with snap. Desktop: 3-column grid.

const PROMO_TILES: PromoTileProps[] = [
  {
    id: "promo-tile-papeterie",
    title: "Papeterie",
    subtitle: "-20% sur les cahiers",
    badge: "-20%",
    href: "/category/papeterie",
    variant: "dark",
    icon: <PenLine className="w-4 h-4 text-[var(--color-accent)]" />,
  },
  {
    id: "promo-tile-fournitures",
    title: "Fournitures Scolaires",
    subtitle: "Kits géométrie & calculatrices",
    href: "/category/fournitures-scolaires",
    variant: "ivory",
    icon: <Ruler className="w-4 h-4 text-[var(--color-primary)]" />,
  },
  {
    id: "promo-tile-livres",
    title: "Livres Scolaires",
    subtitle: "Nouveaux titres disponibles",
    badge: "NOUVEAU",
    href: "/category/livres-scolaires",
    variant: "primary",
    icon: <BookOpen className="w-4 h-4 text-white/90" />,
  },
]

export function PromoTilesRow() {
  return (
    <>
      {/* Mobile — horizontal scroll with snap */}
      <div
        className="lg:hidden overflow-x-auto -mx-4 px-4 pb-1 scroll-x snap-x snap-mandatory"
        aria-label="Promotions en cours"
      >
        <div className="flex gap-3 w-max">
          {PROMO_TILES.map((tile) => (
            <div key={tile.id} className="w-48 shrink-0 snap-start">
              <PromoTile {...tile} />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop — 3-column grid */}
      <div
        className="hidden lg:grid grid-cols-3 gap-4"
        aria-label="Promotions en cours"
      >
        {PROMO_TILES.map((tile) => (
          <PromoTile key={tile.id} {...tile} />
        ))}
      </div>
    </>
  )
}
