"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { apiGetScanById, apiPatch, apiFetch } from "@/lib/api"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScanTerminal } from "@/components/scan-terminal"
import {
  Scale,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  StopCircle,
  Terminal,
  RotateCcw,
  Wifi,
  WifiOff,
} from "lucide-react"

type ScanStatus = "pending" | "running" | "completed" | "failed"

type LogEntry = {
  timestamp: string
  level: string
  message: string
  icon: string
}

type Scan = {
  id: string
  target_url: string
  scan_type?: string
  status: ScanStatus
  progress: number
  risk_level?: string
  current_phase?: string
  created_at: string
  scan_logs?: LogEntry[]
  scan_data?: { summary?: { total_violations?: number; risk_level?: string } }
}

export default function ScanProgressPage() {
  const params = useParams()
  const router = useRouter()
  const scanId = params.id as string

  const [userEmail, setUserEmail] = useState("")
  const [scan, setScan] = useState<Scan | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [showTerminal, setShowTerminal] = useState(true)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [isAnnulerling, setIsAnnulerling] = useState(false)

  const { data: session } = useSession()
  const consecutiveErrors = useRef(0)

  useEffect(() => {
    if (session?.user?.email) setUserEmail(session.user.email)
  }, [session])

  const fetchScan = useCallback(async (): Promise<Scan | null> => {
    if (!session?.backendToken) return null
    try {
      const data = await apiGetScanById<Scan>(scanId, session.backendToken)
      consecutiveErrors.current = 0
      setIsReconnecting(false)
      setScan(data)
      // Logs temps réel via GET /scan/{id}/status (endpoint dédié)
      try {
        const statusRes = await apiFetch(`/scan/${scanId}/status`, session.backendToken)
        if (statusRes.ok) {
          const status = await statusRes.json()
          if (Array.isArray(status.scan_logs) && status.scan_logs.length > 0) {
            setLogs(status.scan_logs)
          }
        }
      } catch { /* ignore */ }
      return data
    } catch (e) {
      consecutiveErrors.current += 1
      // After 3 consecutive errors assume backend is restarting (SIGTERM window ~5s)
      if (consecutiveErrors.current >= 3) {
        setIsReconnecting(true)
      }
      return null
    }
  }, [scanId, session?.backendToken])

  // Initial fetch — wait for session then load
  useEffect(() => {
    if (!session?.backendToken) return
    fetchScan().then((data) => {
      if (!data) setError("Scan introuvable")
      setIsLoading(false)
    })
  }, [fetchScan, session?.backendToken])

  // Poll for updates while scan is active
  useEffect(() => {
    if (!scan) return
    if (scan.status === "completed" || scan.status === "failed") return

    const interval = setInterval(async () => {
      const updated = await fetchScan()
      if (updated?.status === "failed") {
        clearInterval(interval)
      }
    }, 2000)

    // Safety timeout 15 min
    const timeout = setTimeout(() => {
      clearInterval(interval)
      if (scan.status !== "completed") {
        setError("Le scan a pris trop de temps. Veuillez réessayer.")
      }
    }, 15 * 60 * 1000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [scan?.status, fetchScan])

  const handleViewReport = () => router.push(`/report/${scanId}`)
  const handleBackToScan = () => router.push("/scan")

  const handleAnnulerScan = async () => {
    if (!scan || !session?.backendToken) return
    setIsAnnulerling(true)
    try {
      await apiPatch(`/scan/${scanId}`, session.backendToken, {
        status: "failed",
        current_phase: "Annulé par l'utilisateur",
        completed_at: new Date().toISOString(),
      })
      router.push("/scan")
    } catch {
      setIsAnnulerling(false)
    }
  }

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname
    } catch {
      return url
    }
  }

  const getStatusBadge = () => {
    if (!scan) return null
    switch (scan.status) {
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Terminé
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
            <XCircle className="h-3 w-3 mr-1" />
            Échec
          </Badge>
        )
      case "running":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            En cours
          </Badge>
        )
      default:
        return (
          <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/50">
            En attente
          </Badge>
        )
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Chargement...</p>
        </div>
      </div>
    )
  }

  // Error state (scan not found or timed out)
  if (error || !scan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100">
        <div className="container mx-auto p-4">
          <DashboardNav userEmail={userEmail} />
          <div className="max-w-2xl mx-auto mt-12">
            <Card className="bg-slate-900/50 border-red-500/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-100 mb-2">
                  {error || "Scan introuvable"}
                </h2>
                <p className="text-slate-400 mb-6">
                  Une erreur s'est produite lors du scan. Vous pouvez réessayer.
                </p>
                <Button onClick={handleBackToScan} className="btn-cta">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour au scanner
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Failed state
  if (scan.status === "failed") {
    const isServerRestart = scan.current_phase?.includes("Serveur redémarré")
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100">
        <div className="container mx-auto p-4">
          <DashboardNav userEmail={userEmail} />
          <div className="max-w-2xl mx-auto mt-12">
            <Card className={`bg-slate-900/50 backdrop-blur-sm ${isServerRestart ? "border-amber-500/50" : "border-red-500/50"}`}>
              <CardContent className="p-8 text-center">
                {isServerRestart ? (
                  <>
                    <AlertTriangle className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-100 mb-2">Scan interrompu</h2>
                    <p className="text-slate-400 mb-2">{extractDomain(scan.target_url)}</p>
                    <p className="text-sm text-slate-500 mb-6">
                      Le serveur a redémarré pendant l'analyse (déploiement rolling). Relancez le scan pour obtenir vos résultats.
                    </p>
                    <Button
                      onClick={() => router.push(`/scan?url=${encodeURIComponent(scan.target_url)}&mode=${scan.scan_type || "standard"}`)}
                      className="btn-cta"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Relancer le scan
                    </Button>
                  </>
                ) : (
                  <>
                    <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-100 mb-2">Le scan a échoué</h2>
                    <p className="text-slate-400 mb-2">{extractDomain(scan.target_url)}</p>
                    <p className="text-sm text-slate-500 mb-6">
                      {scan.current_phase && scan.current_phase !== "Échec"
                        ? scan.current_phase
                        : "Le site n'a pas pu être analysé. Cela peut être dû à un blocage WAF, une protection anti-bot, ou un problème de connexion."}
                    </p>
                    <Button onClick={handleBackToScan} className="btn-cta">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Réessayer
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Completed state
  if (scan.status === "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100">
        <div className="container mx-auto p-4">
          <DashboardNav userEmail={userEmail} />
          <div className="max-w-2xl mx-auto mt-12">
            <Card className="bg-slate-900/50 border-green-500/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center justify-between">
                  <span className="flex items-center">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-400" />
                    Scan terminé
                  </span>
                  {getStatusBadge()}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-lg text-slate-300 mb-2">{extractDomain(scan.target_url)}</p>
                  {scan.risk_level && (
                    <Badge className={`text-lg px-4 py-1 ${
                      scan.risk_level === "CRITICAL" ? "bg-red-500/20 text-red-400 border-red-500/50" :
                      scan.risk_level === "HIGH" ? "bg-orange-500/20 text-orange-400 border-orange-500/50" :
                      scan.risk_level === "MEDIUM" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" :
                      "bg-green-500/20 text-green-400 border-green-500/50"
                    }`}>
                      Risque {scan.risk_level}
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={handleViewReport} className="btn-cta h-12">
                    <Eye className="mr-2 h-4 w-4" />
                    Voir le rapport
                  </Button>
                  <Button
                    onClick={handleBackToScan}
                    variant="outline"
                    className="border-slate-700 hover:bg-slate-800 bg-transparent h-12"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Nouveau scan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Running / Pending state
  const progress = scan.progress || 0
  const currentPhase = scan.current_phase || "Analyse en cours..."

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100">
      <div className="container mx-auto p-4">
        <DashboardNav userEmail={userEmail} />

        <div className="max-w-3xl mx-auto mt-8">
          {/* Reconnecting banner */}
          {isReconnecting && (
            <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2 mb-4">
              <WifiOff className="h-4 w-4 shrink-0" />
              Connexion au serveur perdue — tentative de reconnexion...
            </div>
          )}

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center justify-between">
                <span className="flex items-center">
                  <Scale className="mr-2 h-5 w-5 text-cyan-500" />
                  Scan en cours
                </span>
                <div className="flex items-center gap-2">
                  {isReconnecting ? (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">
                      <Wifi className="h-3 w-3 mr-1" />
                      Reconnexion...
                    </Badge>
                  ) : (
                    getStatusBadge()
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTerminal(!showTerminal)}
                    className="text-slate-400 hover:text-slate-100"
                  >
                    <Terminal className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-lg text-slate-300">{extractDomain(scan.target_url)}</p>
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 text-cyan-500 animate-spin" />
                  <span className="text-cyan-400 font-medium">{progress}%</span>
                </div>
              </div>

              <div className="space-y-1">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-slate-500">{currentPhase}</p>
              </div>

              {showTerminal && (
                <ScanTerminal
                  logs={logs}
                  isRunning={scan.status === "running" || scan.status === "pending"}
                  className="mt-4"
                />
              )}

              {!showTerminal && (
                <p className="text-sm text-slate-500 text-center py-4">
                  L'analyse peut prendre 2 à 5 minutes selon la complexité du site.
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={handleBackToScan}
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-800 bg-transparent"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
                <Button
                  onClick={handleAnnulerScan}
                  variant="outline"
                  disabled={isAnnulerling}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
                >
                  {isAnnulerling ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <StopCircle className="mr-2 h-4 w-4" />
                  )}
                  Annuler le scan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
