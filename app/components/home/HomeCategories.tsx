"use client"

import Image from "next/image"
import Link from "next/link"
import { BookOpen, PenLine, Ruler, Palette, Book, Briefcase, Package, ArrowRight, LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import type { Category } from "@/types"

const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  PenLine,
  Ruler,
  Palette,
  Book,
  Briefcase,
  Package,
}

const CATEGORY_IMAGES: Record<string, string> = {
  "livres-scolaires": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
  "papeterie": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80",
  "fournitures-scolaires": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=80",
  "arts-creativite": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80",
  "livres": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
  "bureau": "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80",
  "kits-scolaires": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80",
}

export function HomeCategories({ categories }: { categories?: Category[] }) {
  // If categories are passed from Supabase, map them; otherwise use default fallback list
  const displayCategories = (categories && categories.length > 0)
    ? categories.map((c) => {
        const IconComponent = (c.icon && ICON_MAP[c.icon]) ? ICON_MAP[c.icon] : BookOpen
        return {
          name: c.name,
          description: c.description || "Découvrir la sélection",
          href: `/category/${c.slug}`,
          Icon: IconComponent,
          image: c.image_url || CATEGORY_IMAGES[c.slug] || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
        }
      })
    : [
        {
          name: "Livres Scolaires",
          description: "Primaire, Collège, Lycée",
          href: "/category/livres-scolaires",
          Icon: BookOpen,
          image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
        },
        {
          name: "Papeterie",
          description: "Cahiers, stylos, classeurs",
          href: "/category/papeterie",
          Icon: PenLine,
          image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80",
        },
        {
          name: "Fournitures Scolaires",
          description: "Géométrie, calculatrices, trousses",
          href: "/category/fournitures-scolaires",
          Icon: Ruler,
          image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=80",
        },
        {
          name: "Arts & Créativité",
          description: "Dessin, peinture, loisirs créatifs",
          href: "/category/arts-creativite",
          Icon: Palette,
          image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80",
        },
        {
          name: "Livres",
          description: "Romans, culture, jeunesse",
          href: "/category/livres",
          Icon: Book,
          image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
        },
        {
          name: "Bureau",
          description: "Organisation, classeurs, matériel pro",
          href: "/category/bureau",
          Icon: Briefcase,
          image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80",
        },
        {
          name: "Kits Scolaires",
          description: "Packs complets prêts pour la rentrée",
          href: "/category/kits-scolaires",
          Icon: Package,
          image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80",
        },
        {
          name: "Voir tout le catalogue",
          description: "Tous les rayons & sélections",
          href: "/boutique",
          Icon: ArrowRight,
          image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
        },
      ]

  return (
    <section
      className="py-12 lg:py-16 bg-white border-t border-[var(--color-border)]"
      aria-labelledby="categories-heading"
    >
      <div className="container-site">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-eyebrow mb-1.5">Explorer le catalogue</p>
            <h2 id="categories-heading" className="text-section-title">
              Nos catégories
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-[var(--color-primary)] font-semibold hover:gap-2.5 transition-all duration-150"
          >
            Toutes les catégories
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
          {displayCategories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group block"
              aria-label={cat.name}
            >
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-[var(--color-border)] shadow-xs group-hover:shadow-md group-hover:border-[var(--color-primary)]/40 transition-all duration-300">
                {/* Photo container (fixed aspect ratio) */}
                <div className="relative h-44 sm:h-52 w-full overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out opacity-85 group-hover:opacity-95"
                  />
                  {/* Subtle dark gradient overlay so white text stays crisp */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent"
                    aria-hidden="true"
                  />

                  {/* Icon badge floating top-right */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center text-white group-hover:bg-[var(--color-primary)] group-hover:border-[var(--color-primary)] group-hover:scale-110 transition-all duration-200">
                    <cat.Icon className="w-4 h-4" strokeWidth={2} />
                  </div>

                  {/* Bottom Text Content (Overlaid on photo) */}
                  <div className="absolute bottom-0 inset-x-0 p-3.5 sm:p-4 text-white">
                    <h3 className="font-display font-bold text-sm sm:text-base leading-snug group-hover:text-[var(--color-accent-light)] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-white/75 mt-0.5 line-clamp-1">
                      {cat.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
