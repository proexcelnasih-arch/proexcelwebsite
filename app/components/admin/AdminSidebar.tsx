"use client"

import { Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  PlusCircle,
  Layers,
  Boxes,
  Users,
  Tag,
  MessageSquareQuote,
  Palette,
  Settings,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminSidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
  onCloseMobile?: () => void
  logoUrl?: string | null
}

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: string | number
  badgeColor?: string
  exact?: boolean
}

// ── Flat Navigation List (Sedap Style — No Accordion Dropdowns) ──
const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Commandes",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Produits",
    href: "/admin/products",
    icon: Package,
    exact: true,
  },
  {
    title: "Ajouter Produit",
    href: "/admin/products/new",
    icon: PlusCircle,
    exact: true,
  },
  {
    title: "Catégories",
    href: "/admin/categories",
    icon: Layers,
  },
  {
    title: "Stock & Inventaire",
    href: "/admin/inventory",
    icon: Boxes,
  },
  {
    title: "Clients",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Marketing & Coupons",
    href: "/admin/coupons",
    icon: Tag,
  },
  {
    title: "Avis Clients",
    href: "/admin/reviews",
    icon: MessageSquareQuote,
  },
  {
    title: "Vitrine & CMS",
    href: "/admin/storefront",
    icon: Palette,
  },
  {
    title: "Paramètres",
    href: "/admin/settings/store",
    icon: Settings,
  },
]

function SidebarNavList({
  collapsed,
  onCloseMobile,
}: {
  collapsed: boolean
  onCloseMobile?: () => void
}) {
  const pathname = usePathname()

  function isItemActive(item: NavItem) {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname.startsWith(item.href)
  }

  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3.5 py-4 space-y-1 scrollbar-thin">
      {NAV_ITEMS.map((item) => {
        const active = isItemActive(item)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onCloseMobile}
            className={cn(
              "group relative flex items-center rounded-2xl text-[13px] font-medium transition-all duration-200 cursor-pointer",
              collapsed ? "p-3 justify-center" : "px-4 py-3 gap-3.5",
              active
                ? "bg-[#8C1A2B]/10 text-[#8C1A2B] font-bold shadow-2xs"
                : "text-slate-500 hover:text-[#8C1A2B] hover:bg-[#8C1A2B]/5"
            )}
            title={collapsed ? item.title : undefined}
          >
            {/* ── Active Left Indicator Bar (Sedap Style) ──────── */}
            {active && (
              <span
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-[#8C1A2B] rounded-r-full transition-all duration-200",
                  collapsed ? "-left-1 h-5" : "-left-3.5"
                )}
              />
            )}

            {/* Icon */}
            <Icon
              className={cn(
                "w-5 h-5 shrink-0 transition-colors duration-200",
                active
                  ? "text-[#8C1A2B]"
                  : "text-slate-400 group-hover:text-[#8C1A2B]"
              )}
              strokeWidth={active ? 2.25 : 1.75}
            />

            {/* Label */}
            {!collapsed && (
              <span className="truncate flex-1 tracking-tight">
                {item.title}
              </span>
            )}

            {/* Optional Badge */}
            {!collapsed && item.badge && (
              <span
                className={cn(
                  "text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0",
                  item.badgeColor ?? "bg-slate-100 text-slate-700"
                )}
              >
                {item.badge}
              </span>
            )}
          </Link>
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
      {/* ── Top Brand Header (Sedap Style) ───────────────────── */}
      <div className="h-20 border-b border-[#E2E8F0] flex items-center justify-between px-5 shrink-0">
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
              <div className="flex items-center">
                <span className="font-sans font-extrabold text-xl text-slate-900 tracking-tight leading-none">
                  ProExcel
                </span>
                <span className="text-[#8C1A2B] font-extrabold text-xl leading-none">.</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 mt-1 leading-none">
                Admin Dashboard
              </span>
            </div>
          )}
        </Link>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex w-7 h-7 rounded-lg border border-[#E2E8F0] items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            aria-label={collapsed ? "Agrandir le menu" : "Réduire le menu"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* ── Navigation Items ─────────────────────────────────── */}
      <Suspense fallback={<div className="flex-1 p-4 text-xs text-slate-400">Chargement du menu…</div>}>
        <SidebarNavList collapsed={collapsed} onCloseMobile={onCloseMobile} />
      </Suspense>

      {/* ── Bottom Promotional Card (Sedap Style) ─────────────── */}
      {!collapsed && (
        <div className="px-3.5 pb-2 shrink-0">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#8C1A2B] to-[#5E0F1D] text-white shadow-sm relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <p className="text-[11px] font-medium leading-relaxed text-white/90">
                Besoin d&apos;ajouter un produit rapidement à votre catalogue ?
              </p>
              <Link
                href="/admin/products/new"
                onClick={onCloseMobile}
                className="inline-flex items-center justify-center w-full py-2 px-3 rounded-xl bg-white text-[#8C1A2B] text-xs font-bold shadow-2xs hover:bg-slate-50 transition-colors"
              >
                + Nouveau Produit
              </Link>
            </div>
            {/* Soft decorative background circles */}
            <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-xs pointer-events-none" />
            <div className="absolute -top-6 -left-6 w-16 h-16 bg-white/5 rounded-full blur-xs pointer-events-none" />
          </div>
        </div>
      )}

      {/* ── Bottom Storefront Quick Link ─────────────────────── */}
      <div className="p-3 border-t border-[#E2E8F0] shrink-0">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#8C1A2B] hover:bg-slate-50 border border-[#E2E8F0] transition-all",
            collapsed ? "p-2.5 justify-center" : "px-3.5 py-2.5"
          )}
        >
          <ExternalLink className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          {!collapsed && <span>Voir la boutique</span>}
        </Link>
      </div>
    </aside>
  )
}
