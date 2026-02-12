"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScanTerminal } from "@/components/scan-terminal"
import { useSubscription, getPlanDisplayName, getPlanColor } from "@/hooks/use-subscription"
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
  Zap
} from "lucide-react"
import Link from "next/link"

// ============================================================================
// CONFIGURATION (from scanner_config.py)
// ============================================================================

const SECTORS = [
  { key: "accommodation_hospitality", label: "Hôtellerie & Restauration", description: "Hôtellerie, restauration, tourisme" },
  { key: "employment", label: "Ressources Humaines", description: "Ressources humaines, recrutement" },
  { key: "finance_insurance", label: "Finance & Assurance", description: "Banque, assurance, conseil" },
  { key: "healthcare", label: "Santé", description: "Santé, médical, pharmaceutique" },
  { key: "individuals_associations", label: "Associations", description: "Particuliers et associations privées" },
  { key: "industry_commerce", label: "Industrie & Commerce", description: "Industrie, e-commerce, retail" },
  { key: "media_telecoms", label: "Médias & Télécoms", description: "Médias, télécommunications, diffusion" },
  { key: "public_education", label: "Secteur Public & Éducation", description: "Secteur public, éducation, gouvernement" },
  { key: "real_estate", label: "Immobilier", description: "Immobilier, gestion locative" },
  { key: "transportation_energy", label: "Transport & Énergie", description: "Transport, énergie, utilities" },
  { key: "technology", label: "Technologie", description: "Technologie, software, SaaS" },
  { key: "other", label: "Autre", description: "Autre secteur non spécifié" },
]

const REVENUE_BRACKETS = [
  { key: "SMALL", label: "< 1 Milliard €", description: "PME et ETI" },
  { key: "MEDIUM", label: "1 à 10 Milliards €", description: "Grandes entreprises" },
  { key: "LARGE", label: "> 10 Milliards €", description: "Très grandes entreprises / GAFA" },
]

const EMPLOYEE_BRACKETS = [
  { key: "SMALL", label: "< 1 000 employés", description: "Petites et moyennes entreprises", value: 500 },
  { key: "MEDIUM", label: "1 000 à 10 000 employés", description: "Grandes entreprises", value: 5000 },
  { key: "LARGE", label: "> 10 000 employés", description: "Très grandes entreprises", value: 50000 },
]

// Helper to get numeric values for API
const getRevenueValue = (bracket: string): number => {
  switch (bracket) {
    case "SMALL": return 500_000_000 // 500M€
    case "MEDIUM": return 5_000_000_000 // 5Md€
    case "LARGE": return 50_000_000_000 // 50Md€
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
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function ScanPage() {
  const [userEmail, setUserEmail] = useState("")
  const [targetUrl, setTargetUrl] = useState("https://")
  const [sector, setSector] = useState("")
  const [revenueBracket, setRevenueBracket] = useState("")
  const [employeeBracket, setEmployeeBracket] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scans, setScans] = useState<Scan[]>([])
  const [scansLoading, setScansLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [selectedScans, setSelectedScans] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  // Active scan tracking (for inline progress display)
  const [activeScanId, setActiveScanId] = useState<string | null>(null)
  const [activeScanLogs, setActiveScanLogs] = useState<LogEntry[]>([])
  const [showActiveScan, setShowActiveScan] = useState(false)
  // Download panel toggle for history items
  const [expandedDownloadId, setExpandedDownloadId] = useState<string | null>(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [downloadingPdfScanId, setDownloadingPdfScanId] = useState<string | null>(null)
  const router = useRouter()
  
  // Subscription management
  const subscription = useSubscription()

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUserEmail(user.email || "")

      // Fetch all scans
      const { data: scansData } = await supabase
        .from("scans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (scansData) {
        setScans(scansData)
      }
      setScansLoading(false)
    }

    fetchData()
  }, [router])

  // Poll for running scans (but not during deletion)
  useEffect(() => {
    const hasRunningScans = scans.some(s => s.status === "running" || s.status === "pending")
    if (!hasRunningScans) return

    const interval = setInterval(async () => {
      // Don't poll while deleting - this prevents deleted scans from reappearing
      if (isDeleting || showDeleteConfirm) return

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: scansData } = await supabase
        .from("scans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (scansData) {
        // Check if any scan just completed to refresh subscription counter
        const previousScans = scans
        const newlyCompleted = scansData.some(newScan => {
          const oldScan = previousScans.find(s => s.id === newScan.id)
          return oldScan && oldScan.status !== 'completed' && newScan.status === 'completed'
        })
        if (newlyCompleted) {
          subscription.refresh()
        }
        
        setScans(scansData)

        // Update active scan logs if we have an active scan
        if (activeScanId) {
          const activeScan = scansData.find(s => s.id === activeScanId)
          if (activeScan?.scan_logs && Array.isArray(activeScan.scan_logs)) {
            setActiveScanLogs(activeScan.scan_logs)
          }
        }
      }
    }, 2000) // Poll every 2 seconds for smoother updates

    return () => clearInterval(interval)
  }, [scans, isDeleting, showDeleteConfirm, activeScanId])

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Non authentifié")
      }

      // Validate URL
      let urlToScan = targetUrl.trim()
      if (!urlToScan.startsWith("http://") && !urlToScan.startsWith("https://")) {
        urlToScan = "https://" + urlToScan
      }

      try {
        new URL(urlToScan)
      } catch {
        throw new Error("URL invalide")
      }

      // Validate required fields
      if (!sector) {
        throw new Error("Veuillez sélectionner un secteur d'activité")
      }
      if (!revenueBracket) {
        throw new Error("Veuillez sélectionner une fourchette de chiffre d'affaires")
      }
      if (!employeeBracket) {
        throw new Error("Veuillez sélectionner une fourchette d'employés")
      }

      // Pas de limite pour le moment - test grandeur nature

      // Create scan record with company info in Supabase
      const { data: scan, error: scanError } = await supabase
        .from("scans")
        .insert({
          user_id: user.id,
          target_url: urlToScan,
          scan_type: "hybrid",
          status: "pending",
          progress: 0,
          company_sector: sector,
          company_revenue_bracket: revenueBracket,
          company_employee_bracket: employeeBracket,
        })
        .select()
        .single()

      if (scanError) throw scanError

      // Add to local state immediately and activate tracking
      setScans(prev => [scan, ...prev])
      setActiveScanId(scan.id)
      setActiveScanLogs([])
      setShowActiveScan(true)
      setTargetUrl("https://")

      // Trigger backend scan via API with Supabase scan ID for progress updates
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: urlToScan,
          company_info: {
            name: new URL(urlToScan).hostname.replace("www.", ""),
            revenue: getRevenueValue(revenueBracket),
            employee_count: getEmployeeValue(employeeBracket),
            sector: sector,
          },
          scan_mode: "hybrid",
          supabase_scan_id: scan.id,  // Pass Supabase ID for real-time progress updates
          user_id: user.id,  // Pass user ID for storage organization
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Erreur serveur: ${response.status}`)
      }

      const apiResult = await response.json()

      // Update Supabase record with backend scan_id for tracking
      await supabase
        .from("scans")
        .update({
          status: "running",
          progress: 5,
        })
        .eq("id", scan.id)

    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredScans = scans.filter(scan =>
    scan.target_url.toLowerCase().includes(searchQuery.toLowerCase())
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
      case "CRITICAL":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
            🔴 Critique
          </Badge>
        )
      case "HIGH":
        return (
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">
            🟠 Élevé
          </Badge>
        )
      case "MEDIUM":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
            🟡 Moyen
          </Badge>
        )
      case "LOW":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
            🟢 Faible
          </Badge>
        )
      default:
        return (
          <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/50">
            <CheckCircle className="h-3 w-3 mr-1" />
            Terminé
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname
    } catch {
      return url
    }
  }

  const handleToggleSelect = (scanId: string) => {
    setSelectedScans(prev => {
      const newSet = new Set(prev)
      if (newSet.has(scanId)) {
        newSet.delete(scanId)
      } else {
        newSet.add(scanId)
      }
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
    if (selectedScans.size === 0) return

    setIsDeleting(true)
    const idsToDelete = Array.from(selectedScans)

    try {
      const supabase = createClient()

      // Supprimer tous les scans sélectionnés
      const { error, count } = await supabase
        .from("scans")
        .delete()
        .in("id", idsToDelete)
        .select()

      if (error) {
        console.error("Supabase delete error:", error)
        alert(`Erreur de suppression: ${error.message}`)
        throw error
      }

      console.log(`Deleted ${idsToDelete.length} scans from Supabase`)

      // Update local state IMMEDIATELY to prevent polling from restoring them
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
    setCancellingId(scanId)
    try {
      const supabase = createClient()
      await supabase
        .from("scans")
        .update({
          status: "failed",
          current_phase: "Annulé par l'utilisateur",
          completed_at: new Date().toISOString(),
        })
        .eq("id", scanId)

      // Small delay to show the cancelling state
      await new Promise(resolve => setTimeout(resolve, 500))

      // Update local state
      setScans(prev => prev.map(s =>
        s.id === scanId
          ? { ...s, status: "failed" as const, completed_at: new Date().toISOString() }
          : s
      ))
    } catch (error) {
      console.error("Failed to cancel scan:", error)
    } finally {
      setCancellingId(null)
    }
  }

  const isFormValid = targetUrl.trim() !== "https://" && targetUrl.trim().length > 8 && sector && revenueBracket && employeeBracket

  // Get active scan data
  const activeScan = activeScanId ? scans.find(s => s.id === activeScanId) : null
  const isActiveScanRunning = activeScan?.status === "running" || activeScan?.status === "pending"
  const isActiveScanCompleted = activeScan?.status === "completed"
  const isActiveScanFailed = activeScan?.status === "failed"

  // Download handlers - récupère les données depuis Supabase directement
  const handleDownloadHtml = async () => {
    if (!activeScanId) return
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("scans")
        .select("report_html, target_url")
        .eq("id", activeScanId)
        .single()

      if (!data?.report_html) {
        setError("Rapport HTML non disponible")
        return
      }

      const blob = new Blob([data.report_html], { type: "text/html" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `rapport-rgpd-${extractDomain(data.target_url)}.html`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("HTML download error:", error)
      setError("Erreur lors du téléchargement HTML")
    }
  }

  const handleDownloadForensics = async () => {
    if (!activeScanId) return
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("scans")
        .select("storage_path")
        .eq("id", activeScanId)
        .single()

      if (!data?.storage_path) {
        setError("Archive forensics non disponible")
        return
      }

      // Télécharger depuis Supabase Storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("scan-results")
        .download(data.storage_path)

      if (downloadError || !fileData) {
        setError("Erreur lors du téléchargement de l'archive")
        return
      }

      const url = window.URL.createObjectURL(fileData)
      const a = document.createElement("a")
      a.href = url
      a.download = data.storage_path.split("/").pop() || "forensics.zip"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Forensics download error:", error)
      setError("Erreur lors du téléchargement forensics")
    }
  }

  const handleDownloadJson = async () => {
    if (!activeScanId || !activeScan) return
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("scans")
        .select("scan_data, target_url")
        .eq("id", activeScanId)
        .single()

      if (!data?.scan_data) {
        setError("Données JSON non disponibles")
        return
      }

      const blob = new Blob([JSON.stringify(data.scan_data, null, 2)], { type: "application/json" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `scan-data-${extractDomain(data.target_url)}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("JSON download error:", error)
      setError("Erreur lors du téléchargement JSON")
    }
  }

  const handleDownloadPdf = async () => {
    if (!activeScanId) return
    setDownloadingPdf(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("scans")
        .select("scan_data, target_url, report_pdf_path")
        .eq("id", activeScanId)
        .single()
      const domain = data?.target_url ? extractDomain(data.target_url) : "rapport"
      if (data?.report_pdf_path) {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from("scan-results")
          .download(data.report_pdf_path)
        if (downloadError || !fileData) {
          setError("Erreur lors du téléchargement du PDF")
          return
        }
        const url = window.URL.createObjectURL(fileData)
        const a = document.createElement("a")
        a.href = url
        a.download = `rapport-rgpd-${domain}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        return
      }
      if (!data?.scan_data) {
        setError("Données du rapport non disponibles pour le PDF")
        return
      }
      const res = await fetch("/api/scan/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.scan_data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { detail?: string }).detail || `Erreur ${res.status}`)
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `rapport-rgpd-${domain}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("PDF download error:", error)
      setError(error instanceof Error ? error.message : "Erreur lors du téléchargement du PDF")
    } finally {
      setDownloadingPdf(false)
    }
  }

  const downloadPdfForScan = async (scanId: string, targetUrl: string) => {
    setDownloadingPdfScanId(scanId)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("scans")
        .select("scan_data, report_pdf_path")
        .eq("id", scanId)
        .single()
      const domain = extractDomain(targetUrl)
      if (data?.report_pdf_path) {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from("scan-results")
          .download(data.report_pdf_path)
        if (downloadError || !fileData) {
          setError("Erreur lors du téléchargement du PDF")
          return
        }
        const url = window.URL.createObjectURL(fileData)
        const a = document.createElement("a")
        a.href = url
        a.download = `rapport-rgpd-${domain}.pdf`
        a.style.display = "none"
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }, 100)
        return
      }
      if (!data?.scan_data) {
        setError("Données du rapport non disponibles pour le PDF")
        return
      }
      const res = await fetch("/api/scan/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.scan_data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { detail?: string }).detail || `Erreur ${res.status}`)
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `rapport-rgpd-${domain}.pdf`
      a.style.display = "none"
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)
    } catch (error) {
      console.error("PDF download error:", error)
      setError(error instanceof Error ? error.message : "Erreur lors du téléchargement du PDF")
    } finally {
      setDownloadingPdfScanId(null)
    }
  }

  const handleCloseActiveScan = () => {
    setShowActiveScan(false)
    setActiveScanId(null)
    setActiveScanLogs([])
  }

  // Download handlers for history items (take scanId as param)
  const downloadHtmlForScan = async (scanId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from("scans")
      .select("report_html, target_url")
      .eq("id", scanId)
      .single()

    if (!data?.report_html) {
      setError("Rapport HTML non disponible")
      return
    }

    // Force download avec octet-stream
    const blob = new Blob([data.report_html], { type: "application/octet-stream" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `rapport-rgpd-${extractDomain(data.target_url)}.html`
    a.style.display = "none"
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }, 100)
  }

  const downloadForensicsForScan = async (scanId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from("scans")
      .select("storage_path")
      .eq("id", scanId)
      .single()

    if (!data?.storage_path) {
      setError("Archive forensics non disponible")
      return
    }

    const { data: fileData, error: downloadError } = await supabase.storage
      .from("scan-results")
      .download(data.storage_path)

    if (downloadError || !fileData) {
      setError("Erreur téléchargement archive")
      return
    }

    const url = window.URL.createObjectURL(fileData)
    const a = document.createElement("a")
    a.href = url
    a.download = data.storage_path.split("/").pop() || "forensics.zip"
    a.style.display = "none"
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }, 100)
  }

  const downloadJsonForScan = async (scanId: string, targetUrl: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from("scans")
      .select("scan_data")
      .eq("id", scanId)
      .single()

    if (!data?.scan_data) {
      setError("Données JSON non disponibles")
      return
    }

    const blob = new Blob([JSON.stringify(data.scan_data, null, 2)], { type: "application/octet-stream" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `scan-data-${extractDomain(targetUrl)}.json`
    a.style.display = "none"
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100">
      <div className="container mx-auto p-4 max-w-5xl">
        <DashboardNav userEmail={userEmail} />

        {/* Section: Nouveau Scan */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-100 flex items-center text-xl">
                <Globe className="mr-3 h-6 w-6 text-cyan-500" />
                Scanner un site
              </CardTitle>
              
              {/* Mode test - pas d'affichage de limite */}
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                  Mode test
                </Badge>
                <div className="text-sm text-slate-400">
                  Accès libre pour tester l&apos;outil
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStartScan} className="space-y-6" autoComplete="off">
              {/* URL Input */}
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
                      // Remove any protocol the user might paste
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

              {/* Company Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sector */}
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-cyan-500" />
                    Secteur d'activité
                  </Label>
                  <Select value={sector} onValueChange={setSector} disabled={isLoading}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-slate-100 h-11">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {SECTORS.map((s) => (
                        <SelectItem
                          key={s.key}
                          value={s.key}
                          className="text-slate-100 focus:bg-slate-700 focus:text-slate-100"
                        >
                          <div>
                            <div>{s.label}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Revenue */}
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Euro className="h-4 w-4 text-cyan-500" />
                    Chiffre d'affaires
                  </Label>
                  <Select value={revenueBracket} onValueChange={setRevenueBracket} disabled={isLoading}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-slate-100 h-11">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {REVENUE_BRACKETS.map((r) => (
                        <SelectItem
                          key={r.key}
                          value={r.key}
                          className="text-slate-100 focus:bg-slate-700 focus:text-slate-100"
                        >
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Employees */}
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Users className="h-4 w-4 text-cyan-500" />
                    Nombre d'employés
                  </Label>
                  <Select value={employeeBracket} onValueChange={setEmployeeBracket} disabled={isLoading}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-slate-100 h-11">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {EMPLOYEE_BRACKETS.map((e) => (
                        <SelectItem
                          key={e.key}
                          value={e.key}
                          className="text-slate-100 focus:bg-slate-700 focus:text-slate-100"
                        >
                          {e.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Envoyer Button */}
              <Button
                type="submit"
                className="btn-cta w-full h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Lancement de l'analyse...
                  </>
                ) : (
                  <>
                    Lancer l'analyse RGPD
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              {!showActiveScan && (
                <p className="text-xs text-slate-500 text-center">
                  Le scan analyse les cookies, trackers, fingerprinting et la conformité RGPD.
                  Les informations sur l'entreprise permettent d'estimer les risques d'amende.
                  Durée : 2-5 minutes.
                </p>
              )}
            </form>

            {/* Logs et résultats intégrés sous le formulaire */}
            {showActiveScan && activeScan && (
              <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-4">
                {/* Header avec statut */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isActiveScanRunning && <Loader2 className="h-5 w-5 text-cyan-500 animate-spin" />}
                    {isActiveScanCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {isActiveScanFailed && <XCircle className="h-5 w-5 text-red-500" />}
                    <span className="text-slate-200 font-medium">
                      {extractDomain(activeScan.target_url)}
                    </span>
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

                {/* Barre de progression */}
                {isActiveScanRunning && (
                  <div className="space-y-1">
                    <Progress value={activeScan.progress || 0} className="h-2" />
                    <p className="text-xs text-slate-500">{activeScan.current_phase || "Analyse en cours..."}</p>
                  </div>
                )}

                {/* Terminal de logs */}
                <ScanTerminal
                  logs={activeScanLogs}
                  isRunning={isActiveScanRunning}
                />

                {/* Bouton annuler (pendant le scan) */}
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

                {/* Téléchargements (scan terminé) */}
                {isActiveScanCompleted && (
                  <div className="space-y-4 pt-2">
                    {/* Mode test - tous les téléchargements disponibles */}
                    <>
                      <p className="text-sm text-slate-300 font-medium">Télécharger les résultats :</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Button
                          onClick={handleDownloadHtml}
                          variant="outline"
                          className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent flex-col h-auto py-3"
                        >
                          <FileCode className="h-5 w-5 mb-1" />
                          <span className="text-xs">Rapport HTML</span>
                          <span className="text-[10px] text-slate-500">Interactif</span>
                        </Button>
                        <Button
                          onClick={handleDownloadForensics}
                          variant="outline"
                          className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 bg-transparent flex-col h-auto py-3"
                        >
                          <FolderArchive className="h-5 w-5 mb-1" />
                          <span className="text-xs">Forensics</span>
                          <span className="text-[10px] text-slate-500">Preuves ZIP</span>
                        </Button>
                        <Button
                          onClick={handleDownloadJson}
                          variant="outline"
                          className="border-green-500/50 text-green-400 hover:bg-green-500/10 bg-transparent flex-col h-auto py-3"
                        >
                          <FileJson className="h-5 w-5 mb-1" />
                          <span className="text-xs">Données JSON</span>
                          <span className="text-[10px] text-slate-500">Brutes</span>
                        </Button>
                        <Button
                          onClick={handleDownloadPdf}
                          disabled={downloadingPdf}
                          variant="outline"
                          className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 bg-transparent flex-col h-auto py-3 disabled:opacity-50"
                        >
                          {downloadingPdf ? (
                            <Loader2 className="h-5 w-5 mb-1 animate-spin" />
                          ) : (
                            <FileDown className="h-5 w-5 mb-1" />
                          )}
                          <span className="text-xs">PDF</span>
                          <span className="text-[10px] text-slate-500">Rapport</span>
                        </Button>
                      </div>
                    </>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2">
                  <Button
                    onClick={handleCloseActiveScan}
                    variant="outline"
                    size="sm"
                    className="border-slate-500 text-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-600 bg-transparent"
                  >
                    Fermer
                  </Button>
                  {isActiveScanCompleted && (
                    <Link href={`/report/${activeScan.id}`}>
                      <Button
                        size="sm"
                        className="btn-cta"
                      >
                        Voir le rapport complet
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
                {/* État échoué */}
                {isActiveScanFailed && (
                  <div className="text-center py-4">
                    <p className="text-slate-400 mb-3">
                      {activeScan.current_phase && activeScan.current_phase !== "Échec"
                        ? activeScan.current_phase
                        : "Le scan a échoué. Cela peut être dû à un blocage WAF ou une protection anti-bot."}
                    </p>
                    <Button
                      onClick={handleCloseActiveScan}
                      variant="outline"
                      className="border-slate-500 text-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-600 bg-transparent"
                    >
                      Fermer
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section: Historique des Scans */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-slate-100 flex items-center text-lg">
                <FileText className="mr-3 h-5 w-5 text-cyan-500" />
                Historique des scans
                {scans.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    ({scans.length})
                  </span>
                )}
              </CardTitle>

              <div className="flex items-center gap-3">
                {scans.length > 0 && (
                  <>
                    {/* Bouton Supprimer - visible quand des scans sont sélectionnés */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={selectedScans.size === 0}
                      className={selectedScans.size > 0
                        ? "border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
                        : "border-slate-700/50 text-slate-500 bg-transparent cursor-not-allowed"
                      }
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer ({selectedScans.size})
                    </Button>

                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        placeholder="Search..."
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

          {/* Modal de confirmation de suppression */}
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
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                      className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleDeleteSelected}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Suppression...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </>
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
                {/* Header avec checkbox tout sélectionner */}
                <div className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 hover:text-slate-200 transition-colors"
                  >
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
                      ? "Tout désélectionner"
                      : "Tout sélectionner"
                    }
                  </button>
                  {selectedScans.size > 0 && (
                    <span className="text-cyan-400">
                      ({selectedScans.size} sélectionné{selectedScans.size > 1 ? "s" : ""})
                    </span>
                  )}
                </div>

                {filteredScans.map((scan) => (
                  <div key={scan.id} className="space-y-2">
                    <div
                      className={`flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border transition-colors ${
                        selectedScans.has(scan.id)
                          ? "border-cyan-500/50 bg-cyan-500/5"
                          : expandedDownloadId === scan.id
                            ? "border-green-500/50 bg-green-500/5"
                            : "border-slate-700/50 hover:border-slate-600/50"
                      }`}
                    >
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleSelect(scan.id)}
                      className="mr-3 flex-shrink-0"
                    >
                      {selectedScans.has(scan.id) ? (
                        <CheckSquare className="h-5 w-5 text-cyan-400" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-500 hover:text-slate-300" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-slate-200 font-medium truncate">
                          {extractDomain(scan.target_url)}
                        </h3>
                        {getRiskBadge(scan.risk_level, scan.status)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{formatDate(scan.created_at)}</span>
                        {scan.status === "running" && scan.progress > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-cyan-400">{scan.progress}%</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {/* Bouton Consulter - actif quand completed */}
                      {scan.status === "completed" ? (
                        <Link href={`/report/${scan.id}`}>
                          <Button
                            size="sm"
                            className="btn-cta"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Consulter
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="border-slate-700/50 text-slate-500 bg-transparent cursor-not-allowed"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Consulter
                        </Button>
                      )}

                      {/* Bouton Suivre/Télécharger selon le statut */}
                      {(scan.status === "running" || scan.status === "pending") ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault()
                            setActiveScanId(scan.id)
                            setActiveScanLogs(scan.scan_logs || [])
                            setShowActiveScan(true)
                            window.scrollTo({ top: 0, behavior: "smooth" })
                          }}
                          className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Suivre
                        </Button>
                      ) : scan.status === "completed" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault()
                            setExpandedDownloadId(expandedDownloadId === scan.id ? null : scan.id)
                          }}
                          className={expandedDownloadId === scan.id
                            ? "border-green-500 text-green-400 bg-green-500/10"
                            : "border-green-500/50 text-green-400 hover:bg-green-500/10 bg-transparent"
                          }
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                          {expandedDownloadId === scan.id ? (
                            <ChevronUp className="h-3 w-3 ml-1" />
                          ) : (
                            <ChevronDown className="h-3 w-3 ml-1" />
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="border-slate-700/50 text-slate-500 bg-transparent cursor-not-allowed"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      )}

                      {/* Bouton Annuler - actif quand running ou pending */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault()
                          if (scan.status === "running" || scan.status === "pending") {
                            handleCancelScan(scan.id)
                          }
                        }}
                        disabled={!(scan.status === "running" || scan.status === "pending") || cancellingId === scan.id}
                        className={
                          cancellingId === scan.id
                            ? "border-slate-500/50 text-slate-500 bg-transparent cursor-not-allowed"
                            : (scan.status === "running" || scan.status === "pending")
                              ? "border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
                              : "border-slate-700/50 text-slate-500 bg-transparent cursor-not-allowed"
                        }
                      >
                        {cancellingId === scan.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <StopCircle className="h-4 w-4 mr-2" />
                        )}
                        Annuler
                      </Button>
                    </div>
                    </div>

                    {/* Ligne dépliable avec boutons de téléchargement */}
                    {expandedDownloadId === scan.id && scan.status === "completed" && (
                      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 rounded-lg border border-green-500/30 ml-8">
                        {/* Mode test - tous les téléchargements disponibles */}
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadHtmlForScan(scan.id)}
                            className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
                          >
                            <FileCode className="h-4 w-4 mr-1" />
                            HTML
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadForensicsForScan(scan.id)}
                            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 bg-transparent"
                          >
                            <FolderArchive className="h-4 w-4 mr-1" />
                            Forensique
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadJsonForScan(scan.id, scan.target_url)}
                            className="border-green-500/50 text-green-400 hover:bg-green-500/10 bg-transparent"
                          >
                            <FileJson className="h-4 w-4 mr-1" />
                            JSON
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={downloadingPdfScanId === scan.id}
                            onClick={() => downloadPdfForScan(scan.id, scan.target_url)}
                            className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 bg-transparent disabled:opacity-50"
                          >
                            {downloadingPdfScanId === scan.id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <FileDown className="h-4 w-4 mr-1" />
                            )}
                            PDF
                          </Button>
                        </>
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
                    : "Remplissez le formulaire ci-dessus pour lancer votre première analyse"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
