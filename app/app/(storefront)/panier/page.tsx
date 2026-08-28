import type { Metadata } from "next"
import { CartPageClient } from "./CartPageClient"

export const metadata: Metadata = {
  title: "Mon Panier | ProExcel",
  description: "Consultez et gérez votre panier ProExcel.",
}

export default function PanierPage() {
  return <CartPageClient />
}
