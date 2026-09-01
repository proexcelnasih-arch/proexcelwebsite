import { Suspense } from "react"
import type { Metadata } from "next"
import { AuthClient } from "../AuthClient"

export const metadata: Metadata = {
  title: "Connexion — Papeterie Pro Excel",
  description:
    "Connectez-vous à votre compte Papeterie Pro Excel pour retrouver vos commandes et vos fournitures favorites.",
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-[460px] animate-pulse bg-white/40 rounded-3xl" />}>
      <AuthClient defaultMode="login" />
    </Suspense>
  )
}
