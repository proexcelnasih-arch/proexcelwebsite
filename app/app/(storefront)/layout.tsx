import { Navbar } from "@/components/layout/Navbar"
import { CategoryNav, MobileCategoryStrip } from "@/components/layout/CategoryNav"
import { Footer } from "@/components/layout/Footer"
import { FloatingChatButton } from "@/components/layout/FloatingChatButton"

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      {/* Global header */}
      <Navbar />
      <CategoryNav />
      <MobileCategoryStrip />

      {/* Page content */}
      <main className="flex-1" id="main-content" tabIndex={-1}>
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Floating Chat */}
      <FloatingChatButton />
    </div>
  )
}
