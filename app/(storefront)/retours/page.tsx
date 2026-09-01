import type { Metadata } from "next"
import Link from "next/link"
import {
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Truck,
  CreditCard,
  ArrowRight,
} from "lucide-react"
import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { STORE_INFO } from "@/lib/navigation"

export const metadata: Metadata = {
  title: "Politique de Retours & Remboursements | ProExcel",
  description:
    "Consultez les conditions de retour et de remboursement sous 7 jours de ProExcel. Processus simple et assistance réactive.",
}

export default function RetoursPage() {
  const whatsappClean = STORE_INFO.whatsapp.replace(/[^0-9]/g, "")

  return (
    <div className="bg-[var(--color-background)] min-h-screen py-6 lg:py-10">
      <div className="container-site max-w-5xl">
        <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Retours & Remboursements" }]} />

        {/* Hero Header */}
        <div className="text-center mt-6 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider mb-3">
            <RotateCcw className="w-4 h-4" />
            <span>Garantie Satisfait ou Remboursé</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-text-primary)] tracking-tight">
            Politique de Retours &amp; Échanges
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-2 max-w-2xl mx-auto">
            Votre satisfaction est notre priorité absolue. Si un article ne vous convient pas, nous facilitons vos retours et échanges en toute transparence.
          </p>
        </div>

        {/* ── 3-Step Return Process Cards ── */}
        <div className="bg-white rounded-3xl border border-[var(--color-border)] p-8 sm:p-10 shadow-xs mb-14">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 mb-8 text-center">
            Comment effectuer un retour en 3 étapes simples ?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] flex items-center justify-center font-display font-bold text-xl mb-4 relative">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">1. Demande de retour</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Contactez notre service client par WhatsApp ou par téléphone dans un délai de <strong>7 jours</strong> après réception en indiquant votre numéro de commande.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] flex items-center justify-center font-display font-bold text-xl mb-4">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">2. Enlèvement du colis</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Notre livreur partenaire passe directement à votre adresse récupérer le produit dans son emballage d&apos;origine intact.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] flex items-center justify-center font-display font-bold text-xl mb-4">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">3. Échange ou Remboursement</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dès vérification de l&apos;article, nous procédons à l&apos;envoi du produit de remplacement ou au remboursement sous 48h selon votre préférence.
              </p>
            </div>
          </div>
        </div>

        {/* ── Conditions Details (2 Columns) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          {/* Eligible conditions */}
          <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-4 text-emerald-800">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <h3 className="font-bold text-base">Conditions d&apos;éligibilité au retour</h3>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Demande effectuée dans les 7 jours ouvrables suivant la livraison.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Articles neufs, non utilisés, non écrits, et dans leur emballage d&apos;origine complet.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Erreur de référence de notre part ou article défectueux (frais de retour 100% à notre charge).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Présentation du bon de livraison ou du numéro de commande.</span>
              </li>
            </ul>
          </div>

          {/* Ineligible conditions */}
          <div className="bg-white rounded-3xl border border-rose-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-4 text-rose-800">
              <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
              <h3 className="font-bold text-base">Articles non éligibles au retour</h3>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">•</span>
                <span>Manuels ou cahiers annotés, surlignés ou ayant subi des détériorations.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">•</span>
                <span>Fournitures consommables descellées (stylos ouverts, feutres entamés, peinture utilisée).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">•</span>
                <span>Articles retournés au-delà du délai légal de 7 jours.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Help / Contact Banner ── */}
        <div className="bg-gradient-to-br from-[#8C1A2B] to-[#5E0F1D] rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display font-bold text-2xl tracking-tight">
              Besoin d&apos;effectuer un retour ou un échange ?
            </h3>
            <p className="text-white/80 text-xs sm:text-sm mt-1.5 max-w-md">
              Envoyez-nous un message avec votre numéro de commande et notre équipe traitera votre demande immédiatement.
            </p>
          </div>

          <a
            href={`https://wa.me/${whatsappClean}?text=Bonjour%20Pro%20Excel,%20je%20souhaite%20effectuer%20un%20retour`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center justify-center gap-2.5 h-12 px-7 rounded-xl bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#1EBE5D] hover:shadow-[0_0_24px_rgba(37,211,102,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 shadow-md"
          >
            <MessageCircle className="w-4.5 h-4.5" strokeWidth={2} />
            <span>Demander un retour sur WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  )
}
