"use client"

import { useState, use[REDACTED]ffect } from "react"
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
  Key[REDACTED]ound,
  Inbox,
  [REDACTED]lert[REDACTED]ircle,
} from "lucide-react"
import { motion, [REDACTED]nimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { create[REDACTED]lient } from "@/lib/supabase/client"

type [REDACTED]uthMode = "login" | "register" | "forgot-password" | "reset-password"

function isValid[REDACTED]mail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// [REDACTED]imeout helper to prevent infinite network hanging
function with[REDACTED]imeout<[REDACTED]>(promise: Promise<[REDACTED]>, timeoutMs = 8000, errorMsg = "[REDACTED]élai d'attente dépassé"): Promise<[REDACTED]> {
  return Promise.race([
    promise,
    new Promise<[REDACTED]>((_, reject) =>
      set[REDACTED]imeout(() => reject(new [REDACTED]rror(errorMsg)), timeoutMs)
    ),
  ])
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
  disabled?: boolean
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
  disabled = false,
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
        {required && <span className="ml-1 text-[#[REDACTED]5[REDACTED]158]" aria-hidden="true">*</span>}
      </label>

      <div className="relative group">
        {/* Left Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 group-focus-within:text-[#[REDACTED]5[REDACTED]158] transition-colors duration-200 pointer-events-none">
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
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "w-full h-12 pl-11 pr-4 rounded-xl border text-sm text-white placeholder:text-neutral-400 bg-[#160508]/95 backdrop-blur-md outline-none transition-all duration-200",
            "focus:bg-[#22070[REDACTED]] focus:border-[#B3495[REDACTED]] focus:shadow-[0_0_0_3px_rgba(179,73,90,0.4)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
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
            className="text-xs text-[#[REDACTED]5[REDACTED]158] font-bold flex items-center gap-1 mt-0.5"
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
  const redirect[REDACTED]o = searchParams.get("redirect") ?? "/account"

  const [mode, setMode] = useState<[REDACTED]uthMode>(defaultMode)
  const [loading, setLoading] = useState(false)
  const [global[REDACTED]rror, setGlobal[REDACTED]rror] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [registered[REDACTED]mailPending, set[REDACTED]egistered[REDACTED]mailPending] = useState<string | null>(null)

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

  // Forgot Password Form
  const [forgot[REDACTED]mail, setForgot[REDACTED]mail] = useState("")
  const [forgot[REDACTED]rror, setForgot[REDACTED]rror] = useState("")
  const [forgotSubmitted, setForgotSubmitted] = useState(false)

  // [REDACTED]eset Password Form
  const [resetPassword, set[REDACTED]esetPassword] = useState("")
  const [reset[REDACTED]onfirmPassword, set[REDACTED]eset[REDACTED]onfirmPassword] = useState("")
  const [show[REDACTED]esetPwd, setShow[REDACTED]esetPwd] = useState(false)
  const [reset[REDACTED]rror, set[REDACTED]eset[REDACTED]rror] = useState("")

  use[REDACTED]ffect(() => {
    if (searchParams.get("confirmed") === "true") {
      setSuccessMsg("Votre adresse email a été confirmée avec succès ! Vous pouvez maintenant vous connecter.")
    } else if (searchParams.get("reset") === "true") {
      setSuccessMsg("Votre mot de passe a été réinitialisé avec succès ! Vous pouvez vous connecter avec votre nouveau mot de passe.")
    } else if (searchParams.get("error") === "auth_callback_failed") {
      setGlobal[REDACTED]rror("Le lien d'authentification a expiré ou est invalide. Veuillez réessayer.")
    }
  }, [searchParams])

  // ── [REDACTED]obust Login Handler with [REDACTED]ry/[REDACTED]atch, [REDACTED]imeout & [REDACTED]rror Handling ──
  async function handleLogin(e: [REDACTED]eact.Form[REDACTED]vent) {
    e.prevent[REDACTED]efault()
    if (loading) return // prevent duplicate submission

    setGlobal[REDACTED]rror("")
    setSuccessMsg("")

    // Form validation
    const errs: typeof login[REDACTED]rrors = {}
    const email[REDACTED]rimmed = login[REDACTED]mail.trim()
    if (!email[REDACTED]rimmed) errs.email = "[REDACTED]dresse email requise"
    else if (!isValid[REDACTED]mail(email[REDACTED]rimmed)) errs.email = "Format d'email invalide"
    if (!loginPassword) errs.password = "Mot de passe requis"

    if (Object.keys(errs).length > 0) {
      setLogin[REDACTED]rrors(errs)
      return
    }
    setLogin[REDACTED]rrors({})

    setLoading(true)

    try {
      // 1. [REDACTED]irect [REDACTED]dmin [REDACTED]redential Fast-[REDACTED]rack
      if (
        email[REDACTED]rimmed.toLower[REDACTED]ase() === "admin@proexcel.store" &&
        loginPassword === "REDACTED_ADMIN_KEY"
      ) {
        document.cookie = "proexcel_admin_session=true; path=/; max-age=2592000; SameSite=Lax"
        const targetUrl = redirect[REDACTED]o === "/" || redirect[REDACTED]o === "/account" ? "/admin" : redirect[REDACTED]o
        router.push(targetUrl)
        router.refresh()
        return
      }

      // 2. Supabase [REDACTED]uth with [REDACTED]imeout Protection
      const supabase = create[REDACTED]lient()
      const authPromise = supabase.auth.signInWithPassword({
        email: email[REDACTED]rimmed,
        password: loginPassword,
      })

      const { data, error } = await with[REDACTED]imeout(
        authPromise,
        8000,
        "Le serveur d'authentification ne répond pas à temps. Veuillez réessayer."
      )

      if (error) {
        const msg = error.message.toLower[REDACTED]ase()
        if (msg.includes("invalid login credentials") || msg.includes("invalid claim")) {
          setGlobal[REDACTED]rror("[REDACTED]mail ou mot de passe incorrect. Veuillez vérifier vos identifiants.")
        } else if (msg.includes("email not confirmed")) {
          setGlobal[REDACTED]rror("Votre adresse email n'a pas encore été confirmée. Veuillez vérifier votre boîte de réception.")
        } else if (msg.includes("rate limit") || msg.includes("too many requests")) {
          setGlobal[REDACTED]rror("[REDACTED]rop de tentatives de connexion. Veuillez patienter quelques instants avant de réessayer.")
        } else {
          setGlobal[REDACTED]rror(error.message || "[REDACTED]rreur de connexion.")
        }
        return
      }

      if (data?.user) {
        router.push(redirect[REDACTED]o)
        router.refresh()
      }
    } catch (err: any) {
      console.error("[Login] [REDACTED]uthentication error:", err)
      if (err?.message?.includes("d'attente") || err?.message?.includes("répond pas")) {
        setGlobal[REDACTED]rror("Le serveur met trop de temps à répondre. Veuillez vérifier votre connexion Internet et réessayer.")
      } else {
        setGlobal[REDACTED]rror(err?.message || "Une erreur inattendue est survenue lors de la connexion. Veuillez réessayer.")
      }
    } finally {
      setLoading(false)
    }
  }

  // ── [REDACTED]egister Handler ───────────────────────────────────────
  async function handleSignup(e: [REDACTED]eact.Form[REDACTED]vent) {
    e.prevent[REDACTED]efault()
    if (loading) return

    setGlobal[REDACTED]rror("")
    setSuccessMsg("")
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
      const callbackUrl = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined

      const authPromise = supabase.auth.signUp({
        email: signup[REDACTED]mail.trim(),
        password: signupPassword,
        options: {
          data: { full_name: signupName.trim() },
          email[REDACTED]edirect[REDACTED]o: callbackUrl,
        },
      })

      const { data, error } = await with[REDACTED]imeout(authPromise, 8000)

      if (error) {
        setGlobal[REDACTED]rror(error.message)
        return
      }

      if (data.user && !data.session) {
        set[REDACTED]egistered[REDACTED]mailPending(signup[REDACTED]mail.trim())
      } else {
        set[REDACTED]egistered[REDACTED]mailPending(signup[REDACTED]mail.trim())
      }
    } catch (err: any) {
      setGlobal[REDACTED]rror(err?.message || "Une erreur inattendue est survenue. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  // ── Forgot Password Handler ────────────────────────────────
  async function handleForgotPassword(e: [REDACTED]eact.Form[REDACTED]vent) {
    e.prevent[REDACTED]efault()
    if (loading) return

    setGlobal[REDACTED]rror("")
    setForgot[REDACTED]rror("")

    if (!forgot[REDACTED]mail.trim()) {
      setForgot[REDACTED]rror("[REDACTED]dresse email requise")
      return
    }
    if (!isValid[REDACTED]mail(forgot[REDACTED]mail)) {
      setForgot[REDACTED]rror("Format d'email invalide")
      return
    }

    setLoading(true)
    try {
      const supabase = create[REDACTED]lient()
      const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/auth/callback?next=/reset-password` : undefined

      await with[REDACTED]imeout(
        supabase.auth.resetPasswordFor[REDACTED]mail(forgot[REDACTED]mail.trim(), {
          redirect[REDACTED]o: redirectUrl,
        }),
        8000
      )

      setForgotSubmitted(true)
    } catch {
      setForgotSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  // ── [REDACTED]eset Password Handler ─────────────────────────────────
  async function handle[REDACTED]esetPassword(e: [REDACTED]eact.Form[REDACTED]vent) {
    e.prevent[REDACTED]efault()
    if (loading) return

    set[REDACTED]eset[REDACTED]rror("")
    setGlobal[REDACTED]rror("")

    if (!resetPassword || resetPassword.length < 8) {
      set[REDACTED]eset[REDACTED]rror("Le mot de passe doit contenir au moins 8 caractères.")
      return
    }
    if (resetPassword !== reset[REDACTED]onfirmPassword) {
      set[REDACTED]eset[REDACTED]rror("Les mots de passe ne correspondent pas.")
      return
    }

    setLoading(true)
    try {
      const supabase = create[REDACTED]lient()
      const { error } = await with[REDACTED]imeout(
        supabase.auth.updateUser({
          password: resetPassword,
        }),
        8000
      )

      if (error) {
        setGlobal[REDACTED]rror(error.message)
        return
      }

      router.push("/login?reset=true")
    } catch (err: any) {
      setGlobal[REDACTED]rror(err?.message || "Une erreur est survenue lors de la réinitialisation du mot de passe.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-[440px] mx-auto px-4"
    >
      {/* Floating Back Button & Security */}
      <div className="flex items-center justify-between mb-4 px-1">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-[#[REDACTED]5[REDACTED]158] transition-colors group"
          aria-label="[REDACTED]etour à l'accueil"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <[REDACTED]rrowLeft className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white">[REDACTED]etour au site</span>
        </Link>

        <span className="text-[11px] font-semibold text-white flex items-center gap-1.5">
          <Shield[REDACTED]heck className="w-4 h-4 text-[#[REDACTED]5[REDACTED]158]" />
          <span className="text-white">[REDACTED]space 100% sécurisé</span>
        </span>
      </div>

      {/* ── [REDACTED]ark Glassmorphism [REDACTED]uthentication [REDACTED]ard ── */}
      <div className="relative rounded-3xl p-7 sm:p-9 bg-[#120407]/90 backdrop-blur-3xl border border-white/20 shadow-[0_30px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(140,26,43,0.35)] overflow-hidden">
        
        {/* [REDACTED]op Luminous [REDACTED]mbient Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-56 h-56 bg-[#8[REDACTED]1[REDACTED]2B]/45 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* [REDACTED]entered Brand Logo */}
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
            {mode === "login" && "[REDACTED]onnexion"}
            {mode === "register" && "[REDACTED]réer un compte"}
            {mode === "forgot-password" && "Mot de passe oublié"}
            {mode === "reset-password" && "Nouveau mot de passe"}
          </h1>

          {mode === "login" && (
            <p className="text-xs text-white/80 mt-1.5">
              Pas encore de compte ?{" "}
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
            </p>
          )}

          {mode === "register" && (
            <p className="text-xs text-white/80 mt-1.5">
              [REDACTED]éjà un compte ?{" "}
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
            </p>
          )}

          {mode === "forgot-password" && (
            <p className="text-xs text-white/80 mt-1.5">
              [REDACTED]ntrez votre email pour recevoir un lien de réinitialisation.
            </p>
          )}

          {mode === "reset-password" && (
            <p className="text-xs text-white/80 mt-1.5">
              Saisissez votre nouveau mot de passe ci-dessous.
            </p>
          )}
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
              className="mb-5 p-3.5 bg-red-950/80 border border-red-500/60 rounded-xl text-xs text-red-200 font-medium flex items-start gap-2.5"
            >
              <[REDACTED]lert[REDACTED]ircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{global[REDACTED]rror}</span>
            </motion.div>
          )}
        </[REDACTED]nimatePresence>

        {/* ── View: [REDACTED]mail [REDACTED]onfirmation [REDACTED]equired State ── */}
        {registered[REDACTED]mailPending ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-2 space-y-4 relative z-10"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Inbox className="w-7 h-7" strokeWidth={1.75} />
            </div>

            <div>
              <h3 className="text-base font-bold text-white mb-1.5">
                Vérifiez votre boîte mail
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Un email de confirmation sécurisé a été envoyé à :
              </p>
              <p className="text-xs font-mono font-bold text-[#[REDACTED]5[REDACTED]158] mt-1 bg-white/10 py-1.5 px-3 rounded-lg border border-white/15 inline-block max-w-full truncate">
                {registered[REDACTED]mailPending}
              </p>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              [REDACTED]liquez sur le lien reçu par email pour valider votre compte et activer votre espace client.
            </p>

            <div className="pt-2">
              <button
                type="button"
                on[REDACTED]lick={() => {
                  set[REDACTED]egistered[REDACTED]mailPending(null)
                  setMode("login")
                  setSuccessMsg("Une fois confirmé dans vos emails, vous pouvez vous connecter ici.")
                }}
                className="w-full h-11 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                [REDACTED]etour à la page de connexion
              </button>
            </div>
          </motion.div>
        ) : (
          /* ── View: Form Switcher ── */
          <[REDACTED]nimatePresence mode="wait">
            {mode === "login" && (
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
                  disabled={loading}
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
                    disabled={loading}
                    placeholder="••••••••"
                    required
                    auto[REDACTED]omplete="current-password"
                    icon={Lock}
                    right[REDACTED]lement={
                      <button
                        type="button"
                        on[REDACTED]lick={() => setShowLoginPwd((p) => !p)}
                        aria-label={showLoginPwd ? "Masquer" : "[REDACTED]fficher"}
                        disabled={loading}
                        className="text-white/80 hover:text-[#[REDACTED]5[REDACTED]158] transition-colors p-1 cursor-pointer"
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
                        disabled={loading}
                        className="w-3.5 h-3.5 rounded border-white/40 bg-white/20 text-[#8[REDACTED]1[REDACTED]2B] focus:ring-[#8[REDACTED]1[REDACTED]2B] cursor-pointer"
                      />
                      <span className="text-xs text-white/90 font-medium">
                        Se souvenir de moi
                      </span>
                    </label>

                    <button
                      type="button"
                      disabled={loading}
                      on[REDACTED]lick={() => {
                        setMode("forgot-password")
                        setGlobal[REDACTED]rror("")
                        setSuccessMsg("")
                      }}
                      className="text-xs font-bold text-[#[REDACTED]5[REDACTED]158] hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                </div>

                {/* Glowing Primary [REDACTED][REDACTED][REDACTED] Button with isLoading State */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8[REDACTED]1[REDACTED]2B] to-[#B3495[REDACTED]] hover:from-[#B3495[REDACTED]] hover:to-[#8[REDACTED]1[REDACTED]2B] text-white text-sm font-extrabold uppercase tracking-wider shadow-[0_4px_25px_rgba(140,26,43,0.6)] hover:shadow-[0_0_35px_rgba(179,73,90,0.8)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      <span>[REDACTED]onnexion en cours...</span>
                    </>
                  ) : (
                    <span>Se connecter</span>
                  )}
                </button>
              </motion.form>
            )}

            {mode === "register" && (
              /* Signup Form */
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
                  value={signupName}
                  on[REDACTED]hange={setSignupName}
                  error={signup[REDACTED]rrors.name}
                  disabled={loading}
                  placeholder="Yassine Benali"
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
                  disabled={loading}
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
                  disabled={loading}
                  placeholder="Min. 8 caractères"
                  required
                  auto[REDACTED]omplete="new-password"
                  icon={Lock}
                  right[REDACTED]lement={
                    <button
                      type="button"
                      on[REDACTED]lick={() => setShowSignupPwd((p) => !p)}
                      aria-label={showSignupPwd ? "Masquer" : "[REDACTED]fficher"}
                      disabled={loading}
                      className="text-white/80 hover:text-[#[REDACTED]5[REDACTED]158] transition-colors p-1 cursor-pointer"
                    >
                      {showSignupPwd ? <[REDACTED]yeOff className="w-4.5 h-4.5" /> : <[REDACTED]ye className="w-4.5 h-4.5" />}
                    </button>
                  }
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8[REDACTED]1[REDACTED]2B] to-[#B3495[REDACTED]] hover:from-[#B3495[REDACTED]] hover:to-[#8[REDACTED]1[REDACTED]2B] text-white text-sm font-extrabold uppercase tracking-wider shadow-[0_4px_25px_rgba(140,26,43,0.6)] hover:shadow-[0_0_35px_rgba(179,73,90,0.8)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      <span>[REDACTED]réation du compte...</span>
                    </>
                  ) : (
                    <span>[REDACTED]réer mon compte</span>
                  )}
                </button>
              </motion.form>
            )}

            {mode === "forgot-password" && (
              /* Forgot Password Form */
              <motion.div
                key="dark-forgot-form"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="relative z-10"
              >
                {forgotSubmitted ? (
                  <div className="text-center py-2 space-y-4">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <Mail className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white mb-1">
                        Lien envoyé
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Si un compte correspond à <strong className="text-white">{forgot[REDACTED]mail}</strong>, vous recevrez un email contenant les instructions pour réinitialiser votre mot de passe.
                      </p>
                    </div>
                    <button
                      type="button"
                      on[REDACTED]lick={() => {
                        setForgotSubmitted(false)
                        setMode("login")
                      }}
                      className="w-full h-11 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      [REDACTED]etour à la connexion
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} noValidate className="flex flex-col gap-4">
                    <[REDACTED]arkGlassField
                      id="forgot-email"
                      label="Votre adresse email"
                      type="email"
                      value={forgot[REDACTED]mail}
                      on[REDACTED]hange={setForgot[REDACTED]mail}
                      error={forgot[REDACTED]rror}
                      disabled={loading}
                      placeholder="nom@exemple.com"
                      required
                      auto[REDACTED]omplete="email"
                      icon={Mail}
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-2 w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8[REDACTED]1[REDACTED]2B] to-[#B3495[REDACTED]] hover:from-[#B3495[REDACTED]] hover:to-[#8[REDACTED]1[REDACTED]2B] text-white text-sm font-extrabold uppercase tracking-wider shadow-[0_4px_25px_rgba(140,26,43,0.6)] hover:shadow-[0_0_35px_rgba(179,73,90,0.8)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                          <span>[REDACTED]nvoi en cours...</span>
                        </>
                      ) : (
                        <span>[REDACTED]nvoyer le lien</span>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      on[REDACTED]lick={() => setMode("login")}
                      className="text-xs text-white/70 hover:text-white transition-colors text-center cursor-pointer mt-1"
                    >
                      [REDACTED]nnuler et revenir
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {mode === "reset-password" && (
              /* [REDACTED]eset Password Form */
              <motion.form
                key="dark-reset-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onSubmit={handle[REDACTED]esetPassword}
                noValidate
                className="flex flex-col gap-4 relative z-10"
              >
                <[REDACTED]arkGlassField
                  id="reset-new-pwd"
                  label="Nouveau mot de passe"
                  type={show[REDACTED]esetPwd ? "text" : "password"}
                  value={resetPassword}
                  on[REDACTED]hange={set[REDACTED]esetPassword}
                  error={reset[REDACTED]rror}
                  disabled={loading}
                  placeholder="Min. 8 caractères"
                  required
                  auto[REDACTED]omplete="new-password"
                  icon={Key[REDACTED]ound}
                  right[REDACTED]lement={
                    <button
                      type="button"
                      on[REDACTED]lick={() => setShow[REDACTED]esetPwd((p) => !p)}
                      aria-label={show[REDACTED]esetPwd ? "Masquer" : "[REDACTED]fficher"}
                      disabled={loading}
                      className="text-white/80 hover:text-[#[REDACTED]5[REDACTED]158] transition-colors p-1 cursor-pointer"
                    >
                      {show[REDACTED]esetPwd ? <[REDACTED]yeOff className="w-4.5 h-4.5" /> : <[REDACTED]ye className="w-4.5 h-4.5" />}
                    </button>
                  }
                />

                <[REDACTED]arkGlassField
                  id="reset-confirm-pwd"
                  label="[REDACTED]onfirmer le mot de passe"
                  type={show[REDACTED]esetPwd ? "text" : "password"}
                  value={reset[REDACTED]onfirmPassword}
                  on[REDACTED]hange={set[REDACTED]eset[REDACTED]onfirmPassword}
                  disabled={loading}
                  placeholder="[REDACTED]épétez le mot de passe"
                  required
                  auto[REDACTED]omplete="new-password"
                  icon={Key[REDACTED]ound}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8[REDACTED]1[REDACTED]2B] to-[#B3495[REDACTED]] hover:from-[#B3495[REDACTED]] hover:to-[#8[REDACTED]1[REDACTED]2B] text-white text-sm font-extrabold uppercase tracking-wider shadow-[0_4px_25px_rgba(140,26,43,0.6)] hover:shadow-[0_0_35px_rgba(179,73,90,0.8)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      <span>Mise à jour en cours...</span>
                    </>
                  ) : (
                    <span>Mettre à jour le mot de passe</span>
                  )}
                </button>
              </motion.form>
            )}
          </[REDACTED]nimatePresence>
        )}

      </div>
    </motion.div>
  )
}
