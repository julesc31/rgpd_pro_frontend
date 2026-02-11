"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Beaker } from "lucide-react"

const STORAGE_KEY = (scanId: string) => `beta-feedback-seen-${scanId}`
const DELAY_MS = 6000

export type FeedbackContext = {
  scanId: string
  status: "completed" | "failed"
  targetUrl: string
  riskLevel?: string
  violationsCount?: number
  errorMessage?: string
}

export function BetaFeedbackQuestionnaire({ context }: { context: FeedbackContext }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const { scanId, status, targetUrl, riskLevel, violationsCount = 0, errorMessage } = context

  const hasViolations = status === "completed" && (violationsCount > 0 || ["CRITICAL", "HIGH", "MEDIUM"].includes(riskLevel || ""))
  const isFailed = status === "failed"

  useEffect(() => {
    if (typeof window === "undefined") return
    if (localStorage.getItem(STORAGE_KEY(scanId))) return

    const timer = setTimeout(() => setOpen(true), DELAY_MS)
    return () => clearTimeout(timer)
  }, [scanId])

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY(scanId), "skipped")
    setOpen(false)
  }

  const handleSubmit = () => {
    let domain = "?"
    try {
      if (targetUrl && (targetUrl.startsWith("http://") || targetUrl.startsWith("https://"))) {
        domain = new URL(targetUrl).hostname.replace("www.", "")
      }
    } catch {
      // ignore
    }
    const lines = [
      `[Feedback Beta RGPD_PRO]`,
      `Scan: ${scanId}`,
      `URL: ${targetUrl}`,
      `Statut: ${status}`,
      `Risque: ${riskLevel || "N/A"}`,
      `Violations: ${violationsCount ?? "N/A"}`,
      ...(errorMessage ? [`Erreur: ${errorMessage}`] : []),
      ``,
      `--- Réponses ---`,
      ...Object.entries(answers).map(([k, v]) => `${k}: ${v}`),
      ``,
      `Commentaire libre:`,
    ]

    const body = encodeURIComponent(lines.join("\n"))
    window.open(`mailto:contact@rgpd.pro?subject=Feedback%20Beta%20-%20${encodeURIComponent(domain)}&body=${body}`, "_blank")
    localStorage.setItem(STORAGE_KEY(scanId), "submitted")
    setOpen(false)
  }

  const setAnswer = (key: string, value: string) => {
    setAnswers((a) => ({ ...a, [key]: value }))
    setStep((s) => s + 1)
  }

  const questions = isFailed
    ? [
        { key: "type_site", label: "Quel type de site analysiez-vous ?", options: ["E-commerce", "Blog / CMS", "Site vitrine", "SaaS / App", "Autre"] },
        { key: "cause", label: "Avez-vous une idée de la cause ?", options: ["Blocage WAF / anti-bot", "Timeout / lenteur", "Erreur technique", "Je ne sais pas"] },
        { key: "repro", label: "Souhaitez-vous qu'on vous recontacte pour reproduire ?", options: ["Oui", "Non"] },
      ]
    : hasViolations
      ? [
          { key: "pertinence", label: "Les violations détectées vous semblent-elles pertinentes ?", options: ["Oui, très", "En partie", "Non, faux positifs", "Difficile à dire"] },
          { key: "clarte", label: "Le rapport est-il clair et actionnable ?", options: ["Oui", "Assez", "Non, à améliorer"] },
          { key: "estimation", label: "L'estimation d'amende vous paraît-elle réaliste ?", options: ["Oui", "Plutôt haute", "Plutôt basse", "Sans avis"] },
        ]
      : [
          { key: "attendu", label: "Étiez-vous surpris par l'absence de violations ?", options: ["Non, le site est connu conforme", "Oui, j'attendais des problèmes", "Sans avis"] },
          { key: "type_site", label: "Quel type de site ?", options: ["E-commerce", "Blog / CMS", "Site vitrine", "SaaS / App", "Autre"] },
        ]

  const currentQ = questions[step]

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleSkip()}>
      <DialogContent
        className="max-w-md border-slate-700 bg-slate-900 text-slate-100"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cyan-400">
            <Beaker className="h-5 w-5" />
            Aidez-nous à améliorer RGPD_PRO (Beta)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {!currentQ ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Merci ! Cliquez sur Envoyer pour ouvrir votre messagerie — le message sera pré-rempli.
              </p>
              <div className="flex gap-3">
                <Button onClick={handleSubmit} className="btn-cta">
                  Envoyer à contact@rgpd.pro
                </Button>
                <Button variant="ghost" onClick={handleSkip} className="text-slate-500">
                  Passer
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-slate-300 font-medium">{currentQ.label}</p>
              <div className="flex flex-wrap gap-2">
                {currentQ.options.map((opt) => (
                  <Button
                    key={opt}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                    onClick={() => setAnswer(currentQ.key, opt)}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {step + 1} / {questions.length}
              </p>
              <Button variant="ghost" size="sm" onClick={handleSkip} className="text-slate-500">
                Passer ce questionnaire
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
