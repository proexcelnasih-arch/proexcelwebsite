import Link from "next/link"
import { ArrowRight, Package } from "lucide-react"

// ── Static side banner — "Kits Scolaires Complets" ─────────────
// Ivory bg with burgundy left border for strong contrast vs dark slider.
// Server component — no client state needed.

export function SideBanner() {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden bg-[var(--color-background)] border-l-4 border-[var(--color-primary)] min-h-[200px] lg:min-h-[460px] p-6 lg:p-8">

      {/* Decorative dot grid */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, var(--color-primary) 1.5px, transparent 1.5px)`,
          backgroundSize: "22px 22px",
        }}
        aria-hidden="true"
      />

      {/* Decorative circles */}
      <div
        className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full border-2 border-[var(--color-primary)]/12 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full border border-[var(--color-primary)]/8 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-6 -right-4 w-20 h-20 rounded-full border border-[var(--color-accent)]/15 pointer-events-none"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full gap-4">

        {/* Category badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] rounded-[var(--radius-sm)] self-start">
          <Package className="w-3 h-3 text-[var(--color-primary)]" />
          <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--color-primary)]">
            Rentrée 2025
          </span>
        </div>

        {/* Headline */}
        <div>
          <h2
            className="font-display text-[var(--color-text-primary)] leading-tight"
            style={{ fontSize: "clamp(1.1rem, 1.7vw, 1.45rem)", fontWeight: 600 }}
          >
            Kits Scolaires{" "}
            <span className="text-[var(--color-primary)]">Complets</span>
          </h2>
          <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed mt-2">
            Tout dans un seul pack : cahiers, stylos, règles et fournitures.
            Disponible Primaire, Collège &amp; Lycée.
          </p>
        </div>

        {/* Price pill */}
        <div className="inline-flex items-baseline gap-1 self-start">
          <span className="text-xs text-[var(--color-text-secondary)] font-medium">Dès</span>
          <span className="text-xl font-bold text-[var(--color-primary)] font-display">149</span>
          <span className="text-sm font-semibold text-[var(--color-primary-light)]">DH</span>
        </div>

        {/* Feature bullets */}
        <ul className="flex flex-col gap-1.5" aria-label="Contenu du kit">
          {[
            "Cahiers grand format assortis",
            "Stylos, crayons, règles",
            "Cartable offert à partir de 249 DH",
          ].map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-[12px] text-[var(--color-text-secondary)]"
            >
              <span
                className="mt-[3px] w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href="/category/kits-scolaires"
          id="side-banner-cta"
          className="inline-flex items-center gap-2 h-10 px-5 text-sm font-bold text-white bg-[var(--color-primary)] rounded-[var(--radius-md)] hover:bg-[var(--color-primary-dark)] transition-colors duration-150 self-start mt-auto shadow-sm"
        >
          Voir les kits
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
