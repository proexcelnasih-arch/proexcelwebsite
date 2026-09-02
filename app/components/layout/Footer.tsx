import Link from "next/link"
import { Phone, MessageCircle } from "lucide-react"
import { STORE_INFO, SOCIAL_LINKS } from "@/lib/navigation"
import { PeLogo } from "./Navbar"

const footerLinks = {
  shop: {
    title: "Boutique",
    links: [
      { label: "Tous les produits", href: "/boutique" },
      { label: "Meilleures ventes", href: "/boutique?sort=bestselling" },
      { label: "Nouveautés", href: "/nouveautes" },
      { label: "Meilleures offres", href: "/meilleures-offres" },
      { label: "Kits scolaires", href: "/category/kits-scolaires" },
    ],
  },
  categories: {
    title: "Catégories",
    links: [
      { label: "Livres Scolaires", href: "/category/livres-scolaires" },
      { label: "Livres", href: "/category/livres" },
      { label: "Papeterie", href: "/category/papeterie" },
      { label: "Fournitures Scolaires", href: "/category/fournitures-scolaires" },
      { label: "Bureau", href: "/category/bureau" },
      { label: "Arts & Créativité", href: "/category/arts-creativite" },
    ],
  },
  help: {
    title: "Aide & Support",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Livraison", href: "/livraison" },
      { label: "Retours", href: "/retours" },
      { label: "Suivre ma commande", href: "/suivre-commande" },
    ],
  },
}

// ── Outline Social Icons (Brand color only on hover) ─────────
function InstagramIcon({ className = "w-4.5 h-4.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function FacebookIcon({ className = "w-4.5 h-4.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function WhatsAppOutlineIcon({ className = "w-4.5 h-4.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

export function Footer({
  logoUrl,
  storeSettings,
}: {
  logoUrl?: string | null
  storeSettings?: any
} = {}) {
  const whatsappClean = STORE_INFO.whatsapp.replace(/[^0-9]/g, "")

  return (
    <footer
      className="bg-white text-[var(--color-text-primary)] border-t border-[var(--color-border)]"
      role="contentinfo"
      aria-label="Pied de page"
    >
      {/* Main footer section */}
      <div className="container-site py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Column 1: Logo & Outline Social Media Icons (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <Link href="/" aria-label="Accueil Pro Excel">
              <PeLogo className="h-10" logoUrl={logoUrl} />
            </Link>

            {/* Outline Social Icons (Filled with brand color only on hover) */}
            <div className="flex items-center gap-3">
              {/* Instagram Outline */}
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-300 text-slate-700 bg-white hover:border-[#E1306C] hover:bg-[#E1306C] hover:text-white hover:shadow-[0_0_16px_rgba(225,48,108,0.45)] hover:scale-110 active:scale-95 transition-all duration-200"
                aria-label="Instagram Pro Excel"
              >
                <InstagramIcon />
              </a>

              {/* Facebook Outline */}
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-300 text-slate-700 bg-white hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white hover:shadow-[0_0_16px_rgba(24,119,242,0.45)] hover:scale-110 active:scale-95 transition-all duration-200"
                aria-label="Facebook Pro Excel"
              >
                <FacebookIcon />
              </a>

              {/* WhatsApp Outline */}
              <a
                href={`https://wa.me/${whatsappClean}?text=Bonjour%20Pro%20Excel`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-300 text-slate-700 bg-white hover:border-[#25D366] hover:bg-[#25D366] hover:text-white hover:shadow-[0_0_16px_rgba(37,211,102,0.45)] hover:scale-110 active:scale-95 transition-all duration-200"
                aria-label="WhatsApp Pro Excel"
              >
                <WhatsAppOutlineIcon />
              </a>
            </div>
          </div>

          {/* Column 2: Boutique (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
              {footerLinks.shop.title}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.shop.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Catégories (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
              {footerLinks.categories.title}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.categories.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Aide & Support (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
              {footerLinks.help.title}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.help.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: "Besoin d'aide ?" Block (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-3.5 pt-2 sm:pt-0">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-primary)] block mb-1">
                Besoin d&apos;aide ?
              </span>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Une question concernant votre commande ou vos manuels ?
              </p>
            </div>
            
            {/* Phone link */}
            <a
              href={`tel:${STORE_INFO.phone}`}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--color-surface-2)]/60 hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] transition-all duration-150 group border border-transparent hover:border-[var(--color-primary)]/20"
            >
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Phone className="w-3.5 h-3.5" strokeWidth={2} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">Assistance téléphonique</span>
                <span className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)] tracking-tight group-hover:text-[var(--color-primary)] transition-colors truncate">
                  {STORE_INFO.phone}
                </span>
              </div>
            </a>

            {/* Redesigned WhatsApp Row: Compact Card with Soft Green Glow & Scale */}
            <a
              href={`https://wa.me/${whatsappClean}?text=Bonjour%20Pro%20Excel`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2.5 rounded-xl border border-emerald-500/30 bg-white hover:bg-emerald-50/40 hover:border-[#25D366] hover:shadow-[0_0_20px_rgba(37,211,102,0.35)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 ease-out group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(37,211,102,0.6)] transition-all duration-200">
                <MessageCircle className="w-4 h-4" strokeWidth={2} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">Réponse rapide</span>
                <span className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)] group-hover:text-emerald-700 transition-colors">
                  Discuter sur WhatsApp
                </span>
              </div>
            </a>
          </div>

        </div>
      </div>

      {/* Copyright & Legal Bar */}
      <div className="border-t border-[var(--color-border)] bg-white py-5">
        <div className="container-site flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} {STORE_INFO.name}. Tous droits réservés.
          </p>

          <div className="flex items-center gap-5">
            <Link href="/mentions-legales" className="text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
              Confidentialité
            </Link>
            <Link href="/cgv" className="text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
              CGV
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
