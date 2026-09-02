import React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#070203]">
      {/* Subtle Deep Dark Maroon Radial Vignette */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,#180307_0%,#070203_100%)]"
        aria-hidden="true"
      />

      {/* Central Soft Glowing Light Orb directly behind the login card */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[650px] h-[550px] sm:h-[650px] bg-[#8C1A2B]/22 rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Subtle secondary warm ambient gold glimmer */}
      <div
        className="absolute -bottom-28 left-1/2 -translate-x-1/2 w-[450px] h-[250px] bg-[#C9A227]/8 rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Content Area */}
      <main className="relative z-10 w-full flex items-center justify-center py-6 sm:py-10">
        {children}
      </main>
    </div>
  )
}
