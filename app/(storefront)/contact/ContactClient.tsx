"use client"

import { useState } from "react"
import {
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { STORE_INFO } from "@/lib/navigation"

export function ContactClient() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "commande",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const whatsappClean = STORE_INFO.whatsapp.replace(/[^0-9]/g, "")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.fullName || !formData.email || !formData.message) return

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        subject: "commande",
        message: "",
      })
    }, 800)
  }

  return (
    <div className="bg-[var(--color-background)] min-h-screen py-6 lg:py-10">
      <div className="container-site max-w-6xl">
        <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Contact & Assistance" }]} />

        {/* Page Header */}
        <div className="mt-6 mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider mb-3">
            <Mail className="w-4 h-4" />
            <span>Service Client &amp; Support</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-text-primary)] tracking-tight">
            Contactez notre équipe ProExcel
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-2">
            Une question sur une commande, un livre ou une liste scolaire ? Notre service client est disponible du lundi au samedi pour vous répondre rapidement.
          </p>
        </div>

        {/* ── Main Layout: Info Cards (Left) + Form (Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Left Column: Direct Contact Channels (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* WhatsApp Card */}
            <a
              href={`https://wa.me/${whatsappClean}?text=Bonjour%20Pro%20Excel`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-3xl bg-white border border-emerald-500/30 hover:border-[#25D366] hover:shadow-[0_0_24px_rgba(37,211,102,0.25)] hover:scale-[1.01] transition-all duration-200 group flex items-start gap-4 shadow-xs"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 block mb-0.5">
                  Canal le plus rapide
                </span>
                <h3 className="font-bold text-slate-900 text-base">WhatsApp Direct</h3>
                <p className="text-xs text-slate-500 mt-0.5">Réponse instantanée de 9h à 20h</p>
                <p className="text-xs font-bold text-emerald-700 mt-2 flex items-center gap-1">
                  <span>Ouvrir la discussion</span>
                  <span>→</span>
                </p>
              </div>
            </a>

            {/* Phone Card */}
            <a
              href={`tel:${STORE_INFO.phone}`}
              className="p-6 rounded-3xl bg-white border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:shadow-md hover:scale-[1.01] transition-all duration-200 group flex items-start gap-4 shadow-xs"
            >
              <div className="w-12 h-12 rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] flex items-center justify-center shrink-0 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                <Phone className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-primary)] block mb-0.5">
                  Appel Téléphonique
                </span>
                <h3 className="font-bold text-slate-900 text-base">{STORE_INFO.phone}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Lun - Sam : 9h00 à 19h30</p>
              </div>
            </a>

            {/* Email Card */}
            <a
              href={`mailto:${STORE_INFO.email}`}
              className="p-6 rounded-3xl bg-white border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:shadow-md hover:scale-[1.01] transition-all duration-200 group flex items-start gap-4 shadow-xs"
            >
              <div className="w-12 h-12 rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] flex items-center justify-center shrink-0 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                <Mail className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-primary)] block mb-0.5">
                  Par Email
                </span>
                <h3 className="font-bold text-slate-900 text-base">{STORE_INFO.email}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Réponse garantie sous 24h ouvrées</p>
              </div>
            </a>

            {/* Physical Address & Hours Card */}
            <div className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-xs space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Adresse principale</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{STORE_INFO.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 pt-3 border-t border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Horaires d&apos;ouverture</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Lundi au Samedi : 09:00 — 19:30</p>
                  <p className="text-xs text-slate-400">Dimanche : Fermé</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[var(--color-border)] p-7 sm:p-10 shadow-xs relative">
            <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 mb-1">
              Envoyez-nous un message
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Remplissez le formulaire ci-dessous et notre équipe vous recontactera rapidement.
            </p>

            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-semibold flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Message envoyé avec succès !</p>
                    <p className="text-xs text-emerald-700 mt-0.5 font-normal">
                      Merci de nous avoir contactés. Nous reviendrons vers vous dans les plus brefs délais.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-name" className="text-xs font-bold text-slate-700">
                    Nom complet <span className="text-[var(--color-primary)]">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Ex: Yassine Benali"
                    className="h-11 px-4 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-email" className="text-xs font-bold text-slate-700">
                    Adresse Email <span className="text-[var(--color-primary)]">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nom@exemple.com"
                    className="h-11 px-4 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-phone" className="text-xs font-bold text-slate-700">
                    Téléphone (optionnel)
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="06 XX XX XX XX"
                    className="h-11 px-4 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-subject" className="text-xs font-bold text-slate-700">
                    Objet du message
                  </label>
                  <select
                    id="contact-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="h-11 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 bg-white outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 cursor-pointer"
                  >
                    <option value="commande">Suivi de ma commande</option>
                    <option value="livres">Disponibilité d&apos;un livre / manuel</option>
                    <option value="liste">Devis pour liste scolaire complète</option>
                    <option value="retour">Retour ou échange d&apos;article</option>
                    <option value="autre">Autre demande</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-message" className="text-xs font-bold text-slate-700">
                  Votre message <span className="text-[var(--color-primary)]">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Écrivez votre message ici avec le plus de détails possible…"
                  className="p-4 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto min-w-[180px] h-12 px-8 rounded-xl bg-[var(--color-primary)] text-white font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-[var(--color-primary-dark)] active:scale-[0.98] disabled:opacity-50 transition-all duration-200 shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" strokeWidth={2} />
                    <span>Envoyer le message</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
