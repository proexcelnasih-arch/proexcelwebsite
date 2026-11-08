import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import {
  CheckCircle2,
  Package,
  Truck,
  Banknote,
  ArrowRight,
  BookOpen,
} from "lucide-react"
import { createAdminClient, createClient } from "@/lib/supabase/server"
import { verifyOrderToken } from "@/lib/auth/order-token"
import { formatPrice } from "@/lib/utils"

// ── Types ──────────────────────────────────────────────────────
interface SuccessOrderItem {
  id: string
  product_name_snapshot: string
  price_snapshot: number
  quantity: number
  subtotal: number
}

interface SuccessOrder {
  id: string
  order_number: string
  user_id: string | null
  customer_name: string
  customer_email: string | null
  customer_phone: string
  status: string
  payment_status: string
  payment_method: string
  subtotal: number
  shipping_cost: number
  discount_amount: number
  total: number
  created_at: string
  shipping_address: {
    full_name?: string
    phone?: string
    address?: string
    city?: string
  } | null
  order_items: SuccessOrderItem[]
}

export const metadata: Metadata = {
  title: "Commande confirmée | ProExcel",
  description: "Votre commande ProExcel a bien été passée.",
  robots: { index: false, follow: false },
}

// ── Page ───────────────────────────────────────────────────────
export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const { order: orderId } = await searchParams

  // Validate order UUID format
  if (!orderId || typeof orderId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
    redirect("/")
  }

  // 1. Check Cookie HMAC token authorization (SEC-04)
  const cookieStore = await cookies()
  const tokenCookie = cookieStore.get(`order_token_${orderId}`)?.value
  const hasValidCookieToken = verifyOrderToken(orderId, tokenCookie)

  // 2. Check Session authorization (Logged in user or Admin)
  let currentUser: { id: string } | null = null
  let isAuthorizedAdmin = false

  try {
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (user) {
      currentUser = { id: user.id }
      const adminClient = await createAdminClient()
      const { data: profile } = await adminClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()
      if (profile?.role === "admin") {
        isAuthorizedAdmin = true
      }
    }
  } catch {
    // Guest or no active session
  }

  // Fetch only needed columns using admin client (service role)
  let order: SuccessOrder | null = null
  try {
    const adminDb = await createAdminClient()
    const { data } = await adminDb
      .from("orders")
      .select(`
        id,
        order_number,
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        status,
        payment_status,
        payment_method,
        subtotal,
        shipping_cost,
        discount_amount,
        total,
        created_at,
        shipping_address,
        order_items (
          id,
          product_name_snapshot,
          price_snapshot,
          quantity,
          subtotal
        )
      `)
      .eq("id", orderId)
      .maybeSingle()

    if (data) {
      order = data as unknown as SuccessOrder
    }
  } catch (err) {
    console.warn("[success] Could not fetch order:", err)
  }

  if (!order) {
    redirect("/")
  }

  // Verify access rights:
  // (a) Valid HMAC signed token for this exact order
  // (b) Logged-in user owns the order
  // (c) Logged-in user is an admin
  const isOrderOwner = Boolean(currentUser && order.user_id && order.user_id === currentUser.id)
  const isAuthorized = hasValidCookieToken || isOrderOwner || isAuthorizedAdmin

  if (!isAuthorized) {
    redirect("/")
  }

  const shippingAddress = order.shipping_address as {
    full_name?: string
    phone?: string
    address?: string
    city?: string
  } | null

  // ── Date formatting ────────────────────────────────────────
  const orderDate = new Date(order.created_at).toLocaleDateString("fr-MA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="container-site py-10 lg:py-16 max-w-2xl mx-auto">
      {/* ── Success header ─────────────────────────────────── */}
      <div className="text-center mb-10">
        <div className="inline-flex w-20 h-20 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] items-center justify-center mb-5">
          <CheckCircle2
            className="w-10 h-10 text-[var(--color-primary)]"
            strokeWidth={1.5}
          />
        </div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-[var(--color-text-primary)] mb-3">
          Commande confirmée !
        </h1>
        <p className="text-[var(--color-text-secondary)] max-w-sm mx-auto leading-relaxed">
          Merci pour votre commande chez{" "}
          <span className="font-semibold text-[var(--color-primary)]">ProExcel</span>.
          Nous vous contacterons pour confirmer la livraison.
        </p>
      </div>

      {/* ── Order card ─────────────────────────────────────── */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-card)]">

        {/* Order header */}
        <div className="bg-[var(--color-primary)] px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/65 mb-0.5">
              Numéro de commande
            </p>
            <p className="font-display font-bold text-lg text-white tracking-tight">
              #{order.order_number}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/65 mb-0.5">
              Date
            </p>
            <p className="text-sm font-medium text-white/90 capitalize">
              {orderDate}
            </p>
          </div>
        </div>

        {/* Order summary stats */}
        <div className="grid grid-cols-3 divide-x divide-[var(--color-border)] border-b border-[var(--color-border)]">
          {[
            {
              icon: <Package className="w-4 h-4" strokeWidth={1.75} />,
              label: "Articles",
              value: `${(order.order_items || []).reduce(
                (sum, i) => sum + i.quantity,
                0
              )} article${
                (order.order_items || []).reduce((sum, i) => sum + i.quantity, 0) >
                1
                  ? "s"
                  : ""
              }`,
            },
            {
              icon: <Banknote className="w-4 h-4" strokeWidth={1.75} />,
              label: "Total à payer",
              value: formatPrice(order.total),
            },
            {
              icon: <Truck className="w-4 h-4" strokeWidth={1.75} />,
              label: "Paiement",
              value: "À la livraison",
            },
          ].map((stat, i) => (
            <div key={i} className="p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[var(--color-text-muted)] text-[11px] font-medium mb-1">
                {stat.icon}
                {stat.label}
              </div>
              <p className="font-display font-bold text-sm text-[var(--color-text-primary)]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="p-6 space-y-6">
          {/* Items breakdown */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
              Articles commandés
            </h2>
            <div className="divide-y divide-[var(--color-border)]">
              {(order.order_items || []).map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center shrink-0 text-[var(--color-text-muted)]">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                        {item.product_name_snapshot}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-secondary)]">
                        Qté : {item.quantity} × {formatPrice(item.price_snapshot)}
                      </p>
                    </div>
                  </div>
                  <p className="font-display font-bold text-xs text-[var(--color-text-primary)] shrink-0">
                    {formatPrice(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing totals */}
          <div className="border-t border-[var(--color-border)] pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span>Sous-total</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>

            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Remise</span>
                <span>-{formatPrice(order.discount_amount)}</span>
              </div>
            )}

            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span>Frais de livraison</span>
              <span>
                {order.shipping_cost === 0 ? (
                  <span className="text-emerald-600 font-semibold">Gratuit</span>
                ) : (
                  formatPrice(order.shipping_cost)
                )}
              </span>
            </div>

            <div className="flex justify-between text-sm font-bold text-[var(--color-text-primary)] border-t border-[var(--color-border)] pt-2 mt-2">
              <span>Total à régler</span>
              <span className="font-display text-base text-[var(--color-primary)]">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>

          {/* Shipping & Payment notice */}
          {shippingAddress && (
            <div className="border-t border-[var(--color-border)] pt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                Adresse de livraison
              </h2>
              <p className="text-xs text-[var(--color-text-primary)] font-semibold">
                {shippingAddress.full_name || order.customer_name}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {shippingAddress.address}, {shippingAddress.city}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {shippingAddress.phone || order.customer_phone}
              </p>
            </div>
          )}

          {/* Next steps notice */}
          <div className="p-4 bg-[var(--color-background)] rounded-[var(--radius-lg)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] space-y-1">
            <p className="font-bold text-[var(--color-text-primary)]">
              Que se passe-t-il maintenant ?
            </p>
            <p>
              1. Notre équipe prépare votre colis sous 24h ouvrées.
            </p>
            <p>
              2. Le livreur vous contactera par téléphone avant son passage.
            </p>
            <p>
              3. Vous réglez le montant exact en espèces à la réception de votre colis.
            </p>
          </div>
        </div>
      </div>

      {/* ── Actions ─────────────────────────────────────────── */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[var(--radius-lg)] bg-[var(--color-primary)] text-white text-xs font-bold hover:bg-[var(--color-primary-dark)] transition-colors shadow-sm"
        >
          Retour à la boutique
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/suivre-commande"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] text-xs font-bold hover:bg-[var(--color-background)] transition-colors"
        >
          Suivre ma commande
        </Link>
      </div>
    </div>
  )
}
