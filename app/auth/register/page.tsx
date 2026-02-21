"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, CheckCircle2, Zap, Shield, Lock } from "lucide-react"

const LOGO = (
  <svg width="36" height="36" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L4 10v12c0 11 8 18 18 20 10-2 18-9 18-20V10L22 2z" fill="url(#sg-r)" stroke="url(#ss-r)" strokeWidth="1.5"/>
    <path d="M22 8L10 14v8c0 7.5 5.5 12 12 13.5 6.5-1.5 12-6 12-13.5v-8L22 8z" fill="#0a0f1a" fillOpacity="0.6"/>
    <path d="M16 22l4 4 8-8" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="sg-r" x1="4" y1="2" x2="40" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1e3a8a"/><stop offset="1" stopColor="#0891b2"/>
      </linearGradient>
      <linearGradient id="ss-r" x1="4" y1="2" x2="40" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6"/><stop offset="1" stopColor="#22d3ee"/>
      </linearGradient>
    </defs>
  </svg>
)

const SCAN_TYPES = [
  {
    icon: Zap,
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
    name: "Scan Rapide",
    detail: "Cookies, bandeau RGPD • ~30 sec",
  },
  {
    icon: Shield,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
    name: "Scan Standard",
    detail: "Analyse complète + estimation d'amende • ~2-3 min",
  },
  {
    icon: Lock,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30",
    name: "Scan Forensique",
    detail: "Preuves recevables + archive ZIP • ~5-10 min",
  },
]

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur lors de la création du compte")
      router.push("/auth/success")
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

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Créer un compte</h1>
              <p className="text-slate-400">
                Accès bêta gratuit. Sans carte bancaire.
              </p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-300">Nom complet</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jean Dupont"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-11 focus:border-cyan-500"
                  autoComplete="name"
                />
              </div>

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
                <Label htmlFor="password" className="text-slate-300">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="8 caractères minimum"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-11 focus:border-cyan-500"
                  autoComplete="new-password"
                  minLength={8}
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
                {isLoading ? "Création du compte..." : "Créer mon compte gratuit"}
              </Button>

              <p className="text-xs text-slate-500 text-center">
                En créant un compte, vous acceptez nos{" "}
                <Link href="/cgu" className="text-slate-400 hover:text-white underline">CGU</Link>
                {" "}et notre{" "}
                <Link href="/confidentialite" className="text-slate-400 hover:text-white underline">politique de confidentialité</Link>.
              </p>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Déjà un compte ?{" "}
              <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Colonne droite — Ce que vous débloquez ── */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-slate-900 to-slate-800 border-l border-slate-800 flex-col items-center justify-center p-12">
        <div className="max-w-sm">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1.5 mb-6">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              <span className="text-xs text-green-300 font-medium">Accès immédiat après inscription</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              3 modes de scan inclus
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Pendant la bêta, tous les modes sont accessibles gratuitement.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {SCAN_TYPES.map(({ icon: Icon, color, bg, name, detail }) => (
              <div key={name} className={`flex items-start gap-3 p-4 rounded-xl border ${bg}`}>
                <Icon className={`h-5 w-5 ${color} flex-shrink-0 mt-0.5`} />
                <div>
                  <p className="text-slate-100 font-medium text-sm">{name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{detail}</p>
                </div>
              </div>
            ))}
          </div>

          <ul className="space-y-2">
            {[
              "Rapport HTML interactif",
              "Export PDF, JSON & ZIP forensique",
              "Estimation d'amende chiffrée",
              "Historique de vos scans",
            ].map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-6 border-t border-slate-700">
            <p className="text-xs text-slate-500">
              Aucune carte bancaire requise. Aucune limite pendant la bêta.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
