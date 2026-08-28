"use client"

import { useState } from "react"
import { Mail, Check, Sparkles, Loader2, ArrowRight } from "lucide-react"

import { subscribeToNewsletter } from "@/app/actions/newsletter"

export function HomeNewsletter() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      setStatus("error")
      setMessage("Veuillez saisir une adresse email valide.")
      return
    }

    setStatus("loading")
    try {
      const res = await subscribeToNewsletter(email)
      if (res.success) {
        setStatus("success")
        setMessage(res.message)
        setEmail("")
      } else {
        setStatus("error")
        setMessage(res.message)
      }
    } catch {
      setStatus("error")
      setMessage("Une erreur est survenue. Veuillez réessayer.")
    }
  }

  return (
    <section
      className="py-14 bg-white border-t border-[var(--color-border)]"
      aria-labelledby="newsletter-heading"
    >
      <div className="container-site">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#4A0A16] via-[#2F060E] to-[#180307] text-white p-8 sm:p-12 lg:p-14 overflow-hidden border border-white/10 shadow-lg">
          {/* Ambient Glow */}
          <div
            className="absolute top-0 right-1/4 w-80 h-80 bg-[var(--color-accent)]/15 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-10 -left-10 w-60 h-60 bg-[var(--color-primary)]/20 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-[var(--color-accent-light)] text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest mb-3.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span>Offres &amp; Nouveautés</span>
            </div>

            <h2
              id="newsletter-heading"
              className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-white leading-tight mb-2.5"
            >
              Restez informé de nos sélections
            </h2>

            <p className="text-white/85 text-xs sm:text-sm md:text-base leading-relaxed mb-7 max-w-lg mx-auto">
              Recevez nos nouveautés, promotions exclusives et conseils pour la rentrée directement dans votre boîte mail.
            </p>

            {/* Newsletter Form */}
            {status === "success" ? (
              <div className="p-4 bg-[color-mix(in_srgb,var(--color-success)_20%,transparent)] border border-white/20 rounded-2xl text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 max-w-md mx-auto">
                <Check className="w-4 h-4 text-[var(--color-accent-light)]" strokeWidth={2.5} />
                <span>{message}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Mail
                      className="w-4.5 h-4.5 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      strokeWidth={1.75}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (status === "error") setStatus("idle")
                      }}
                      placeholder="Votre adresse email…"
                      aria-label="Adresse email pour la newsletter"
                      required
                      className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-xs sm:text-sm outline-none focus:border-[var(--color-accent)] focus:bg-white/15 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="h-12 px-6 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-light)] text-[var(--color-text-primary)] font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 transition-all flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {status === "loading" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>S&apos;inscrire</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {status === "error" && (
                  <p className="text-xs text-[var(--color-accent-light)] mt-2 font-medium">
                    {message}
                  </p>
                )}

                <p className="text-[10px] sm:text-[11px] text-white/60 mt-3">
                  🔒 Pas de spam. Vous pouvez vous désinscrire à tout moment.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
