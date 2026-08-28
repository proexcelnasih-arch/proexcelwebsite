"use client"

import { createContext, useContext, useState, useId } from "react"
import { cn } from "@/lib/utils"

// ── Context ───────────────────────────────────────────────────
const TabsContext = createContext<{
  activeTab: string
  setActiveTab: (tab: string) => void
}>({ activeTab: "", setActiveTab: () => {} })

// ── Tabs Root ─────────────────────────────────────────────────
interface TabsProps {
  defaultTab: string
  children: React.ReactNode
  className?: string
  onChange?: (tab: string) => void
}

export function Tabs({ defaultTab, children, className, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  function handleChange(tab: string) {
    setActiveTab(tab)
    onChange?.(tab)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  )
}

// ── Tab List ──────────────────────────────────────────────────
interface TabListProps {
  children: React.ReactNode
  className?: string
  variant?: "underline" | "pills"
}

export function TabList({ children, className, variant = "underline" }: TabListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        variant === "underline"
          ? "flex border-b border-[var(--color-border)] gap-0"
          : "flex gap-1 p-1 bg-[var(--color-surface-2)] rounded-[var(--radius-lg)]",
        className
      )}
    >
      {children}
    </div>
  )
}

// ── Tab Trigger ───────────────────────────────────────────────
interface TabTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
  variant?: "underline" | "pills"
}

export function TabTrigger({ value, children, className, variant = "underline" }: TabTriggerProps) {
  const { activeTab, setActiveTab } = useContext(TabsContext)
  const isActive = activeTab === value
  const id = useId()

  return (
    <button
      id={`tab-${id}-${value}`}
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${id}-${value}`}
      onClick={() => setActiveTab(value)}
      className={cn(
        "transition-all duration-150 font-medium text-sm",
        variant === "underline"
          ? cn(
              "px-5 py-3 border-b-2 -mb-px",
              isActive
                ? "border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]"
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]"
            )
          : cn(
              "px-4 py-1.5 rounded-[var(--radius-md)]",
              isActive
                ? "bg-white text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            ),
        className
      )}
    >
      {children}
    </button>
  )
}

// ── Tab Content ───────────────────────────────────────────────
interface TabContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function TabContent({ value, children, className }: TabContentProps) {
  const { activeTab } = useContext(TabsContext)
  const id = useId()

  if (activeTab !== value) return null

  return (
    <div
      id={`panel-${id}-${value}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}-${value}`}
      className={cn("outline-none", className)}
    >
      {children}
    </div>
  )
}
