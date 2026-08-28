import Link from "next/link"
import { ArrowRight, ShoppingBag, BookOpen, Sparkles, PenLine } from "lucide-react"
import type { HeroSlide, PromoTile } from "@/types"

export function HomeHero({
  slides,
  promoTiles,
}: {
  slides?: HeroSlide[]
  promoTiles?: PromoTile[]
}) {
  const mainSlide = slides?.[0]
  const sideSlide = slides?.[1]

  const tile1 = promoTiles?.[0]
  const tile2 = promoTiles?.[1]
  const tile3 = promoTiles?.[2]

  return (
    <section aria-label="Bannière principale" className="py-6 bg-white">
      <div className="container-site">
        {/* ── Main DigiTech Grid Layout ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-6">
          
          {/* Left Hero Banner (8 cols / ~68% width) */}
          <div className="lg:col-span-8 relative min-h-[380px] lg:min-h-[420px] rounded-2xl overflow-hidden bg-[var(--color-primary-dark)] text-white p-8 lg:p-12 flex flex-col justify-center shadow-md border border-white/10">
            {/* Background Storefront Image & Gradient */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-45 scale-105"
              style={{ backgroundImage: `url('${mainSlide?.image_url || "/storefront.jpg"}')` }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-dark)]/95 via-[var(--color-primary-dark)]/85 to-transparent"
              aria-hidden="true"
            />

            {/* Content */}
            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-accent-light)]">
                  Pro Excel
                </span>
              </div>

              <h1 className="font-display font-bold text-white text-3xl sm:text-4xl lg:text-5xl leading-tight mb-3">
                {mainSlide?.title ? (
                  mainSlide.title
                ) : (
                  <>
                    Fournitures Scolaires &amp; <span className="text-[var(--color-accent-light)]">Librairie</span>
                  </>
                )}
              </h1>

              <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-7 max-w-md">
                {mainSlide?.subtitle ||
                  "Votre librairie & papeterie de référence à Casablanca. Produits de qualité supérieure livrés à votre porte."}
              </p>

              {/* Single Primary CTA Button */}
              <Link
                href={mainSlide?.cta_link || "/boutique"}
                id="hero-main-cta"
                className="inline-flex items-center justify-center gap-2.5 h-12 px-7 text-sm font-extrabold text-[var(--color-text-primary)] bg-[var(--color-accent)] rounded-full hover:bg-[var(--color-accent-light)] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-md"
              >
                <ShoppingBag className="w-4.5 h-4.5" strokeWidth={1.75} />
                <span>{mainSlide?.cta_text || "Explorer la boutique"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Side Highlight Banner (4 cols / ~32% width) */}
          <div className="lg:col-span-4 relative min-h-[380px] lg:min-h-[420px] rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white p-8 flex flex-col justify-between shadow-md border border-white/10">
            {/* School supplies composition background */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 scale-105"
              style={{
                backgroundImage: `url('${
                  sideSlide?.image_url ||
                  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80"
                }')`,
              }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary-dark)] via-[var(--color-primary-dark)]/40 to-transparent opacity-85" aria-hidden="true" />

            <div className="relative z-10">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-accent-light)] bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
                Saison 2026
              </span>
              <h2 className="font-display font-bold text-2xl lg:text-3xl text-white mt-4 mb-2">
                {sideSlide?.title || "Kits Scolaires Complets"}
              </h2>
              <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
                {sideSlide?.subtitle ||
                  "Préparez la rentrée sereinement avec nos packs clé en main pour chaque niveau scolaire."}
              </p>
            </div>

            <div className="relative z-10 mt-6">
              <Link
                href={sideSlide?.cta_link || "/category/kits-scolaires"}
                className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--color-accent-light)] hover:text-white transition-colors"
              >
                <span>{sideSlide?.cta_text || "Découvrir la sélection"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* ── 3 Horizontal Promo Feature Callouts ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Promo Callout 1 */}
          <Link
            href={tile1?.link || "/category/kits-scolaires"}
            className="bg-white border border-[var(--color-border)]/80 p-5 sm:p-6 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md hover:border-[var(--color-primary)]/40 hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <div>
              <span className="text-[10px] font-extrabold text-[var(--color-accent-dark)] bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                -20% Immédiat
              </span>
              <h3 className="font-display font-bold text-base text-[var(--color-text-primary)] mt-2 mb-1 group-hover:text-[var(--color-primary)] transition-colors">
                {tile1?.title || "Packs Rentrée Clé en Main"}
              </h3>
              <div className="text-xs font-semibold text-[var(--color-primary)] flex items-center gap-1">
                <span>{tile1?.subtitle || "Dès 199 DH · Découvrir"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] text-[var(--color-primary)] flex items-center justify-center shrink-0 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-200">
              <ShoppingBag className="w-5 h-5" strokeWidth={1.75} />
            </div>
          </Link>

          {/* Promo Callout 2 */}
          <Link
            href={tile2?.link || "/boutique"}
            className="bg-white border border-[var(--color-border)]/80 p-5 sm:p-6 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md hover:border-[var(--color-primary)]/40 hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <div>
              <span className="text-[10px] font-extrabold text-[var(--color-success)] bg-[var(--color-success-bg)] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Offre Livraison
              </span>
              <h3 className="font-display font-bold text-base text-[var(--color-text-primary)] mt-2 mb-1 group-hover:text-[var(--color-primary)] transition-colors">
                {tile2?.title || "Livraison Gratuite dès 299 DH"}
              </h3>
              <div className="text-xs font-semibold text-[var(--color-primary)] flex items-center gap-1">
                <span>{tile2?.subtitle || "Partout au Maroc sous 24/48h"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] text-[var(--color-primary)] flex items-center justify-center shrink-0 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-200">
              <Sparkles className="w-5 h-5" strokeWidth={1.75} />
            </div>
          </Link>

          {/* Promo Callout 3 */}
          <Link
            href={tile3?.link || "/nouveautes"}
            className="bg-white border border-[var(--color-border)]/80 p-5 sm:p-6 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md hover:border-[var(--color-primary)]/40 hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <div>
              <span className="text-[10px] font-extrabold text-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Programmes 2026
              </span>
              <h3 className="font-display font-bold text-base text-[var(--color-text-primary)] mt-2 mb-1 group-hover:text-[var(--color-primary)] transition-colors">
                {tile3?.title || "Manuels 100% Certifiés"}
              </h3>
              <div className="text-xs font-semibold text-[var(--color-primary)] flex items-center gap-1">
                <span>{tile3?.subtitle || "Primaire, Collège, Lycée"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] text-[var(--color-primary)] flex items-center justify-center shrink-0 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-200">
              <BookOpen className="w-5 h-5" strokeWidth={1.75} />
            </div>
          </Link>
        </div>

      </div>
    </section>
  )
}
