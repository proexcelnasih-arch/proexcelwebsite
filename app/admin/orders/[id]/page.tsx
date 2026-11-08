import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getAdminOrder } from "@/lib/admin/admin-queries"
import { OrderDetailClient, type OrderDetails } from "./OrderDetailClient"

// Server Component fetching via createAdminClient() (BUG-04: fixes client RLS blocking)
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: orderId } = await params
  if (!orderId) {
    notFound()
  }

  const order = await getAdminOrder(orderId)

  if (!order) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="mb-4">Commande introuvable.</p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#8C1A2B] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux commandes
        </Link>
      </div>
    )
  }

  return <OrderDetailClient initialOrder={order as unknown as OrderDetails} />
}
