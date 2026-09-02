import React from "react"
import { cn } from "@/lib/utils"

interface AdminCardProps {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  accentColor?: string // Defaults to ProExcel burgundy (#8C1A2B)
  children: React.ReactNode
  className?: string
  headerClassName?: string
  noPadding?: boolean
}

export function AdminCard({
  title,
  subtitle,
  action,
  accentColor = "bg-[#8C1A2B]",
  children,
  className,
  headerClassName,
  noPadding = false,
}: AdminCardProps) {
  const hasHeader = Boolean(title || subtitle || action)

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col",
        className
      )}
    >
      {hasHeader && (
        <div
          className={cn(
            "flex items-center justify-between gap-3 px-5 py-4 sm:px-6 border-b border-slate-100",
            headerClassName
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Colored Accent Bar on Title */}
            <span
              className={cn("w-1.5 h-4.5 rounded-full shrink-0", accentColor)}
              aria-hidden="true"
            />
            <div className="min-w-0">
              {title && (
                <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {action && <div className="shrink-0 flex items-center">{action}</div>}
        </div>
      )}

      <div className={cn(!noPadding && "p-5 sm:p-6", "flex-1")}>
        {children}
      </div>
    </div>
  )
}
