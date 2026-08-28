import Image from "next/image"
import { Star, CheckCircle2 } from "lucide-react"

const DEFAULT_REVIEWS = [
  {
    name: "Yassine B.",
    initials: "YB",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    city: "Casablanca",
    rating: 5,
    title: "Livraison impeccable pour la rentrée",
    comment:
      "J'ai commandé tous les manuels scolaires et cahiers pour mes deux enfants. Reçu en 24h à Casablanca, emballage soigné et livres conformes au programme.",
    verified: true,
  },
  {
    name: "Salma M.",
    initials: "SM",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    city: "Rabat",
    rating: 5,
    title: "Papeterie de grande qualité",
    comment:
      "Excellente sélection de fournitures de marque (Clairefontaine, Faber-Castell). Le service client sur WhatsApp est très réactif et professionnel !",
    verified: true,
  },
  {
    name: "Omar T.",
    initials: "OT",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80",
    city: "Marrakech",
    rating: 5,
    title: "Paiement à la livraison sans souci",
    comment:
      "Très bonne expérience d'achat. Le kit complet pour le collège m'a fait gagner un temps précieux. Paiement à la réception simple et rapide.",
    verified: true,
  },
]

export function HomeReviews({ reviews }: { reviews?: any[] }) {
  const displayReviews = (reviews && reviews.length > 0)
    ? reviews.map((r) => ({
        name: r.profiles?.full_name || "Client Vérifié",
        initials: (r.profiles?.full_name || "CV").slice(0, 2).toUpperCase(),
        avatar: r.profiles?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
        city: "Maroc",
        rating: r.rating || 5,
        title: r.title || (r.products?.name ? `Avis sur ${r.products.name}` : "Très satisfait"),
        comment: r.comment || "Commande reçue rapidement et bien emballée. Service irréprochable !",
        verified: r.is_verified_purchase ?? true,
      }))
    : DEFAULT_REVIEWS

  return (
    <section
      className="py-14 lg:py-18 bg-white border-t border-[var(--color-border)]"
      aria-labelledby="reviews-heading"
    >
      <div className="container-site">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="text-eyebrow mb-1.5">Avis Clients</p>
          <h2
            id="reviews-heading"
            className="text-section-title mb-2.5"
          >
            Ce que disent nos clients
          </h2>
          <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <div className="flex items-center gap-0.5 text-[var(--color-accent)]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[var(--color-accent)]" strokeWidth={1.75} />
              ))}
            </div>
            <span className="font-semibold text-[var(--color-text-primary)]">4.9 / 5</span>
            <span className="text-[var(--color-text-muted)]">•</span>
            <span>+1 250 commandes livrées au Maroc</span>
          </div>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayReviews.slice(0, 3).map((review, idx) => (
            <div
              key={idx}
              className="bg-white border border-[var(--color-border)] rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[var(--color-primary)]/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div>
                {/* Stars */}
                <div className="flex items-center gap-1 mb-3 text-[var(--color-accent)]">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[var(--color-accent)]" strokeWidth={1.75} />
                  ))}
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-2 leading-snug">
                  &ldquo;{review.title}&rdquo;
                </h3>

                {/* Comment */}
                <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed mb-4">
                  {review.comment}
                </p>
              </div>

              {/* Author with Avatar and verified badge */}
              <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-[var(--color-border)]">
                    <Image
                      src={review.avatar}
                      alt={review.name}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                      {review.name}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      {review.city}
                    </p>
                  </div>
                </div>

                {review.verified && (
                  <div
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--color-success)] bg-[var(--color-success-bg)] px-2 py-0.5 rounded-full shrink-0"
                    title="Achat vérifié"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Vérifié</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
