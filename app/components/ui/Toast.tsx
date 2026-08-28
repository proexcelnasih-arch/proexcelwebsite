"use client"

import React, { createContext, useCallback, useContext, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ToastMessage } from "@/types"

// ── Context ───────────────────────────────────────────────────
interface ToastContextValue {
  toasts: ToastMessage[]
  toast: (msg: Omit<ToastMessage, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

// ── Hook ──────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used inside <Toaster>")
  return ctx
}

// ── Icons ─────────────────────────────────────────────────────
const ICONS: Record<ToastMessage["type"], React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 shrink-0" />,
  error: <AlertCircle className="w-5 h-5 shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 shrink-0" />,
  info: <Info className="w-5 h-5 shrink-0" />,
}

const TYPE_STYLES: Record<ToastMessage["type"], string> = {
  success: "border-green-200 bg-green-50 text-green-900 [&_svg]:text-green-600",
  error: "border-red-200 bg-red-50 text-red-900 [&_svg]:text-red-600",
  warning: "border-amber-200 bg-amber-50 text-amber-900 [&_svg]:text-amber-600",
  info: "border-blue-200 bg-blue-50 text-blue-900 [&_svg]:text-blue-600",
}

// ── Toast Item ────────────────────────────────────────────────
function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "flex items-start gap-3 w-full max-w-sm p-4 rounded-[var(--radius-lg)] border shadow-md",
        TYPE_STYLES[toast.type]
      )}
      role="alert"
      aria-live="polite"
    >
      {ICONS[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs opacity-80">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 p-0.5 rounded opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

// ── Toaster Provider ──────────────────────────────────────────
export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const toast = useCallback((msg: Omit<ToastMessage, "id">) => {
    const id = crypto.randomUUID()
    const duration = msg.duration ?? 4000
    setToasts((prev) => [...prev, { ...msg, id }])
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[var(--z-toast)] flex flex-col gap-2 pointer-events-none"
        aria-label="Notifications"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onDismiss={() => dismiss(t.id)} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
