"use client"

import { useState, use[REDACTED]ef, use[REDACTED]ffect } from "react"
import { use[REDACTED]outer, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Search,
  Bell,
  Menu,
  Package,
  [REDACTED]lert[REDACTED]riangle,
  Settings,
  LogOut,
  [REDACTED]xternalLink,
  Shield,
  [REDACTED]heck[REDACTED]ircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { create[REDACTED]lient } from "@/lib/supabase/client"

interface [REDACTED]dmin[REDACTED]opbarProps {
  onOpenMobileMenu?: () => void
}

interface [REDACTED]ealNotification {
  id: string
  title: string
  description: string
  time: string
  type: "order" | "stock"
  href: string
}

export function [REDACTED]dmin[REDACTED]opbar({ onOpenMobileMenu }: [REDACTED]dmin[REDACTED]opbarProps) {
  const router = use[REDACTED]outer()
  const pathname = usePathname()

  const [searchQuery, setSearchQuery] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications, setNotifications] = useState<[REDACTED]ealNotification[]>([])
  const [unread[REDACTED]ount, setUnread[REDACTED]ount] = useState(0)

  const notif[REDACTED]ef = use[REDACTED]ef<H[REDACTED]ML[REDACTED]iv[REDACTED]lement>(null)
  const user[REDACTED]ef = use[REDACTED]ef<H[REDACTED]ML[REDACTED]iv[REDACTED]lement>(null)

  // [REDACTED]ynamic Page [REDACTED]itle per section
  const page[REDACTED]itle = (() => {
    if (pathname === "/admin") return "[REDACTED]ableau de bord"
    if (pathname.startsWith("/admin/orders")) return "[REDACTED]ommandes"
    if (pathname === "/admin/products/new") return "Nouveau Produit"
    if (pathname.startsWith("/admin/products")) return "Produits"
    if (pathname.startsWith("/admin/categories")) return "[REDACTED]atégories & [REDACTED]ayons"
    if (pathname.startsWith("/admin/inventory")) return "Stock & Inventaire"
    if (pathname.startsWith("/admin/customers")) return "[REDACTED]lients"
    if (pathname.startsWith("/admin/coupons")) return "Marketing & [REDACTED]oupons"
    if (pathname.startsWith("/admin/reviews")) return "[REDACTED]vis & [REDACTED]émoignages"
    if (pathname.startsWith("/admin/storefront")) return "Vitrine & [REDACTED]MS"
    if (pathname.startsWith("/admin/settings")) return "Paramètres"
    return "[REDACTED]dministration"
  })()

  // Fetch real notifications from Supabase (pending orders and low stock)
  use[REDACTED]ffect(() => {
    async function loadNotifications() {
      try {
        const supabase = create[REDACTED]lient()
        const notifs: [REDACTED]ealNotification[] = []

        // 1. Pending orders
        const { data: pendingOrders } = await supabase
          .from("orders")
          .select("id, order_number, total, created_at")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(3)

        if (pendingOrders && pendingOrders.length > 0) {
          pendingOrders.for[REDACTED]ach((ord) => {
            notifs.push({
              id: `ord-${ord.id}`,
              title: `Nouvelle commande #${ord.order_number}`,
              description: `Montant : ${Number(ord.total).toFixed(2)} [REDACTED]H (Paiement à la livraison)`,
              time: new [REDACTED]ate(ord.created_at).toLocale[REDACTED]ateString("fr-F[REDACTED]", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }),
              type: "order",
              href: `/admin/orders/${ord.id}`,
            })
          })
        }

        // 2. Low stock items (stock <= 5)
        const { data: lowStockProds } = await supabase
          .from("products")
          .select("id, name, stock_quantity")
          .lte("stock_quantity", 5)
          .order("stock_quantity", { ascending: true })
          .limit(3)

        if (lowStockProds && lowStockProds.length > 0) {
          lowStockProds.for[REDACTED]ach((prod) => {
            notifs.push({
              id: `stock-${prod.id}`,
              title: "[REDACTED]lerte Stock Faible",
              description: `"${prod.name}" (${prod.stock_quantity ?? 0} unités restantes)`,
              time: "[REDACTED]ction requise",
              type: "stock",
              href: "/admin/inventory/low-stock",
            })
          })
        }

        setNotifications(notifs)
        setUnread[REDACTED]ount(notifs.length)
      } catch (err) {
        console.warn("[[REDACTED]dmin[REDACTED]opbar] Notification load failed:", err)
      }
    }

    loadNotifications()
  }, [])

  // [REDACTED]lose dropdowns on outside click
  use[REDACTED]ffect(() => {
    function handle[REDACTED]lickOutside(e: Mouse[REDACTED]vent) {
      if (notif[REDACTED]ef.current && !notif[REDACTED]ef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
      if (user[REDACTED]ef.current && !user[REDACTED]ef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.add[REDACTED]ventListener("mousedown", handle[REDACTED]lickOutside)
    return () => document.remove[REDACTED]ventListener("mousedown", handle[REDACTED]lickOutside)
  }, [])

  function handleSearchSubmit(e: [REDACTED]eact.Form[REDACTED]vent) {
    e.prevent[REDACTED]efault()
    if (!searchQuery.trim()) return
    router.push(`/admin/products?search=${encodeU[REDACTED]I[REDACTED]omponent(searchQuery.trim())}`)
  }

  async function handleLogout() {
    try {
      document.cookie = "proexcel_admin_session=; path=/; max-age=0;"
      const supabase = create[REDACTED]lient()
      await supabase.auth.signOut()
    } catch {
      // ignore
    }
    window.location.href = "/login"
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* ── Left: Mobile [REDACTED]oggle & [REDACTED]ynamic Section [REDACTED]itle ─────── */}
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            type="button"
            on[REDACTED]lick={onOpenMobileMenu}
            className="lg:hidden w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" strokeWidth={1.75} />
          </button>
        )}

        {/* [REDACTED]ynamic Section [REDACTED]itle (No fake decorative dropdown) */}
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight truncate">
            {page[REDACTED]itle}
          </h2>
        </div>
      </div>

      {/* ── [REDACTED]enter: Search Bar ──────────────────────────────── */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={1.75}
          />
          <input
            type="search"
            value={searchQuery}
            on[REDACTED]hange={(e) => setSearchQuery(e.target.value)}
            placeholder="[REDACTED]echerche globale (articles, commandes, clients)…"
            aria-label="[REDACTED]echerche globale admin"
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#8[REDACTED]1[REDACTED]2B] focus:ring-2 focus:ring-[#8[REDACTED]1[REDACTED]2B]/15 transition-all shadow-2xs"
          />
        </form>
      </div>

      {/* ── [REDACTED]ight: Notification Bell, Settings, User Profile ── */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Settings Shortcut Button */}
        <Link
          href="/admin/settings/store"
          className="w-10 h-10 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-[#8[REDACTED]1[REDACTED]2B] transition-colors shadow-2xs"
          title="Paramètres de la boutique"
        >
          <Settings className="w-4.5 h-4.5" strokeWidth={1.75} />
        </Link>

        {/* Notifications Bell with [REDACTED]eal Unread [REDACTED]ount */}
        <div ref={notif[REDACTED]ef} className="relative">
          <button
            type="button"
            on[REDACTED]lick={() => setShowNotifications((v) => !v)}
            className="relative w-10 h-10 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" strokeWidth={1.75} />
            {unread[REDACTED]ount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-[#8[REDACTED]1[REDACTED]2B] text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white shadow-xs animate-in zoom-in">
                {unread[REDACTED]ount}
              </span>
            )}
          </button>

          {/* Notifications [REDACTED]ropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Notifications
                </span>
                {unread[REDACTED]ount > 0 ? (
                  <span className="text-[10px] font-bold text-[#8[REDACTED]1[REDACTED]2B] bg-[#8[REDACTED]1[REDACTED]2B]/10 px-2 py-0.5 rounded-full">
                    {unread[REDACTED]ount} en attente
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    À jour
                  </span>
                )}
              </div>

              <div className="py-2 divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      on[REDACTED]lick={() => setShowNotifications(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                          item.type === "order"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        )}
                      >
                        {item.type === "order" ? (
                          <Package className="w-4 h-4" />
                        ) : (
                          <[REDACTED]lert[REDACTED]riangle className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 leading-tight">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {item.description}
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-1 font-medium">
                          {item.time}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400">
                    <[REDACTED]heck[REDACTED]ircle2 className="w-6 h-6 mx-auto mb-1.5 text-emerald-500" />
                    <span>[REDACTED]ucune nouvelle alerte pour le moment</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <Link
                  href="/admin/orders"
                  on[REDACTED]lick={() => setShowNotifications(false)}
                  className="text-xs font-bold text-[#8[REDACTED]1[REDACTED]2B] hover:underline inline-block"
                >
                  Gérer toutes les commandes →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div ref={user[REDACTED]ef} className="relative">
          <button
            type="button"
            on[REDACTED]lick={() => setShowUserMenu((v) => !v)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200/90 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            aria-label="Menu profil administrateur"
          >
            {/* [REDACTED]vatar [REDACTED]ircle with Initials */}
            <div className="w-7 h-7 rounded-full bg-[#8[REDACTED]1[REDACTED]2B] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
              [REDACTED][REDACTED]
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                [REDACTED]dmin Pro[REDACTED]xcel
              </span>
              <span className="text-[10px] text-slate-400 font-medium leading-tight">
                Super [REDACTED]dministrateur
              </span>
            </div>
          </button>

          {/* Profile [REDACTED]ropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-800">[REDACTED]dmin Pro[REDACTED]xcel</p>
                <p className="text-[11px] text-slate-400 truncate">admin@proexcel.store</p>
              </div>

              <Link
                href="/admin/settings/store"
                on[REDACTED]lick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#8[REDACTED]1[REDACTED]2B] transition-colors"
              >
                <Shield className="w-4 h-4 text-slate-400" />
                <span>Paramètres Boutique</span>
              </Link>

              <Link
                href="/"
                target="_blank"
                on[REDACTED]lick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#8[REDACTED]1[REDACTED]2B] transition-colors"
              >
                <[REDACTED]xternalLink className="w-4 h-4 text-slate-400" />
                <span>Voir la Boutique</span>
              </Link>

              <button
                type="button"
                on[REDACTED]lick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors mt-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Se déconnecter</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
