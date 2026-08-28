"use client"

import { AlertCircle, RotateCcw, Home } from "lucide-react"
import Link from "next/link"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen bg-[var(--color-surface-1)] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-[var(--radius-xl)] flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-[var(--color-error)]" />
        </div>

        {/* Title */}
        <h1 className="text-display mb-3 font-display text-[var(--color-text-primary)]">
          Une erreur est survenue
        </h1>

        {/* Description */}
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
          Nous rencontrons un problème technique. Veuillez réessayer ou retourner à l&apos;accueil.
        </p>

        {/* Error digest for debugging */}
        {error.digest && (
          <p className="text-xs text-[var(--color-text-muted)] font-mono mb-8 bg-[var(--color-neutral-100)] rounded px-2 py-1 inline-block">
            Référence: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-[var(--color-brand-primary)] text-white text-sm font-medium rounded-[var(--radius-md)] hover:bg-[var(--color-brand-primary-light)] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 border border-[var(--color-border-strong)] text-[var(--color-text-primary)] text-sm font-medium rounded-[var(--radius-md)] hover:bg-[var(--color-surface-2)] transition-colors"
          >
            <Home className="w-4 h-4" />
            Accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
