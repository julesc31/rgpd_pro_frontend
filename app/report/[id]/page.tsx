"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, FileJson, FileDown, Package, FileText } from "lucide-react"
import { useSubscription, getPlanDisplayName } from "@/hooks/use-subscription"
import { apiGetScanById } from "@/lib/api"
import Link from "next/link"

type ScanData = {
  id: string
  target_url: string
  report_html?: string
  storage_path?: string
  scan_data?: Record<string, unknown>
  status: string
  scan_type?: string
}

export default function ReportViewerPage() {
  const params = useParams()
  const router = useRouter()
  const [reportHtml, setReportHtml] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [downloadingZip, setDownloadingZip] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [scanData, setScanData] = useState<ScanData | null>(null)
  const [errorType, setErrorType] = useState<"not_found" | "no_html" | null>(null)
  
  // Subscription info (pas de restrictions pour le moment - mode test)
  const subscription = useSubscription()
  const canDownload = true // Tous les téléchargements disponibles en mode test

  const { data: session } = useSession()

  useEffect(() => {
    if (subscription.isLoading || !session?.backendToken) return
    const fetchReport = async () => {
      try {
        // Essaie GET /scan/{id} d'abord, fallback GET /scans (voir lib/api.ts)
        const scan = await apiGetScanById<ScanData>(params.id as string, session.backendToken)
        setScanData(scan)
        console.debug("[Report] scan reçu:", {
          id: scan.id, status: scan.status,
          has_report_html: !!scan.report_html,
          has_scan_data: !!scan.scan_data,
          storage_path: scan.storage_path,
        })
        if (scan.report_html) {
          setReportHtml(scan.report_html)
        } else {
          setErrorType("no_html")
        }
      } catch (error) {
        console.error("[Report] Scan introuvable:", error)
        setErrorType("not_found")
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [params.id, router, subscription.isLoading, session?.backendToken])

  const getDomain = () => {
    if (!scanData?.target_url) return "rapport"
    try {
      return new URL(scanData.target_url).hostname.replace("www.", "")
    } catch {
      return "rapport"
    }
  }

  const handleDownloadHTML = () => {
    if (!canDownload || !reportHtml) return
    const blob = new Blob([reportHtml], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `rgpd-report-${getDomain()}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadJSON = () => {
    if (!canDownload || !scanData?.scan_data) return
    const blob = new Blob([JSON.stringify(scanData.scan_data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `rgpd-data-${getDomain()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadPDF = async () => {
    if (!canDownload) return
    setDownloadingPdf(true)
    try {
      if (scanData?.report_pdf_path) {
        const res = await fetch(`/api/r2/download?key=${encodeURIComponent(scanData.report_pdf_path)}`)
        if (!res.ok) { alert("Erreur lors du téléchargement du PDF"); return }
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `rapport-rgpd-${getDomain()}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        return
      }
      if (!scanData?.scan_data) {
        alert("Données du rapport non disponibles pour le PDF")
        return
      }
      const res = await fetch("/api/scan/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scanData.scan_data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { detail?: string }).detail || `Erreur ${res.status}`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `rapport-rgpd-${getDomain()}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("PDF download error:", error)
      alert(error instanceof Error ? error.message : "Erreur lors du téléchargement du PDF")
    } finally {
      setDownloadingPdf(false)
    }
  }

  const handleDownloadZIP = async () => {
    if (!canDownload || !scanData?.storage_path) return
    setDownloadingZip(true)
    try {
      const res = await fetch(`/api/r2/download?key=${encodeURIComponent(scanData.storage_path)}`)
      if (!res.ok) throw new Error("Téléchargement impossible")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `rgpd-package-${getDomain()}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading ZIP:", error)
      alert("Erreur lors du téléchargement du package")
    } finally {
      setDownloadingZip(false)
    }
  }

  if (loading || subscription.isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Chargement du rapport...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
      {/* Fixed Header with Controls */}
      <div className="h-14 flex-shrink-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/scan")}
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <div className="flex gap-2 items-center">
            {/* JSON — tous les types */}
            <Button
              onClick={handleDownloadJSON}
              variant="outline"
              disabled={!scanData?.scan_data}
              title="Télécharger le JSON"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent disabled:opacity-50"
            >
              <FileJson className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">JSON</span>
            </Button>

            {/* HTML — tous les types */}
            <Button
              onClick={handleDownloadHTML}
              variant="outline"
              disabled={!reportHtml}
              title="Télécharger le HTML"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent disabled:opacity-50"
            >
              <FileText className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">HTML</span>
            </Button>

            {/* PDF — standard + forensic uniquement */}
            {scanData?.scan_type !== "quick" && (
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                disabled={(!scanData?.scan_data && !scanData?.report_pdf_path) || downloadingPdf}
                title="Télécharger le PDF"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent disabled:opacity-50"
              >
                {downloadingPdf ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-300 mr-2" />
                    <span className="hidden sm:inline">PDF...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">PDF</span>
                  </>
                )}
              </Button>
            )}

            {/* ZIP — standard + forensic uniquement */}
            {scanData?.scan_type !== "quick" && (
              <Button
                onClick={handleDownloadZIP}
                disabled={!scanData?.storage_path || downloadingZip}
                title={!scanData?.storage_path ? "Package non disponible" : "Télécharger le package complet"}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white disabled:opacity-50"
              >
                {downloadingZip ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span className="hidden sm:inline">Téléchargement...</span>
                  </>
                ) : (
                  <>
                    <Package className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">
                      {scanData?.scan_type === "forensic" ? "Bundle complet" : "ZIP"}
                    </span>
                    <Download className="ml-1 h-3 w-3 sm:hidden" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>


      {/* Full-screen Report Viewer */}
      <div className="flex-1 min-h-0">
        {reportHtml ? (
          <iframe
            srcDoc={reportHtml}
            className="w-full h-full border-0"
            title="Rapport RGPD"
            sandbox="allow-same-origin allow-scripts"
            style={{ height: "100%" }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">📄</div>
              {errorType === "not_found" ? (
                <>
                  <h2 className="text-2xl font-bold text-white mb-2">Scan introuvable</h2>
                  <p className="text-slate-400 mb-2">
                    Ce scan n&apos;existe pas ou n&apos;est plus disponible.
                  </p>
                  <p className="text-slate-500 text-sm mb-6">
                    ID : <code className="text-cyan-400">{params.id as string}</code>
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-2">Rapport HTML non disponible</h2>
                  <p className="text-slate-400 mb-2">
                    Le scan a été trouvé mais le rapport HTML n&apos;a pas été retourné par le backend.
                  </p>
                  <p className="text-slate-500 text-sm mb-6">
                    Vérifiez que <code className="text-cyan-400">GET /scan/{'{id}'}</code> ou{" "}
                    <code className="text-cyan-400">GET /scans</code> retourne le champ{" "}
                    <code className="text-cyan-400">report_html</code> pour les scans completed.
                  </p>
                </>
              )}
              <Button
                onClick={() => router.push("/scan")}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                Retour aux scans
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
