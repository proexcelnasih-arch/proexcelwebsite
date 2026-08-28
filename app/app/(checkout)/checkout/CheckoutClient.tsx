"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Truck,
  Banknote,
  ChevronDown,
  Loader2,
  Lock,
  Tag,
  ShoppingBag,
  AlertCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn, formatPrice } from "@/lib/utils"
import { MOROCCAN_CITIES, type CartItem } from "@/types"

// ── Constants ──────────────────────────────────────────────────
const CART_KEY = "cart"
const SHIPPING = 25
const FREE_THRESHOLD = 299

// ── Cart helpers ───────────────────────────────────────────────
function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    const p = JSON.parse(raw ?? '{"items":[]}')
    return p.items ?? []
  } catch { return [] }
}

function clearCart() {
  localStorage.setItem(CART_KEY, JSON.stringify({ items: [] }))
  window.dispatchEvent(new Event("cart-updated"))
}

// ── Field component ────────────────────────────────────────────
interface FieldProps {
  id: string
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}

function FormField({ id, label, required, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[var(--color-text-primary)]">
        {label}
        {required && <span className="ml-1 text-[var(--color-error)]" aria-hidden>*</span>}
      </label>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            key="err"
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-[var(--color-error)] font-medium flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Shared input class ─────────────────────────────────────────
const inputCls = (hasError?: boolean) =>
  cn(
    "w-full h-12 px-4 rounded-xl border text-sm bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none transition-all duration-150",
    "focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_12%,transparent)]",
    hasError
      ? "border-[var(--color-error)]"
      : "border-[var(--color-border-strong)] hover:border-[var(--color-primary)]"
  )

// ── Section header ─────────────────────────────────────────────
function SectionTitle({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center shrink-0">
        {step}
      </div>
      <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-base">
        {title}
      </h2>
    </div>
  )
}

// ── CheckoutClient ─────────────────────────────────────────────
export function CheckoutClient() {
  const router = useRouter()

  // Cart
  const [items, setItems] = useState<CartItem[] | null>(null)

  // Form fields
  const [name, setName]       = useState("")
  const [phone, setPhone]     = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity]       = useState("")
  const [email, setEmail]     = useState("")
  const [notes, setNotes]     = useState("")
  const [coupon, setCoupon]   = useState("")

  // Submission state
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState("")
  const [submitting, setSubmitting]   = useState(false)

  useEffect(() => { setItems(readCart()) }, [])

  // ── Computed totals (display-only; server recalculates) ──────
  const subtotal = (items ?? []).reduce((s, i) => s + i.price * i.quantity, 0)
  const shipping = subtotal >= FREE_THRESHOLD ? 0 : SHIPPING
  const total    = subtotal + shipping

  // ── Form validation ──────────────────────────────────────────
  const validate = useCallback(() => {
    const e: Record<string, string> = {}
    if (!name.trim() || name.trim().length < 2) {
      e.name = "Nom complet requis"
    }
    const cleanPhone = phone.replace(/[\s\-\.\(\)]/g, "")
    if (!/^(?:(?:\+|00)212|0)[5-7]\d{8}$/.test(cleanPhone)) {
      e.phone = "Numéro invalide — format : 06XXXXXXXX"
    }
    if (!address.trim() || address.trim().length < 5) {
      e.address = "Adresse complète requise"
    }
    if (!city) {
      e.city = "Veuillez sélectionner votre ville"
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = "Email invalide"
    }
    return e
  }, [name, phone, address, city, email])

  // ── Submit ───────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setGlobalError("")

    if (!items || items.length === 0) {
      setGlobalError("Votre panier est vide.")
      return
    }

    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      // Scroll to first error
      const firstErrId = Object.keys(fieldErrors)[0]
      document.getElementById(firstErrId)?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    setErrors({})
    setSubmitting(true)

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.id, name: i.name, price: i.price, quantity: i.quantity,
            image: i.image, slug: i.slug,
          })),
          customerInfo: { name: name.trim(), phone: phone.trim(), address: address.trim(), city, email: email.trim(), notes: notes.trim() },
          couponCode: coupon.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        if (data.field) {
          setErrors({ [data.field]: data.error })
          document.getElementById(data.field)?.scrollIntoView({ behavior: "smooth", block: "center" })
        } else {
          setGlobalError(data.error ?? "Une erreur est survenue. Veuillez réessayer.")
        }
        return
      }

      // ── Success ──────────────────────────────────────────────
      clearCart()
      router.push(`/checkout/success?order=${data.orderId}`)
    } catch {
      setGlobalError("Erreur réseau. Vérifiez votre connexion et réessayez.")
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading (cart not yet read from localStorage) ────────────
  if (items === null) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-7 h-7 animate-spin text-[var(--color-primary)]" />
      </div>
    )
  }

  // ── Empty cart redirect hint ─────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="container-site py-20 text-center">
        <ShoppingBag className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-4" strokeWidth={1} />
        <h1 className="text-xl font-semibold mb-3 text-[var(--color-text-primary)]">Votre panier est vide</h1>
        <Link
          href="/boutique"
          className="inline-flex h-11 px-7 items-center bg-[var(--color-primary)] text-white font-bold rounded-[var(--radius-lg)] hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          Retourner à la boutique
        </Link>
      </div>
    )
  }

  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  // ── Main render ──────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="container-site py-8 lg:py-10">

        {/* Global error banner */}
        <AnimatePresence>
          {globalError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
              className="mb-6 flex items-start gap-3 p-4 bg-[color-mix(in_srgb,var(--color-error)_8%,transparent)] border border-[color-mix(in_srgb,var(--color-error)_25%,transparent)] rounded-[var(--radius-lg)] text-sm text-[var(--color-error)] font-medium"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              {globalError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-10 items-start">

          {/* ── LEFT: Form ──────────────────────────────────── */}
          <div className="flex flex-col gap-8">

            {/* ── Section 1: Customer info ─────────────────── */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
              <SectionTitle step={1} title="Informations client" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <FormField id="name" label="Nom complet" required error={errors.name}>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Votre nom complet"
                    autoComplete="name"
                    className={inputCls(!!errors.name)}
                  />
                </FormField>

                {/* Phone */}
                <FormField id="phone" label="Téléphone" required error={errors.phone}>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06 XX XX XX XX"
                    autoComplete="tel"
                    inputMode="tel"
                    className={inputCls(!!errors.phone)}
                  />
                </FormField>

                {/* Address — full width */}
                <div className="sm:col-span-2">
                  <FormField id="address" label="Adresse complète" required error={errors.address}>
                    <input
                      id="address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Rue, quartier, numéro..."
                      autoComplete="street-address"
                      className={inputCls(!!errors.address)}
                    />
                  </FormField>
                </div>

                {/* City */}
                <FormField id="city" label="Ville" required error={errors.city}>
                  <div className="relative">
                    <select
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={cn(inputCls(!!errors.city), "appearance-none pr-10 cursor-pointer")}
                    >
                      <option value="">Sélectionner une ville</option>
                      {MOROCCAN_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none"
                      strokeWidth={1.75}
                    />
                  </div>
                </FormField>

                {/* Email (optional) */}
                <FormField id="email" label="Email (optionnel)" error={errors.email}>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    autoComplete="email"
                    className={inputCls(!!errors.email)}
                  />
                </FormField>

                {/* Notes — full width */}
                <div className="sm:col-span-2">
                  <FormField id="notes" label="Notes de commande (optionnel)">
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Instructions spéciales, étage, code d'entrée..."
                      rows={3}
                      className={cn(
                        inputCls(),
                        "h-auto py-3 resize-none leading-relaxed"
                      )}
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {/* ── Section 2: Livraison ─────────────────────── */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
              <SectionTitle step={2} title="Livraison" />

              <div className="flex items-start gap-4 p-4 bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)] border-2 border-[var(--color-primary)] rounded-[var(--radius-lg)]">
                <div className="mt-0.5">
                  <div className="w-4 h-4 rounded-full border-2 border-[var(--color-primary)] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="w-4 h-4 text-[var(--color-primary)]" strokeWidth={1.75} />
                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                      Livraison à domicile
                    </span>
                    {shipping === 0 && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-[var(--color-primary)] text-white rounded-full">
                        Gratuite
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-[var(--color-text-secondary)]">
                    Délai estimé : <span className="font-semibold">1 à 3 jours ouvrables</span>
                    {shipping > 0 && (
                      <> · <span className="font-semibold">{formatPrice(shipping)}</span></>
                    )}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                    Livraison partout au Maroc · Prise de contact avant livraison
                  </p>
                </div>
              </div>
            </div>

            {/* ── Section 3: Paiement ──────────────────────── */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
              <SectionTitle step={3} title="Paiement" />

              <div className="flex items-start gap-4 p-4 bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)] border-2 border-[var(--color-primary)] rounded-[var(--radius-lg)]">
                <div className="mt-0.5">
                  <div className="w-4 h-4 rounded-full border-2 border-[var(--color-primary)] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Banknote className="w-4 h-4 text-[var(--color-primary)]" strokeWidth={1.75} />
                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                      Paiement à la livraison
                    </span>
                  </div>
                  <p className="text-[13px] text-[var(--color-text-secondary)]">
                    Payez en espèces directement au livreur lors de la réception de votre commande.
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                    Aucune information bancaire requise
                  </p>
                </div>
              </div>
            </div>

            {/* ── Submit (mobile: shown here; desktop: right col CTA) ── */}
            <div className="lg:hidden">
              <SubmitButton submitting={submitting} />
            </div>
          </div>

          {/* ── RIGHT: Order summary ─────────────────────────── */}
          <div className="lg:sticky lg:top-[80px] self-start flex flex-col gap-4">

            {/* Summary card */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] overflow-hidden">
              <div className="px-6 py-5 border-b border-[var(--color-border)]">
                <h2 className="font-display font-semibold text-[var(--color-text-primary)]">
                  Résumé de commande
                </h2>
                <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
                  {itemCount} article{itemCount > 1 ? "s" : ""}
                </p>
              </div>

              {/* Item list */}
              <div className="px-6 py-4 flex flex-col gap-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-11 h-11 shrink-0 rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-surface-1)]">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill sizes="44px" className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-[var(--color-neutral-300)]" strokeWidth={1} />
                        </div>
                      )}
                      {/* Qty badge */}
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-[var(--color-primary)] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[var(--color-text-primary)] line-clamp-1">
                        {item.name}
                      </p>
                    </div>
                    <p className="text-[12px] font-semibold text-[var(--color-text-primary)] shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="px-6 py-4 border-t border-[var(--color-border)] flex flex-col gap-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">Sous-total</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">Livraison</span>
                  {shipping === 0 ? (
                    <span className="font-semibold text-[var(--color-success)]">Gratuite</span>
                  ) : (
                    <span className="font-semibold">{formatPrice(shipping)}</span>
                  )}
                </div>
                <div className="flex justify-between font-bold text-sm pt-2 mt-0.5 border-t border-[var(--color-border)]">
                  <span>Total</span>
                  <span className="text-[var(--color-primary)]">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="px-6 pb-5">
                <div className={cn(
                  "flex items-center border border-[var(--color-border-strong)] rounded-[var(--radius-lg)] overflow-hidden focus-within:border-[var(--color-primary)] transition-colors",
                  errors.coupon && "border-[var(--color-error)]"
                )}>
                  <div className="pl-3 text-[var(--color-text-muted)]">
                    <Tag className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                  <input
                    id="coupon"
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    placeholder="Code promo"
                    className="flex-1 h-10 px-2 text-sm bg-transparent outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] tracking-widest"
                    aria-label="Code promo"
                  />
                </div>
                {errors.coupon && (
                  <p className="text-xs text-[var(--color-error)] font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.coupon}
                  </p>
                )}
                <p className="text-[11px] text-[var(--color-text-muted)] mt-1.5">
                  Le code sera validé lors de la confirmation
                </p>
              </div>
            </div>

            {/* Submit (desktop) */}
            <div className="hidden lg:block">
              <SubmitButton submitting={submitting} />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

// ── Submit button ──────────────────────────────────────────────
function SubmitButton({ submitting }: { submitting: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="submit"
        disabled={submitting}
        id="confirm-order-btn"
        className="flex items-center justify-center gap-2.5 w-full h-14 bg-[var(--color-primary)] text-white font-bold text-base rounded-[var(--radius-xl)] hover:bg-[var(--color-primary-dark)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-[0_4px_14px_color-mix(in_srgb,var(--color-primary)_30%,transparent)]"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Traitement en cours…
          </>
        ) : (
          <>
            <Lock className="w-4.5 h-4.5" strokeWidth={2} />
            Confirmer la commande
          </>
        )}
      </button>
      <p className="text-[12px] text-[var(--color-text-muted)] text-center">
        🔒 Vos informations sont protégées et ne seront jamais partagées
      </p>
    </div>
  )
}
