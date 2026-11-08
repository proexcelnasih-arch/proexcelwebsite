import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Eye,
} from "lucide-react"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { getAdminCustomer } from "@/lib/admin/admin-queries"

// Server Component fetching via createAdminClient() (BUG-04: fixes client RLS blocking)
export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: customerId } = await params
  if (!customerId) {
    notFound()
  }

  const customer = await getAdminCustomer(customerId)

  if (!customer) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="mb-4">Client introuvable.</p>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#8C1A2B] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux clients
        </Link>
      </div>
    )
  }

  const orders = customer.orders || []
  const totalSpent = orders.reduce((sum, ord) => sum + (Number(ord.total) || 0), 0)
  const avgBasket = orders.length > 0 ? Math.round(totalSpent / orders.length) : 0
  const primaryAddress = customer.addresses?.[0]

  return (
    <div className="space-y-6">
      {/* ── Top Bar ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#E2E8F0]">
        <Link
          href="/admin/customers"
          className="w-9 h-9 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          aria-label="Retour aux clients"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Fiche Client : {customer.full_name || "Client ProExcel"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Client depuis le {new Date(customer.created_at).toLocaleDateString("fr-FR")} • {primaryAddress?.city || "Casablanca"}, Maroc
          </p>
        </div>
      </div>

      {/* ── 3 Summary KPI Cards ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 mb-1">Valeur Totale (LTV)</p>
          <p className="text-2xl font-bold text-[#8C1A2B]">
            {totalSpent.toLocaleString()} DH
          </p>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 mb-1">Commandes Validées</p>
          <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 mb-1">Panier Moyen</p>
          <p className="text-2xl font-bold text-slate-900">{avgBasket} DH</p>
        </div>
      </div>

      {/* ── Two Column Details ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Customer Profile & Addresses */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-[#E2E8F0]">
            Profil &amp; Coordonnées
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-bold text-slate-800">{customer.full_name || "Non renseigné"}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-slate-700 font-medium">{customer.email || "Non renseigné"}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-slate-700 font-medium">{customer.phone || "Non renseigné"}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-slate-700 font-medium">
                {primaryAddress ? `${primaryAddress.address_line || ""}, ${primaryAddress.city || ""}` : "Adresse de livraison non enregistrée"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Order History */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-[#E2E8F0]">
            Historique des Commandes ({orders.length})
          </h2>

          {orders.length > 0 ? (
            <div className="divide-y divide-[#E2E8F0]">
              {orders.map((ord) => (
                <div key={ord.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{ord.order_number}</span>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(ord.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-900">{ord.total} DH</span>
                    <StatusBadge status={ord.status} />
                    <Link
                      href={`/admin/orders/${ord.id}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#8C1A2B] hover:bg-slate-100 transition-colors"
                      title="Voir la commande"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4">Aucune commande enregistrée pour ce client.</p>
          )}
        </div>
      </div>
    </div>
  )
}
