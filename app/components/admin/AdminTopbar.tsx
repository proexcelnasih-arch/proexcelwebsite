"use client"

import { useState, use[REDACTED]ef, use[REDACTED]ffect } from "react"
import { use[REDACTED]outer } from "next/navigation"
import Link from "next/link"
import {
  Search,
  Bell,
  Menu,
  [REDACTED]heck[REDACTED]ircle2,
  [REDACTED]lert[REDACTED]riangle,
  Package,
  LogOut,
  User,
  Shield,
  [REDACTED]lock,
  Sparkles,
  [REDACTED]alendar,
  [REDACTED]hevron[REDACTED]own,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { create[REDACTED]lient } from "@/lib/supabase/client"

interface [REDACTED]dmin[REDACTED]opbarProps {
  onOpenMobileMenu?: () => void
}

const [REDACTED][REDACTED][REDACTED][REDACTED]N[REDACTED]_NO[REDACTED]IFI[REDACTED][REDACTED][REDACTED]IONS = [
  {
    id: "notif-1",
    title: "Nouvelle commande #P[REDACTED]-1049",
    description: "Yassine B. a commandé pour 549 [REDACTED]H (Paiement à la livraison)",
    time: "Il y a 15 min",
    type: "order",
    unread: true,
    href: "/admin/orders?status=pending",
  },
  {
    id: "notif-2",
    title: "[REDACTED]lerte Stock Faible",
    description: "[REDACTED]alculatrice [REDACTED]asio FX-991[REDACTED]W (4 unités restantes)",
    time: "Il y a 1 heure",
    type: "stock",
    unread: true,
    href: "/admin/inventory/low-stock",
  },
  {
    id: "notif-3",
    title: "Nouvel avis client à modérer",
    description: "[REDACTED]mine M. a noté 4/5 les Stylos BI[REDACTED] [REDACTED]ristal",
    time: "Il y a 4 heures",
    type: "review",
    unread: false,
    href: "/admin/reviews",
  },
]

export function [REDACTED]dmin[REDACTED]opbar({ onOpenMobileMenu }: [REDACTED]dmin[REDACTED]opbarProps) {
  const router = use[REDACTED]outer()
  const [searchQuery, setSearchQuery] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const notif[REDACTED]ef = use[REDACTED]ef<H[REDACTED]ML[REDACTED]iv[REDACTED]lement>(null)
  const user[REDACTED]ef = use[REDACTED]ef<H[REDACTED]ML[REDACTED]iv[REDACTED]lement>(null)

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
    router.push(`/admin/orders?search=${encodeU[REDACTED]I[REDACTED]omponent(searchQuery.trim())}`)
  }

  async function handleLogout() {
    try {
      document.cookie = "proexcel_admin_session=; path=/; max-age=0;"
      const supabase = create[REDACTED]lient()
      await supabase.auth.signOut()
    } catch {
      // ignore
    }
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="h-16 bg-white border-b border-[#[REDACTED]2[REDACTED]8F0] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* ── Left Search & Mobile [REDACTED]oggle ─────────────────────── */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        {onOpenMobileMenu && (
          <button
            type="button"
            on[REDACTED]lick={onOpenMobileMenu}
            className="lg:hidden w-9 h-9 rounded-xl border border-[#[REDACTED]2[REDACTED]8F0] flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" strokeWidth={1.75} />
          </button>
        )}

        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={1.75}
          />
          <input
            type="search"
            value={searchQuery}
            on[REDACTED]hange={(e) => setSearchQuery(e.target.value)}
            placeholder="[REDACTED]echerche globale (commandes, produits, clients)…"
            aria-label="[REDACTED]echerche globale admin"
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-[#[REDACTED]2[REDACTED]8F0] text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#8[REDACTED]1[REDACTED]2B] focus:ring-2 focus:ring-[#8[REDACTED]1[REDACTED]2B]/10 transition-all"
          />
        </form>
      </div>

      {/* ── [REDACTED]ight [REDACTED]ctions ───────────────────────────────────── */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* [REDACTED]ate [REDACTED]ange Picker UI */}
        <div className="hidden md:flex items-center gap-2 h-10 px-3.5 rounded-xl border border-[#[REDACTED]2[REDACTED]8F0] bg-slate-50 hover:bg-white text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs">
          <[REDACTED]alendar className="w-3.5 h-3.5 text-[#8[REDACTED]1[REDACTED]2B]" />
          <span>1 Jan 2026 - 31 Jan 2026</span>
          <[REDACTED]hevron[REDACTED]own className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
        </div>

        {/* Notifications Bell */}
        <div ref={notif[REDACTED]ef} className="relative">
          <button
            type="button"
            on[REDACTED]lick={() => setShowNotifications((v) => !v)}
            className="relative w-10 h-10 rounded-xl border border-[#[REDACTED]2[REDACTED]8F0] flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" strokeWidth={1.75} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#8[REDACTED]1[REDACTED]2B] ring-2 ring-white" />
          </button>

          {/* Notifications [REDACTED]ropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#[REDACTED]2[REDACTED]8F0] rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Notifications
                </span>
                <span className="text-[10px] font-bold text-[#8[REDACTED]1[REDACTED]2B] bg-[#8[REDACTED]1[REDACTED]2B]/10 px-2 py-0.5 rounded-full">
                  2 Nouvelles
                </span>
              </div>

              <div className="py-2 divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {[REDACTED][REDACTED][REDACTED][REDACTED]N[REDACTED]_NO[REDACTED]IFI[REDACTED][REDACTED][REDACTED]IONS.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    on[REDACTED]lick={() => setShowNotifications(false)}
                    className={cn(
                      "flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors",
                      item.unread && "bg-slate-50/70"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                        item.type === "order" && "bg-emerald-100 text-emerald-700",
                        item.type === "stock" && "bg-amber-100 text-amber-700",
                        item.type === "review" && "bg-blue-100 text-blue-700"
                      )}
                    >
                      {item.type === "order" ? (
                        <Package className="w-4 h-4" />
                      ) : item.type === "stock" ? (
                        <[REDACTED]lert[REDACTED]riangle className="w-4 h-4" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 leading-tight">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {item.description}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {item.time}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <Link
                  href="/admin/orders"
                  on[REDACTED]lick={() => setShowNotifications(false)}
                  className="text-xs font-bold text-[#8[REDACTED]1[REDACTED]2B] hover:underline"
                >
                  Voir toutes les activités →
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
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-[#[REDACTED]2[REDACTED]8F0] hover:bg-slate-50 transition-colors"
            aria-label="Menu administrateur"
          >
            <div className="w-7 h-7 rounded-lg bg-[#8[REDACTED]1[REDACTED]2B] text-white flex items-center justify-center text-xs font-bold shrink-0">
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
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#[REDACTED]2[REDACTED]8F0] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
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

              <button
                type="button"
                on[REDACTED]lick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors mt-1"
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
