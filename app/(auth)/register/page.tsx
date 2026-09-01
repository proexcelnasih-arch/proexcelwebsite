import { Suspense } from "react"
import type { Metadata } from "next"
import { AuthClient } from "../AuthClient"

export const metadata: Metadata = {
  title: "Inscription — Papeterie Pro Excel",
  description:
    "Créez votre compte Papeterie Pro Excel pour commander vos livres, papeterie et fournitures scolaires au Maroc.",
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-[520px] animate-pulse bg-white/40 rounded-3xl" />}>
      <AuthClient defaultMode="register" />
    </Suspense>
  )
}
