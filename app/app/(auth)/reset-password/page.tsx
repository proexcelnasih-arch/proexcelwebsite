import { Suspense } from "react"
import type { Metadata } from "next"
import { AuthClient } from "../AuthClient"

export const metadata: Metadata = {
  title: "Nouveau mot de passe — Papeterie Pro Excel",
  description:
    "Définissez un nouveau mot de passe sécurisé pour votre compte Papeterie Pro Excel.",
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-[460px] animate-pulse bg-white/40 rounded-3xl" />}>
      <AuthClient defaultMode="reset-password" />
    </Suspense>
  )
}
