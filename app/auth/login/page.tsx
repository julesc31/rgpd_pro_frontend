"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, CheckCircle2, Shield, Target, TrendingUp, Lock } from "lucide-react"

const LOGO = (
  <svg width="36" height="36" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L4 10v12c0 11 8 18 18 20 10-2 18-9 18-20V10L22 2z" fill="url(#sg-l)" stroke="url(#ss-l)" strokeWidth="1.5"/>
    <path d="M22 8L10 14v8c0 7.5 5.5 12 12 13.5 6.5-1.5 12-6 12-13.5v-8L22 8z" fill="#0a0f1a" fillOpacity="0.6"/>
    <path d="M16 22l4 4 8-8" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="sg-l" x1="4" y1="2" x2="40" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1e3a8a"/><stop offset="1" stopColor="#0891b2"/>
      </linearGradient>
      <linearGradient id="ss-l" x1="4" y1="2" x2="40" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6"/><stop offset="1" stopColor="#22d3ee"/>
      </linearGradient>
    </defs>
  </svg>
)

const BENEFITS = [
  { icon: Shield, text: "Détection complète des violations RGPD" },
  { icon: TrendingUp, text: "Estimation d'amende basée sur 2 091 sanctions réelles" },
  { icon: Target, text: "Plan de remédiation priorisé par ROI" },
  { icon: Lock, text: "Preuves forensiques recevables en contrôle CNIL" },
]

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push("/scan")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">

      {/* ── Colonne gauche — Formulaire ── */}
      <div className="flex-1 flex flex-col">
        {/* Header minimal */}
        <header className="p-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
          <Link href="/" className="flex items-center gap-2">
            {LOGO}
            <span className="text-lg font-bold">
              <span className="text-white">RGPD</span>
              <span className="text-cyan-400">_PRO</span>
            </span>
          </Link>
        </header>

        {/* Formulaire centré */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Connexion</h1>
              <p className="text-slate-400">Accédez à votre tableau de bord d&apos;audit.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-11 focus:border-cyan-500"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-300">Mot de passe</Label>
                  <Link href="/auth/reset-password" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white h-11 focus:border-cyan-500"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="btn-cta w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Pas encore de compte ?{" "}
              <Link href="/auth/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Créer un compte gratuit
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Colonne droite — Value prop (masquée sur mobile) ── */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-slate-900 to-slate-800 border-l border-slate-800 flex-col items-center justify-center p-12">
        <div className="max-w-sm">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-3 py-1.5 mb-6">
              <span className="text-xs text-blue-300 font-medium">Accès bêta — gratuit</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Audit RGPD professionnel
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Détectez les violations, estimez vos risques financiers et générez des preuves recevables — en quelques minutes.
            </p>
          </div>

          <ul className="space-y-4">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20 flex-shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 pt-8 border-t border-slate-700">
            <p className="text-xs text-slate-500 leading-relaxed">
              Basé sur 2 091 sanctions européennes analysées (CNIL, ICO, AEPD et 15 autres autorités).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
