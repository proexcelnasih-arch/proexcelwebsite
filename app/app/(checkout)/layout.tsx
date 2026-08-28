import Link from "next/link"
import { BookOpen, Lock, ArrowLeft } from "lucide-react"
import { STORE_INFO } from "@/lib/navigation"
import { Toaster } from "@/components/ui/Toast"

// ── Checkout Layout ────────────────────────────────────────────
// Minimal distraction-free header — no Navbar, no CategoryNav, no Footer clutter.
// Wraps /checkout and /checkout/success only.

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      {/* ── Minimal header ───────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm"
        role="banner"
      >
        <div className="container-site h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label={`${STORE_INFO.name} — Accueil`}
          >
            <div className="w-7 h-7 bg-[var(--color-primary)] rounded-[var(--radius-md)] flex items-center justify-center shadow-sm group-hover:bg-[var(--color-primary-dark)] transition-colors">
              <BookOpen className="w-4 h-4 text-white" strokeWidth={1.75} />
            </div>
            <span className="font-display font-bold text-[16px] text-[var(--color-primary)] tracking-tight">
              {STORE_INFO.name}
            </span>
          </Link>

          {/* Secure checkout label */}
          <div className="hidden sm:flex items-center gap-1.5 text-[12px] font-semibold text-[var(--color-text-muted)] tracking-wide uppercase">
            <Lock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" strokeWidth={2} />
            Checkout sécurisé
          </div>

          {/* Back to cart */}
          <Link
            href="/panier"
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
            aria-label="Retour au panier"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            <span className="hidden sm:block">Retour au panier</span>
          </Link>
        </div>
      </header>

      {/* ── Page content ─────────────────────────────────────── */}
      <Toaster>
        <main className="flex-1" id="checkout-main">
          {children}
        </main>
      </Toaster>

      {/* ── Minimal footer ───────────────────────────────────── */}
      <footer
        className="border-t border-[var(--color-border)] py-4 text-center"
        role="contentinfo"
      >
        <p className="text-[11px] text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} {STORE_INFO.name} · Paiement à la livraison ·
          Vos données sont 100% protégées
        </p>
      </footer>
    </div>
  )
}
