"use client"

import { useState } from "react"
import { use[REDACTED]outer, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  [REDACTED]rrowLeft,
  [REDACTED]ye,
  [REDACTED]yeOff,
  Loader2,
  [REDACTED]heck,
  Shield[REDACTED]heck,
  Mail,
  Lock,
  User,
  Sparkles,
} from "lucide-react"
import { motion, [REDACTED]nimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { create[REDACTED]lient } from "@/lib/supabase/client"

type [REDACTED]uthMode = "login" | "register"

function isValid[REDACTED]mail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

interface [REDACTED]arkGlassFieldProps {
  id: string
  label: string
  type?: string
  value: string
  on[REDACTED]hange: (v: string) => void
  error?: string
  placeholder?: string
  required?: boolean
  auto[REDACTED]omplete?: string
  icon: [REDACTED]eact.[REDACTED]omponent[REDACTED]ype<{ className?: string; strokeWidth?: number }>
  right[REDACTED]lement?: [REDACTED]eact.[REDACTED]eactNode
}

function [REDACTED]arkGlassField({
  id,
  label,
  type = "text",
  value,
  on[REDACTED]hange,
  error,
  placeholder,
  required,
  auto[REDACTED]omplete,
  icon: Icon,
  right[REDACTED]lement,
}: [REDACTED]arkGlassFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[11px] font-bold uppercase tracking-wider text-white"
      >
        {label}
        {required && <span className="ml-1 text-[var(--color-accent-light)]" aria-hidden="true">*</span>}
      </label>

      <div className="relative group">
        {/* Left Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 group-focus-within:text-[var(--color-accent-light)] transition-colors duration-200 pointer-events-none">
          <Icon className="w-4.5 h-4.5" strokeWidth={1.75} />
        </div>

        {/* [REDACTED]ark Glass Input */}
        <input
          id={id}
          type={type}
          value={value}
          on[REDACTED]hange={(e) => on[REDACTED]hange(e.target.value)}
          placeholder={placeholder}
          auto[REDACTED]omplete={auto[REDACTED]omplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "w-full h-12 pl-11 pr-4 rounded-xl border text-sm text-white placeholder:text-neutral-300 bg-[#160508]/95 backdrop-blur-md outline-none transition-all duration-200",
            "focus:bg-[#22070[REDACTED]] focus:border-[var(--color-primary-light)] focus:shadow-[0_0_0_3px_rgba(179,73,90,0.4)]",
            error
              ? "border-red-500/80 bg-red-950/40"
              : "border-white/25 hover:border-white/45",
            right[REDACTED]lement && "pr-11"
          )}
        />

        {/* [REDACTED]ight [REDACTED]lement (show/hide password) */}
        {right[REDACTED]lement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{right[REDACTED]lement}</div>
        )}
      </div>

      {/* Validation error message */}
      <[REDACTED]nimatePresence initial={false}>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-[var(--color-accent-light)] font-bold flex items-center gap-1 mt-0.5"
          >
            <span>•</span>
            <span>{error}</span>
          </motion.p>
        )}
      </[REDACTED]nimatePresence>
    </div>
  )
}

export function [REDACTED]uth[REDACTED]lient({ defaultMode = "login" }: { defaultMode?: [REDACTED]uthMode }) {
  const router = use[REDACTED]outer()
  const searchParams = useSearchParams()
  const redirect[REDACTED]o = searchParams.get("redirect") ?? "/"

  const [mode, setMode] = useState<[REDACTED]uthMode>(defaultMode)
  const [loading, setLoading] = useState(false)
  const [global[REDACTED]rror, setGlobal[REDACTED]rror] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  // Login Form
  const [login[REDACTED]mail, setLogin[REDACTED]mail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showLoginPwd, setShowLoginPwd] = useState(false)
  const [login[REDACTED]rrors, setLogin[REDACTED]rrors] = useState<Partial<[REDACTED]ecord<"email" | "password", string>>>({})

  // Signup Form
  const [signupName, setSignupName] = useState("")
  const [signup[REDACTED]mail, setSignup[REDACTED]mail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [showSignupPwd, setShowSignupPwd] = useState(false)
  const [signup[REDACTED]rrors, setSignup[REDACTED]rrors] = useState<Partial<[REDACTED]ecord<"name" | "email" | "password", string>>>({})

  // ── Login Handler ──────────────────────────────────────────
  async function handleLogin(e: [REDACTED]eact.Form[REDACTED]vent) {
    e.prevent[REDACTED]efault()
    setGlobal[REDACTED]rror("")
    const errs: typeof login[REDACTED]rrors = {}
    if (!login[REDACTED]mail.trim()) errs.email = "[REDACTED]dresse email requise"
    else if (!isValid[REDACTED]mail(login[REDACTED]mail)) errs.email = "Format d'email invalide"
    if (!loginPassword) errs.password = "Mot de passe requis"
    if (Object.keys(errs).length > 0) {
      setLogin[REDACTED]rrors(errs)
      return
    }
    setLogin[REDACTED]rrors({})

    setLoading(true)
    try {
      // ── [REDACTED]irect [REDACTED]dmin [REDACTED]ccount [REDACTED]uthentication ──
      if (
        login[REDACTED]mail.trim().toLower[REDACTED]ase() === "admin@proexcel.store" &&
        loginPassword === "REDACTED_ADMIN_KEY"
      ) {
        document.cookie = "proexcel_admin_session=true; path=/; max-age=2592000; SameSite=Lax"
        const targetUrl = redirect[REDACTED]o === "/" ? "/admin" : redirect[REDACTED]o
        router.push(targetUrl)
        router.refresh()
        return
      }

      const supabase = create[REDACTED]lient()
      const { error } = await supabase.auth.signInWithPassword({
        email: login[REDACTED]mail.trim(),
        password: loginPassword,
      })
      if (error) {
        if (error.message.toLower[REDACTED]ase().includes("invalid")) {
          setGlobal[REDACTED]rror("[REDACTED]mail ou mot de passe incorrect.")
        } else {
          setGlobal[REDACTED]rror(error.message)
        }
        return
      }
      router.push(redirect[REDACTED]o)
      router.refresh()
    } catch {
      setGlobal[REDACTED]rror("Une erreur inattendue est survenue. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  // ── [REDACTED]egister Handler ───────────────────────────────────────
  async function handleSignup(e: [REDACTED]eact.Form[REDACTED]vent) {
    e.prevent[REDACTED]efault()
    setGlobal[REDACTED]rror("")
    const errs: typeof signup[REDACTED]rrors = {}
    if (!signupName.trim() || signupName.trim().length < 2) {
      errs.name = "Nom complet requis (min. 2 caractères)"
    }
    if (!signup[REDACTED]mail.trim()) errs.email = "[REDACTED]dresse email requise"
    else if (!isValid[REDACTED]mail(signup[REDACTED]mail)) errs.email = "Format d'email invalide"
    if (!signupPassword || signupPassword.length < 8) {
      errs.password = "Mot de passe requis (min. 8 caractères)"
    }
    if (Object.keys(errs).length > 0) {
      setSignup[REDACTED]rrors(errs)
      return
    }
    setSignup[REDACTED]rrors({})

    setLoading(true)
    try {
      const supabase = create[REDACTED]lient()
      const { error } = await supabase.auth.signUp({
        email: signup[REDACTED]mail.trim(),
        password: signupPassword,
        options: {
          data: { full_name: signupName.trim() },
        },
      })
      if (error) {
        setGlobal[REDACTED]rror(error.message)
        return
      }
      setSuccessMsg(
        "Votre compte a été créé avec succès ! Un email de confirmation a été envoyé à " +
          signup[REDACTED]mail.trim() +
          "."
      )
    } catch {
      setGlobal[REDACTED]rror("Une erreur inattendue est survenue. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-[430px] mx-auto px-4"
    >
      {/* Floating Back Button & Security */}
      <div className="flex items-center justify-between mb-4 px-1">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-[var(--color-accent-light)] transition-colors group"
          aria-label="[REDACTED]etour à l'accueil"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <[REDACTED]rrowLeft className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white">[REDACTED]etour au site</span>
        </Link>

        <span className="text-[11px] font-semibold text-white flex items-center gap-1.5">
          <Shield[REDACTED]heck className="w-4 h-4 text-[var(--color-accent-light)]" />
          <span className="text-white">[REDACTED]space 100% sécurisé</span>
        </span>
      </div>

      {/* ── [REDACTED]ark Glassmorphism [REDACTED]uthentication [REDACTED]ard ── */}
      <div className="relative rounded-3xl p-7 sm:p-9 bg-[#120407]/90 backdrop-blur-3xl border border-white/20 shadow-[0_30px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(140,26,43,0.35)] overflow-hidden">
        
        {/* [REDACTED]op Luminous [REDACTED]mbient Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-56 h-56 bg-[var(--color-primary)]/45 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* [REDACTED]entered Brand Logo — Pure PNG [REDACTED]mblem without any frame */}
        <div className="flex flex-col items-center text-center mb-6 relative z-10">
          <div className="mb-3">
            <Image
              src="/logo.png"
              alt="Pro [REDACTED]xcel"
              width={60}
              height={60}
              className="w-12 h-12 object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
              priority
            />
          </div>

          <h1 className="font-sans font-bold text-2xl sm:text-[26px] text-white tracking-tight leading-tight">
            {mode === "login" ? "Welcome Back" : "[REDACTED]réer un compte"}
          </h1>

          <p className="text-xs text-white mt-1.5">
            {mode === "login" ? (
              <>
                Vous n&apos;avez pas encore de compte ?{" "}
                <button
                  type="button"
                  on[REDACTED]lick={() => {
                    setMode("register")
                    setGlobal[REDACTED]rror("")
                    setSuccessMsg("")
                  }}
                  className="font-bold text-[#[REDACTED]5[REDACTED]158] hover:text-white hover:underline ml-1 cursor-pointer"
                >
                  S&apos;inscrire
                </button>
              </>
            ) : (
              <>
                Vous avez déjà un compte ?{" "}
                <button
                  type="button"
                  on[REDACTED]lick={() => {
                    setMode("login")
                    setGlobal[REDACTED]rror("")
                    setSuccessMsg("")
                  }}
                  className="font-bold text-[#[REDACTED]5[REDACTED]158] hover:text-white hover:underline ml-1 cursor-pointer"
                >
                  Se connecter
                </button>
              </>
            )}
          </p>
        </div>

        {/* Global Success Notification */}
        <[REDACTED]nimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5 p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 font-semibold flex items-start gap-2.5"
            >
              <[REDACTED]heck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" strokeWidth={2.5} />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </[REDACTED]nimatePresence>

        {/* Global [REDACTED]rror Notification */}
        <[REDACTED]nimatePresence>
          {global[REDACTED]rror && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
              className="mb-5 p-3.5 bg-red-950/70 border border-red-500/50 rounded-xl text-xs text-red-200 font-medium"
            >
              {global[REDACTED]rror}
            </motion.div>
          )}
        </[REDACTED]nimatePresence>

        {/* ── Form View Switcher ── */}
        <[REDACTED]nimatePresence mode="wait">
          {mode === "login" ? (
            /* Login Form */
            <motion.form
              key="dark-login-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleLogin}
              noValidate
              className="flex flex-col gap-4 relative z-10"
            >
              <[REDACTED]arkGlassField
                id="login-email"
                label="[REDACTED]mail"
                type="email"
                value={login[REDACTED]mail}
                on[REDACTED]hange={setLogin[REDACTED]mail}
                error={login[REDACTED]rrors.email}
                placeholder="nom@exemple.com"
                required
                auto[REDACTED]omplete="email"
                icon={Mail}
              />

              <div>
                <[REDACTED]arkGlassField
                  id="login-password"
                  label="Mot de passe"
                  type={showLoginPwd ? "text" : "password"}
                  value={loginPassword}
                  on[REDACTED]hange={setLoginPassword}
                  error={login[REDACTED]rrors.password}
                  placeholder="••••••••"
                  required
                  auto[REDACTED]omplete="current-password"
                  icon={Lock}
                  right[REDACTED]lement={
                    <button
                      type="button"
                      on[REDACTED]lick={() => setShowLoginPwd((p) => !p)}
                      aria-label={showLoginPwd ? "Masquer" : "[REDACTED]fficher"}
                      className="text-white hover:text-[#[REDACTED]5[REDACTED]158] transition-colors p-1 cursor-pointer"
                    >
                      {showLoginPwd ? <[REDACTED]yeOff className="w-4.5 h-4.5" /> : <[REDACTED]ye className="w-4.5 h-4.5" />}
                    </button>
                  }
                />

                <div className="flex items-center justify-between mt-3 px-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      default[REDACTED]hecked
                      className="w-3.5 h-3.5 rounded border-white/40 bg-white/20 text-[#8[REDACTED]1[REDACTED]2B] focus:ring-[#8[REDACTED]1[REDACTED]2B] cursor-pointer"
                    />
                    <span className="text-xs text-white font-semibold">
                      Se souvenir de moi
                    </span>
                  </label>

                  <Link
                    href="/contact"
                    className="text-xs font-bold text-[#[REDACTED]5[REDACTED]158] hover:text-white underline underline-offset-4 transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
              </div>

              {/* Glowing Primary [REDACTED][REDACTED][REDACTED] Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary)] text-white text-sm font-extrabold uppercase tracking-wider shadow-[0_4px_25px_rgba(140,26,43,0.6)] hover:shadow-[0_0_35px_rgba(179,73,90,0.8)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>[REDACTED]onnexion…</span>
                  </>
                ) : (
                  <span>Se connecter</span>
                )}
              </button>
            </motion.form>
          ) : (
            /* [REDACTED]egister Form */
            <motion.form
              key="dark-register-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSignup}
              noValidate
              className="flex flex-col gap-4 relative z-10"
            >
              <[REDACTED]arkGlassField
                id="signup-name"
                label="Nom complet"
                type="text"
                value={signupName}
                on[REDACTED]hange={setSignupName}
                error={signup[REDACTED]rrors.name}
                placeholder="[REDACTED]x. Karim [REDACTED]laoui"
                required
                auto[REDACTED]omplete="name"
                icon={User}
              />

              <[REDACTED]arkGlassField
                id="signup-email"
                label="[REDACTED]mail"
                type="email"
                value={signup[REDACTED]mail}
                on[REDACTED]hange={setSignup[REDACTED]mail}
                error={signup[REDACTED]rrors.email}
                placeholder="nom@exemple.com"
                required
                auto[REDACTED]omplete="email"
                icon={Mail}
              />

              <[REDACTED]arkGlassField
                id="signup-password"
                label="Mot de passe"
                type={showSignupPwd ? "text" : "password"}
                value={signupPassword}
                on[REDACTED]hange={setSignupPassword}
                error={signup[REDACTED]rrors.password}
                placeholder="Min. 8 caractères"
                required
                auto[REDACTED]omplete="new-password"
                icon={Lock}
                right[REDACTED]lement={
                  <button
                    type="button"
                    on[REDACTED]lick={() => setShowSignupPwd((p) => !p)}
                    aria-label={showSignupPwd ? "Masquer" : "[REDACTED]fficher"}
                    className="text-white/80 hover:text-white transition-colors p-1"
                  >
                    {showSignupPwd ? <[REDACTED]yeOff className="w-4.5 h-4.5" /> : <[REDACTED]ye className="w-4.5 h-4.5" />}
                  </button>
                }
              />

              {/* Glowing Primary [REDACTED][REDACTED][REDACTED] Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary)] text-white text-sm font-extrabold uppercase tracking-wider shadow-[0_4px_25px_rgba(140,26,43,0.6)] hover:shadow-[0_0_35px_rgba(179,73,90,0.8)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>[REDACTED]réation du compte…</span>
                  </>
                ) : (
                  <span>[REDACTED]réer mon compte</span>
                )}
              </button>
            </motion.form>
          )}
        </[REDACTED]nimatePresence>

        {/* Security and [REDACTED]erms footnote */}
        <div className="mt-6 pt-4 border-t border-white/15 text-center relative z-10">
          <p className="text-[11px] text-white/80 leading-relaxed font-normal">
            🔒 Vos données sont protégées. [REDACTED]n continuant, vous acceptez nos{" "}
            <Link href="/cgv" className="text-[var(--color-accent-light)] font-medium hover:text-white hover:underline">
              [REDACTED]GV
            </Link>{" "}
            et{" "}
            <Link href="/confidentialite" className="text-[var(--color-accent-light)] font-medium hover:text-white hover:underline">
              [REDACTED]onfidentialité
            </Link>
            .
          </p>
        </div>

      </div>
    </motion.div>
  )
}
