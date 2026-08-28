import Link from "next/link"
import { BookOpen, Home, ArrowRight } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-1)] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-16 h-16 bg-[var(--color-brand-primary)] rounded-[var(--radius-xl)] flex items-center justify-center mx-auto mb-6 shadow-[var(--shadow-md)]">
          <BookOpen className="w-8 h-8 text-[var(--color-brand-accent)]" />
        </div>

        {/* 404 number */}
        <p className="text-[80px] font-display font-bold text-[var(--color-neutral-200)] leading-none mb-2 select-none">
          404
        </p>

        {/* Title */}
        <h1 className="text-display mb-3 font-display text-[var(--color-text-primary)]">
          Page introuvable
        </h1>

        {/* Description */}
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-8">
          La page que vous recherchez n&apos;existe pas ou a été déplacée. Retournez à l&apos;accueil ou explorez notre boutique.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-[var(--color-brand-primary)] text-white text-sm font-medium rounded-[var(--radius-md)] hover:bg-[var(--color-brand-primary-light)] transition-colors"
          >
            <Home className="w-4 h-4" />
            Accueil
          </Link>
          <Link
            href="/boutique"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 border border-[var(--color-border-strong)] text-[var(--color-text-primary)] text-sm font-medium rounded-[var(--radius-md)] hover:bg-[var(--color-surface-2)] transition-colors"
          >
            Boutique
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
