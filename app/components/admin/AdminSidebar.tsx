"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import Image from "next/image"
import {
  ChevronDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ADMIN_NAVIGATION, type AdminNavGroup } from "@/lib/admin/admin-navigation"
import { createClient } from "@/lib/supabase/client"

interface AdminSidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
  onCloseMobile?: () => void
  logoUrl?: string | null
}

function SidebarNavList({
  collapsed,
  onCloseMobile,
}: {
  collapsed: boolean
  onCloseMobile?: () => void
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    main: true,
    orders: true,
    products: true,
    categories: false,
    inventory: false,
    customers: false,
    marketing: false,
    storefront: false,
    settings: false,
  })

  function toggleGroup(groupId: string) {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }))
  }

  function isItemActive(href: string) {
    const [targetPath, targetQuery] = href.split("?")
    if (targetQuery) {
      const statusParam = searchParams.get("status")
      const tabParam = searchParams.get("tab")
      if (statusParam && targetQuery.includes(`status=${statusParam}`)) return true
      if (tabParam && targetQuery.includes(`tab=${tabParam}`)) return true
      return false
    }
    if (href === "/admin") return pathname === "/admin"
    return (
      pathname === targetPath &&
      !searchParams.get("status") &&
      !searchParams.get("tab")
    )
  }

  function isGroupActive(group: AdminNavGroup) {
    return group.items.some((item) => isItemActive(item.href))
  }

  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3 scrollbar-thin">
      {ADMIN_NAVIGATION.map((group) => {
        const isOpen = openGroups[group.id] ?? false
        const groupActive = isGroupActive(group)
        const GroupIcon = group.icon

        // When group has only 1 item (like Dashboard)
        const isSingleItem = group.items.length === 1
        const singleItem = isSingleItem ? group.items[0] : null
        const singleActive = singleItem ? isItemActive(singleItem.href) : false

        if (isSingleItem && singleItem) {
          return (
            <div key={group.id}>
              <Link
                href={singleItem.href}
                onClick={onCloseMobile}
                className={cn(
                  "group relative flex items-center rounded-xl text-xs font-semibold transition-all duration-200",
                  collapsed ? "p-2.5 justify-center" : "px-3 py-2.5 gap-3",
                  singleActive
                    ? "bg-[#8C1A2B]/10 text-[#8C1A2B] font-bold shadow-2xs"
                    : "text-slate-600 hover:text-[#8C1A2B] hover:bg-slate-50"
                )}
                title={collapsed ? singleItem.title : undefined}
              >
                {/* Active circle indicator behind icon */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                    singleActive
                      ? "bg-[#8C1A2B] text-white shadow-2xs"
                      : "bg-slate-100 text-slate-500 group-hover:bg-[#8C1A2B]/10 group-hover:text-[#8C1A2B]"
                  )}
                >
                  <GroupIcon className="w-4 h-4" strokeWidth={1.75} />
                </div>

                {!collapsed && (
                  <span className="truncate flex-1 font-bold text-slate-800 group-hover:text-[#8C1A2B]">
                    {singleItem.title}
                  </span>
                )}

                {/* Active indicator dot */}
                {singleActive && !collapsed && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8C1A2B] shrink-0" />
                )}
              </Link>
            </div>
          )
        }

        return (
          <div key={group.id} className="space-y-1">
            {/* Group Header Button */}
            {!collapsed ? (
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  "w-full flex items-center justify-between px-2 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer group",
                  groupActive
                    ? "text-[#8C1A2B]"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-2.5">
                  {/* Rounded icon badge matching reference */}
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                      groupActive
                        ? "bg-[#8C1A2B]/15 text-[#8C1A2B]"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/70 group-hover:text-slate-800"
                    )}
                  >
                    <GroupIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </div>
                  <span className="uppercase text-[11px] tracking-wider truncate">
                    {group.title}
                  </span>
                </div>

                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                    isOpen ? "rotate-0" : "-rotate-90"
                  )}
                  strokeWidth={2}
                />
              </button>
            ) : (
              <div className="w-full flex justify-center py-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                    groupActive
                      ? "bg-[#8C1A2B] text-white shadow-2xs"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  )}
                  title={group.title}
                >
                  <GroupIcon className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
            )}

            {/* Sub-items List */}
            {(isOpen || collapsed) && (
              <div className={cn("space-y-0.5", !collapsed && "pl-6 pr-1")}>
                {group.items.map((item) => {
                  const active = isItemActive(item.href)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "group relative flex items-center justify-between rounded-lg text-xs transition-all duration-200",
                        collapsed ? "p-2 justify-center" : "px-3 py-2",
                        active
                          ? "bg-[#8C1A2B]/10 text-[#8C1A2B] font-bold"
                          : "text-slate-600 hover:text-[#8C1A2B] hover:bg-slate-50 hover:translate-x-0.5"
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      {/* Left accent bar on active item */}
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#8C1A2B] rounded-r-full" />
                      )}

                      <span className="truncate">{item.title}</span>

                      {item.badge ? (
                        <span
                          className={cn(
                            "text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ml-1.5 shrink-0",
                            item.badgeColor ?? "bg-slate-200 text-slate-700"
                          )}
                        >
                          {item.badge}
                        </span>
                      ) : active ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8C1A2B] shrink-0 ml-1.5" />
                      ) : null}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}

export function AdminSidebar({
  collapsed = false,
  onToggleCollapse,
  onCloseMobile,
  logoUrl,
}: AdminSidebarProps) {
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
    <aside
      className={cn(
        "bg-white border-r border-slate-200/80 flex flex-col h-screen sticky top-0 transition-all duration-300 z-30 select-none shadow-2xs",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* ── Top Brand Header ─────────────────────────────────── */}
      <div className="h-16 border-b border-slate-100 flex items-center justify-between px-4 shrink-0">
        <Link
          href="/admin"
          className="flex items-center gap-3 overflow-hidden group"
          aria-label="ProExcel Admin Portal"
        >
          {/* Circular logo avatar matching reference */}
          <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105">
            <Image
              src={logoUrl || "/logo.png"}
              alt="ProExcel Logo"
              width={32}
              height={32}
              className="w-7 h-7 object-contain"
              priority
            />
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center">
                <span className="font-sans font-extrabold text-base text-slate-900 tracking-tight leading-none truncate">
                  ProExcel
                </span>
                <span className="text-[#8C1A2B] font-extrabold text-base leading-none">.</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1 leading-none">
                Admin Portal
              </span>
            </div>
          )}
        </Link>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex w-7 h-7 rounded-lg border border-slate-200 items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            aria-label={collapsed ? "Agrandir le menu" : "Réduire le menu"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* ── Navigation Items ─────────────────────────────────── */}
      <Suspense fallback={<div className="flex-1 p-4 text-xs text-slate-400">Chargement...</div>}>
        <SidebarNavList collapsed={collapsed} onCloseMobile={onCloseMobile} />
      </Suspense>

      {/* ── Pinned Bottom Action Icons (Reference Style) ──────── */}
      <div className="p-3 border-t border-slate-100 flex flex-col gap-1.5 shrink-0 bg-slate-50/50">
        {/* Settings Shortcut */}
        <Link
          href="/admin/settings/store"
          onClick={onCloseMobile}
          className={cn(
            "flex items-center gap-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#8C1A2B] hover:bg-white hover:shadow-2xs transition-all",
            collapsed ? "p-2.5 justify-center" : "px-3 py-2"
          )}
          title="Paramètres de la boutique"
        >
          <Settings className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-[#8C1A2B]" />
          {!collapsed && <span>Paramètres</span>}
        </Link>

        {/* Storefront Link */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#8C1A2B] hover:bg-white hover:shadow-2xs transition-all",
            collapsed ? "p-2.5 justify-center" : "px-3 py-2"
          )}
          title="Voir la boutique en direct"
        >
          <ExternalLink className="w-4 h-4 shrink-0 text-slate-400" />
          {!collapsed && <span>Voir la boutique</span>}
        </Link>

        {/* Logout button */}
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer",
            collapsed ? "p-2.5 justify-center" : "px-3 py-2"
          )}
          title="Se déconnecter"
        >
          <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  )
}
