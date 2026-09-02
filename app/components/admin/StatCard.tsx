import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  change?: number // Percentage change (e.g. +12.5 or -3.2). If undefined or null, trend badge is omitted cleanly
  showChange?: boolean // Explicit flag to control trend badge display
  period?: string
  icon: LucideIcon
  iconColor?: "burgundy" | "amber" | "blue" | "purple" | "emerald"
  sparklineData?: number[]
  subtitle?: string
}

export function StatCard({
  title,
  value,
  change,
  showChange = true,
  period = "ce mois",
  icon: Icon,
  iconColor = "burgundy",
  sparklineData = [10, 15, 12, 18, 20, 25, 22, 30],
  subtitle,
}: StatCardProps) {
  const hasValidTrend = change !== undefined && change !== null && showChange
  const isPositive = hasValidTrend ? change >= 0 : false

  const colorMap = {
    burgundy: {
      bg: "bg-[#8C1A2B]/10",
      text: "text-[#8C1A2B]",
      stroke: "#8C1A2B",
      fill: "#8C1A2B",
    },
    amber: {
      bg: "bg-amber-100/70",
      text: "text-amber-700",
      stroke: "#D97706",
      fill: "#D97706",
    },
    blue: {
      bg: "bg-blue-100/70",
      text: "text-blue-700",
      stroke: "#2563EB",
      fill: "#2563EB",
    },
    purple: {
      bg: "bg-purple-100/70",
      text: "text-purple-700",
      stroke: "#7C3AED",
      fill: "#7C3AED",
    },
    emerald: {
      bg: "bg-emerald-100/70",
      text: "text-emerald-700",
      stroke: "#16A34A",
      fill: "#16A34A",
    },
  }

  const selectedColor = colorMap[iconColor] || colorMap.burgundy

  // Generate SVG path for sparkline
  const maxVal = Math.max(...sparklineData, 1)
  const minVal = Math.min(...sparklineData, 0)
  const range = maxVal - minVal || 1
  const width = 84
  const height = 36

  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width
      const y = height - ((val - minVal) / range) * (height - 8) - 4
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
      {/* Top Row: Icon + Sparkline */}
      <div className="flex items-center justify-between mb-3">
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs",
            selectedColor.bg,
            selectedColor.text
          )}
        >
          <Icon className="w-5 h-5" strokeWidth={1.75} />
        </div>

        {/* Sparkline curve */}
        {sparklineData.length > 1 && (
          <div className="w-20 h-9 shrink-0 opacity-85">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <polyline
                fill="none"
                stroke={selectedColor.stroke}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
          </div>
        )}
      </div>

      {/* Title & Metric Value */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 tracking-tight">
          {title}
        </p>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
          {value}
        </h3>
      </div>

      {/* Footer: Trend badge or clean subtitle */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
        {hasValidTrend ? (
          <>
            <span
              className={cn(
                "inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-full",
                isPositive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  : "bg-rose-50 text-rose-700 border border-rose-200/60"
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3 text-emerald-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-rose-600" />
              )}
              <span>
                {isPositive ? "+" : ""}
                {change}%
              </span>
            </span>
            <span className="text-slate-400 text-[11px] truncate">{period}</span>
          </>
        ) : (
          <span className="text-slate-400 text-[11px] truncate">
            {subtitle || period}
          </span>
        )}
      </div>
    </div>
  )
}
