import type { Metadata } from "next"
import { CheckoutClient } from "./CheckoutClient"

export const metadata: Metadata = {
  title: "Commander — Checkout sécurisé | ProExcel",
  description: "Finalisez votre commande ProExcel. Paiement à la livraison.",
  robots: { index: false, follow: false },
}

export default function CheckoutPage() {
  return <CheckoutClient />
}
