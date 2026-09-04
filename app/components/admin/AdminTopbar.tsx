"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Search,
  Bell,
  Menu,
  Package,
  AlertTriangle,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface AdminTopbarProps {
  onOpenMobileMenu?: () => void
}

interface RealNotification {
  id: string
  title: string
  description: string
  time: string
  type: "order" | "stock"
  href: string
}

export function AdminTopbar({ onOpenMobileMenu }: AdminTopbarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [searchQuery, setSearchQuery] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [adminEmail, setAdminEmail] = useState<string>("")
  const [notifications, setNotifications] = useState<RealNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setAdminEmail(data.user.email)
      }
    })
  }, [])

  // Dynamic Page Title per section
  const pageTitle = (() => {
    if (pathname === "/admin") return "Tableau de bord"
    if (pathname.startsWith("/admin/orders")) return "Commandes"
    if (pathname === "/admin/products/new") return "Nouveau Produit"
    if (pathname.startsWith("/admin/products")) return "Produits"
    if (pathname.startsWith("/admin/categories")) return "Catégories & Rayons"
    if (pathname.startsWith("/admin/inventory")) return "Stock & Inventaire"
    if (pathname.startsWith("/admin/customers")) return "Clients"
    if (pathname.startsWith("/admin/coupons")) return "Marketing & Coupons"
    if (pathname.startsWith("/admin/reviews")) return "Avis & Témoignages"
    if (pathname.startsWith("/admin/storefront")) return "Vitrine & CMS"
    if (pathname.startsWith("/admin/settings")) return "Paramètres"
    return "Administration"
  })()

  // Fetch real notifications from Supabase (pending orders and low stock)
  useEffect(() => {
    async function loadNotifications() {
      try {
        const supabase = createClient()
        const notifs: RealNotification[] = []

        // 1. Pending orders
        const { data: pendingOrders } = await supabase
          .from("orders")
          .select("id, order_number, total, created_at")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(3)

        if (pendingOrders && pendingOrders.length > 0) {
          pendingOrders.forEach((ord) => {
            notifs.push({
              id: `ord-${ord.id}`,
              title: `Nouvelle commande #${ord.order_number}`,
              description: `Montant : ${Number(ord.total).toFixed(2)} DH (Paiement à la livraison)`,
              time: new Date(ord.created_at).toLocaleDateString("fr-FR", {
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
          lowStockProds.forEach((prod) => {
            notifs.push({
              id: `stock-${prod.id}`,
              title: "Alerte Stock Faible",
              description: `"${prod.name}" (${prod.stock_quantity ?? 0} unités restantes)`,
              time: "Action requise",
              type: "stock",
              href: "/admin/inventory/low-stock",
            })
          })
        }

        setNotifications(notifs)
        setUnreadCount(notifs.length)
      } catch (err) {
        console.warn("[AdminTopbar] Notification load failed:", err)
      }
    }

    loadNotifications()
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/admin/products?search=${encodeURIComponent(searchQuery.trim())}`)
  }

  async function handleLogout() {
    try {
      document.cookie = "proexcel_admin_session=; path=/; max-age=0;"
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // ignore
    }
    window.location.href = "/login"
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* ── Left: Mobile Toggle & Dynamic Section Title ─────── */}
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" strokeWidth={1.75} />
          </button>
        )}

        {/* Dynamic Section Title (No fake decorative dropdown) */}
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight truncate">
            {pageTitle}
          </h2>
        </div>
      </div>

      {/* ── Center: Search Bar ──────────────────────────────── */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={1.75}
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Recherche globale (articles, commandes, clients)…"
            aria-label="Recherche globale admin"
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#8C1A2B] focus:ring-2 focus:ring-[#8C1A2B]/15 transition-all shadow-2xs"
          />
        </form>
      </div>

      {/* ── Right: Notification Bell, Settings, User Profile ── */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Settings Shortcut Button */}
        <Link
          href="/admin/settings/store"
          className="w-10 h-10 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-[#8C1A2B] transition-colors shadow-2xs"
          title="Paramètres de la boutique"
        >
          <Settings className="w-4.5 h-4.5" strokeWidth={1.75} />
        </Link>

        {/* Notifications Bell with Real Unread Count */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications((v) => !v)}
            className="relative w-10 h-10 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-[#8C1A2B] text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white shadow-xs animate-in zoom-in">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Notifications
                </span>
                {unreadCount > 0 ? (
                  <span className="text-[10px] font-bold text-[#8C1A2B] bg-[#8C1A2B]/10 px-2 py-0.5 rounded-full">
                    {unreadCount} en attente
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
                      onClick={() => setShowNotifications(false)}
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
                          <AlertTriangle className="w-4 h-4" />
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
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-1.5 text-emerald-500" />
                    <span>Aucune nouvelle alerte pour le moment</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <Link
                  href="/admin/orders"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-bold text-[#8C1A2B] hover:underline inline-block"
                >
                  Gérer toutes les commandes →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div ref={userRef} className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu((v) => !v)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200/90 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            aria-label="Menu profil administrateur"
          >
            {/* Avatar Circle with Initials */}
            <div className="w-7 h-7 rounded-full bg-[#8C1A2B] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
              AD
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                Admin ProExcel
              </span>
              <span className="text-[10px] text-slate-400 font-medium leading-tight">
                Super Administrateur
              </span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-800">Admin ProExcel</p>
                <p className="text-[11px] text-slate-400 truncate">{adminEmail || "admin@proexcel.store"}</p>
              </div>

              <Link
                href="/admin/settings/store"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#8C1A2B] transition-colors"
              >
                <Shield className="w-4 h-4 text-slate-400" />
                <span>Paramètres Boutique</span>
              </Link>

              <Link
                href="/"
                target="_blank"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#8C1A2B] transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-slate-400" />
                <span>Voir la Boutique</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
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
