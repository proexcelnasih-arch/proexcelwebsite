"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, LayoutGrid, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV_CATEGORIES } from "@/lib/navigation"

// ── Categories Dropdown Menu (DigiTech Style) ─────────────────
function CategoriesDropdown() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      {/* "Toutes les catégories" Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2.5 h-11 px-5 bg-[var(--color-primary)] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-tl-xl rounded-tr-xl shadow-xs hover:bg-[var(--color-primary-dark)] transition-colors"
        aria-expanded={open}
      >
        <LayoutGrid className="w-4 h-4" strokeWidth={2.2} />
        <span>Toutes les catégories</span>
        <ChevronDown
          className={cn("w-4 h-4 transition-transform duration-200 ml-1", open && "rotate-180")}
        />
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 w-64 bg-white border border-[var(--color-border)] rounded-b-xl shadow-xl z-[var(--z-dropdown)] overflow-hidden py-2"
          >
            {NAV_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] hover:text-[var(--color-primary)] transition-colors"
              >
                <span>{cat.name}</span>
                <span className="text-[10px] text-[var(--color-text-muted)]">→</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Category Navigation Bar (DigiTech Layout) ────────────────
export function CategoryNav() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Accueil" },
    { href: "/boutique", label: "Boutique" },
    { href: "/category/livres-scolaires", label: "Livres Scolaires" },
    { href: "/category/papeterie", label: "Papeterie" },
    { href: "/category/fournitures-scolaires", label: "Fournitures" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <nav
      className="bg-white border-b border-[var(--color-border)] hidden lg:block sticky top-[var(--height-navbar)] z-[calc(var(--z-navbar)-1)] shadow-xs"
      aria-label="Navigation secondaire"
    >
      <div className="container-site h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left: "Toutes les catégories" dropdown */}
          <CategoriesDropdown />

          {/* Center Links */}
          <div className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors",
                    isActive
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Right Promo Badge */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] px-3.5 py-1.5 rounded-full">
            <Tag className="w-3.5 h-3.5" />
            <span>Jusqu&apos;à -30% sur les fournitures</span>
          </div>
        </div>
      </div>
    </nav>
  )
}

// ── Mobile Category Strip (horizontal scroll) ─────────────────
export function MobileCategoryStrip() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden bg-white border-b border-[var(--color-border)]"
      aria-label="Catégories"
    >
      <div className="scroll-x px-4 py-2.5 flex gap-2">
        {NAV_CATEGORIES.map((cat) => {
          const isActive =
            pathname === `/category/${cat.slug}` ||
            pathname.startsWith(`/category/${cat.slug}/`)
          return (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className={cn(
                "flex-shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all whitespace-nowrap",
                isActive
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                  : "bg-white text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              )}
            >
              {cat.name}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
