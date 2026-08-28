import type { Metadata } from "next"
import { WishlistClient } from "./WishlistClient"

export const metadata: Metadata = {
  title: "Ma Liste de Souhaits | ProExcel",
  description: "Retrouvez vos articles favoris et préparez vos commandes en toute simplicité sur ProExcel.",
}

export default function WishlistPage() {
  return <WishlistClient />
}
