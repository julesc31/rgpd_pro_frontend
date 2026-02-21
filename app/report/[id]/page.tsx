"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useSubscription } from "@/hooks/use-subscription"
import { apiGetScanById } from "@/lib/api"

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
  const [errorType, setErrorType] = useState<"not_found" | "no_html" | null>(null)
  
  // Subscription info (pas de restrictions pour le moment - mode test)
  const subscription = useSubscription()
  const { data: session } = useSession()

  useEffect(() => {
    if (subscription.isLoading || !session?.backendToken) return
    const fetchReport = async () => {
      try {
        // Essaie GET /scan/{id} d'abord, fallback GET /scans (voir lib/api.ts)
        const scan = await apiGetScanById<ScanData>(params.id as string, session.backendToken)
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
