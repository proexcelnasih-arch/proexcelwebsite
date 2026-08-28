import type { Metadata } from "next"
import Link from "next/link"
import {
  Truck,
  MapPin,
  Clock,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Package,
  PhoneCall,
  ArrowRight,
} from "lucide-react"
import { Breadcrumb } from "@/components/ui/Breadcrumb"

export const metadata: Metadata = {
  title: "Livraison & Expédition au Maroc | ProExcel",
  description:
    "Découvrez nos délais et tarifs de livraison express partout au Maroc. Livraison gratuite dès 299 DH et paiement à la livraison.",
}

const SHIPPING_ZONES = [
  {
    zone: "Zone 1 : Casablanca & Environs",
    cities: "Casablanca, Mohammedia, Bouskoura, Dar Bouazza, Nouaceur",
    delay: "24h ouvrées (ou le jour même si commande avant 12h)",
    price: "25 DH",
    freeThreshold: "Gratuit dès 299 DH",
    highlight: true,
  },
  {
    zone: "Zone 2 : Grandes Villes du Royaume",
    cities: "Rabat, Salé, Marrakech, Tanger, Fès, Meknès, Agadir, Kénitra, Tétouan, Oujda, El Jadida",
    delay: "24h à 48h ouvrées",
    price: "35 DH",
    freeThreshold: "Gratuit dès 299 DH",
    highlight: false,
  },
  {
    zone: "Zone 3 : Autres Villes & Provinces",
    cities: "Toutes les autres villes et communes du Maroc sans exception",
    delay: "48h à 72h ouvrées",
    price: "35 DH",
    freeThreshold: "Gratuit dès 299 DH",
    highlight: false,
  },
]

export default function LivraisonPage() {
  return (
    <div className="bg-[var(--color-background)] min-h-screen py-6 lg:py-10">
      <div className="container-site max-w-5xl">
        <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Livraison & Expédition" }]} />

        {/* Hero Banner */}
        <div className="text-center mt-6 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider mb-3">
            <Truck className="w-4 h-4" />
            <span>Expédition Express Partout au Maroc</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-text-primary)] tracking-tight">
            Modalités &amp; Tarifs de Livraison
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-2 max-w-2xl mx-auto">
            Chez ProExcel, nous mettons tout en œuvre pour préparer et livrer vos livres scolaires, fournitures et papeterie dans les plus brefs délais et avec le plus grand soin.
          </p>
        </div>

        {/* ── Free Shipping Highlight Box ── */}
        <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-3xl p-6 sm:p-8 text-white shadow-lg mb-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <Package className="w-7 h-7 text-white" strokeWidth={1.75} />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#E5C158] block">
                Offre Spéciale
              </span>
              <h2 className="font-display font-bold text-xl sm:text-2xl tracking-tight">
                Livraison 100% Gratuite dès 299 DH d&apos;achats
              </h2>
              <p className="text-xs sm:text-sm text-white/80 mt-0.5">
                Valable sur l&apos;ensemble du catalogue et pour toutes les villes du Maroc.
              </p>
            </div>
          </div>
          <Link
            href="/boutique"
            className="shrink-0 h-11 px-6 rounded-xl bg-white text-[var(--color-primary)] font-bold text-xs uppercase tracking-wider hover:bg-slate-50 active:scale-95 transition-all shadow-sm flex items-center gap-2"
          >
            <span>Profiter de l&apos;offre</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ── Shipping Zones Table / Cards ── */}
        <div className="mb-14">
          <div className="flex items-center gap-2.5 mb-6">
            <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[var(--color-text-primary)]">
              Zones de livraison &amp; Délais
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {SHIPPING_ZONES.map((zone, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-3xl p-6 border flex flex-col justify-between shadow-xs transition-shadow hover:shadow-md ${
                  zone.highlight
                    ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/10"
                    : "border-[var(--color-border)]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
                      {zone.zone.split(":")[0]}
                    </span>
                    {zone.highlight && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-white">
                        Express 24h
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mb-2">
                    {zone.zone.split(":")[1] || zone.zone}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{zone.cities}</p>

                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium">{zone.delay}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-lg font-bold text-[var(--color-primary)]">{zone.price}</span>
                    <span className="text-[10px] text-slate-400 block font-normal">par commande</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    {zone.freeThreshold}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Key Delivery Benefits Grid ── */}
        <div className="bg-white rounded-3xl border border-[var(--color-border)] p-8 sm:p-10 shadow-xs mb-14">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-[var(--color-text-primary)] mb-8 text-center">
            Les garanties de livraison ProExcel
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] flex items-center justify-center">
                <CreditCard className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Paiement à la livraison</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Payez en espèces directement au livreur une fois votre colis inspecté.
              </p>
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Emballage sécurisé</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cartons renforcés et protection bulle pour éviter tout coin corné ou dommage.
              </p>
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] flex items-center justify-center">
                <PhoneCall className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Appel avant livraison</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Le livreur vous contacte au préalable pour convenir du meilleur créneau horaire.
              </p>
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Suivi en direct</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Notification par SMS/WhatsApp et suivi d&apos;acheminement en temps réel.
              </p>
            </div>
          </div>
        </div>

        {/* ── Call to action ── */}
        <div className="text-center">
          <p className="text-xs text-slate-500 mb-3">
            Vous avez déjà passé commande et souhaitez savoir où en est votre colis ?
          </p>
          <Link
            href="/suivre-commande"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:bg-[var(--color-primary-dark)] transition-all shadow-xs"
          >
            <span>Suivre mon colis en temps réel</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
