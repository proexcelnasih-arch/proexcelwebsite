"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showPageNumbers?: boolean
  className?: string
}

function getPageRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | "...")[] = []

  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, "...", total)
  } else if (current >= total - 3) {
    pages.push(1, "...", total - 4, total - 3, total - 2, total - 1, total)
  } else {
    pages.push(1, "...", current - 1, current, current + 1, "...", total)
  }

  return pages
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = getPageRange(currentPage, totalPages)

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1", className)}
    >
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Page précédente"
        className={cn(
          "flex items-center gap-1 h-9 px-3 text-sm font-medium rounded-[var(--radius-md)] transition-all",
          "border border-[var(--color-border)] text-[var(--color-text-secondary)]",
          "hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]",
          "disabled:opacity-40 disabled:pointer-events-none"
        )}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Précédent</span>
      </button>

      {/* Page numbers */}
      {showPageNumbers && (
        <div className="flex items-center gap-1">
          {pages.map((page, idx) =>
            page === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="w-9 h-9 flex items-center justify-center text-sm text-[var(--color-text-muted)]"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
                className={cn(
                  "w-9 h-9 flex items-center justify-center text-sm font-medium rounded-[var(--radius-md)] transition-all",
                  currentPage === page
                    ? "bg-[var(--color-primary)] text-white shadow-xs font-bold"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {page}
              </button>
            )
          )}
        </div>
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Page suivante"
        className={cn(
          "flex items-center gap-1 h-9 px-3 text-sm font-medium rounded-[var(--radius-md)] transition-all",
          "border border-[var(--color-border)] text-[var(--color-text-secondary)]",
          "hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]",
          "disabled:opacity-40 disabled:pointer-events-none"
        )}
      >
        <span className="hidden sm:inline">Suivant</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  )
}
