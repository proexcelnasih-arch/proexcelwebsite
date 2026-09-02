"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  DollarSign,
  ShoppingCart,
  Users,
  Truck,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  ChevronDown,
  Package,
  Plus,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Clock,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Hardcoded Zero Metrics (Per Strict Requirements) ─────────────
const KPI_METRICS = [
  {
    id: "revenue",
    title: "Total Revenue",
    value: "$0.00",
    change: "+0.0%",
    timeframe: "vs last month",
    icon: DollarSign,
    iconBg: "bg-red-50 text-[#8C1A2B]",
    trendBg: "bg-slate-100 text-slate-500",
  },
  {
    id: "orders",
    title: "Total Orders",
    value: "0",
    change: "+0.0%",
    timeframe: "vs last month",
    icon: ShoppingCart,
    iconBg: "bg-amber-50 text-amber-600",
    trendBg: "bg-slate-100 text-slate-500",
  },
  {
    id: "customers",
    title: "Total Customers",
    value: "0",
    change: "+0.0%",
    timeframe: "vs last month",
    icon: Users,
    iconBg: "bg-blue-50 text-blue-600",
    trendBg: "bg-slate-100 text-slate-500",
  },
  {
    id: "delivery",
    title: "Pending Delivery",
    value: "0",
    change: "+0.0%",
    timeframe: "vs last month",
    icon: Truck,
    iconBg: "bg-rose-50 text-[#8C1A2B]",
    trendBg: "bg-slate-100 text-slate-500",
  },
]

// ── Top Selling Products Placeholders (0 Pcs Sold) ───────────────
const TOP_PRODUCTS = [
  {
    id: "prod-1",
    name: "Cahier Oxford Polypro A4 96p Grands Carreaux",
    category: "Cahiers & Blocs",
    price: "$1.80",
    sold: "0 Pcs sold",
    image: "/storefront-real.jpg",
    rating: "5.0",
  },
  {
    id: "prod-2",
    name: "Boîte de 50 Stylos à Bille BIC Cristal Original Bleu",
    category: "Écriture & Stylos",
    price: "$12.50",
    sold: "0 Pcs sold",
    image: "/storefront.jpg",
    rating: "4.9",
  },
  {
    id: "prod-3",
    name: "Classeur à Levier Exacompta A4 Dos 80mm",
    category: "Classement & Archivage",
    price: "$3.40",
    sold: "0 Pcs sold",
    image: "/hero-composition.jpg",
    rating: "4.8",
  },
  {
    id: "prod-4",
    name: "Set Traçage Géométrique Maped Technic 4 Pièces",
    category: "Fournitures Scolaires",
    price: "$2.90",
    sold: "0 Pcs sold",
    image: "/storefront-real.jpg",
    rating: "5.0",
  },
]

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export default function AdminDashboardPage() {
  const [chartPeriod, setChartPeriod] = useState<"monthly" | "weekly" | "daily">("monthly")

  return (
    <div className="space-y-6 sm:space-y-8 max-w-[1600px] mx-auto">
      
      {/* ── Dashboard Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
              Overview
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Welcome back to the PROEXCEL Store Management Center.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Date Filter Pill */}
          <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer">
            <Calendar className="w-4 h-4 text-[#8C1A2B]" />
            <span>This Month: Jan 2026</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Add Product CTA */}
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#8C1A2B] hover:bg-[#701422] text-white text-xs font-bold shadow-sm shadow-[#8C1A2B]/20 hover:shadow-md hover:shadow-[#8C1A2B]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* ── 1. KPI Cards (Top Row) ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {KPI_METRICS.map((kpi) => {
          const Icon = kpi.icon

          return (
            <div
              key={kpi.id}
              className="group relative bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-red-900/5 hover:-translate-y-1 transition-all duration-300 cursor-default"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="text-xs sm:text-sm font-semibold text-slate-500">
                  {kpi.title}
                </span>
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                    kpi.iconBg
                  )}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
              </div>

              {/* Bold Primary Value (Hardcoded 0) */}
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {kpi.value}
                </h2>

                <div className="flex items-center gap-2 text-xs">
                  <span className={cn("px-2 py-0.5 rounded-md font-bold text-[11px] flex items-center gap-0.5", kpi.trendBg)}>
                    <ArrowUpRight className="w-3 h-3" />
                    {kpi.change}
                  </span>
                  <span className="text-slate-400 text-[11px]">{kpi.timeframe}</span>
                </div>
              </div>

              {/* Subtle Bottom Accent Indicator on Hover */}
              <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-[#8C1A2B] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
            </div>
          )
        })}
      </div>

      {/* ── 2. Charts Section: Sales Analytic & Sales Target ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Large Line Chart Panel: Sales Analytic (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            {/* Panel Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h2 className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Sales Analytic
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Revenue and performance overview across the selected period
                </p>
              </div>

              {/* Timeframe Filter Buttons */}
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 text-xs font-semibold text-slate-600 self-start sm:self-auto">
                {(["monthly", "weekly", "daily"] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setChartPeriod(period)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg capitalize transition-all duration-200 cursor-pointer",
                      chartPeriod === period
                        ? "bg-white text-[#8C1A2B] font-bold shadow-2xs"
                        : "hover:text-slate-900"
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Flat Zero-Line Chart Graphic (SVG) */}
            <div className="relative pt-6 pb-2">
              <div className="h-64 sm:h-72 w-full flex flex-col justify-between">
                
                {/* SVG Canvas */}
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="zeroLineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8C1A2B" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#8C1A2B" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid Guidelines */}
                  <line x1="0" y1="20" x2="600" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="65" x2="600" y2="65" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="110" x2="600" y2="110" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="155" x2="600" y2="155" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                  
                  {/* Baseline (0 value line) */}
                  <line x1="0" y1="190" x2="600" y2="190" stroke="#E2E8F0" strokeWidth="1.5" />

                  {/* Filled Area beneath the 0 baseline */}
                  <polygon points="0,190 600,190 600,200 0,200" fill="url(#zeroLineGradient)" />

                  {/* Flat zero line */}
                  <line
                    x1="0"
                    y1="190"
                    x2="600"
                    y2="190"
                    stroke="#8C1A2B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* 12 Interactive Zero Dots on the baseline */}
                  {MONTHS.map((_, i) => {
                    const cx = (i / 11) * 600
                    return (
                      <circle
                        key={i}
                        cx={cx}
                        cy={190}
                        r={3.5}
                        className="fill-white stroke-[#8C1A2B] hover:r-5 transition-all cursor-pointer"
                        strokeWidth={2}
                      />
                    )
                  })}
                </svg>

                {/* X-Axis Month Labels */}
                <div className="flex justify-between text-[11px] font-medium text-slate-400 pt-2 select-none">
                  {MONTHS.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Chart Summaries */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-5 mt-4 border-t border-slate-100">
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 block">Total Sales</span>
              <span className="text-sm sm:text-base font-bold text-slate-900">$0.00</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 block">Average Order</span>
              <span className="text-sm sm:text-base font-bold text-slate-900">$0.00</span>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 block">Conversion Rate</span>
              <span className="text-sm sm:text-base font-bold text-slate-900">0.0%</span>
            </div>
          </div>
        </div>

        {/* Small Doughnut Panel: Sales Target (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h2 className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Sales Target
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Monthly revenue goal progress
                </p>
              </div>
              <span className="p-2 rounded-xl bg-slate-50 text-slate-400">
                <TrendingUp className="w-4 h-4 text-[#8C1A2B]" />
              </span>
            </div>

            {/* Circular Doughnut Chart (0% Progress with Clean Grey Track) */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  {/* Background Track (Grey) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="64"
                    fill="transparent"
                    stroke="#F1F5F9"
                    strokeWidth="14"
                  />
                  {/* Active Progress Ring (0% shown, soft zero head) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="64"
                    fill="transparent"
                    stroke="#8C1A2B"
                    strokeWidth="14"
                    strokeDasharray="402.12"
                    strokeDashoffset="402.12"
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* Center Content: Bold 0 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    0%
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                    Completed
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center max-w-[200px] mt-4">
                You haven&apos;t generated sales towards your monthly goal yet.
              </p>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                Target Goal
              </span>
              <span className="font-bold text-slate-800">$0.00</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8C1A2B]" />
                Current Revenue
              </span>
              <span className="font-bold text-slate-800">$0.00</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Remaining
              </span>
              <span className="font-bold text-slate-800">$0.00</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── 3. Bottom Section: Top Selling Products ────────────────── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-lg text-slate-900 tracking-tight">
                Top Selling Products
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-[#8C1A2B]">
                0 Total Sales
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Best-performing catalog articles and live inventory highlights
            </p>
          </div>

          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C1A2B] hover:text-[#701422] transition-colors group self-start sm:self-auto cursor-pointer"
          >
            <span>View All Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TOP_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="group relative bg-slate-50/60 hover:bg-white rounded-2xl p-3.5 border border-slate-100 hover:border-slate-200 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Product Image with Hover Zoom Container */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white mb-3 border border-slate-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* 0 Pcs Sold Badge Overlay */}
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-white/95 backdrop-blur-xs text-slate-600 border border-slate-200/80 shadow-xs">
                    {product.sold}
                  </span>
                </div>

                {/* Category & Rating */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="font-semibold uppercase tracking-wider truncate">
                    {product.category}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-slate-600 shrink-0">
                    ★ {product.rating}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-[#8C1A2B] transition-colors">
                  {product.name}
                </h3>
              </div>

              {/* Price & Action Row */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100/80">
                <div>
                  <span className="text-[10px] text-slate-400 block leading-none">Price</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                    {product.price}
                  </span>
                </div>

                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center group-hover:bg-[#8C1A2B] group-hover:border-[#8C1A2B] group-hover:text-white transition-all shadow-2xs">
                  <Eye className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
