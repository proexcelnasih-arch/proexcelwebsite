import { Navbar } from "@/components/layout/Navbar"
import { CategoryNav, MobileCategoryStrip } from "@/components/layout/CategoryNav"
import { Footer } from "@/components/layout/Footer"
import { FloatingChatButton } from "@/components/layout/FloatingChatButton"
import { getStoreSettings } from "@/lib/supabase/queries"

export const dynamic = "force-dynamic"

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const storeSettings = await getStoreSettings()
  const logoUrl = storeSettings?.logo_url ?? null
  const socialLinks =
    storeSettings?.social_links &&
    typeof storeSettings.social_links === "object" &&
    !Array.isArray(storeSettings.social_links)
      ? (storeSettings.social_links as Record<string, string>)
      : null

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      {/* Global header */}
      <Navbar logoUrl={logoUrl} storeName={storeSettings?.store_name} />
      <CategoryNav />
      <MobileCategoryStrip />

      {/* Page content */}
      <main className="flex-1" id="main-content" tabIndex={-1}>
        {children}
      </main>

      {/* Footer */}
      <Footer logoUrl={logoUrl} storeSettings={storeSettings} />

      {/* Global Floating Chat */}
      <FloatingChatButton
        whatsappNumber={
          socialLinks?.whatsapp || storeSettings?.contact_phone
        }
      />
    </div>
  )
}
