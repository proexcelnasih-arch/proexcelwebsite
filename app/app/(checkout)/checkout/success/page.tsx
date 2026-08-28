import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  CheckCircle2,
  Package,
  Truck,
  Banknote,
  ArrowRight,
  BookOpen,
} from "lucide-react"
import { createAdminClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils"
import type { Database } from "@/types/database"

// ── Types ──────────────────────────────────────────────────────
type OrderRow = Database["public"]["Tables"]["orders"]["Row"]
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"]

type FullOrder = OrderRow & {
  order_items: OrderItemRow[]
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

  if (!orderId) {
    redirect("/")
  }

  // Fetch order with items using admin client (bypasses RLS — safe in server component)
  let order: FullOrder | null = null

  try {
    const supabase = await createAdminClient()
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .maybeSingle<FullOrder>()
    order = data
  } catch (err) {
    console.warn("[success] Could not fetch order from Supabase:", err)
  }

  // Fallback demo order for local/offline preview
  const displayOrder: FullOrder = order ?? {
    id: orderId,
    order_number: `CMD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${orderId.slice(0, 5).toUpperCase()}`,
    user_id: null,
    customer_name: "Client ProExcel",
    customer_email: "",
    customer_phone: "06XXXXXXXX",
    status: "confirmed",
    payment_status: "pending",
    payment_method: "cod",
    subtotal: 149,
    shipping_cost: 25,
    discount_amount: 0,
    total: 174,
    coupon_code: null,
    notes: null,
    shipping_address: {
      full_name: "Client ProExcel",
      phone: "06XXXXXXXX",
      address: "Adresse de livraison",
      city: "Casablanca",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order_items: [
      {
        id: "item-1",
        order_id: orderId,
        product_id: "1",
        product_name_snapshot: "Articles de papeterie et fournitures scolaires",
        price_snapshot: 149,
        quantity: 1,
        subtotal: 149,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  }

  const shippingAddress = displayOrder.shipping_address as {
    full_name: string
    phone: string
    address: string
    city: string
  } | null

  // ── Date formatting ────────────────────────────────────────
  const orderDate = new Date(displayOrder.created_at).toLocaleDateString("fr-MA", {
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
              #{displayOrder.order_number}
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
              value: `${displayOrder.order_items.length} article${displayOrder.order_items.length > 1 ? "s" : ""}`,
            },
            {
              icon: <Truck className="w-4 h-4" strokeWidth={1.75} />,
              label: "Livraison",
              value: displayOrder.shipping_cost === 0 ? "Gratuite" : formatPrice(displayOrder.shipping_cost),
            },
            {
              icon: <Banknote className="w-4 h-4" strokeWidth={1.75} />,
              label: "Paiement",
              value: "À la livraison",
            },
          ].map((stat) => (
            <div key={stat.label} className="px-4 py-4 text-center">
              <div className="flex justify-center text-[var(--color-primary)] mb-1.5">
                {stat.icon}
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-0.5">
                {stat.label}
              </p>
              <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Items list */}
        <div className="px-6 py-5 border-b border-[var(--color-border)]">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
            Articles commandés
          </h2>
          <div className="flex flex-col gap-3">
            {displayOrder.order_items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {item.product_name_snapshot}
                  </p>
                  <p className="text-[12px] text-[var(--color-text-muted)]">
                    Qté : {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)] shrink-0">
                  {formatPrice(item.subtotal)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="px-6 py-5 border-b border-[var(--color-border)] flex flex-col gap-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-secondary)]">Sous-total</span>
            <span className="font-medium">{formatPrice(displayOrder.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-secondary)]">Livraison</span>
            {displayOrder.shipping_cost === 0 ? (
              <span className="font-medium text-[var(--color-success)]">Gratuite</span>
            ) : (
              <span className="font-medium">{formatPrice(displayOrder.shipping_cost)}</span>
            )}
          </div>
          {displayOrder.discount_amount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">
                Réduction{displayOrder.coupon_code ? ` (${displayOrder.coupon_code})` : ""}
              </span>
              <span className="font-medium text-[var(--color-success)]">
                -{formatPrice(displayOrder.discount_amount)}
              </span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-2 mt-0.5 border-t border-[var(--color-border)]">
            <span className="text-[var(--color-text-primary)]">Total</span>
            <span className="text-[var(--color-primary)] text-lg">{formatPrice(displayOrder.total)}</span>
          </div>
        </div>

        {/* Delivery address */}
        {shippingAddress && (
          <div className="px-6 py-5 border-b border-[var(--color-border)]">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
              Adresse de livraison
            </h2>
            <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              <p className="font-semibold text-[var(--color-text-primary)]">
                {shippingAddress.full_name}
              </p>
              <p>{shippingAddress.address}</p>
              <p>{shippingAddress.city}</p>
              <p>{shippingAddress.phone}</p>
            </div>
          </div>
        )}

        {/* Info note */}
        <div className="px-6 py-5 bg-[color-mix(in_srgb,var(--color-accent)_7%,transparent)]">
          <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
            📞 Notre équipe vous contactera dans les plus brefs délais pour confirmer votre
            commande et organiser la livraison à votre adresse.
          </p>
        </div>
      </div>

      {/* ── CTAs ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mt-7">
        <Link
          href="/compte/commandes"
          className="flex-1 flex items-center justify-center gap-2 h-12 bg-[var(--color-primary)] text-white font-bold rounded-[var(--radius-lg)] hover:bg-[var(--color-primary-dark)] transition-colors shadow-sm"
        >
          Suivre ma commande
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/boutique"
          className="flex-1 flex items-center justify-center gap-2 h-12 border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-bold rounded-[var(--radius-lg)] hover:bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)] transition-colors"
        >
          Continuer mes achats
        </Link>
      </div>
    </div>
  )
}
