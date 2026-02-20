"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { apiGet, apiPatch } from "@/lib/api"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Shield, Bell, Key, Trash2, Save, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [fullName, setFullName] = useState("")
  const [company, setCompany] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [scanAlerts, setScanAlerts] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(false)
  const [securityAlerts, setSecurityAlerts] = useState(true)

  useEffect(() => {
    if (!session?.backendToken) return
    const fetchProfile = async () => {
      try {
        const data = await apiGet<any>("/profiles/me", session.backendToken)
        setProfile(data)
        setFullName(data.full_name || "")
        setCompany(data.company || "")
      } catch {
        // profil non disponible
      }
    }
    fetchProfile()
  }, [session?.backendToken])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.backendToken) return
    setIsLoading(true)
    setMessage(null)
    try {
      await apiPatch("/profiles/me", session.backendToken, {
        full_name: fullName,
        company,
        updated_at: new Date().toISOString(),
      })
      setMessage({ type: "success", text: "Profil mis à jour avec succès !" })
    } catch (error: unknown) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Échec de la mise à jour" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Les mots de passe ne correspondent pas" })
      setIsLoading(false)
      return
    }
    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Le mot de passe doit contenir au moins 8 caractères" })
      setIsLoading(false)
      return
    }
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Échec du changement de mot de passe")
      setMessage({ type: "success", text: "Mot de passe modifié avec succès !" })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: unknown) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Échec du changement de mot de passe" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) return
    await signOut({ callbackUrl: "/" })
  }

  const userEmail = session?.user?.email || ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100">
      <div className="container mx-auto p-4">
        <DashboardNav userEmail={userEmail} />
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Paramètres</h1>
          <p className="text-slate-400">Gérez vos paramètres de compte et préférences</p>
        </div>

        {message && (
          <div className={`mb-6 flex items-center space-x-2 p-4 rounded-lg border ${message.type === "success" ? "bg-green-500/10 border-green-500/50 text-green-400" : "bg-red-500/10 border-red-500/50 text-red-400"}`}>
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-700/50 p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-slate-800 data-[state=active]:text-cyan-400">
              <User className="h-4 w-4 mr-2" />Profil
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-slate-800 data-[state=active]:text-cyan-400">
              <Shield className="h-4 w-4 mr-2" />Sécurité
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-slate-800 data-[state=active]:text-cyan-400">
              <Bell className="h-4 w-4 mr-2" />Notifications
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-slate-800 data-[state=active]:text-cyan-400">
              <Key className="h-4 w-4 mr-2" />Clés API
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-slate-100">Informations du profil</CardTitle>
                  <CardDescription className="text-slate-400">Mettez à jour vos informations personnelles</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="flex items-center space-x-4 mb-6">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-slate-700 text-cyan-500 text-xl">{userEmail.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-slate-200 font-medium">{userEmail}</p>
                        <p className="text-sm text-slate-400">Compte {profile?.role || "utilisateur"}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-slate-300">Nom complet</Label>
                      <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-slate-800/50 border-slate-700/50 text-slate-100" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-slate-300">Entreprise</Label>
                      <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} className="bg-slate-800/50 border-slate-700/50 text-slate-100" />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full btn-cta">
                      {isLoading ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-slate-100">Changer le mot de passe</CardTitle>
                  <CardDescription className="text-slate-400">Mettez à jour votre mot de passe</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-slate-300">Mot de passe actuel</Label>
                      <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="bg-slate-800/50 border-slate-700/50 text-slate-100" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-slate-300">Nouveau mot de passe</Label>
                      <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-slate-800/50 border-slate-700/50 text-slate-100" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-slate-300">Confirmer le nouveau mot de passe</Label>
                      <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-slate-800/50 border-slate-700/50 text-slate-100" />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full btn-cta">
                      {isLoading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-red-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center"><Trash2 className="h-5 w-5 mr-2" />Zone dangereuse</CardTitle>
                  <CardDescription className="text-slate-400">Supprimer définitivement votre compte et toutes vos données</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-red-400">Attention : Cette action est irréversible. Tous vos scans, rapports et données seront définitivement supprimés.</p>
                  </div>
                  <Button variant="outline" onClick={handleDeleteAccount} className="border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent">
                    <Trash2 className="h-4 w-4 mr-2" />Supprimer le compte
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-slate-100">Préférences de notifications</CardTitle>
                <CardDescription className="text-slate-400">Choisissez les notifications que vous souhaitez recevoir</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: "Notifications par email", desc: "Recevoir les notifications par email", value: emailNotifications, set: setEmailNotifications },
                  { label: "Alertes de scan", desc: "Être notifié quand les scans sont terminés", value: scanAlerts, set: setScanAlerts },
                  { label: "Alertes de sécurité", desc: "Notifications pour les violations critiques", value: securityAlerts, set: setSecurityAlerts },
                  { label: "Rapports hebdomadaires", desc: "Recevoir un résumé hebdomadaire", value: weeklyReports, set: setWeeklyReports },
                ].map(({ label, desc, value, set }) => (
                  <div key={label} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                    <div className="space-y-1">
                      <p className="text-slate-200 font-medium">{label}</p>
                      <p className="text-sm text-slate-400">{desc}</p>
                    </div>
                    <Switch checked={value} onCheckedChange={set} />
                  </div>
                ))}
                <Button className="btn-cta">
                  <Save className="h-4 w-4 mr-2" />Sauvegarder les préférences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-slate-100">Clés API</CardTitle>
                <CardDescription className="text-slate-400">Gérez vos clés API pour l&apos;accès programmatique</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-200 font-medium">Clé API Production</p>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Active</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 text-sm bg-slate-900/50 border border-slate-700/50 rounded px-3 py-2 text-slate-400 font-mono">sk_prod_••••••••••••••••••••••••</code>
                    <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent">Copier</Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Créée le 15 janvier 2025</p>
                </div>
                <Button className="btn-cta">
                  <Key className="h-4 w-4 mr-2" />Générer une nouvelle clé
                </Button>
                <div className="bg-cyan-500/10 border border-cyan-500/50 rounded-lg p-4 mt-6">
                  <p className="text-sm text-cyan-400">Gardez vos clés API en sécurité. Ne les partagez jamais publiquement.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
