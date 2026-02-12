"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl || window.location.origin}/scan`,
          data: { full_name: fullName },
        },
      })
      if (error) throw error
      router.push("/auth/success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header simple */}
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm">
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <svg width="40" height="40" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L4 10v12c0 11 8 18 18 20 10-2 18-9 18-20V10L22 2z" fill="url(#sg-reg)" stroke="url(#ss-reg)" strokeWidth="1.5"/>
              <path d="M22 8L10 14v8c0 7.5 5.5 12 12 13.5 6.5-1.5 12-6 12-13.5v-8L22 8z" fill="#0a0f1a" fillOpacity="0.6"/>
              <path d="M16 22l4 4 8-8" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="sg-reg" x1="4" y1="2" x2="40" y2="42" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1e3a8a"/><stop offset="1" stopColor="#0891b2"/>
                </linearGradient>
                <linearGradient id="ss-reg" x1="4" y1="2" x2="40" y2="42" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3b82f6"/><stop offset="1" stopColor="#22d3ee"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="text-2xl font-bold">
              <span className="text-white">RGPD</span>
              <span className="text-cyan-400">_PRO</span>
            </span>
          </div>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-white">Créer un compte</CardTitle>
              <CardDescription className="text-slate-400">
                2 scans gratuits inclus. Sans carte bancaire.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-300">Nom</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Jean Dupont"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button
                  type="submit"
                  className="btn-cta w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Création..." : "Créer mon compte"}
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-slate-400">
                Déjà un compte ?{" "}
                <Link href="/auth/login" className="text-cyan-400 hover:underline">
                  Se connecter
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
