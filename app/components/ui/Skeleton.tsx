import React from "react"
import { cn } from "@/lib/utils"

// ── Skeleton ──────────────────────────────────────────────────
interface SkeletonProps {
  className?: string
  rounded?: boolean
  style?: React.CSSProperties
}

function Skeleton({ className, rounded, style }: SkeletonProps) {
  return (
    <div
      style={style}
      className={cn(
        "skeleton",
        rounded && "rounded-full",
        className
      )}
      aria-hidden="true"
    />
  )
}

// ── Product Card Skeleton ─────────────────────────────────────
function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <Skeleton className="aspect-[3/4] w-full rounded-[var(--radius-lg)]" />
      <div className="flex flex-col gap-2 px-1">
        <Skeleton className="h-3 w-1/3 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-3.5 w-2/3 rounded" />
        <div className="flex items-center gap-2 mt-1">
          <Skeleton className="h-5 w-20 rounded" />
          <Skeleton className="h-4 w-14 rounded" />
        </div>
      </div>
    </div>
  )
}

// ── Text Skeleton ─────────────────────────────────────────────
function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4 rounded", i === lines - 1 ? "w-3/5" : "w-full")}
        />
      ))}
    </div>
  )
}

// ── Table Row Skeleton ────────────────────────────────────────
function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  )
}

export { Skeleton, ProductCardSkeleton, TextSkeleton, TableRowSkeleton }
