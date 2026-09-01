import Link from "next/link"
import {
  Sparkles,
  Sliders,
  Layers,
  Package,
  ArrowRight,
  Eye,
  ExternalLink,
} from "lucide-react"

export default function StorefrontOverviewPage() {
  const sections = [
    {
      title: "Diapositives du Hero Slider",
      description: "Modifiez les visuels, titres, boutons d'action et offres du carrousel d'accueil.",
      href: "/admin/storefront/hero-slides",
      icon: Sparkles,
      count: "3 Diapositives",
    },
    {
      title: "3 Pavés Promotionnels",
      description: "Gérez les 3 cartes d'offres phares situées sous le slider d'accueil.",
      href: "/admin/storefront/promo-tiles",
      icon: Sliders,
      count: "3 Encarts actifs",
    },
    {
      title: "Produits en Vedette",
      description: "Sélectionnez les articles affichés dans 'Meilleures Ventes', 'Nouveautés' et 'Offres'.",
      href: "/admin/storefront/featured-products",
      icon: Package,
      count: "12 Produits sélectionnés",
    },
    {
      title: "Mise en avant des Rayons",
      description: "Organisez l'ordre des 8 vignettes de catégories sur la page d'accueil.",
      href: "/admin/storefront/featured-categories",
      icon: Layers,
      count: "8 Catégories en vitrine",
    },
  ]

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestion de la Vitrine (Storefront CMS)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Personnalisez le contenu, les bannières et les sélections de la page d&apos;accueil.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Voir la vitrine en direct</span>
        </Link>
      </div>

      {/* ── Grid of CMS Modules ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sections.map((sec) => {
          const Icon = sec.icon

          return (
            <Link
              key={sec.href}
              href={sec.href}
              className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-[#8C1A2B]/40 hover:-translate-y-0.5 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#8C1A2B]/10 text-[#8C1A2B] flex items-center justify-center group-hover:bg-[#8C1A2B] group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" strokeWidth={1.75} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {sec.count}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 group-hover:text-[#8C1A2B] transition-colors mb-1.5">
                  {sec.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">{sec.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#8C1A2B]">
                <span>Configurer la section</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
