import type { Metadata } from "next"
import { FAQClient } from "./FAQClient"

export const metadata: Metadata = {
  title: "Foire Aux Questions (FAQ) | ProExcel",
  description: "Toutes les réponses à vos questions sur les commandes, la livraison au Maroc, le paiement et les retours sur ProExcel.",
}

export default function FAQPage() {
  return <FAQClient />
}
