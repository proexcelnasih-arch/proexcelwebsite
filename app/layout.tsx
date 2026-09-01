import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/Toast"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Papeterie Pro Excel — Fournitures Scolaires, de Bureau & Librairie",
    template: "%s | Papeterie Pro Excel",
  },
  description:
    "Papeterie Pro Excel à Casablanca. Fournitures scolaires, de bureau et librairie en ligne. Livraison partout au Maroc.",
  keywords: [
    "papeterie pro excel",
    "papeterie casablanca",
    "fournitures scolaires maroc",
    "livres scolaires casablanca",
    "fournitures de bureau",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "fr_MA",
    siteName: "Papeterie Pro Excel",
    title: "Papeterie Pro Excel — Fournitures Scolaires, de Bureau & Librairie",
    description:
      "Fournitures scolaires, de bureau et librairie en ligne. Tél : 07 15 22 03 00.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Papeterie Pro Excel — Fournitures Scolaires, de Bureau & Librairie",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" dir="ltr" className={jakarta.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Organization structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "ProExcel",
              url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
              description: "Papeterie, librairie et fournitures scolaires au Maroc.",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+212 522-123456",
                contactType: "customer service",
                availableLanguage: ["French", "Arabic"],
              },
              address: {
                "@type": "PostalAddress",
                addressCountry: "MA",
                addressLocality: "Casablanca",
              },
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <Toaster>{children}</Toaster>
      </body>
    </html>
  )
}
