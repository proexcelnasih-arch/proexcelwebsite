"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingBag,
  User,
  MapPin,
  Heart,
  LogOut,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Eye,
  AlertCircle,
  Check,
  Loader2,
  Phone,
  Mail,
  Shield,
  ArrowRight,
  ExternalLink,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatPrice, cn } from "@/lib/utils"
import { MOROCCAN_CITIES } from "@/types"
import { createClient } from "@/lib/supabase/client"
import { Dialog } from "@/components/ui/Dialog"

type DashboardTab = "overview" | "orders" | "profile" | "addresses" | "wishlist"

interface AccountDashboardClientProps {
  initialUser: any
  initialProfile: any
  initialOrders: any[]
  initialAddresses: any[]
}

const ORDER_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  pending: { label: "En attente", bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: Clock },
  confirmed: { label: "Confirmée", bg: "bg-blue-50 border-blue-200", text: "text-blue-700", icon: CheckCircle2 },
  processing: { label: "En préparation", bg: "bg-purple-50 border-purple-200", text: "text-purple-700", icon: Package },
  shipped: { label: "Expédiée", bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700", icon: Truck },
  delivered: { label: "Livrée", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: CheckCircle2 },
  cancelled: { label: "Annulée", bg: "bg-rose-50 border-rose-200", text: "text-rose-700", icon: AlertCircle },
}

const STATUS_STEPS = [
  { id: "pending", label: "En attente" },
  { id: "confirmed", label: "Confirmée" },
  { id: "processing", label: "En préparation" },
  { id: "shipped", label: "Expédiée" },
  { id: "delivered", label: "Livrée" },
]

export function AccountDashboardClient({
  initialUser,
  initialProfile,
  initialOrders,
  initialAddresses,
}: AccountDashboardClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview")

  // State
  const [profile, setProfile] = useState(initialProfile || {})
  const [orders] = useState<any[]>(initialOrders || [])
  const [addresses, setAddresses] = useState<any[]>(initialAddresses || [])

  // Profile Form State
  const [fullName, setFullName] = useState(initialProfile?.full_name || "")
  const [phone, setPhone] = useState(initialProfile?.phone || "")
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileSavedMsg, setProfileSavedMsg] = useState("")

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any | null>(null)
  const [addrFullName, setAddrFullName] = useState("")
  const [addrPhone, setAddrPhone] = useState("")
  const [addrCity, setAddrCity] = useState<string>(MOROCCAN_CITIES[0])
  const [addrLine, setAddrLine] = useState("")
  const [addrIsDefault, setAddrIsDefault] = useState(false)
  const [isSavingAddr, setIsSavingAddr] = useState(false)

  // Order Details Modal State
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  // Computed Metrics
  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => ["pending", "confirmed", "processing", "shipped"].includes(o.status)).length
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length

  // ── Handlers ────────────────────────────────────────────────
  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setIsSavingProfile(true)
    setProfileSavedMsg("")

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", initialUser.id)

      if (!error) {
        setProfile((prev: any) => ({ ...prev, full_name: fullName.trim(), phone: phone.trim() }))
        setProfileSavedMsg("Vos informations ont été enregistrées avec succès.")
        setTimeout(() => setProfileSavedMsg(""), 4000)
      }
    } catch {
      // ignore
    } finally {
      setIsSavingProfile(false)
    }
  }

  function handleOpenAddAddress() {
    setEditingAddress(null)
    setAddrFullName(profile?.full_name || "")
    setAddrPhone(profile?.phone || "")
    setAddrCity(MOROCCAN_CITIES[0])
    setAddrLine("")
    setAddrIsDefault(addresses.length === 0)
    setIsAddressModalOpen(true)
  }

  function handleOpenEditAddress(addr: any) {
    setEditingAddress(addr)
    setAddrFullName(addr.full_name || "")
    setAddrPhone(addr.phone || "")
    setAddrCity(addr.city || MOROCCAN_CITIES[0])
    setAddrLine(addr.address_line || "")
    setAddrIsDefault(addr.is_default || false)
    setIsAddressModalOpen(true)
  }

  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault()
    setIsSavingAddr(true)

    try {
      const supabase = createClient()

      if (addrIsDefault) {
        // Reset previous default addresses
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", initialUser.id)
      }

      if (editingAddress) {
        const { data, error } = await supabase
          .from("addresses")
          .update({
            full_name: addrFullName.trim(),
            phone: addrPhone.trim(),
            city: addrCity,
            address_line: addrLine.trim(),
            is_default: addrIsDefault,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingAddress.id)
          .select()
          .single()

        if (!error && data) {
          setAddresses((prev) =>
            prev.map((a) => (a.id === editingAddress.id ? data : addrIsDefault ? { ...a, is_default: false } : a))
          )
        }
      } else {
        const { data, error } = await supabase
          .from("addresses")
          .insert({
            user_id: initialUser.id,
            full_name: addrFullName.trim(),
            phone: addrPhone.trim(),
            city: addrCity,
            address_line: addrLine.trim(),
            is_default: addrIsDefault,
          })
          .select()
          .single()

        if (!error && data) {
          setAddresses((prev) => [
            data,
            ...prev.map((a) => (addrIsDefault ? { ...a, is_default: false } : a)),
          ])
        }
      }

      setIsAddressModalOpen(false)
    } catch {
      // ignore
    } finally {
      setIsSavingAddr(false)
    }
  }

  async function handleDeleteAddress(id: string) {
    if (!confirm("Voulez-vous vraiment supprimer cette adresse ?")) return
    try {
      const supabase = createClient()
      await supabase.from("addresses").delete().eq("id", id)
      setAddresses((prev) => prev.filter((a) => a.id !== id))
    } catch {
      // ignore
    }
  }

  async function handleLogout() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      document.cookie = "proexcel_admin_session=; path=/; max-age=0;"
      router.push("/login")
      router.refresh()
    } catch {
      router.push("/login")
    }
  }

  const navItems = [
    { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: "orders", label: "Mes commandes", icon: ShoppingBag, badge: totalOrders },
    { id: "profile", label: "Mon profil", icon: User },
    { id: "addresses", label: "Mes adresses", icon: MapPin, badge: addresses.length },
    { id: "wishlist", label: "Liste de souhaits", icon: Heart },
  ]

  const userInitial = (profile?.full_name || initialUser.email || "C").charAt(0).toUpperCase()

  return (
    <div className="min-h-[85vh] bg-[var(--color-background)] py-8 lg:py-12">
      <div className="container-site max-w-7xl">
        
        {/* Page Title */}
        <div className="mb-8">
          <p className="text-eyebrow mb-1">Espace Membre</p>
          <h1 className="text-section-title">Mon Compte</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── LEFT: Jumia-Style Sidebar Nav ─────────────────── */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
            
            {/* User Profile Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] text-white font-extrabold text-xl flex items-center justify-center shadow-md shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 font-medium">Bonjour,</p>
                <h3 className="font-bold text-slate-900 text-base truncate">
                  {profile?.full_name || "Client ProExcel"}
                </h3>
                <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
                  {initialUser.email}
                </p>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="p-3 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col gap-1.5" aria-label="Menu Mon Compte">
              {navItems.map((item) => {
                const isActive = activeTab === item.id
                const Icon = item.icon
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onClick={() => setActiveTab(item.id as DashboardTab)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer select-none",
                      isActive
                        ? "bg-[var(--color-primary)] text-white shadow-xs"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4.5 h-4.5" strokeWidth={isActive ? 2.2 : 1.75} />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[11px] font-bold",
                            isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className={cn("w-4 h-4 opacity-50", isActive && "text-white")} />
                    </div>
                  </motion.button>
                )
              })}

              <div className="pt-2 mt-2 border-t border-slate-100">
                <motion.button
                  type="button"
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4.5 h-4.5" strokeWidth={1.75} />
                  <span>Déconnexion</span>
                </motion.button>
              </div>
            </nav>

          </aside>

          {/* ── RIGHT: Main Content Panel ─────────────────────── */}
          <main className="lg:col-span-8 xl:col-span-9">
            <AnimatePresence mode="wait">
              
              {/* ── 1. VUE D'ENSEMBLE (OVERVIEW) ──────────────── */}
              {activeTab === "overview" && (
                <motion.div
                  key="tab-overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                        <ShoppingBag className="w-6 h-6" strokeWidth={1.75} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold">Total Commandes</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-0.5">{totalOrders}</h4>
                      </div>
                    </div>

                    <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
                        <Truck className="w-6 h-6" strokeWidth={1.75} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold">En cours de livraison</p>
                        <h4 className="text-2xl font-black text-indigo-700 mt-0.5">{pendingOrders}</h4>
                      </div>
                    </div>

                    <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                        <CheckCircle2 className="w-6 h-6" strokeWidth={1.75} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold">Commandes Livrées</p>
                        <h4 className="text-2xl font-black text-emerald-700 mt-0.5">{deliveredOrders}</h4>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders Section */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">Commandes Récentes</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Suivez l&apos;état de vos derniers achats</p>
                      </div>
                      {orders.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveTab("orders")}
                          className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Voir tout l&apos;historique</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {orders.length === 0 ? (
                      <div className="text-center py-10 space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                          <Package className="w-8 h-8 stroke-[1.5]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-base">Aucune commande pour le moment</h4>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                            Explorez nos catalogues de papeterie et fournitures scolaires pour passer votre première commande.
                          </p>
                        </div>
                        <Link
                          href="/boutique"
                          className="inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
                        >
                          <span>Découvrir la boutique</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {orders.slice(0, 3).map((order) => {
                          const statusConf = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending
                          const StatusIcon = statusConf.icon
                          return (
                            <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <span className="font-mono font-bold text-sm text-slate-900">
                                    {order.order_number}
                                  </span>
                                  <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border", statusConf.bg, statusConf.text)}>
                                    <StatusIcon className="w-3 h-3" />
                                    <span>{statusConf.label}</span>
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500">
                                  {new Date(order.created_at).toLocaleDateString("fr-FR", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                  {" • "}
                                  {order.order_items?.length || 1} article{(order.order_items?.length || 1) > 1 ? "s" : ""}
                                </p>
                              </div>

                              <div className="flex items-center gap-4 justify-between sm:justify-end">
                                <span className="font-extrabold text-base text-[var(--color-primary)]">
                                  {formatPrice(order.total)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrder(order)}
                                  className="h-9 px-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Détails</span>
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Profile & Default Address Quick Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Profile Quick Box */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-slate-900 text-sm">Informations Personnelles</h4>
                          <button
                            type="button"
                            onClick={() => setActiveTab("profile")}
                            className="text-xs font-bold text-[var(--color-primary)] hover:underline cursor-pointer"
                          >
                            Modifier
                          </button>
                        </div>
                        <p className="text-xs text-slate-700 font-semibold">{profile?.full_name || "Nom non défini"}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{initialUser.email}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{profile?.phone || "Téléphone non renseigné"}</p>
                      </div>
                    </div>

                    {/* Default Address Quick Box */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-slate-900 text-sm">Adresse de Livraison</h4>
                          <button
                            type="button"
                            onClick={() => setActiveTab("addresses")}
                            className="text-xs font-bold text-[var(--color-primary)] hover:underline cursor-pointer"
                          >
                            Gérer
                          </button>
                        </div>
                        {addresses.length > 0 ? (
                          <>
                            <p className="text-xs text-slate-700 font-semibold">{addresses[0].full_name}</p>
                            <p className="text-xs text-slate-600 mt-0.5">{addresses[0].address_line}, {addresses[0].city}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{addresses[0].phone}</p>
                          </>
                        ) : (
                          <p className="text-xs text-slate-400">Aucune adresse enregistrée.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── 2. MES COMMANDES (ORDERS) ─────────────────── */}
              {activeTab === "orders" && (
                <motion.div
                  key="tab-orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Historique de vos commandes</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{totalOrders} commande{totalOrders !== 1 ? "s" : ""} au total</p>
                    </div>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                        <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-base">Aucune commande enregistrée</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                          Vos futures commandes apparaîtront ici avec leur suivi en temps réel.
                        </p>
                      </div>
                      <Link
                        href="/boutique"
                        className="inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
                      >
                        <span>Faire mes achats</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const statusConf = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending
                        const StatusIcon = statusConf.icon
                        return (
                          <div
                            key={order.id}
                            className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <span className="font-mono font-bold text-sm text-slate-900">
                                  {order.order_number}
                                </span>
                                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border", statusConf.bg, statusConf.text)}>
                                  <StatusIcon className="w-3 h-3" />
                                  <span>{statusConf.label}</span>
                                </span>
                              </div>

                              <p className="text-xs text-slate-500">
                                Passée le{" "}
                                {new Date(order.created_at).toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>

                              {/* Items list preview */}
                              <div className="flex flex-wrap gap-2 pt-1">
                                {order.order_items?.map((item: any) => (
                                  <span key={item.id} className="text-[11px] font-medium bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-700">
                                    {item.quantity}x {item.product_name_snapshot}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200/60">
                              <div className="text-right">
                                <span className="text-xs text-slate-400 block">Total TTC</span>
                                <span className="font-extrabold text-lg text-[var(--color-primary)]">
                                  {formatPrice(order.total)}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => setSelectedOrder(order)}
                                className="h-10 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Voir détails</span>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── 3. MON PROFIL (PROFILE) ───────────────────── */}
              {activeTab === "profile" && (
                <motion.div
                  key="tab-profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs"
                >
                  <div className="mb-6 pb-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-lg">Informations du compte</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Gérez vos coordonnées personnelles</p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="max-w-xl space-y-5">
                    {profileSavedMsg && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>{profileSavedMsg}</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label htmlFor="prof-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Nom complet
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="prof-name"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          placeholder="Votre nom complet"
                          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="prof-email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Adresse Email (Identifiant)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="prof-email"
                          type="email"
                          value={initialUser.email || ""}
                          disabled
                          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-500 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">Pour changer votre adresse email de connexion, veuillez contacter le service client.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="prof-phone" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Numéro de téléphone
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="prof-phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="06 XX XX XX XX"
                          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="h-11 px-6 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                      >
                        {isSavingProfile ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Enregistrement…</span>
                          </>
                        ) : (
                          <span>Enregistrer les modifications</span>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ── 4. MES ADRESSES (ADDRESSES) ───────────────── */}
              {activeTab === "addresses" && (
                <motion.div
                  key="tab-addresses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Carnet d&apos;adresses</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Gérez vos adresses de livraison pour un passage de commande plus rapide</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenAddAddress}
                      className="h-10 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter une adresse</span>
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-10 space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                        <MapPin className="w-8 h-8 stroke-[1.5]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-base">Aucune adresse enregistrée</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                          Ajoutez votre adresse de domicile ou de bureau pour faciliter vos prochaines livraisons.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenAddAddress}
                        className="inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter une adresse maintenant</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-slate-900 text-sm">{addr.full_name}</h4>
                              {addr.is_default && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                                  Par défaut
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed">{addr.address_line}</p>
                            <p className="text-xs font-bold text-slate-900 mt-1">{addr.city}, Maroc</p>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{addr.phone}</span>
                            </p>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/60">
                            <button
                              type="button"
                              onClick={() => handleOpenEditAddress(addr)}
                              className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Modifier</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="h-8 px-3 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── 5. LISTE DE SOUHAITS (WISHLIST) ───────────── */}
              {activeTab === "wishlist" && (
                <motion.div
                  key="tab-wishlist"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Votre liste de souhaits</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Retrouvez tous vos articles sauvegardés</p>
                    </div>
                    <Link
                      href="/wishlist"
                      className="h-10 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ouvrir la page complète</span>
                    </Link>
                  </div>

                  <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[var(--color-primary)]">
                      <Heart className="w-8 h-8 fill-[var(--color-primary)]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">Gérez vos articles favoris</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                        Accédez à tout moment à votre liste de souhaits pour ajouter rapidement vos articles au panier.
                      </p>
                    </div>
                    <Link
                      href="/wishlist"
                      className="inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
                    >
                      <span>Voir ma liste de souhaits</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </main>

        </div>
      </div>

      {/* ── Address Add/Edit Modal ────────────────────────────── */}
      <Dialog
        open={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title={editingAddress ? "Modifier l'adresse" : "Ajouter une nouvelle adresse"}
        size="md"
      >
        <form onSubmit={handleSaveAddress} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Nom complet</label>
            <input
              type="text"
              required
              value={addrFullName}
              onChange={(e) => setAddrFullName(e.target.value)}
              placeholder="Ex. Karim Alaoui"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Téléphone</label>
              <input
                type="tel"
                required
                value={addrPhone}
                onChange={(e) => setAddrPhone(e.target.value)}
                placeholder="06 XX XX XX XX"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Ville</label>
              <select
                value={addrCity}
                onChange={(e) => setAddrCity(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[var(--color-primary)] bg-white"
              >
                {MOROCCAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Adresse complète (Rue, Quartier, N°)</label>
            <textarea
              required
              rows={2}
              value={addrLine}
              onChange={(e) => setAddrLine(e.target.value)}
              placeholder="Ex. 14 Bd Zerktouni, Apt 5"
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={addrIsDefault}
              onChange={(e) => setAddrIsDefault(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            <span>Définir comme adresse de livraison par défaut</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(false)}
              className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSavingAddr}
              className="h-10 px-5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {isSavingAddr && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Enregistrer l&apos;adresse</span>
            </button>
          </div>
        </form>
      </Dialog>

      {/* ── Order Detail Modal ────────────────────────────────── */}
      {selectedOrder && (
        <Dialog
          open={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Commande ${selectedOrder.order_number}`}
          size="lg"
        >
          <div className="space-y-6 pt-2">
            
            {/* Status Timeline */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Suivi de la livraison
              </p>
              <div className="grid grid-cols-5 gap-2">
                {STATUS_STEPS.map((step, idx) => {
                  const currentIdx = STATUS_STEPS.findIndex((s) => s.id === selectedOrder.status)
                  const isDone = currentIdx >= idx
                  const isCurrent = currentIdx === idx
                  return (
                    <div key={step.id} className="text-center">
                      <div
                        className={cn(
                          "w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all",
                          isDone ? "bg-[var(--color-primary)] text-white shadow-xs" : "bg-slate-200 text-slate-500",
                          isCurrent && "ring-4 ring-[var(--color-primary)]/20"
                        )}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <span className={cn("text-[10px] block mt-1.5 font-bold truncate", isDone ? "text-[var(--color-primary)]" : "text-slate-400")}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Purchased Items */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Articles commandés</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {selectedOrder.order_items?.map((item: any) => {
                  const img = item.products?.product_images?.[0]?.url
                  return (
                    <div key={item.id} className="p-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                          {img ? (
                            <Image src={img} alt={item.product_name_snapshot} fill unoptimized className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold">
                              Photo
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate max-w-sm">
                            {item.product_name_snapshot}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Quantité : {item.quantity} × {formatPrice(item.price_snapshot || item.unit_price || (item.subtotal / item.quantity))}
                          </p>
                        </div>
                      </div>
                      <span className="font-extrabold text-xs text-slate-800 shrink-0">
                        {formatPrice(item.subtotal || item.total_price)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Delivery Details & Financial Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <p className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">Adresse de livraison</p>
                <p className="font-bold text-slate-900">{selectedOrder.customer_name}</p>
                <p className="text-slate-600">
                  {typeof selectedOrder.shipping_address === "object"
                    ? `${selectedOrder.shipping_address?.address_line || selectedOrder.shipping_address?.address_line1 || ""}, ${selectedOrder.shipping_address?.city || ""}`
                    : String(selectedOrder.shipping_address || "")}
                </p>
                <p className="text-slate-500 font-mono">{selectedOrder.customer_phone}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <p className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">Récapitulatif financier</p>
                <div className="flex justify-between text-slate-600">
                  <span>Sous-total</span>
                  <span className="font-semibold">{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Frais de livraison</span>
                  <span className="font-semibold">
                    {selectedOrder.shipping_cost > 0 ? formatPrice(selectedOrder.shipping_cost) : "Gratuit"}
                  </span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Remise coupon</span>
                    <span>-{formatPrice(selectedOrder.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 font-black text-sm pt-1 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-[var(--color-primary)]">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

          </div>
        </Dialog>
      )}
    </div>
  )
}
