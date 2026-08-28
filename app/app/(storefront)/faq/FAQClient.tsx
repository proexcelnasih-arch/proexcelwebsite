"use client"

import { useState } from "react"
import Link from "next/link"
import {
  HelpCircle,
  ChevronDown,
  Search,
  ShoppingCart,
  CreditCard,
  Truck,
  RotateCcw,
  ShieldCheck,
  User,
  MessageCircle,
  Phone,
  ArrowRight,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { cn } from "@/lib/utils"
import { STORE_INFO } from "@/lib/navigation"

interface FAQItem {
  question: string
  answer: string
}

interface FAQCategory {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  items: FAQItem[]
}

const FAQ_DATA: FAQCategory[] = [
  {
    id: "commandes",
    title: "Commandes",
    icon: ShoppingCart,
    items: [
      {
        question: "Comment passer commande sur ProExcel ?",
        answer:
          "Pour commander, parcourez notre catalogue, ajoutez vos articles au panier en cliquant sur « Ajouter au panier », puis rendez-vous sur la page panier. Remplissez simplement votre nom, numéro de téléphone et adresse de livraison au Maroc. Aucun paiement en ligne obligatoire : vous réglez en espèces à la réception de votre colis.",
      },
      {
        question: "Puis-je modifier ou annuler ma commande ?",
        answer:
          "Tant que votre commande n'a pas été remise au transporteur (statut En préparation), vous pouvez la modifier ou l'annuler rapidement en contactant notre service client par WhatsApp au " +
          STORE_INFO.whatsapp +
          " ou par téléphone.",
      },
      {
        question: "Vais-je recevoir une confirmation de commande ?",
        answer:
          "Oui ! Dès la validation de votre panier, vous recevez un récapitulatif détaillé ainsi qu'un message de confirmation par WhatsApp / SMS avec votre numéro de suivi.",
      },
    ],
  },
  {
    id: "paiement",
    title: "Paiement",
    icon: CreditCard,
    items: [
      {
        question: "Quels sont les modes de paiement acceptés ?",
        answer:
          "Nous proposons principalement le Paiement à la livraison (Cash on Delivery) partout au Maroc : vous ne payez qu'au moment où le livreur vous remet votre colis en main propre. Le virement bancaire pour les professionnels est également disponible sur demande.",
      },
      {
        question: "Y a-t-il des frais supplémentaires pour le paiement à la livraison ?",
        answer:
          "Non, aucun frais caché ni supplément de paiement à la livraison. Le montant total affiché dans votre panier est exactement le montant à régler.",
      },
    ],
  },
  {
    id: "livraison",
    title: "Livraison & Délais",
    icon: Truck,
    items: [
      {
        question: "Quels sont les délais de livraison ?",
        answer:
          "• Casablanca & environs : Livraison sous 24h ouvrées (ou le jour même pour les commandes passées avant 12h).\n• Autres villes du Maroc (Rabat, Marrakech, Tanger, Fès, Agadir, etc.) : Livraison sous 24h à 48h ouvrées.",
      },
      {
        question: "Quels sont les frais de livraison ?",
        answer:
          "La livraison est 100% GRATUITE pour toute commande à partir de 299 DH d'achats. Pour les commandes inférieures à ce montant, les frais s'élèvent à 25 DH pour Casablanca et 35 DH pour les autres villes du Royaume.",
      },
      {
        question: "Comment suivre l'acheminement de mon colis ?",
        answer:
          "Vous pouvez suivre votre commande à tout moment depuis notre page « Suivre ma commande » en renseignant votre numéro de commande (ex: CMD-XXXX). Notre livreur vous contacte également par téléphone avant son passage.",
      },
    ],
  },
  {
    id: "retours",
    title: "Retours & Échanges",
    icon: RotateCcw,
    items: [
      {
        question: "Quelle est votre politique de retour ?",
        answer:
          "Vous bénéficiez d'un délai légal de 7 jours après réception pour demander un retour ou un échange si le produit ne correspond pas à vos attentes, sous réserve qu'il soit neuf, non utilisé et dans son emballage d'origine.",
      },
      {
        question: "Que faire si un article arrive endommagé ou non conforme ?",
        answer:
          "Envoyez-nous une photo du produit endommagé sur WhatsApp au " +
          STORE_INFO.whatsapp +
          ". Nous procéderons immédiatement au remplacement gratuit ou au remboursement intégral à nos frais.",
      },
    ],
  },
  {
    id: "produits",
    title: "Produits & Authenticité",
    icon: ShieldCheck,
    items: [
      {
        question: "Vos manuels scolaires et livres sont-ils originaux ?",
        answer:
          "Oui, 100% de nos livres scolaires, parascolaires et fournitures sont certifiés originaux et proviennent directement des éditeurs officiels (Hachette, Nathan, Bordas, etc.) et des marques partenaires (Clairefontaine, BIC, Casio, Faber-Castell, etc.).",
      },
      {
        question: "Proposez-vous des remises pour les listes scolaires ou les écoles ?",
        answer:
          "Oui ! Pour les achats groupés d'associations de parents d'élèves, d'écoles ou de commandes en gros, nous proposons des tarifs préférentiels et des devis personnalisés. Contactez notre équipe commerciale via notre page Contact.",
      },
    ],
  },
  {
    id: "compte",
    title: "Compte & Données",
    icon: User,
    items: [
      {
        question: "Ai-je besoin d'un compte pour commander ?",
        answer:
          "Non, la création de compte n'est pas obligatoire. Vous pouvez passer commande en mode invité rapidement. Toutefois, créer un compte vous permet de sauvegarder vos adresses et de retrouver l'historique complet de vos achats.",
      },
      {
        question: "Mes données personnelles sont-elles protégées ?",
        answer:
          "Absolument. Vos informations personnelles sont strictement confidentielles et ne sont utilisées que pour le traitement et la livraison de vos commandes conformément aux normes de protection des données (CNDP).",
      },
    ],
  },
]

export function FAQClient() {
  const [activeTab, setActiveTab] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "commandes-0": true,
    "livraison-0": true,
  })

  function toggleItem(key: string) {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const filteredCategories = FAQ_DATA.map((cat) => {
    if (activeTab !== "all" && cat.id !== activeTab) return null
    const matchedItems = cat.items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (matchedItems.length === 0) return null
    return { ...cat, items: matchedItems }
  }).filter(Boolean) as FAQCategory[]

  const whatsappClean = STORE_INFO.whatsapp.replace(/[^0-9]/g, "")

  return (
    <div className="bg-[var(--color-background)] min-h-screen py-6 lg:py-10">
      <div className="container-site max-w-5xl">
        <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Foire Aux Questions (FAQ)" }]} />

        {/* Hero Header */}
        <div className="text-center mt-6 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-4 h-4" />
            <span>Centre d&apos;aide &amp; FAQ</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-text-primary)] tracking-tight">
            Comment pouvons-nous vous aider ?
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-2 max-w-xl mx-auto">
            Trouvez des réponses rapides et claires à toutes vos questions sur les commandes, la livraison et nos produits.
          </p>

          {/* Quick Search */}
          <div className="mt-6 max-w-lg mx-auto relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une question (ex: délai de livraison, retour, paiement)…"
              className="w-full h-12 pl-12 pr-4 bg-white border border-[var(--color-border)] rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[var(--color-primary)] focus:ring-3 focus:ring-[var(--color-primary)]/15 shadow-xs transition-all"
            />
          </div>
        </div>

        {/* Category Pills Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none justify-start sm:justify-center">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer",
              activeTab === "all"
                ? "bg-[var(--color-primary)] text-white shadow-xs"
                : "bg-white border border-[var(--color-border)] text-slate-600 hover:bg-slate-50"
            )}
          >
            Toutes les questions
          </button>
          {FAQ_DATA.map((cat) => {
            const Icon = cat.icon
            const isActive = activeTab === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer",
                  isActive
                    ? "bg-[var(--color-primary)] text-white shadow-xs"
                    : "bg-white border border-[var(--color-border)] text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>{cat.title}</span>
              </button>
            )
          })}
        </div>

        {/* FAQ Accordion Lists */}
        <div className="space-y-8 mb-16">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => {
              const CategoryIcon = category.icon
              return (
                <div
                  key={category.id}
                  className="bg-white rounded-3xl border border-[var(--color-border)] p-6 sm:p-8 shadow-xs"
                >
                  <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[var(--color-border)]">
                    <div className="w-8 h-8 rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] flex items-center justify-center">
                      <CategoryIcon className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <h2 className="font-display font-bold text-lg text-[var(--color-text-primary)]">
                      {category.title}
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {category.items.map((item, idx) => {
                      const itemKey = `${category.id}-${idx}`
                      const isOpen = !!openItems[itemKey]
                      return (
                        <div
                          key={idx}
                          className="rounded-2xl border border-[var(--color-border)]/70 overflow-hidden transition-colors"
                        >
                          <button
                            type="button"
                            onClick={() => toggleItem(itemKey)}
                            aria-expanded={isOpen}
                            className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-white hover:bg-slate-50/70 transition-colors"
                          >
                            <span className="text-sm sm:text-base font-bold text-[var(--color-text-primary)] pr-4">
                              {item.question}
                            </span>
                            <div
                              className={cn(
                                "w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600 transition-transform duration-200",
                                isOpen && "rotate-180 bg-[var(--color-primary)] text-white"
                              )}
                            >
                              <ChevronDown className="w-4 h-4" strokeWidth={2} />
                            </div>
                          </button>
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                              >
                                <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border)]/50 pt-3.5 whitespace-pre-line">
                                  {item.answer}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="bg-white rounded-3xl border border-[var(--color-border)] p-12 text-center">
              <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="font-bold text-lg text-slate-800 mb-1">Aucun résultat trouvé</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-4">
                Nous n&apos;avons pas trouvé de question correspondant à votre recherche. N&apos;hésitez pas à contacter notre équipe d&apos;assistance.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("")
                  setActiveTab("all")
                }}
                className="h-10 px-5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:bg-[var(--color-primary-dark)]"
              >
                Réinitialiser la recherche
              </button>
            </div>
          )}
        </div>

        {/* ── Still need help card ── */}
        <div className="bg-gradient-to-br from-[#8C1A2B] to-[#5E0F1D] rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#E5C158] block mb-1">
              Vous avez d&apos;autres questions ?
            </span>
            <h3 className="font-display font-bold text-2xl sm:text-3xl tracking-tight">
              Notre équipe d&apos;assistance est là pour vous
            </h3>
            <p className="text-white/80 text-xs sm:text-sm mt-1.5 max-w-md">
              Contactez-nous directement sur WhatsApp pour une réponse instantanée ou par formulaire de contact.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <a
              href={`https://wa.me/${whatsappClean}?text=Bonjour%20Pro%20Excel,%20j'ai%20une%20question`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full sm:w-auto h-12 px-6 rounded-xl bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#1EBE5D] hover:shadow-[0_0_24px_rgba(37,211,102,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 shadow-md"
            >
              <MessageCircle className="w-4.5 h-4.5" strokeWidth={2} />
              <span>WhatsApp Direct</span>
            </a>
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 w-full sm:w-auto h-12 px-6 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              <span>Page Contact</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
