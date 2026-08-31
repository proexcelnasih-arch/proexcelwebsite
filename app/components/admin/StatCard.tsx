import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  change: number // e.g. +12.5 or -3.2
  showChange?: boolean // if false, hides the trend footer entirely
  period?: string
  icon: LucideIcon
  iconColor?: "burgundy" | "amber" | "blue" | "purple" | "emerald"
  sparklineData?: number[]
}

export function StatCard({
  title,
  value,
  change,
  showChange = true,
  period = "vs 7 derniers jours",
  icon: Icon,
  iconColor = "burgundy",
  sparklineData = [10, 15, 12, 18, 20, 25, 22, 30],
}: StatCardProps) {
  const isPositive = change >= 0

  const colorMap = {
    burgundy: { bg: "bg-[#8C1A2B]/10", text: "text-[#8C1A2B]", stroke: "#8C1A2B" },
    amber: { bg: "bg-amber-100", text: "text-amber-700", stroke: "#D97706" },
    blue: { bg: "bg-blue-100", text: "text-blue-700", stroke: "#2563EB" },
    purple: { bg: "bg-purple-100", text: "text-purple-700", stroke: "#7C3AED" },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-700", stroke: "#16A34A" },
  }

  const selectedColor = colorMap[iconColor] || colorMap.burgundy

  // Generate SVG path for sparkline
  const maxVal = Math.max(...sparklineData, 1)
  const minVal = Math.min(...sparklineData, 0)
  const range = maxVal - minVal || 1
  const width = 80
  const height = 36

  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width
      const y = height - ((val - minVal) / range) * (height - 6) - 3
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
      {/* Top Row: Icon + Sparkline */}
      <div className="flex items-center justify-between mb-3">
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
            selectedColor.bg,
            selectedColor.text
          )}
        >
          <Icon className="w-5 h-5" strokeWidth={1.75} />
        </div>

        {/* Sparkline curve */}
        <div className="w-20 h-9 shrink-0">
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
      </div>

      {/* Title & Metric */}
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
          {value}
        </h3>
      </div>

      {/* Percentage Trend footer — only when showChange is true */}
      {showChange && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-bold text-[11px] px-1.5 py-0.5 rounded-md",
              isPositive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
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
          <span className="text-slate-400 text-[11px]">{period}</span>
        </div>
      )}
    </div>
  )
}
