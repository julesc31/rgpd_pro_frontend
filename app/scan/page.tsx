"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScanTerminal } from "@/components/scan-terminal"
import { useSubscription } from "@/hooks/use-subscription"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Globe,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  FileText,
  ExternalLink,
  Loader2,
  Building2,
  Users,
  Euro,
  StopCircle,
  Trash2,
  CheckSquare,
  Square,
  Download,
  FileJson,
  FolderArchive,
  FileCode,
  FileDown,
  ChevronDown,
  ChevronUp,
  Lock,
  Zap,
  Shield,
  ChevronRight,
  RotateCcw,
} from "lucide-react"
import Link from "next/link"

// ============================================================================
// CONFIGURATION
// ============================================================================

type ScanMode = "quick" | "standard" | "forensic"

const SCAN_MODES: {
  id: ScanMode
  name: string
  description: string
  duration: string
  badge: string
  badgeColor: string
  features: string[]
  recommended?: boolean
  icon: React.ElementType
}[] = [
  {
    id: "quick",
    name: "Scan Rapide",
    description: "Détection des violations les plus courantes",
    duration: "~30 sec",
    badge: "Gratuit",
    badgeColor: "green",
    icon: Zap,
    features: ["Cookies & trackers", "Bandeau consentement", "Politique de confidentialité"],
  },
  {
    id: "standard",
    name: "Scan Standard",
    description: "Analyse complète avec estimation financière",
    duration: "~2-3 min",
    badge: "Gratuit",
    badgeColor: "blue",
    icon: Shield,
    recommended: true,
    features: ["Tout Rapide +", "Fingerprinting", "Scripts tiers", "Estimation d'amende"],
  },
  {
    id: "forensic",
    name: "Scan Forensique",
    description: "Preuves recevables pour contrôle CNIL",
    duration: "~5-10 min",
    badge: "Pro",
    badgeColor: "purple",
    icon: Lock,
    features: ["Tout Standard +", "Captures horodatées", "Archive ZIP", "Hash SHA256"],
  },
]

const SECTORS = [
  { key: "accommodation_hospitality", label: "Hôtellerie & Restauration" },
  { key: "employment", label: "Ressources Humaines" },
  { key: "finance_insurance", label: "Finance & Assurance" },
  { key: "healthcare", label: "Santé" },
  { key: "individuals_associations", label: "Associations" },
  { key: "industry_commerce", label: "Industrie & Commerce" },
  { key: "media_telecoms", label: "Médias & Télécoms" },
  { key: "public_education", label: "Secteur Public & Éducation" },
  { key: "real_estate", label: "Immobilier" },
  { key: "transportation_energy", label: "Transport & Énergie" },
  { key: "technology", label: "Technologie" },
  { key: "other", label: "Autre" },
]

const REVENUE_BRACKETS = [
  { key: "SMALL", label: "< 1 Milliard €" },
  { key: "MEDIUM", label: "1 à 10 Milliards €" },
  { key: "LARGE", label: "> 10 Milliards €" },
]

const EMPLOYEE_BRACKETS = [
  { key: "SMALL", label: "< 1 000 employés", value: 500 },
  { key: "MEDIUM", label: "1 000 à 10 000 employés", value: 5000 },
  { key: "LARGE", label: "> 10 000 employés", value: 50000 },
]

const getRevenueValue = (bracket: string): number => {
  switch (bracket) {
    case "SMALL": return 500_000_000
    case "MEDIUM": return 5_000_000_000
    case "LARGE": return 50_000_000_000
    default: return 500_000_000
  }
}

const getEmployeeValue = (bracket: string): number => {
  switch (bracket) {
    case "SMALL": return 500
    case "MEDIUM": return 5000
    case "LARGE": return 50000
    default: return 500
  }
}

// ============================================================================
// TYPES
// ============================================================================

type LogEntry = {
  timestamp: string
  level: string
  message: string
  icon: string
}

type Scan = {
  id: string
  target_url: string
  scan_type: string
  status: string
  progress: number
  risk_level?: string
  current_phase?: string
  created_at: string
  completed_at: string | null
  scan_logs?: LogEntry[]
  scan_data?: { summary?: { total_violations?: number; risk_level?: string } }
  report_html?: string
  storage_path?: string
  report_pdf_path?: string
}

// Normalise un objet brut de l'API en Scan typé
// Le schéma DB a changé : url→target_url, scan_mode→scan_type selon les versions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeScan(raw: any): Scan {
  return {
    id: raw.id ?? raw.scan_id,
    target_url: raw.target_url || raw.url || "",
    scan_type: raw.scan_type || raw.scan_mode || "quick",
    status: raw.status || "pending",
    progress: raw.progress ?? 0,
    risk_level: raw.risk_level,
    current_phase: raw.current_phase,
    created_at: raw.created_at || new Date().toISOString(),
    completed_at: raw.completed_at ?? null,
    scan_logs: Array.isArray(raw.scan_logs) ? raw.scan_logs : [],
    scan_data: raw.scan_data,
    report_html: raw.report_html,
    storage_path: raw.storage_path,
    report_pdf_path: raw.report_pdf_path,
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function ScanPage() {
  const { data: session } = useSession()
  const [userEmail, setUserEmail] = useState("")
  const [targetUrl, setTargetUrl] = useState("https://")
  const [scanMode, setScanMode] = useState<ScanMode>("standard")
  const [sector, setSector] = useState("")
  const [revenueBracket, setRevenueBracket] = useState("")
  const [employeeBracket, setEmployeeBracket] = useState("")
  const [showCompanyInfo, setShowCompanyInfo] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scans, setScans] = useState<Scan[]>([])
  const [scansLoading, setScansLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [selectedScans, setSelectedScans] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeScanId, setActiveScanId] = useState<string | null>(null)
  const [activeScanLogs, setActiveScanLogs] = useState<LogEntry[]>([])
  const [showActiveScan, setShowActiveScan] = useState(false)
  const [expandedDownloadId, setExpandedDownloadId] = useState<string | null>(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [downloadingPdfScanId, setDownloadingPdfScanId] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const subscription = useSubscription()
  // Vrai quand handleStartScan a un detectionTimer actif qui gère déjà le polling /status
  const isDetectionTimerActive = useRef(false)
  // Mémorise le mode soumis pour corriger scan_type si le backend ne le retourne pas
  const pendingScanMode = useRef<ScanMode>("standard")
  // Map id → scan_type corrigé pour toute la session
  const correctedScanTypes = useRef<Map<string, string>>(new Map())

  // Pre-fill form when coming from a "Relancer le scan" redirect
  useEffect(() => {
    const urlParam = searchParams.get("url")
    const modeParam = searchParams.get("mode")
    if (urlParam) setTargetUrl(urlParam)
    if (modeParam && ["quick", "standard", "forensic"].includes(modeParam)) {
      setScanMode(modeParam as ScanMode)
    }
  }, [searchParams])

  useEffect(() => {
    if (session?.user?.email) setUserEmail(session.user.email)
  }, [session])

  useEffect(() => {
    if (!session?.backendToken) return
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/scans`, {
          headers: { Authorization: `Bearer ${session.backendToken}` },
        })
        if (res.ok) {
          const data = await res.json()
          const raw = Array.isArray(data) ? data : (data.scans || [])
          setScans(raw.map(normalizeScan))
        }
      } catch { /* ignore */ } finally {
        setScansLoading(false)
      }
    }
    fetchData()
  }, [session?.backendToken])

  // Poll for running scans
  useEffect(() => {
    const hasRunningScans = scans.some(s => s.status === "running" || s.status === "pending")
    if (!hasRunningScans || !session?.backendToken) return

    const interval = setInterval(async () => {
      if (isDeleting || showDeleteConfirm) return
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/scans`, {
          headers: { Authorization: `Bearer ${session.backendToken}` },
        })
        if (!res.ok) return
        const raw = await res.json()
        const scansData: Scan[] = (Array.isArray(raw) ? raw : (raw.scans || [])).map(normalizeScan)
        const newlyCompleted = scansData.some(newScan => {
          const oldScan = scans.find(s => s.id === newScan.id)
          return oldScan && oldScan.status !== "completed" && newScan.status === "completed"
        })
        if (newlyCompleted) subscription.refresh()
        setScans(scansData)
        // Logs en temps réel via GET /scan/{id}/status
        // Skip si detectionTimer est actif — il gère déjà ce polling (évite les doublons)
        if (activeScanId && !isDetectionTimerActive.current) {
          const activeScan = scansData.find(s => s.id === activeScanId)
          const isStillActive = activeScan?.status === "running" || activeScan?.status === "pending"
          if (isStillActive) {
            try {
              const statusRes = await fetch(`${apiUrl}/scan/${activeScanId}/status`, {
                headers: { Authorization: `Bearer ${session.backendToken}` },
              })
              if (statusRes.ok) {
                const status = await statusRes.json()
                if (Array.isArray(status.scan_logs) && status.scan_logs.length > 0) {
                  setActiveScanLogs(status.scan_logs)
                }
                if (status.progress !== undefined || status.current_phase !== undefined) {
                  setScans(prev => prev.map(s =>
                    s.id === activeScanId
                      ? { ...s, progress: status.progress ?? s.progress, current_phase: status.current_phase ?? s.current_phase }
                      : s
                  ))
                }
              }
            } catch { /* ignore */ }
          }
        }
      } catch { /* ignore */ }
    }, 2000)

    return () => clearInterval(interval)
  }, [scans, isDeleting, showDeleteConfirm, activeScanId, session?.backendToken])

  const handleStartScan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.backendToken || !session.user?.id) {
      setError("Non authentifié — veuillez vous reconnecter")
      return
    }
    setError(null)

    // Validation
    let urlToScan = targetUrl.trim()
    if (!urlToScan.startsWith("http://") && !urlToScan.startsWith("https://")) {
      urlToScan = "https://" + urlToScan
    }
    try { new URL(urlToScan) } catch { setError("URL invalide"); return }
    if (scanMode !== "quick") {
      if (!sector) { setError("Veuillez sélectionner un secteur d'activité"); return }
      if (!revenueBracket) { setError("Veuillez sélectionner un chiffre d'affaires"); return }
      if (!employeeBracket) { setError("Veuillez sélectionner un nombre d'employés"); return }
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.backendToken}`,
    }

    // Mémorise le mode pour corriger scan_type si le backend ne le retourne pas
    pendingScanMode.current = scanMode

    // POST /scan retourne immédiatement (status="queued") — vrai fire-and-forget.
    // Le scan tourne en thread côté backend.
    fetch(`${apiUrl}/scan`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        url: urlToScan,
        company_info: scanMode !== "quick" ? {
          name: new URL(urlToScan).hostname.replace("www.", ""),
          revenue: getRevenueValue(revenueBracket),
          employee_count: getEmployeeValue(employeeBracket),
          sector,
        } : null,
        scan_mode: scanMode,
        user_id: session.user.id,
      }),
    }).catch(() => { /* réseau : le polling détectera l'échec */ })

    // Affiche l'UI immédiatement
    setShowActiveScan(true)
    setActiveScanLogs([])
    setTargetUrl("https://")

    // Snapshot des IDs connus AVANT le nouveau scan
    const knownIds = new Set(scans.map(s => s.id))
    let detectedScanId: string | null = null
    isDetectionTimerActive.current = true

    // Poll toutes les 1.5s :
    //  1. GET /scans → détecte le nouveau scan, met à jour le state
    //  2. GET /scan/{id}/status → logs en temps réel
    //  3. Quand completed/failed → arrête le polling (GET /scans a déjà le résultat complet)
    const detectionTimer = setInterval(async () => {
      try {
        const res = await fetch(`${apiUrl}/scans`, {
          headers: { Authorization: `Bearer ${session.backendToken}` },
        })
        if (!res.ok) return
        const raw = await res.json()
        const list: Scan[] = (Array.isArray(raw) ? raw : (raw.scans || [])).map(normalizeScan)

        // Détecte le nouveau scan AVANT setScans pour corriger scan_type si besoin
        if (!detectedScanId) {
          const newScan = list.find(s => !knownIds.has(s.id))
          if (newScan) {
            detectedScanId = newScan.id
            setActiveScanId(newScan.id)
            // Le backend ne retourne pas toujours scan_type → on force le mode soumis
            correctedScanTypes.current.set(newScan.id, pendingScanMode.current)
          }
        }

        // Applique les corrections de scan_type (session en cours)
        const correctedList = list.map(s => {
          const override = correctedScanTypes.current.get(s.id)
          return override ? { ...s, scan_type: override } : s
        })
        setScans(correctedList)

        if (!detectedScanId) return

        const activeScan = list.find(s => s.id === detectedScanId)

        // Scan terminé — appel final à /status pour récupérer les logs complets
        if (activeScan?.status === "completed" || activeScan?.status === "failed") {
          clearInterval(detectionTimer)
          isDetectionTimerActive.current = false
          try {
            const finalRes = await fetch(`${apiUrl}/scan/${detectedScanId}/status`, {
              headers: { Authorization: `Bearer ${session.backendToken}` },
            })
            if (finalRes.ok) {
              const finalStatus = await finalRes.json()
              if (Array.isArray(finalStatus.scan_logs) && finalStatus.scan_logs.length > 0) {
                setActiveScanLogs(finalStatus.scan_logs)
              }
            }
          } catch { /* ignore */ }
          return
        }

        // Scan en cours → logs via /status
        try {
          const statusRes = await fetch(`${apiUrl}/scan/${detectedScanId}/status`, {
            headers: { Authorization: `Bearer ${session.backendToken}` },
          })
          if (statusRes.ok) {
            const status = await statusRes.json()
            if (Array.isArray(status.scan_logs) && status.scan_logs.length > 0) {
              setActiveScanLogs(status.scan_logs)
            }
          }
        } catch { /* ignore */ }
      } catch { /* ignore */ }
    }, 1500)
  }

  const filteredScans = scans.filter(scan =>
    (scan.target_url || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRiskBadge = (riskLevel?: string, status?: string) => {
    if (status === "running" || status === "pending") {
      return (
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          En cours
        </Badge>
      )
    }
    if (status === "failed") {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
          <XCircle className="h-3 w-3 mr-1" />
          Échec
        </Badge>
      )
    }
    switch (riskLevel?.toUpperCase()) {
      case "CRITICAL": return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">🔴 Critique</Badge>
      case "HIGH": return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">🟠 Élevé</Badge>
      case "MEDIUM": return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">🟡 Moyen</Badge>
      case "LOW": return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">🟢 Faible</Badge>
      default: return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/50"><CheckCircle className="h-3 w-3 mr-1" />Terminé</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  }

  const extractDomain = (url: string) => {
    try { return new URL(url).hostname } catch { return url }
  }

  const handleToggleSelect = (scanId: string) => {
    setSelectedScans(prev => {
      const newSet = new Set(prev)
      newSet.has(scanId) ? newSet.delete(scanId) : newSet.add(scanId)
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedScans.size === filteredScans.length) {
      setSelectedScans(new Set())
    } else {
      setSelectedScans(new Set(filteredScans.map(s => s.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedScans.size === 0 || !session?.backendToken) return
    setIsDeleting(true)
    const idsToDelete = Array.from(selectedScans)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      await fetch(`${apiUrl}/scans`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.backendToken}`,
        },
        body: JSON.stringify({ ids: idsToDelete }),
      })
      setScans(prev => prev.filter(s => !selectedScans.has(s.id)))
      setSelectedScans(new Set())
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error("Failed to delete scans:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelScan = async (scanId: string) => {
    if (!session?.backendToken) return
    setCancellingId(scanId)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      await fetch(`${apiUrl}/scan/${scanId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.backendToken}`,
        },
        body: JSON.stringify({
          status: "failed",
          current_phase: "Annulé par l'utilisateur",
          completed_at: new Date().toISOString(),
        }),
      })
      await new Promise(resolve => setTimeout(resolve, 500))
      setScans(prev => prev.map(s =>
        s.id === scanId ? { ...s, status: "failed", completed_at: new Date().toISOString() } : s
      ))
    } catch (error) {
      console.error("Failed to cancel scan:", error)
    } finally {
      setCancellingId(null)
    }
  }

  const isFormValid =
    targetUrl.trim() !== "https://" &&
    targetUrl.trim().length > 8 &&
    (scanMode === "quick" || (sector && revenueBracket && employeeBracket))

  const activeScan = activeScanId ? scans.find(s => s.id === activeScanId) : null
  const isActiveScanRunning = activeScan?.status === "running" || activeScan?.status === "pending"
  const isActiveScanCompleted = activeScan?.status === "completed"
  const isActiveScanFailed = activeScan?.status === "failed"

  // ── Download helpers ──────────────────────────────────────────────────────

  /**
   * Le backend n'a pas GET /scan/{id}. On fetche GET /scans et on filtre par ID.
   * On regarde d'abord dans le state local (déjà chargé).
   */
  const fetchScanById = async (id: string): Promise<Scan | null> => {
    const local = scans.find(s => s.id === id)
    if (!session?.backendToken) return local || null
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/scans`, {
        headers: { Authorization: `Bearer ${session.backendToken}` },
      })
      if (!res.ok) return local || null
      const raw = await res.json()
      const list: Scan[] = (Array.isArray(raw) ? raw : (raw.scans || [])).map(normalizeScan)
      return list.find(s => s.id === id) || local || null
    } catch {
      return local || null
    }
  }

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.style.display = "none"
    document.body.appendChild(a)
    a.click()
    setTimeout(() => { window.URL.revokeObjectURL(url); document.body.removeChild(a) }, 100)
  }

  const handleDownloadHtml = async (scanId?: string) => {
    const id = scanId || activeScanId
    if (!id) return
    try {
      const data = await fetchScanById(id)
      if (!data?.report_html) { setError("Rapport HTML non disponible"); return }
      triggerDownload(
        new Blob([data.report_html], { type: "application/octet-stream" }),
        `rapport-rgpd-${extractDomain(data.target_url)}.html`
      )
    } catch { setError("Rapport HTML non disponible") }
  }

  const handleDownloadForensics = async (scanId?: string) => {
    const id = scanId || activeScanId
    if (!id) return
    try {
      const data = await fetchScanById(id)
      if (!data?.storage_path) { setError("Archive forensique non disponible"); return }
      const dlRes = await fetch(`/api/r2/download?key=${encodeURIComponent(data.storage_path)}`)
      if (!dlRes.ok) { setError("Erreur lors du téléchargement de l'archive"); return }
      triggerDownload(await dlRes.blob(), data.storage_path.split("/").pop() || "forensics.zip")
    } catch { setError("Erreur lors du téléchargement de l'archive") }
  }

  const handleDownloadJson = async (scanId?: string, url?: string) => {
    const id = scanId || activeScanId
    if (!id) return
    try {
      const data = await fetchScanById(id)
      if (!data?.scan_data) { setError("Données JSON non disponibles"); return }
      triggerDownload(
        new Blob([JSON.stringify(data.scan_data, null, 2)], { type: "application/octet-stream" }),
        `scan-data-${extractDomain(url || data.target_url)}.json`
      )
    } catch { setError("Données JSON non disponibles") }
  }

  const handleDownloadPdf = async (scanId?: string, targetUrlOverride?: string) => {
    const id = scanId || activeScanId
    if (!id) return
    if (scanId) setDownloadingPdfScanId(scanId)
    else setDownloadingPdf(true)
    try {
      const data = await fetchScanById(id)
      if (!data) { setError("Données du rapport non disponibles pour le PDF"); return }
      const domain = extractDomain(targetUrlOverride || data?.target_url || "rapport")

      if (data?.report_pdf_path) {
        const dlRes = await fetch(`/api/r2/download?key=${encodeURIComponent(data.report_pdf_path)}`)
        if (dlRes.ok) { triggerDownload(await dlRes.blob(), `rapport-rgpd-${domain}.pdf`); return }
      }
      if (!data?.scan_data) { setError("Données du rapport non disponibles pour le PDF"); return }

      const pdfRes = await fetch("/api/scan/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.scan_data),
      })
      if (!pdfRes.ok) {
        const err = await pdfRes.json().catch(() => ({}))
        throw new Error((err as { detail?: string }).detail || `Erreur ${pdfRes.status}`)
      }
      triggerDownload(await pdfRes.blob(), `rapport-rgpd-${domain}.pdf`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erreur lors du téléchargement du PDF")
    } finally {
      setDownloadingPdf(false)
      setDownloadingPdfScanId(null)
    }
  }

  const handleCloseActiveScan = () => {
    setShowActiveScan(false)
    setActiveScanId(null)
    setActiveScanLogs([])
    isDetectionTimerActive.current = false
  }

  const handleRelaunchScan = (scan: Scan) => {
    setTargetUrl(scan.target_url)
    if (scan.scan_type && ["quick", "standard", "forensic"].includes(scan.scan_type)) {
      setScanMode(scan.scan_type as ScanMode)
    }
    handleCloseActiveScan()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100">
      <div className="container mx-auto p-4 max-w-5xl">
        <DashboardNav userEmail={userEmail} />

        {/* ── Nouveau Scan ── */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-100 flex items-center text-xl">
                <Globe className="mr-3 h-6 w-6 text-cyan-500" />
                Scanner un site
              </CardTitle>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                Accès libre — Beta
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStartScan} className="space-y-6" autoComplete="off">

              {/* ── Sélection du mode de scan ── */}
              <div className="space-y-3">
                <Label className="text-slate-300 text-sm font-medium">Mode d&apos;analyse</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {SCAN_MODES.map((mode) => {
                    const Icon = mode.icon
                    const isSelected = scanMode === mode.id
                    const colorClasses = {
                      green: isSelected
                        ? "border-green-500 bg-green-500/10 ring-1 ring-green-500/50"
                        : "border-slate-700/50 hover:border-green-500/50 hover:bg-green-500/5",
                      blue: isSelected
                        ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/50"
                        : "border-slate-700/50 hover:border-blue-500/50 hover:bg-blue-500/5",
                      purple: isSelected
                        ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/50"
                        : "border-slate-700/50 hover:border-purple-500/50 hover:bg-purple-500/5",
                    }[mode.badgeColor]

                    const iconColor = {
                      green: "text-green-400",
                      blue: "text-blue-400",
                      purple: "text-purple-400",
                    }[mode.badgeColor]

                    const badgeClasses = {
                      green: "bg-green-500/20 text-green-400 border-green-500/50",
                      blue: "bg-blue-500/20 text-blue-400 border-blue-500/50",
                      purple: "bg-purple-500/20 text-purple-400 border-purple-500/50",
                    }[mode.badgeColor]

                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          setScanMode(mode.id)
                          if (mode.id === "quick") setShowCompanyInfo(false)
                          else setShowCompanyInfo(true)
                        }}
                        className={`relative text-left p-4 rounded-xl border transition-all duration-200 ${colorClasses}`}
                      >
                        {mode.recommended && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Recommandé
                          </span>
                        )}
                        <div className="flex items-start justify-between mb-2">
                          <Icon className={`h-5 w-5 ${iconColor}`} />
                          <Badge className={`text-[10px] px-1.5 py-0 ${badgeClasses}`}>{mode.badge}</Badge>
                        </div>
                        <p className="text-slate-100 font-semibold text-sm mb-0.5">{mode.name}</p>
                        <p className="text-slate-400 text-xs mb-2">{mode.description}</p>
                        <p className={`text-xs font-medium ${iconColor}`}>{mode.duration}</p>
                        <ul className="mt-2 space-y-0.5">
                          {mode.features.map((f) => (
                            <li key={f} className="text-slate-500 text-[11px] flex items-center gap-1">
                              <ChevronRight className="h-3 w-3 flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── URL Input ── */}
              <div className="space-y-2">
                <Label htmlFor="url" className="text-slate-300">URL du site à analyser</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-slate-700/50 bg-slate-800 text-slate-400 text-lg">
                    https://
                  </span>
                  <Input
                    id="url"
                    type="text"
                    placeholder="exemple.com"
                    value={targetUrl.replace(/^https:\/\//, "")}
                    onChange={(e) => {
                      const value = e.target.value.replace(/^https?:\/\//, "")
                      setTargetUrl("https://" + value)
                    }}
                    className="bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500 h-12 text-lg rounded-l-none"
                    disabled={isLoading}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-form-type="other"
                  />
                </div>
              </div>

              {/* ── Infos entreprise (accordéon) ── */}
              {scanMode !== "quick" && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowCompanyInfo(!showCompanyInfo)}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showCompanyInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    Informations entreprise
                    <span className="text-slate-600 text-xs">(pour estimation d&apos;amende)</span>
                    <span className="text-red-400 text-xs">* requis</span>
                  </button>

                  {showCompanyInfo && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-cyan-500" />
                          Secteur d&apos;activité
                        </Label>
                        <Select value={sector} onValueChange={setSector} disabled={isLoading}>
                          <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-slate-100 h-11">
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {SECTORS.map((s) => (
                              <SelectItem key={s.key} value={s.key} className="text-slate-100 focus:bg-slate-700">
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 flex items-center gap-2">
                          <Euro className="h-4 w-4 text-cyan-500" />
                          Chiffre d&apos;affaires
                        </Label>
                        <Select value={revenueBracket} onValueChange={setRevenueBracket} disabled={isLoading}>
                          <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-slate-100 h-11">
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {REVENUE_BRACKETS.map((r) => (
                              <SelectItem key={r.key} value={r.key} className="text-slate-100 focus:bg-slate-700">
                                {r.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 flex items-center gap-2">
                          <Users className="h-4 w-4 text-cyan-500" />
                          Nombre d&apos;employés
                        </Label>
                        <Select value={employeeBracket} onValueChange={setEmployeeBracket} disabled={isLoading}>
                          <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-slate-100 h-11">
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {EMPLOYEE_BRACKETS.map((e) => (
                              <SelectItem key={e.key} value={e.key} className="text-slate-100 focus:bg-slate-700">
                                {e.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Scan Rapide — note */}
              {scanMode === "quick" && (
                <p className="text-xs text-slate-500 bg-green-500/5 border border-green-500/20 rounded-lg px-3 py-2">
                  Le scan rapide ne nécessite pas d&apos;informations entreprise. Pour une estimation d&apos;amende,
                  choisissez le mode Standard ou Forensique.
                </p>
              )}

              {error && (
                <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="btn-cta w-full h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Lancement de l&apos;analyse...
                  </>
                ) : (
                  <>
                    Lancer l&apos;analyse RGPD
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              {!showActiveScan && (
                <p className="text-xs text-slate-500 text-center">
                  {scanMode === "quick" && "Analyse rapide des cookies et trackers. Résultats en ~30 secondes."}
                  {scanMode === "standard" && "Analyse complète RGPD avec estimation d'amende basée sur la jurisprudence. Durée : 2-3 minutes."}
                  {scanMode === "forensic" && "Analyse forensique complète avec preuves recevables (captures, archive ZIP, hashes). Durée : 5-10 minutes."}
                </p>
              )}
            </form>

            {/* ── Zone de suivi du scan actif ── */}
            {showActiveScan && activeScan && (
              <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isActiveScanRunning && <Loader2 className="h-5 w-5 text-cyan-500 animate-spin" />}
                    {isActiveScanCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {isActiveScanFailed && <XCircle className="h-5 w-5 text-red-500" />}
                    <span className="text-slate-200 font-medium">{extractDomain(activeScan.target_url)}</span>
                    {activeScan.risk_level && isActiveScanCompleted && (
                      <Badge className={`${
                        activeScan.risk_level === "CRITICAL" ? "bg-red-500/20 text-red-400 border-red-500/50" :
                        activeScan.risk_level === "HIGH" ? "bg-orange-500/20 text-orange-400 border-orange-500/50" :
                        activeScan.risk_level === "MEDIUM" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" :
                        "bg-green-500/20 text-green-400 border-green-500/50"
                      }`}>
                        Risque {activeScan.risk_level}
                      </Badge>
                    )}
                  </div>
                  {isActiveScanRunning && (
                    <span className="text-cyan-400 font-medium">{activeScan.progress || 0}%</span>
                  )}
                </div>

                {isActiveScanRunning && (
                  <div className="space-y-1">
                    <Progress value={activeScan.progress || 0} className="h-2" />
                    <p className="text-xs text-slate-500">{activeScan.current_phase || "Analyse en cours..."}</p>
                  </div>
                )}

                <ScanTerminal logs={activeScanLogs} isRunning={isActiveScanRunning} scanType={activeScan?.scan_type} />

                {isActiveScanRunning && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelScan(activeScan.id)}
                      disabled={cancellingId === activeScan.id}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
                    >
                      {cancellingId === activeScan.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <StopCircle className="h-4 w-4 mr-2" />
                      )}
                      Annuler le scan
                    </Button>
                  </div>
                )}

                {isActiveScanCompleted && (
                  <div className="space-y-3 pt-2">
                    <p className="text-sm text-slate-300 font-medium">Télécharger les résultats :</p>
                    <div className={`grid gap-3 ${activeScan?.scan_type === "quick" ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}>
                      {/* JSON — tous les types */}
                      <Button onClick={() => handleDownloadJson()} variant="outline"
                        className="border-green-500/50 text-green-400 hover:bg-green-500/10 bg-transparent flex-col h-auto py-3">
                        <FileJson className="h-5 w-5 mb-1" />
                        <span className="text-xs">Données JSON</span>
                        <span className="text-[10px] text-slate-500">Brutes</span>
                      </Button>
                      {/* HTML — tous les types */}
                      <Button onClick={() => handleDownloadHtml()} variant="outline"
                        className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent flex-col h-auto py-3">
                        <FileCode className="h-5 w-5 mb-1" />
                        <span className="text-xs">Rapport HTML</span>
                        <span className="text-[10px] text-slate-500">
                          {activeScan?.scan_type === "forensic" ? "Forensique" : activeScan?.scan_type === "standard" ? "Standard" : "Flash"}
                        </span>
                      </Button>
                      {/* PDF — standard + forensic uniquement */}
                      {activeScan?.scan_type !== "quick" && (
                        <Button onClick={() => handleDownloadPdf()} disabled={downloadingPdf} variant="outline"
                          className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 bg-transparent flex-col h-auto py-3 disabled:opacity-50">
                          {downloadingPdf ? <Loader2 className="h-5 w-5 mb-1 animate-spin" /> : <FileDown className="h-5 w-5 mb-1" />}
                          <span className="text-xs">PDF</span>
                          <span className="text-[10px] text-slate-500">Rapport</span>
                        </Button>
                      )}
                      {/* ZIP — standard + forensic uniquement */}
                      {activeScan?.scan_type !== "quick" && (
                        <Button onClick={() => handleDownloadForensics()} variant="outline"
                          className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 bg-transparent flex-col h-auto py-3">
                          <FolderArchive className="h-5 w-5 mb-1" />
                          <span className="text-xs">{activeScan?.scan_type === "forensic" ? "Bundle ZIP" : "ZIP"}</span>
                          <span className="text-[10px] text-slate-500">Archive</span>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <Button onClick={handleCloseActiveScan} variant="outline" size="sm"
                    className="border-slate-500 text-slate-200 hover:bg-slate-700 hover:text-white bg-transparent">
                    Fermer
                  </Button>
                  {isActiveScanCompleted && (
                    <Link href={`/report/${activeScan.id}`}>
                      <Button size="sm" className="btn-cta">
                        Voir le rapport complet
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>

                {isActiveScanFailed && (
                  <div className="text-center py-4">
                    {activeScan?.current_phase?.includes("Serveur redémarré") ? (
                      <>
                        <div className="flex items-center justify-center gap-2 text-amber-400 mb-2">
                          <AlertCircle className="h-5 w-5" />
                          <span className="font-medium">Scan interrompu par un redémarrage serveur</span>
                        </div>
                        <p className="text-slate-400 text-sm mb-4">
                          Le serveur a redémarré pendant l'analyse (déploiement). Relancez le scan pour obtenir vos résultats.
                        </p>
                        <Button
                          onClick={() => activeScan && handleRelaunchScan(activeScan)}
                          className="btn-cta"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Relancer le scan
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-slate-400 mb-3">
                          {activeScan?.current_phase && activeScan.current_phase !== "Échec"
                            ? activeScan.current_phase
                            : "Le scan a échoué. Cela peut être dû à un blocage WAF ou une protection anti-bot."}
                        </p>
                        <Button onClick={handleCloseActiveScan} variant="outline"
                          className="border-slate-500 text-slate-200 hover:bg-slate-700 hover:text-white bg-transparent">
                          Fermer
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Historique des scans ── */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-slate-100 flex items-center text-lg">
                <FileText className="mr-3 h-5 w-5 text-cyan-500" />
                Historique des scans
                {scans.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-slate-500">({scans.length})</span>
                )}
              </CardTitle>

              <div className="flex items-center gap-3">
                {scans.length > 0 && (
                  <>
                    <Button size="sm" variant="outline"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={selectedScans.size === 0}
                      className={selectedScans.size > 0
                        ? "border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
                        : "border-slate-700/50 text-slate-500 bg-transparent cursor-not-allowed"}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer ({selectedScans.size})
                    </Button>

                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500 h-9"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardHeader>

          {/* Modal confirmation suppression */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
              <Card className="bg-slate-900 border-red-500/50 max-w-md mx-4">
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center">
                    <AlertCircle className="mr-2 h-5 w-5 text-red-400" />
                    Confirmer la suppression
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-300">
                    Êtes-vous sûr de vouloir supprimer {selectedScans.size} scan{selectedScans.size > 1 ? "s" : ""} ?
                  </p>
                  <p className="text-sm text-slate-500">
                    Cette action est irréversible. Les rapports associés seront également supprimés.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}
                      className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent">
                      Annuler
                    </Button>
                    <Button onClick={handleDeleteSelected} disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700 text-white">
                      {isDeleting ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" />Suppression...</>
                      ) : (
                        <><Trash2 className="h-4 w-4 mr-2" />Supprimer</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <CardContent>
            {scansLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
              </div>
            ) : filteredScans.length > 0 ? (
              <div className="space-y-3">
                {/* Select all */}
                <div className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400">
                  <button onClick={handleSelectAll}
                    className="flex items-center gap-2 hover:text-slate-200 transition-colors">
                    {selectedScans.size === filteredScans.length && filteredScans.length > 0 ? (
                      <CheckSquare className="h-4 w-4 text-cyan-400" />
                    ) : selectedScans.size > 0 ? (
                      <div className="h-4 w-4 border border-cyan-400 rounded flex items-center justify-center">
                        <div className="h-2 w-2 bg-cyan-400 rounded-sm" />
                      </div>
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                    {selectedScans.size === filteredScans.length && filteredScans.length > 0
                      ? "Tout désélectionner" : "Tout sélectionner"}
                  </button>
                  {selectedScans.size > 0 && (
                    <span className="text-cyan-400">
                      ({selectedScans.size} sélectionné{selectedScans.size > 1 ? "s" : ""})
                    </span>
                  )}
                </div>

                {filteredScans.map((scan) => (
                  <div key={scan.id} className="space-y-2">
                    <div className={`flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border transition-colors ${
                      selectedScans.has(scan.id)
                        ? "border-cyan-500/50 bg-cyan-500/5"
                        : expandedDownloadId === scan.id
                          ? "border-green-500/50 bg-green-500/5"
                          : "border-slate-700/50 hover:border-slate-600/50"
                    }`}>
                      <button onClick={() => handleToggleSelect(scan.id)} className="mr-3 flex-shrink-0">
                        {selectedScans.has(scan.id)
                          ? <CheckSquare className="h-5 w-5 text-cyan-400" />
                          : <Square className="h-5 w-5 text-slate-500 hover:text-slate-300" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-slate-200 font-medium truncate">{extractDomain(scan.target_url)}</h3>
                          {getRiskBadge(scan.risk_level, scan.status)}
                          {scan.scan_type && scan.scan_type !== "hybrid" && (
                            <Badge className="bg-slate-700/50 text-slate-400 border-slate-600/50 text-[10px]">
                              {scan.scan_type === "quick" ? "Rapide" : scan.scan_type === "forensic" ? "Forensique" : "Standard"}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{formatDate(scan.created_at)}</span>
                          {scan.status === "running" && scan.progress > 0 && (
                            <><span>•</span><span className="text-cyan-400">{scan.progress}%</span></>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {/* Consulter */}
                        {scan.status === "completed" ? (
                          <Link href={`/report/${scan.id}`}>
                            <Button size="sm" className="btn-cta">
                              <FileText className="h-4 w-4 mr-2" />Consulter
                            </Button>
                          </Link>
                        ) : (
                          <Button size="sm" variant="outline" disabled
                            className="border-slate-700/50 text-slate-500 bg-transparent cursor-not-allowed">
                            <FileText className="h-4 w-4 mr-2" />Consulter
                          </Button>
                        )}

                        {/* Suivre / Télécharger */}
                        {(scan.status === "running" || scan.status === "pending") ? (
                          <Button size="sm" variant="outline"
                            onClick={() => {
                              setActiveScanId(scan.id)
                              setActiveScanLogs(scan.scan_logs || [])
                              setShowActiveScan(true)
                              window.scrollTo({ top: 0, behavior: "smooth" })
                            }}
                            className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent">
                            <ExternalLink className="h-4 w-4 mr-2" />Suivre
                          </Button>
                        ) : scan.status === "completed" ? (
                          <Button size="sm" variant="outline"
                            onClick={() => setExpandedDownloadId(expandedDownloadId === scan.id ? null : scan.id)}
                            className={expandedDownloadId === scan.id
                              ? "border-green-500 text-green-400 bg-green-500/10"
                              : "border-green-500/50 text-green-400 hover:bg-green-500/10 bg-transparent"}>
                            <Download className="h-4 w-4 mr-2" />Télécharger
                            {expandedDownloadId === scan.id
                              ? <ChevronUp className="h-3 w-3 ml-1" />
                              : <ChevronDown className="h-3 w-3 ml-1" />}
                          </Button>
                        ) : scan.status === "failed" && scan.current_phase?.includes("Serveur redémarré") ? (
                          <Button size="sm" variant="outline"
                            onClick={() => handleRelaunchScan(scan)}
                            className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 bg-transparent">
                            <RotateCcw className="h-4 w-4 mr-2" />Relancer
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled
                            className="border-slate-700/50 text-slate-500 bg-transparent cursor-not-allowed">
                            <Download className="h-4 w-4 mr-2" />Télécharger
                          </Button>
                        )}

                        {/* Annuler */}
                        <Button size="sm" variant="outline"
                          onClick={() => {
                            if (scan.status === "running" || scan.status === "pending")
                              handleCancelScan(scan.id)
                          }}
                          disabled={!(scan.status === "running" || scan.status === "pending") || cancellingId === scan.id}
                          className={
                            cancellingId === scan.id
                              ? "border-slate-500/50 text-slate-500 bg-transparent cursor-not-allowed"
                              : (scan.status === "running" || scan.status === "pending")
                                ? "border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
                                : "border-slate-700/50 text-slate-500 bg-transparent cursor-not-allowed"
                          }>
                          {cancellingId === scan.id
                            ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            : <StopCircle className="h-4 w-4 mr-2" />}
                          Annuler
                        </Button>
                      </div>
                    </div>

                    {/* Zone téléchargements dépliable */}
                    {expandedDownloadId === scan.id && scan.status === "completed" && (
                      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 rounded-lg border border-green-500/30 ml-8">
                        {/* JSON — tous les types */}
                        <Button size="sm" variant="outline"
                          onClick={() => handleDownloadJson(scan.id, scan.target_url)}
                          className="border-green-500/50 text-green-400 hover:bg-green-500/10 bg-transparent">
                          <FileJson className="h-4 w-4 mr-1" />JSON
                        </Button>
                        {/* HTML — tous les types */}
                        <Button size="sm" variant="outline"
                          onClick={() => handleDownloadHtml(scan.id)}
                          className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent">
                          <FileCode className="h-4 w-4 mr-1" />{scan.scan_type === "forensic" ? "Forensique" : scan.scan_type === "standard" ? "Standard" : "Flash"}
                        </Button>
                        {/* PDF — standard + forensic uniquement */}
                        {scan.scan_type !== "quick" && (
                          <Button size="sm" variant="outline"
                            disabled={downloadingPdfScanId === scan.id}
                            onClick={() => handleDownloadPdf(scan.id, scan.target_url)}
                            className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 bg-transparent disabled:opacity-50">
                            {downloadingPdfScanId === scan.id
                              ? <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              : <FileDown className="h-4 w-4 mr-1" />}
                            PDF
                          </Button>
                        )}
                        {/* ZIP — standard + forensic uniquement */}
                        {scan.scan_type !== "quick" && (
                          <Button size="sm" variant="outline"
                            onClick={() => handleDownloadForensics(scan.id)}
                            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 bg-transparent">
                            <FolderArchive className="h-4 w-4 mr-1" />
                            {scan.scan_type === "forensic" ? "Bundle ZIP" : "ZIP"}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Globe className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">
                  {searchQuery ? "Aucun scan trouvé" : "Aucun scan pour le moment"}
                </p>
                <p className="text-sm text-slate-500">
                  {searchQuery
                    ? "Essayez une autre recherche"
                    : "Remplissez le formulaire ci-dessus pour lancer votre première analyse"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
