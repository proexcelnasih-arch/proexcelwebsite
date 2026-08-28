import { Truck, CreditCard, ShieldCheck, CheckCircle } from "lucide-react"

const TRUST_ITEMS = [
  {
    icon: Truck,
    title: "Livraison Express Maroc",
    description: "Livraison rapide à domicile ou point relais sous 24/48h",
  },
  {
    icon: CreditCard,
    title: "Paiement à la Livraison",
    description: "Réglez en espèces en toute sérénité à la réception",
  },
  {
    icon: ShieldCheck,
    title: "Paiement 100% Sécurisé",
    description: "Cartes bancaires marocaines (CMI) et internationales",
  },
  {
    icon: CheckCircle,
    title: "Produits 100% Authentiques",
    description: "Sélection certifiée auprès des éditeurs officiels",
  },
]

export function HomeTrustStrip() {
  return (
    <section
      className="py-14 bg-white border-t border-[var(--color-border)]"
      aria-label="Nos garanties et engagements"
    >
      <div className="container-site">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {TRUST_ITEMS.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-[var(--color-border)] rounded-2xl p-6 flex flex-col items-center text-center shadow-xs hover:shadow-md hover:border-[var(--color-primary)]/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Prominent centered icon in colored circle (28-32px scale) */}
              <div className="w-14 h-14 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] text-[var(--color-primary)] flex items-center justify-center mb-4 shrink-0">
                <item.icon className="w-6 h-6" strokeWidth={1.75} />
              </div>

              {/* Title & Description */}
              <h3 className="text-[15px] font-bold text-[var(--color-text-primary)] mb-1.5 leading-snug">
                {item.title}
              </h3>
              <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
