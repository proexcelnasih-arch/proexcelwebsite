import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// ── Class name merger ─────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Price formatting ──────────────────────────────────────────
export function formatPrice(amount: number): string {
  return `${amount.toLocaleString("fr-MA")} DH`
}

export function formatPriceNumber(amount: number): string {
  return amount.toLocaleString("fr-MA")
}

export function calculateDiscount(price: number, compareAtPrice: number): number {
  if (compareAtPrice <= 0) return 0
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
}

export function formatDiscount(price: number, compareAtPrice: number): string {
  const pct = calculateDiscount(price, compareAtPrice)
  return `-${pct}%`
}

// ── Slug generation ───────────────────────────────────────────
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

// ── Order number generation ───────────────────────────────────
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `CMD-${timestamp}-${random}`
}

// ── Date formatting ───────────────────────────────────────────
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-MA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-MA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date))
}

export function formatRelativeDate(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return "Hier"
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
  if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`
  return formatDate(date)
}

// ── Validation ────────────────────────────────────────────────
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidMoroccanPhone(phone: string): boolean {
  // Moroccan phone: +212 or 0 followed by 9 digits
  const cleaned = phone.replace(/\s/g, "")
  return /^(\+212|0)[5-7]\d{8}$/.test(cleaned)
}

// ── Text helpers ──────────────────────────────────────────────
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "…"
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// ── Rating helpers ────────────────────────────────────────────
export function generateStarArray(rating: number): ("full" | "half" | "empty")[] {
  const stars: ("full" | "half" | "empty")[] = []
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push("full")
    } else if (rating >= i - 0.5) {
      stars.push("half")
    } else {
      stars.push("empty")
    }
  }
  return stars
}

// ── URL helpers ───────────────────────────────────────────────
export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value))
    }
  }
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ""
}

// ── Image helpers ─────────────────────────────────────────────
export function getProductImageUrl(url: string | null | undefined, fallback = "/images/product-placeholder.jpg"): string {
  if (!url) return fallback
  return url
}

// ── Color helpers for status badges ──────────────────────────
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    paid: "bg-green-100 text-green-800",
    refunded: "bg-orange-100 text-orange-800",
  }
  return map[status] ?? "bg-gray-100 text-gray-800"
}

// ── Debounce ──────────────────────────────────────────────────
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// ── Local storage helpers ─────────────────────────────────────
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or private mode
  }
}
