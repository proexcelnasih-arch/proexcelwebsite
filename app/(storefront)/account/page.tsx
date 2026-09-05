import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { AccountDashboardClient } from "@/components/account/AccountDashboardClient"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Mon Compte — Papeterie Pro Excel",
  description: "Gérez vos commandes, vos adresses de livraison et vos informations personnelles sur Papeterie Pro Excel.",
}

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirect=/account")
  }

  // Fetch Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role === "admin") {
    redirect("/admin")
  }

  // Fetch Customer's Orders with Order Items & Product details
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*, products(name, slug, product_images(url)))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch Customer's Saved Addresses
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })

  return (
    <AccountDashboardClient
      initialUser={user}
      initialProfile={profile || { full_name: user.user_metadata?.full_name || "", phone: "" }}
      initialOrders={orders || []}
      initialAddresses={addresses || []}
    />
  )
}
