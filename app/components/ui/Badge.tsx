"use client"

import { cn } from "@/lib/utils"
import React from "react"

// ── Badge ─────────────────────────────────────────────────────
type BadgeVariant = "new" | "sale" | "bestseller" | "featured" | "outofstock" | "default" | "accent"

interface BadgeProps {
  variant?: BadgeVariant
  className?: string
  children: React.ReactNode
}

const badgeVariantStyles: Record<BadgeVariant, string> = {
  new: "bg-[var(--color-badge-new)] text-[var(--color-text-primary)] font-bold",
  sale: "bg-[var(--color-discount)] text-white",
  bestseller: "bg-[var(--color-primary)] text-white",
  featured: "bg-[var(--color-success)] text-white",
  outofstock: "bg-[var(--color-neutral-400)] text-white",
  default: "bg-[var(--color-neutral-200)] text-[var(--color-text-secondary)]",
  accent: "bg-[var(--color-accent)] text-[var(--color-text-primary)] font-bold",
}

function Badge({ variant = "default", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase rounded-[var(--radius-sm)]",
        badgeVariantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

// ── Status Badge ──────────────────────────────────────────────
interface StatusBadgeProps {
  status: string
  className?: string
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  paid: "bg-green-100 text-green-800",
  refunded: "bg-orange-100 text-orange-800",
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-600",
  instock: "bg-green-100 text-green-800",
  lowstock: "bg-amber-100 text-amber-800",
  outofstock: "bg-red-100 text-red-800",
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = status.toLowerCase().replace(/\s+/g, "")
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full capitalize",
        statusStyles[key] ?? "bg-gray-100 text-gray-600",
        className
      )}
    >
      {status}
    </span>
  )
}

export { Badge, StatusBadge }
export type { BadgeProps, BadgeVariant }
