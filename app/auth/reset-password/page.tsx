"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, CheckCircle2 } from "lucide-react"

const LOGO = (
  <svg width="36" height="36" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L4 10v12c0 11 8 18 18 20 10-2 18-9 18-20V10L22 2z" fill="url(#sg-rp)" stroke="url(#ss-rp)" strokeWidth="1.5"/>
    <path d="M22 8L10 14v8c0 7.5 5.5 12 12 13.5 6.5-1.5 12-6 12-13.5v-8L22 8z" fill="#0a0f1a" fillOpacity="0.6"/>
    <path d="M16 22l4 4 8-8" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="sg-rp" x1="4" y1="2" x2="40" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1e3a8a"/><stop offset="1" stopColor="#0891b2"/>
      </linearGradient>
      <linearGradient id="ss-rp" x1="4" y1="2" x2="40" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6"/><stop offset="1" stopColor="#22d3ee"/>
      </linearGradient>
    </defs>
  </svg>
)

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/update-password`,
      })
      if (error) throw error
      setSent(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="p-6 flex items-center justify-between max-w-sm mx-auto w-full">
        <Link href="/auth/login" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Link>
        <Link href="/" className="flex items-center gap-2">
          {LOGO}
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {sent ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500/10 border border-green-500/30 rounded-full mb-6">
                <CheckCircle2 className="h-7 w-7 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Email envoyé</h1>
              <p className="text-slate-400 mb-8">
                Si un compte existe pour <strong className="text-slate-200">{email}</strong>, vous
                recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <p className="text-slate-500 text-sm">
                Vérifiez aussi vos spams.
              </p>
              <Link href="/auth/login" className="block mt-8">
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:border-slate-500 bg-transparent w-full">
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Mot de passe oublié ?</h1>
                <p className="text-slate-400">
                  Entrez votre email. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-5">
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

                {error && (
                  <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <Button type="submit" className="btn-cta w-full h-11" disabled={isLoading}>
                  {isLoading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                Vous vous souvenez ?{" "}
                <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  Se connecter
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
