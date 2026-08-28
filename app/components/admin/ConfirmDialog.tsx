"use client"

import { AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "info"
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "danger",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-md w-full p-6 overflow-hidden animate-in zoom-in-95 duration-150 relative">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              variant === "danger" && "bg-rose-100 text-rose-600",
              variant === "warning" && "bg-amber-100 text-amber-600",
              variant === "info" && "bg-blue-100 text-blue-600"
            )}
          >
            <AlertTriangle className="w-5 h-5" strokeWidth={2} />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">{description}</p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="h-9 px-4 rounded-xl border border-[#E2E8F0] text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {cancelText}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={cn(
                  "h-9 px-4 rounded-xl text-xs font-bold text-white shadow-xs transition-all",
                  variant === "danger" && "bg-rose-600 hover:bg-rose-700",
                  variant === "warning" && "bg-amber-600 hover:bg-amber-700",
                  variant === "info" && "bg-[#8C1A2B] hover:bg-[#5E0F1D]"
                )}
              >
                {loading ? "Traitement…" : confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
