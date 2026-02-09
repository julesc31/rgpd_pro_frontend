"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
  Download,
  Eye,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  StopCircle,
  Terminal
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
  status: ScanStatus
  progress: number
  risk_level?: string
  current_phase?: string
  created_at: string
  scan_logs?: LogEntry[]
}

type ApiScanStatus = {
  scan_id: string
  status: string
  progress: number
  current_phase?: string
  error?: string
}

export default function ScanProgressPage() {
  const params = useParams()
  const router = useRouter()
  const scanId = params.id as string

  const [userEmail, setUserEmail] = useState("")
  const [scan, setScan] = useState<Scan | null>(null)
  const [apiStatus, setApiStatus] = useState<ApiScanStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [showTerminal, setShowTerminal] = useState(true)

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || "")
      } else {
        router.push("/auth/login")
      }
    }
    fetchUser()
  }, [router])

  // Fetch scan from Supabase
  const fetchScan = useCallback(async () => {
    const supabase = createClient()
    const { data, error: dbError } = await supabase
      .from("scans")
      .select("*")
      .eq("id", scanId)
      .single()

    if (dbError || !data) {
      setError("Scan introuvable")
      setIsLoading(false)
      return null
    }

    setScan(data)
    setIsLoading(false)

    // Update logs if available
    if (data.scan_logs && Array.isArray(data.scan_logs)) {
      setLogs(data.scan_logs)
    }

    return data
  }, [scanId])

  // Poll backend API for real status
  const pollBackendStatus = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      // Note: Le backend utilise un scan_id différent, on poll tous les scans running
      const response = await fetch(`${apiUrl}/scans?status=running`)

      if (response.ok) {
        const data = await response.json()
        // Chercher un scan qui match notre URL
        if (scan && data.scans) {
          const matchingScan = data.scans.find((s: any) =>
            s.url === scan.target_url || s.domain === new URL(scan.target_url).hostname
          )
          if (matchingScan) {
            setApiStatus(matchingScan)
            return matchingScan
          }
        }
      }
    } catch (e) {
      // API not available, continue with Supabase data only
      console.log("Backend API not available, using Supabase data")
    }
    return null
  }, [scan])

  // Initial fetch
  useEffect(() => {
    fetchScan()
  }, [fetchScan])

  // Poll for updates
  useEffect(() => {
    if (!scan) return

    // Si le scan est terminé ou échoué, pas besoin de poll
    if (scan.status === "completed" || scan.status === "failed") {
      return
    }

    const interval = setInterval(async () => {
      // Refresh Supabase data
      const updatedScan = await fetchScan()

      // Also try to get backend status
      await pollBackendStatus()

      // Si le scan est failed dans Supabase, arrêter
      if (updatedScan?.status === "failed") {
        setError("Le scan a échoué. Veuillez réessayer.")
        clearInterval(interval)
      }
    }, 2000)

    // Timeout après 10 minutes
    const timeout = setTimeout(() => {
      clearInterval(interval)
      if (scan.status !== "completed") {
        setError("Le scan a pris trop de temps. Veuillez réessayer.")
      }
    }, 10 * 60 * 1000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [scan, fetchScan, pollBackendStatus])

  const handleViewReport = () => {
    router.push(`/report/${scanId}`)
  }

  const handleBackToScan = () => {
    router.push("/scan")
  }

  const [isAnnulerling, setIsAnnulerling] = useState(false)

  const handleAnnulerScan = async () => {
    if (!scan) return

    setIsAnnulerling(true)
    try {
      const supabase = createClient()

      // Update scan status to failed in Supabase
      await supabase
        .from("scans")
        .update({
          status: "failed",
          current_phase: "Annulé par l'utilisateur",
          completed_at: new Date().toISOString(),
        })
        .eq("id", scanId)

      // Redirect back to scan list
      router.push("/scan")
    } catch (error) {
      console.error("Failed to cancel scan:", error)
      setIsAnnulerling(false)
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

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname
    } catch {
      return url
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

  // Error state
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
                <Button
                  onClick={handleBackToScan}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                >
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100">
        <div className="container mx-auto p-4">
          <DashboardNav userEmail={userEmail} />
          <div className="max-w-2xl mx-auto mt-12">
            <Card className="bg-slate-900/50 border-red-500/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-100 mb-2">
                  Le scan a échoué
                </h2>
                <p className="text-slate-400 mb-2">
                  {extractDomain(scan.target_url)}
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  Le site n'a pas pu être analysé. Cela peut être dû à un blocage WAF,
                  une protection anti-bot, ou un problème de connexion.
                </p>
                <Button
                  onClick={handleBackToScan}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Réessayer
                </Button>
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
                  <p className="text-lg text-slate-300 mb-2">
                    {extractDomain(scan.target_url)}
                  </p>
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
                  <Button
                    onClick={handleViewReport}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white h-12"
                  >
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

  // Running/Pending state - use Supabase data directly, fallback to API status
  const progress = scan.progress || (apiStatus?.progress || 0)
  const currentPhase = scan.current_phase || apiStatus?.current_phase || "Analyse en cours..."

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100">
      <div className="container mx-auto p-4">
        <DashboardNav userEmail={userEmail} />

        <div className="max-w-3xl mx-auto mt-8">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center justify-between">
                <span className="flex items-center">
                  <Scale className="mr-2 h-5 w-5 text-cyan-500" />
                  Scan en cours
                </span>
                <div className="flex items-center gap-2">
                  {getStatusBadge()}
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
              {/* Header with domain and progress */}
              <div className="flex items-center justify-between">
                <p className="text-lg text-slate-300">
                  {extractDomain(scan.target_url)}
                </p>
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 text-cyan-500 animate-spin" />
                  <span className="text-cyan-400 font-medium">{progress}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-slate-500">{currentPhase}</p>
              </div>

              {/* Terminal logs */}
              {showTerminal && (
                <ScanTerminal
                  logs={logs}
                  isRunning={scan.status === "running" || scan.status === "pending"}
                  className="mt-4"
                />
              )}

              {/* Fallback message if no logs */}
              {!showTerminal && (
                <p className="text-sm text-slate-500 text-center py-4">
                  L'analyse peut prendre 2 à 5 minutes selon la complexité du site.
                </p>
              )}

              {/* Action buttons */}
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
