import type { Metadata } from "next"
import { TrackOrderClient } from "../suivre-commande/TrackOrderClient"

export const metadata: Metadata = {
  title: "Suivre ma Commande | ProExcel",
  description: "Suivez l'état d'acheminement de votre colis en temps réel sur ProExcel partout au Maroc.",
}

export default function TrackOrderPage() {
  return <TrackOrderClient />
}
