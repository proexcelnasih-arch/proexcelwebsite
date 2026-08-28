import type { Metadata } from "next"
import { ContactClient } from "./ContactClient"

export const metadata: Metadata = {
  title: "Contactez-nous | ProExcel",
  description: "Contactez l'équipe ProExcel par WhatsApp, téléphone, email ou formulaire. Assistance rapide partout au Maroc.",
}

export default function ContactPage() {
  return <ContactClient />
}
