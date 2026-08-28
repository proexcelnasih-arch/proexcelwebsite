import { cn } from "@/lib/utils"

export type StatusType =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "active"
  | "inactive"
  | "approved"
  | "rejected"

interface StatusBadgeProps {
  status: StatusType | string
  label?: string
  className?: string
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  // Orders
  pending: { label: "En attente", bg: "bg-amber-50 border-amber-200/80", text: "text-amber-700", dot: "bg-amber-500" },
  confirmed: { label: "Confirmée", bg: "bg-blue-50 border-blue-200/80", text: "text-blue-700", dot: "bg-blue-500" },
  processing: { label: "En préparation", bg: "bg-purple-50 border-purple-200/80", text: "text-purple-700", dot: "bg-purple-500" },
  shipped: { label: "Expédiée", bg: "bg-indigo-50 border-indigo-200/80", text: "text-indigo-700", dot: "bg-indigo-500" },
  delivered: { label: "Livrée", bg: "bg-emerald-50 border-emerald-200/80", text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled: { label: "Annulée", bg: "bg-rose-50 border-rose-200/80", text: "text-rose-700", dot: "bg-rose-500" },

  // Inventory
  in_stock: { label: "En stock", bg: "bg-emerald-50 border-emerald-200/80", text: "text-emerald-700", dot: "bg-emerald-500" },
  low_stock: { label: "Stock faible", bg: "bg-amber-50 border-amber-200/80", text: "text-amber-700", dot: "bg-amber-500" },
  out_of_stock: { label: "Rupture", bg: "bg-rose-50 border-rose-200/80", text: "text-rose-700", dot: "bg-rose-500" },

  // Generic / Moderation
  active: { label: "Actif", bg: "bg-emerald-50 border-emerald-200/80", text: "text-emerald-700", dot: "bg-emerald-500" },
  inactive: { label: "Inactif", bg: "bg-slate-100 border-slate-200/80", text: "text-slate-600", dot: "bg-slate-400" },
  approved: { label: "Approuvé", bg: "bg-emerald-50 border-emerald-200/80", text: "text-emerald-700", dot: "bg-emerald-500" },
  rejected: { label: "Rejeté", bg: "bg-rose-50 border-rose-200/80", text: "text-rose-700", dot: "bg-rose-500" },
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status.toLowerCase()] ?? {
    label: status,
    bg: "bg-slate-100 border-slate-200",
    text: "text-slate-700",
    dot: "bg-slate-500",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border tracking-tight transition-colors",
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)} aria-hidden="true" />
      <span>{label ?? config.label}</span>
    </span>
  )
}
