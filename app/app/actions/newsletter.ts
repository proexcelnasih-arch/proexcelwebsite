"use server"

import { createClient } from "@/lib/supabase/server"

export interface SubscribeResult {
  success: boolean
  message: string
}

export async function subscribeToNewsletter(email: string): Promise<SubscribeResult> {
  const cleanEmail = (email || "").trim().toLowerCase()
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return {
      success: false,
      message: "Veuillez saisir une adresse email valide.",
    }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: cleanEmail })

    if (error) {
      // Postgres unique violation error code 23505
      if (error.code === "23505" || error.message?.toLowerCase().includes("unique")) {
        return {
          success: true,
          message: "Vous êtes déjà inscrit à notre newsletter.",
        }
      }
      return {
        success: false,
        message: "Une erreur est survenue. Veuillez réessayer ultérieurement.",
      }
    }

    return {
      success: true,
      message: "Merci pour votre inscription ! Vous recevrez nos meilleures offres.",
    }
  } catch (err) {
    console.warn("[newsletter] Exception during subscription:", err)
    return {
      success: false,
      message: "Une erreur est survenue. Veuillez réessayer ultérieurement.",
    }
  }
}
