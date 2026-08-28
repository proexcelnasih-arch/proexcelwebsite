"use client"

import { useState, useEffect, useRef, useSyncExternalStore } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  LogIn,
  Menu,
  X,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { STORE_INFO } from "@/lib/navigation"

// ── Official PE Brand Logo (PNG only) ─────────────────────────
export function PeLogo({ className = "h-9" }: { className?: string }) {
  return (
    <div className={cn("flex items-center shrink-0", className)}>
      <Image
        src="/logo.png"
        alt="Pro Excel"
        width={110}
        height={48}
        className="h-8 sm:h-9 w-auto object-contain shrink-0"
        priority
      />
    </div>
  )
}

// ── Cart count hook (useSyncExternalStore prevents setState in render) ──
function getCartCountSnapshot(): number {
  if (typeof window === "undefined") return 0
  try {
    const cart = JSON.parse(localStorage.getItem("cart") ?? '{"items":[]}')
    return (
      cart.items?.reduce(
        (sum: number, item: { quantity: number }) => sum + item.quantity,
        0
      ) ?? 0
    )
  } catch {
    return 0
  }
}

function getCartCountServerSnapshot(): number {
  return 0
}

function subscribeToCart(callback: () => void) {
  window.addEventListener("storage", callback)
  window.addEventListener("cart-updated", callback)
  return () => {
    window.removeEventListener("storage", callback)
    window.removeEventListener("cart-updated", callback)
  }
}

function useCartCount() {
  return useSyncExternalStore(
    subscribeToCart,
    getCartCountSnapshot,
    getCartCountServerSnapshot
  )
}

// ── Search Bar (Smooth Expand-on-click + Backdrop Blur) ────────
function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsFocused(false)
        inputRef.current?.blur()
      }
    }
    if (isFocused) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isFocused])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setIsFocused(false)
      inputRef.current?.blur()
    }
  }

  return (
    <>
      {/* Subtle Backdrop Blur & Dim when Search is active */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={() => {
              setIsFocused(false)
              inputRef.current?.blur()
            }}
            className="fixed inset-0 top-[65px] bg-slate-900/30 backdrop-blur-xs z-[35] pointer-events-auto"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div
        ref={containerRef}
        className={cn(
          "relative z-[45] transition-all duration-300 ease-out",
          isFocused ? "w-full max-w-2xl mx-auto" : "flex-1 max-w-md mx-auto",
          className
        )}
      >
        <form onSubmit={handleSubmit} role="search" className="w-full">
          <div
            className={cn(
              "flex items-center h-11 px-1.5 border rounded-full bg-white transition-all duration-300 ease-out",
              isFocused
                ? "border-[var(--color-primary)] shadow-[0_8px_30px_rgba(140,26,43,0.18)] ring-3 ring-[var(--color-primary)]/15 scale-[1.01]"
                : "border-[var(--color-border-strong)] hover:border-[var(--color-primary)]/70 shadow-2xs"
            )}
          >
            <Search
              className={cn(
                "ml-3.5 w-4.5 h-4.5 shrink-0 transition-colors duration-200 pointer-events-none",
                isFocused ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"
              )}
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="search"
              id="navbar-search"
              value={query}
              onFocus={() => setIsFocused(true)}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit, livre, fourniture…"
              className="flex-1 h-full px-3 text-sm bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
              aria-label="Rechercher des produits"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  inputRef.current?.focus()
                }}
                className="mr-1 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors duration-150"
                aria-label="Effacer la recherche"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            )}
            <button
              type="submit"
              className={cn(
                "px-4.5 py-2 text-xs font-bold text-white rounded-full transition-all duration-200 shrink-0 shadow-xs",
                "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] active:scale-[0.97]",
                isFocused && "shadow-md bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)]"
              )}
              aria-label="Rechercher"
            >
              Chercher
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

// ── Mobile Drawer ─────────────────────────────────────────────
function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-[var(--z-overlay)] lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.nav
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed top-0 left-0 bottom-0 w-72 bg-white shadow-xl z-[var(--z-drawer)] lg:hidden overflow-y-auto"
            aria-label="Navigation mobile"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
              <Link href="/" onClick={onClose}>
                <PeLogo className="h-8" />
              </Link>
              <button
                onClick={onClose}
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>

            {/* Drawer links */}
            <div className="px-3 py-4 flex flex-col gap-1">
              {MOBILE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] hover:text-[var(--color-primary)] transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Direct Login CTA */}
            <div className="px-5 py-4 border-t border-[var(--color-border)]">
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full h-11 bg-[var(--color-primary)] text-white font-bold text-sm uppercase tracking-wider rounded-full shadow-sm hover:bg-[var(--color-primary-dark)] active:scale-[0.98] transition-all duration-200"
              >
                <LogIn className="w-4.5 h-4.5" strokeWidth={1.75} />
                Connexion
              </Link>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  )
}

const MOBILE_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/boutique", label: "Boutique" },
  { href: "/category/livres-scolaires", label: "Livres Scolaires" },
  { href: "/category/livres", label: "Livres" },
  { href: "/category/papeterie", label: "Papeterie" },
  { href: "/category/fournitures-scolaires", label: "Fournitures Scolaires" },
  { href: "/category/bureau", label: "Bureau" },
  { href: "/category/arts-creativite", label: "Arts & Créativité" },
  { href: "/category/kits-scolaires", label: "Kits Scolaires" },
  { href: "/nouveautes", label: "Nouveautés" },
  { href: "/meilleures-offres", label: "Meilleures Offres" },
]

// ── Main Navbar ───────────────────────────────────────────────
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const cartCount = useCartCount()

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          "navbar sticky top-0 z-[var(--z-navbar)] bg-white border-b border-[var(--color-border)] transition-shadow duration-200",
          scrolled && "shadow-md"
        )}
        role="banner"
      >
        <div className="container-site h-full flex items-center justify-between gap-4 lg:gap-6">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(true)}
            className="group lg:hidden p-2 -ml-2 text-[var(--color-text-primary)] rounded-full focus:outline-none"
            aria-label="Ouvrir le menu"
            aria-expanded={mobileOpen}
          >
            <Menu className="w-5 h-5 transition-transform duration-300 ease-out group-hover:scale-125 active:scale-95" strokeWidth={1.75} />
          </button>

          {/* PE Brand Logo */}
          <Link
            href="/"
            className="flex items-center shrink-0 group"
            aria-label={`${STORE_INFO.name} — Accueil`}
          >
            <PeLogo />
          </Link>

          {/* Centered Search Bar */}
          <SearchBar className="hidden lg:flex" />

          {/* Right Action Icons (Pure Smooth Zoom In/Out on Hover) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Search icon on mobile */}
            <Link
              href="/search"
              className="group lg:hidden flex items-center justify-center w-10 h-10 text-[var(--color-text-primary)]"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5 transition-transform duration-300 ease-out group-hover:scale-125 active:scale-95" strokeWidth={1.75} />
            </Link>

            {/* Connexion / Mon Compte Icon Button */}
            <Link
              href="/login"
              id="navbar-login-btn"
              className="group relative flex items-center justify-center w-10 h-10 text-[var(--color-text-primary)]"
              aria-label="Connexion / Mon compte"
              title="Connexion / Mon compte"
            >
              <User className="w-5 h-5 transition-transform duration-300 ease-out group-hover:scale-125 active:scale-95" strokeWidth={1.75} />
            </Link>

            {/* Wishlist (9lb) Icon Button */}
            <Link
              href="/wishlist"
              className="group relative hidden sm:flex items-center justify-center w-10 h-10 text-[var(--color-text-primary)]"
              aria-label="Liste de souhaits"
              title="Liste de souhaits"
            >
              <Heart className="w-5 h-5 transition-transform duration-300 ease-out group-hover:scale-125 active:scale-95" strokeWidth={1.75} />
            </Link>

            {/* Cart Button */}
            <Link
              href="/panier"
              className="group relative flex items-center justify-center w-10 h-10 text-[var(--color-text-primary)]"
              aria-label={`Panier — ${cartCount} article${cartCount !== 1 ? "s" : ""}`}
              title="Mon panier"
            >
              <ShoppingBag className="w-5 h-5 shrink-0 transition-transform duration-300 ease-out group-hover:scale-125 active:scale-95" strokeWidth={1.75} />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[19px] h-[19px] flex items-center justify-center px-1 bg-[var(--color-discount)] text-white text-[10px] font-bold rounded-full shadow-sm leading-none group-hover:scale-110 transition-transform duration-300"
                  aria-hidden="true"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </motion.span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search bar strip */}
        <div className="lg:hidden border-t border-[var(--color-border)] px-4 py-2.5 bg-white">
          <SearchBar />
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
