"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Check,
  ShieldCheck,
  Mail,
  Lock,
  User,
  KeyRound,
  Inbox,
  AlertCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

type AuthMode = "login" | "register" | "forgot-password" | "reset-password"

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Timeout helper to prevent infinite network hanging
function withTimeout<T>(promise: Promise<T>, timeoutMs = 8000, errorMsg = "Délai d'attente dépassé"): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMsg)), timeoutMs)
    ),
  ])
}

interface DarkGlassFieldProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  error?: string
  placeholder?: string
  required?: boolean
  autoComplete?: string
  disabled?: boolean
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  rightElement?: React.ReactNode
}

function DarkGlassField({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required,
  autoComplete,
  disabled = false,
  icon: Icon,
  rightElement,
}: DarkGlassFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[11px] font-bold uppercase tracking-wider text-slate-300"
      >
        {label}
        {required && <span className="ml-1 text-[#C9A227]" aria-hidden="true">*</span>}
      </label>

      <div className="relative group">
        {/* Left Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#C83E54] transition-colors duration-200 pointer-events-none">
          <Icon className="w-4.5 h-4.5" strokeWidth={1.75} />
        </div>

        {/* Dark Glass Input */}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "w-full h-12 pl-11 pr-4 rounded-xl border text-sm text-white placeholder:text-neutral-500 bg-white/[0.04] backdrop-blur-xs outline-none transition-all duration-200",
            "border-white/10 hover:border-white/20 focus:border-[#8C1A2B] focus:ring-2 focus:ring-[#8C1A2B]/40 focus:bg-white/[0.07]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-red-500/80 bg-red-950/30"
              : "",
            rightElement && "pr-11"
          )}
        />

        {/* Right Element (show/hide password) */}
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>

      {/* Validation error message */}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-[#E5C158] font-bold flex items-center gap-1 mt-0.5"
          >
            <span>•</span>
            <span>{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function getSafeRedirectUrl(target: string | null): string {
  if (!target) return "/account"
  const trimmed = target.trim()
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.startsWith("/\\") &&
    !trimmed.includes(":")
  ) {
    return trimmed
  }
  return "/account"
}

export function AuthClient({ defaultMode = "login" }: { defaultMode?: AuthMode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = getSafeRedirectUrl(searchParams.get("redirect"))

  const [mode, setMode] = useState<AuthMode>(defaultMode)
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [registeredEmailPending, setRegisteredEmailPending] = useState<string | null>(null)

  // Login Form
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showLoginPwd, setShowLoginPwd] = useState(false)
  const [loginErrors, setLoginErrors] = useState<Partial<Record<"email" | "password", string>>>({})

  // Signup Form
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [showSignupPwd, setShowSignupPwd] = useState(false)
  const [signupErrors, setSignupErrors] = useState<Partial<Record<"name" | "email" | "password", string>>>({})

  // Forgot Password Form
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotError, setForgotError] = useState("")
  const [forgotSubmitted, setForgotSubmitted] = useState(false)

  // Reset Password Form
  const [resetPassword, setResetPassword] = useState("")
  const [resetConfirmPassword, setResetConfirmPassword] = useState("")
  const [showResetPwd, setShowResetPwd] = useState(false)
  const [resetError, setResetError] = useState("")

  useEffect(() => {
    if (searchParams.get("confirmed") === "true") {
      setSuccessMsg("Votre adresse email a été confirmée avec succès ! Vous pouvez maintenant vous connecter.")
    } else if (searchParams.get("reset") === "true") {
      setSuccessMsg("Votre mot de passe a été réinitialisé avec succès ! Vous pouvez vous connecter avec votre nouveau mot de passe.")
    } else if (searchParams.get("error") === "auth_callback_failed") {
      setGlobalError("Le lien d'authentification a expiré ou est invalide. Veuillez réessayer.")
    }
  }, [searchParams])

  // ── Robust Login Handler with Try/Catch, Timeout & Error Handling ──
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return // prevent duplicate submission

    setGlobalError("")
    setSuccessMsg("")

    // Form validation
    const errs: typeof loginErrors = {}
    const emailTrimmed = loginEmail.trim()
    if (!emailTrimmed) errs.email = "Adresse email requise"
    else if (!isValidEmail(emailTrimmed)) errs.email = "Format d'email invalide"
    if (!loginPassword) errs.password = "Mot de passe requis"

    if (Object.keys(errs).length > 0) {
      setLoginErrors(errs)
      return
    }
    setLoginErrors({})

    setLoading(true)

    try {
      // Check login rate limit (5 attempts / 15 min per IP+email)
      const { verifyLoginRateLimit } = await import("@/actions/auth-login")
      const rateCheck = await verifyLoginRateLimit(emailTrimmed)
      if (!rateCheck.allowed) {
        setGlobalError(rateCheck.error || "Trop de tentatives. Veuillez patienter 15 minutes.")
        setLoading(false)
        return
      }

      // Supabase Auth with Timeout Protection
      const supabase = createClient()
      const authPromise = supabase.auth.signInWithPassword({
        email: emailTrimmed,
        password: loginPassword,
      })

      const { data, error } = await withTimeout(
        authPromise,
        8000,
        "Le serveur d'authentification ne répond pas à temps. Veuillez réessayer."
      )

      if (error) {
        const msg = error.message.toLowerCase()
        if (msg.includes("invalid login credentials") || msg.includes("invalid claim")) {
          setGlobalError("Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.")
        } else if (msg.includes("email not confirmed")) {
          setGlobalError("Votre adresse email n'a pas encore été confirmée. Veuillez vérifier votre boîte de réception.")
        } else if (msg.includes("rate limit") || msg.includes("too many requests")) {
          setGlobalError("Trop de tentatives de connexion. Veuillez patienter quelques instants avant de réessayer.")
        } else {
          setGlobalError(error.message || "Erreur de connexion.")
        }
        return
      }

      if (data?.user) {
        router.push(redirectTo)
        router.refresh()
      }
    } catch (err: any) {
      console.error("[Login] Authentication error:", err)
      if (err?.message?.includes("d'attente") || err?.message?.includes("répond pas")) {
        setGlobalError("Le serveur met trop de temps à répondre. Veuillez vérifier votre connexion Internet et réessayer.")
      } else {
        setGlobalError(err?.message || "Une erreur inattendue est survenue lors de la connexion. Veuillez réessayer.")
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Register Handler ───────────────────────────────────────
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return

    setGlobalError("")
    setSuccessMsg("")
    const errs: typeof signupErrors = {}
    if (!signupName.trim() || signupName.trim().length < 2) {
      errs.name = "Nom complet requis (min. 2 caractères)"
    }
    if (!signupEmail.trim()) errs.email = "Adresse email requise"
    else if (!isValidEmail(signupEmail)) errs.email = "Format d'email invalide"
    if (!signupPassword || signupPassword.length < 8) {
      errs.password = "Mot de passe requis (min. 8 caractères)"
    }
    if (Object.keys(errs).length > 0) {
      setSignupErrors(errs)
      return
    }
    setSignupErrors({})

    setLoading(true)
    try {
      const supabase = createClient()
      const callbackUrl = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined

      const authPromise = supabase.auth.signUp({
        email: signupEmail.trim(),
        password: signupPassword,
        options: {
          data: { full_name: signupName.trim() },
          emailRedirectTo: callbackUrl,
        },
      })

      const { data, error } = await withTimeout(authPromise, 8000)

      if (error) {
        setGlobalError(error.message)
        return
      }

      if (data.user && !data.session) {
        setRegisteredEmailPending(signupEmail.trim())
      } else {
        setRegisteredEmailPending(signupEmail.trim())
      }
    } catch (err: any) {
      setGlobalError(err?.message || "Une erreur inattendue est survenue. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  // ── Forgot Password Handler ────────────────────────────────
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return

    setGlobalError("")
    setForgotError("")

    if (!forgotEmail.trim()) {
      setForgotError("Adresse email requise")
      return
    }
    if (!isValidEmail(forgotEmail)) {
      setForgotError("Format d'email invalide")
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/auth/callback?next=/reset-password` : undefined

      await withTimeout(
        supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
          redirectTo: redirectUrl,
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

  // ── Reset Password Handler ─────────────────────────────────
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return

    setResetError("")
    setGlobalError("")

    if (!resetPassword || resetPassword.length < 8) {
      setResetError("Le mot de passe doit contenir au moins 8 caractères.")
      return
    }
    if (resetPassword !== resetConfirmPassword) {
      setResetError("Les mots de passe ne correspondent pas.")
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await withTimeout(
        supabase.auth.updateUser({
          password: resetPassword,
        }),
        8000
      )

      if (error) {
        setGlobalError(error.message)
        return
      }

      router.push("/login?reset=true")
    } catch (err: any) {
      setGlobalError(err?.message || "Une erreur est survenue lors de la réinitialisation du mot de passe.")
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
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors group"
          aria-label="Retour à l'accueil"
        >
          <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all">
            <ArrowLeft className="w-3.5 h-3.5 text-slate-300 group-hover:text-white transition-colors" strokeWidth={2} />
          </div>
          <span>Retour au site</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-medium bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-xs">
          <Lock className="w-3.5 h-3.5 text-[#C9A227]" strokeWidth={2} />
          <span>Espace 100% sécurisé</span>
        </span>
      </div>

      {/* ── Dark Glassmorphism Authentication Card ── */}
      <div className="relative rounded-3xl p-7 sm:p-9 bg-white/[0.05] backdrop-blur-md border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(140,26,43,0.2)] overflow-hidden">
        
        {/* Top Luminous Ambient Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-56 h-56 bg-[#8C1A2B]/35 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Centered Brand Logo */}
        <div className="flex flex-col items-center text-center mb-6 relative z-10">
          <div className="mb-3">
            <Image
              src="/logo.png"
              alt="PROEXCEL"
              width={64}
              height={64}
              className="w-14 h-14 object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
              priority
            />
          </div>

          <h1 className="font-sans font-bold text-2xl sm:text-[28px] text-white tracking-tight leading-tight">
            {mode === "login" && "Connexion"}
            {mode === "register" && "Créer un compte"}
            {mode === "forgot-password" && "Mot de passe oublié"}
            {mode === "reset-password" && "Nouveau mot de passe"}
          </h1>

          {mode === "login" && (
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Pas encore de compte ?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register")
                  setGlobalError("")
                  setSuccessMsg("")
                }}
                className="font-bold text-[#C83E54] hover:text-[#E0536A] hover:underline ml-1 cursor-pointer transition-colors"
              >
                S&apos;inscrire
              </button>
            </p>
          )}

          {mode === "register" && (
            <p className="text-xs text-white/80 mt-1.5">
              Déjà un compte ?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login")
                  setGlobalError("")
                  setSuccessMsg("")
                }}
                className="font-bold text-[#E5C158] hover:text-white hover:underline ml-1 cursor-pointer"
              >
                Se connecter
              </button>
            </p>
          )}

          {mode === "forgot-password" && (
            <p className="text-xs text-white/80 mt-1.5">
              Entrez votre email pour recevoir un lien de réinitialisation.
            </p>
          )}

          {mode === "reset-password" && (
            <p className="text-xs text-white/80 mt-1.5">
              Saisissez votre nouveau mot de passe ci-dessous.
            </p>
          )}
        </div>

        {/* Global Success Notification */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5 p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 font-semibold flex items-start gap-2.5"
            >
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" strokeWidth={2.5} />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Error Notification */}
        <AnimatePresence>
          {globalError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
              className="mb-5 p-3.5 bg-red-950/80 border border-red-500/60 rounded-xl text-xs text-red-200 font-medium flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{globalError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── View: Email Confirmation Required State ── */}
        {registeredEmailPending ? (
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
              <p className="text-xs font-mono font-bold text-[#E5C158] mt-1 bg-white/10 py-1.5 px-3 rounded-lg border border-white/15 inline-block max-w-full truncate">
                {registeredEmailPending}
              </p>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              Cliquez sur le lien reçu par email pour valider votre compte et activer votre espace client.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setRegisteredEmailPending(null)
                  setMode("login")
                  setSuccessMsg("Une fois confirmé dans vos emails, vous pouvez vous connecter ici.")
                }}
                className="w-full h-11 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Retour à la page de connexion
              </button>
            </div>
          </motion.div>
        ) : (
          /* ── View: Form Switcher ── */
          <AnimatePresence mode="wait">
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
                <DarkGlassField
                  id="login-email"
                  label="Email"
                  type="email"
                  value={loginEmail}
                  onChange={setLoginEmail}
                  error={loginErrors.email}
                  disabled={loading}
                  placeholder="nom@exemple.com"
                  required
                  autoComplete="email"
                  icon={Mail}
                />

                <div>
                  <DarkGlassField
                    id="login-password"
                    label="Mot de passe"
                    type={showLoginPwd ? "text" : "password"}
                    value={loginPassword}
                    onChange={setLoginPassword}
                    error={loginErrors.password}
                    disabled={loading}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    icon={Lock}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowLoginPwd((p) => !p)}
                        aria-label={showLoginPwd ? "Masquer" : "Afficher"}
                        disabled={loading}
                        className="text-white/80 hover:text-[#E5C158] transition-colors p-1 cursor-pointer"
                      >
                        {showLoginPwd ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    }
                  />

                  <div className="flex items-center justify-between mt-3 px-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        defaultChecked
                        disabled={loading}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#8C1A2B] focus:ring-[#8C1A2B] focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer accent-[#8C1A2B]"
                      />
                      <span className="text-xs text-slate-300 font-medium">
                        Se souvenir de moi
                      </span>
                    </label>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setMode("forgot-password")
                        setGlobalError("")
                        setSuccessMsg("")
                      }}
                      className="text-xs font-semibold text-[#C9A227] hover:text-[#E0B83A] hover:underline underline-offset-4 transition-colors cursor-pointer"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                </div>

                {/* Primary Solid Dark Red Button with Glow */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#8C1A2B] hover:bg-[#A32034] text-white text-sm font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(140,26,43,0.45)] hover:shadow-[0_0_35px_rgba(140,26,43,0.7)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    <span>SE CONNECTER</span>
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
                <DarkGlassField
                  id="signup-name"
                  label="Nom complet"
                  value={signupName}
                  onChange={setSignupName}
                  error={signupErrors.name}
                  disabled={loading}
                  placeholder="Yassine Benali"
                  required
                  autoComplete="name"
                  icon={User}
                />

                <DarkGlassField
                  id="signup-email"
                  label="Email"
                  type="email"
                  value={signupEmail}
                  onChange={setSignupEmail}
                  error={signupErrors.email}
                  disabled={loading}
                  placeholder="nom@exemple.com"
                  required
                  autoComplete="email"
                  icon={Mail}
                />

                <DarkGlassField
                  id="signup-password"
                  label="Mot de passe"
                  type={showSignupPwd ? "text" : "password"}
                  value={signupPassword}
                  onChange={setSignupPassword}
                  error={signupErrors.password}
                  disabled={loading}
                  placeholder="Min. 8 caractères"
                  required
                  autoComplete="new-password"
                  icon={Lock}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowSignupPwd((p) => !p)}
                      aria-label={showSignupPwd ? "Masquer" : "Afficher"}
                      disabled={loading}
                      className="text-white/80 hover:text-[#E5C158] transition-colors p-1 cursor-pointer"
                    >
                      {showSignupPwd ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  }
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8C1A2B] to-[#B3495A] hover:from-[#B3495A] hover:to-[#8C1A2B] text-white text-sm font-extrabold uppercase tracking-wider shadow-[0_4px_25px_rgba(140,26,43,0.6)] hover:shadow-[0_0_35px_rgba(179,73,90,0.8)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      <span>Création du compte...</span>
                    </>
                  ) : (
                    <span>Créer mon compte</span>
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
                        Si un compte correspond à <strong className="text-white">{forgotEmail}</strong>, vous recevrez un email contenant les instructions pour réinitialiser votre mot de passe.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotSubmitted(false)
                        setMode("login")
                      }}
                      className="w-full h-11 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Retour à la connexion
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} noValidate className="flex flex-col gap-4">
                    <DarkGlassField
                      id="forgot-email"
                      label="Votre adresse email"
                      type="email"
                      value={forgotEmail}
                      onChange={setForgotEmail}
                      error={forgotError}
                      disabled={loading}
                      placeholder="nom@exemple.com"
                      required
                      autoComplete="email"
                      icon={Mail}
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-2 w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8C1A2B] to-[#B3495A] hover:from-[#B3495A] hover:to-[#8C1A2B] text-white text-sm font-extrabold uppercase tracking-wider shadow-[0_4px_25px_rgba(140,26,43,0.6)] hover:shadow-[0_0_35px_rgba(179,73,90,0.8)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                          <span>Envoi en cours...</span>
                        </>
                      ) : (
                        <span>Envoyer le lien</span>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setMode("login")}
                      className="text-xs text-white/70 hover:text-white transition-colors text-center cursor-pointer mt-1"
                    >
                      Annuler et revenir
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {mode === "reset-password" && (
              /* Reset Password Form */
              <motion.form
                key="dark-reset-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onSubmit={handleResetPassword}
                noValidate
                className="flex flex-col gap-4 relative z-10"
              >
                <DarkGlassField
                  id="reset-new-pwd"
                  label="Nouveau mot de passe"
                  type={showResetPwd ? "text" : "password"}
                  value={resetPassword}
                  onChange={setResetPassword}
                  error={resetError}
                  disabled={loading}
                  placeholder="Min. 8 caractères"
                  required
                  autoComplete="new-password"
                  icon={KeyRound}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowResetPwd((p) => !p)}
                      aria-label={showResetPwd ? "Masquer" : "Afficher"}
                      disabled={loading}
                      className="text-white/80 hover:text-[#E5C158] transition-colors p-1 cursor-pointer"
                    >
                      {showResetPwd ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  }
                />

                <DarkGlassField
                  id="reset-confirm-pwd"
                  label="Confirmer le mot de passe"
                  type={showResetPwd ? "text" : "password"}
                  value={resetConfirmPassword}
                  onChange={setResetConfirmPassword}
                  disabled={loading}
                  placeholder="Répétez le mot de passe"
                  required
                  autoComplete="new-password"
                  icon={KeyRound}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8C1A2B] to-[#B3495A] hover:from-[#B3495A] hover:to-[#8C1A2B] text-white text-sm font-extrabold uppercase tracking-wider shadow-[0_4px_25px_rgba(140,26,43,0.6)] hover:shadow-[0_0_35px_rgba(179,73,90,0.8)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
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
          </AnimatePresence>
        )}

      </div>
    </motion.div>
  )
}
