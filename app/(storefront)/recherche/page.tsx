import type { Metadata } from "next"
import Link from "next/link"
import { Search } from "lucide-react"
import { getCatalogProducts } from "@/lib/supabase/queries"
import { ProductCard } from "@/components/products/ProductCard"

// ── Types ──────────────────────────────────────────────────────
interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export const dynamic = "force-dynamic"

// ── Metadata ───────────────────────────────────────────────────
export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  const query = q?.trim() ?? ""
  return {
    title: query ? `Résultats pour "${query}" | ProExcel` : "Recherche | ProExcel",
    description: "Recherchez livres, fournitures et papeterie sur ProExcel.",
  }
}

// ── Page ───────────────────────────────────────────────────────
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ""

  const searchResult = query
    ? await getCatalogProducts({ searchQuery: query, pageSize: 40 })
    : { products: [], totalCount: 0 }

  const results = searchResult.products

  return (
    <div className="container-site py-8 lg:py-12">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="mb-8">
        {query ? (
          <>
            <p className="text-eyebrow mb-1.5">Résultats de recherche</p>
            <h1 className="text-section-title">
              {results.length > 0 ? (
                <>
                  <span className="text-[var(--color-primary)]">{results.length}</span>{" "}
                  résultat{results.length > 1 ? "s" : ""} pour{" "}
                  <span className="font-display italic">&ldquo;{query}&rdquo;</span>
                </>
              ) : (
                <>
                  Aucun résultat pour{" "}
                  <span className="font-display italic">&ldquo;{query}&rdquo;</span>
                </>
              )}
            </h1>
          </>
        ) : (
          <>
            <p className="text-eyebrow mb-1.5">Recherche</p>
            <h1 className="text-section-title">Rechercher un produit</h1>
          </>
        )}
      </div>

      {/* ── Results grid ────────────────────────────────────── */}
      {results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-5">
          {results.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} />
          ))}
        </div>
      ) : query ? (
        /* Empty results */
        <div className="flex flex-col items-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] flex items-center justify-center mb-5">
            <Search
              className="w-7 h-7 text-[var(--color-primary)]"
              strokeWidth={1.5}
            />
          </div>
          <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)] mb-2">
            Aucun produit trouvé
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-7 max-w-sm leading-relaxed">
            Essayez avec d&apos;autres mots-clés, vérifiez l&apos;orthographe ou parcourez
            nos catégories.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/boutique"
              className="inline-flex items-center gap-2 h-11 px-6 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-[var(--radius-lg)] hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              Toute la boutique
            </Link>
            <Link
              href="/category/livres-scolaires"
              className="inline-flex items-center gap-2 h-11 px-5 border border-[var(--color-border-strong)] text-sm font-medium text-[var(--color-text-secondary)] rounded-[var(--radius-lg)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
            >
              Livres scolaires
            </Link>
          </div>
        </div>
      ) : (
        /* No query typed yet */
        <div className="flex flex-col items-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] flex items-center justify-center mb-5">
            <Search className="w-7 h-7 text-[var(--color-primary)]" strokeWidth={1.5} />
          </div>
          <p className="text-[var(--color-text-secondary)] max-w-xs leading-relaxed">
            Utilisez la barre de recherche ci-dessus pour trouver des livres, de la
            papeterie ou des fournitures scolaires.
          </p>
        </div>
      )}
    </div>
  )
}
