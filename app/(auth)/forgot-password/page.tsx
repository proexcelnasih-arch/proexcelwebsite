import { Suspense } from "react"
import type { Metadata } from "next"
import { AuthClient } from "../AuthClient"

export const metadata: Metadata = {
  title: "Mot de passe oublié — Papeterie Pro Excel",
  description:
    "Réinitialisez votre mot de passe en toute sécurité sur Papeterie Pro Excel.",
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-[460px] animate-pulse bg-white/40 rounded-3xl" />}>
      <AuthClient defaultMode="forgot-password" />
    </Suspense>
  )
}
