"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

// ── Types ──────────────────────────────────────────────────────
interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export interface CountdownTimerProps {
  /** End date for the countdown. Defaults to 30 days from module load (demo). */
  targetDate?: Date
  label?: string
  className?: string
}

// ── Helpers ────────────────────────────────────────────────────
// Fixed at module load so SSR and client produce the same initial value
const DEFAULT_TARGET = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

function getTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now())
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

const UNITS: Array<{ key: keyof TimeLeft; label: string }> = [
  { key: "days", label: "j" },
  { key: "hours", label: "h" },
  { key: "minutes", label: "m" },
  { key: "seconds", label: "s" },
]

// ── Component ──────────────────────────────────────────────────
export function CountdownTimer({
  targetDate = DEFAULT_TARGET,
  label = "L'offre se termine dans",
  className,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(targetDate))

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return (
    <div className={cn("select-none", className)}>
      {label && (
        <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-white/65 mb-2.5">
          {label}
        </p>
      )}

      <div className="flex items-end gap-1.5" aria-label={`Compte à rebours : ${timeLeft.days} jours ${timeLeft.hours} heures ${timeLeft.minutes} minutes ${timeLeft.seconds} secondes`}>
        {UNITS.map(({ key, label: unit }, i) => (
          <div key={key} className="flex items-end gap-1.5">
            {/* Digit box */}
            <div className="flex flex-col items-center gap-0.5">
              <span
                className="min-w-[2.4rem] h-9 flex items-center justify-center bg-[var(--color-accent)] text-[var(--color-text-primary)] font-bold text-base tabular-nums rounded-[var(--radius-sm)] leading-none px-1 shadow-sm"
                aria-hidden="true"
              >
                {String(timeLeft[key]).padStart(2, "0")}
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-white/55">
                {unit}
              </span>
            </div>
            {/* Separator */}
            {i < UNITS.length - 1 && (
              <span
                className="text-[var(--color-accent)] font-bold text-base leading-none pb-[1.25rem] opacity-80"
                aria-hidden="true"
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
