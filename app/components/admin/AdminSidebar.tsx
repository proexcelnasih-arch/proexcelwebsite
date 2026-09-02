"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import Image from "next/image"
import {
  ChevronDown,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Boxes,
  Users,
  Tag,
  Palette,
  Settings,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ADMIN_NAVIGATION, type AdminNavGroup } from "@/lib/admin/admin-navigation"

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
    categories: true,
    inventory: true,
    customers: true,
    marketing: true,
    storefront: true,
    settings: true,
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
    return pathname === targetPath && !searchParams.get("status") && !searchParams.get("tab")
  }

  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4 scrollbar-thin">
      {ADMIN_NAVIGATION.map((group) => {
        const isOpen = openGroups[group.id] ?? true
        const GroupIcon = group.icon

        return (
          <div key={group.id} className="space-y-1">
            {/* Group Header Button */}
            {!collapsed ? (
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                    <GroupIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </div>
                  <span>{group.title}</span>
                </div>
                {group.items.length > 1 && (
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                      isOpen ? "rotate-0" : "-rotate-90"
                    )}
                    strokeWidth={2}
                  />
                )}
              </button>
            ) : (
              <div className="w-full flex justify-center py-1">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <GroupIcon className="w-4 h-4" strokeWidth={1.75} />
                </div>
              </div>
            )}

            {/* Sub-items List */}
            {(isOpen || collapsed) && (
              <div className={cn("space-y-0.5", !collapsed && "pl-2")}>
                {group.items.map((item) => {
                  const active = isItemActive(item.href)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "group flex items-center justify-between rounded-xl text-xs font-semibold transition-all duration-150",
                        collapsed ? "p-2.5 justify-center" : "px-3 py-2",
                        active
                          ? "bg-[#8C1A2B] text-white shadow-xs font-bold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <span className="truncate">{item.title}</span>

                      {item.badge && !collapsed && (
                        <span
                          className={cn(
                            "text-[10px] font-extrabold px-1.5 py-0.5 rounded-full",
                            active
                              ? "bg-white/20 text-white"
                              : item.badgeColor ?? "bg-slate-200 text-slate-700"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
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
  return (
    <aside
      className={cn(
        "bg-white border-r border-[#E2E8F0] flex flex-col h-screen sticky top-0 transition-all duration-300 z-30 select-none",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* ── Top Brand Header ─────────────────────────────────── */}
      <div className="h-16 border-b border-[#E2E8F0] flex items-center justify-between px-4 shrink-0">
        <Link
          href="/admin"
          className="flex items-center gap-3 overflow-hidden group"
          aria-label="ProExcel Admin Dashboard"
        >
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <Image
              src={logoUrl || "/logo.png"}
              alt="ProExcel Logo"
              width={40}
              height={40}
              className="w-10 h-10 object-contain transition-transform group-hover:scale-105"
              priority
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-sans font-bold text-sm text-slate-900 tracking-tight leading-tight truncate">
                ProExcel
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C1A2B]">
                Admin Portal
              </span>
            </div>
          )}
        </Link>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex w-7 h-7 rounded-lg border border-[#E2E8F0] items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* ── Navigation Items (Wrapped in Suspense) ───────────── */}
      <Suspense fallback={<div className="flex-1 p-4 text-xs text-slate-400">Chargement menu…</div>}>
        <SidebarNavList collapsed={collapsed} onCloseMobile={onCloseMobile} />
      </Suspense>

      {/* ── Bottom Storefront Quick Link ─────────────────────── */}
      <div className="p-3 border-t border-[#E2E8F0] shrink-0">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#8C1A2B] hover:bg-slate-50 border border-[#E2E8F0] transition-all",
            collapsed ? "p-2.5 justify-center" : "px-3 py-2.5"
          )}
        >
          <ExternalLink className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          {!collapsed && <span>Voir la boutique</span>}
        </Link>
      </div>
    </aside>
  )
}
