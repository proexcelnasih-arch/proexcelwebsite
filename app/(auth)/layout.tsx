import React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-x-hidden bg-[#0A0305]">
      {/* 3D Flying Books Background with Soft Atmospheric Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-45 scale-105 filter blur-[8px]"
        style={{ backgroundImage: `url('/auth-bg.jpg')` }}
        aria-hidden="true"
      />

      {/* Atmospheric dark gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0A0305]/80 via-[#0A0305]/60 to-[#0A0305]/90"
        aria-hidden="true"
      />

      {/* Ambient glowing light orbs */}
      <div
        className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-[var(--color-primary)]/20 rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-[var(--color-accent)]/15 rounded-full blur-[130px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Content Area */}
      <main className="relative z-10 w-full flex items-center justify-center py-6">
        {children}
      </main>
    </div>
  )
}
