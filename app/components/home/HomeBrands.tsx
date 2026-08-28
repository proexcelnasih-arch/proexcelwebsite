"use client"

import Link from "next/link"
import type { Brand } from "@/types"

const DEFAULT_BRANDS = [
  { name: "Clairefontaine", slug: "clairefontaine", specialty: "Cahiers & Papeterie" },
  { name: "BIC", slug: "bic", specialty: "Stylos & Écriture" },
  { name: "Faber-Castell", slug: "faber-castell", specialty: "Beaux-Arts & Dessin" },
  { name: "Maped", slug: "maped", specialty: "Traçage & Géométrie" },
  { name: "Oxford", slug: "oxford", specialty: "Cahiers & Classeurs" },
  { name: "Casio", slug: "casio", specialty: "Calculatrices" },
  { name: "Stabilo", slug: "stabilo", specialty: "Surligneurs & Feutres" },
]

export function HomeBrands({ brands }: { brands?: Brand[] }) {
  const displayBrands = (brands && brands.length > 0)
    ? brands.map((b) => ({
        name: b.name,
        slug: b.slug,
        specialty: b.description || "Marque Partenaire",
      }))
    : DEFAULT_BRANDS

  return (
    <section
      className="py-12 bg-white border-t border-[var(--color-border)]"
      aria-labelledby="brands-heading"
    >
      <div className="container-site">
        <div className="text-center max-w-xl mx-auto mb-8">
          <p className="text-eyebrow mb-1">Nos Marques Partenaires</p>
          <h2 id="brands-heading" className="text-xl sm:text-2xl font-display font-bold text-[var(--color-text-primary)]">
            Les grandes marques de référence
          </h2>
        </div>

        {/* Brand Logos Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 items-center">
          {displayBrands.map((brand) => (
            <Link
              key={brand.name}
              href={`/boutique?brand=${encodeURIComponent(brand.slug)}`}
              className="group flex flex-col items-center justify-center p-4 h-20 rounded-2xl bg-[var(--color-surface-2)]/50 border border-[var(--color-border)]/60 hover:bg-white hover:border-[var(--color-primary)]/40 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
              aria-label={`Découvrir les produits ${brand.name}`}
            >
              <span className="font-display font-black text-sm sm:text-base text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] transition-colors tracking-tight text-center">
                {brand.name}
              </span>
              <span className="text-[9px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mt-0.5 text-center truncate max-w-full px-1">
                {brand.specialty}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
