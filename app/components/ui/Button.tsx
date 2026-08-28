"use client"

import { cn } from "@/lib/utils"
import React from "react"

// ── Types ─────────────────────────────────────────────────────
type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "accent"
type ButtonSize = "sm" | "md" | "lg" | "icon"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  as?: "button" | "div"
}

// ── Styles ────────────────────────────────────────────────────
const baseStyles =
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap"

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] focus-visible:ring-[var(--color-primary)] shadow-sm",
  secondary:
    "bg-[var(--color-surface-2)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] focus-visible:ring-[var(--color-neutral-400)] border border-[var(--color-border)]",
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)] focus-visible:ring-[var(--color-neutral-400)]",
  outline:
    "bg-transparent border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white focus-visible:ring-[var(--color-primary)]",
  danger:
    "bg-[var(--color-error)] text-white hover:opacity-90 focus-visible:ring-[var(--color-error)] shadow-sm",
  accent:
    "bg-[var(--color-accent)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-light)] focus-visible:ring-[var(--color-accent)] shadow-sm font-bold",
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-[var(--radius-md)]",
  md: "h-10 px-5 text-sm rounded-[var(--radius-md)]",
  lg: "h-12 px-7 text-base rounded-[var(--radius-lg)]",
  icon: "h-10 w-10 rounded-[var(--radius-md)]",
}

// ── Spinner ───────────────────────────────────────────────────
function Spinner() {
  return (
    <span
      className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70"
      aria-hidden="true"
    />
  )
}

// ── Component ─────────────────────────────────────────────────
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? <Spinner /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }
export type { ButtonProps, ButtonVariant, ButtonSize }
