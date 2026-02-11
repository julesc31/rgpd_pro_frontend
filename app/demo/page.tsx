import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { ArrowRight, ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PublicHeader />

      <main className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Exemple de rapport
          </h1>
          <p className="text-slate-400 text-lg">
            Voici à quoi ressemble un rapport RGPD_PRO. Ce scan a été réalisé sur 
            un site e-commerce réel (anonymisé).
          </p>
        </div>

        {/* Résumé du scan exemple */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/30">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h2 className="font-bold">Site e-commerce — Secteur retail</h2>
                <p className="text-sm text-slate-500">Scan réalisé le 15 janvier 2025</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-red-400">12</div>
                <div className="text-sm text-slate-500">violations détectées</div>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-amber-400">€50K - €200K</div>
                <div className="text-sm text-slate-500">risque estimé</div>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-slate-300">58s</div>
                <div className="text-sm text-slate-500">durée du scan</div>
              </div>
            </div>

            <h3 className="font-medium mb-3">Principales violations :</h3>
            <ul className="space-y-2 mb-6">
              <ViolationItem severity="high">
                Google Analytics chargé avant consentement
              </ViolationItem>
              <ViolationItem severity="high">
                Facebook Pixel déclenché au chargement de la page
              </ViolationItem>
              <ViolationItem severity="medium">
                Canvas fingerprinting détecté (script tiers)
              </ViolationItem>
              <ViolationItem severity="medium">
                Cookies publicitaires avec durée de 2 ans
              </ViolationItem>
              <ViolationItem severity="low">
                Bandeau cookies sans option de refus claire
              </ViolationItem>
            </ul>

            <div className="border-t border-slate-800 pt-6">
              <h3 className="font-medium mb-3">Ce qui était conforme :</h3>
              <ul className="space-y-2">
                <ConformItem>Bandeau de consentement présent</ConformItem>
                <ConformItem>Politique de confidentialité accessible</ConformItem>
                <ConformItem>HTTPS actif sur tout le site</ConformItem>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-xl mx-auto text-center">
          <p className="text-slate-400 mb-6">
            Vous voulez voir ce que ça donne sur votre site ?
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="btn-cta">
              Scanner mon site gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-slate-500 mt-4">
            2 scans gratuits. Sans carte bancaire.
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

function ViolationItem({ 
  severity, 
  children 
}: { 
  severity: "high" | "medium" | "low"
  children: React.ReactNode 
}) {
  const colors = {
    high: "text-red-400 bg-red-500/10 border-red-500/30",
    medium: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    low: "text-blue-400 bg-blue-500/10 border-blue-500/30"
  }
  const labels = {
    high: "Élevé",
    medium: "Moyen",
    low: "Faible"
  }
  
  return (
    <li className="flex items-center gap-3 text-sm">
      <span className={`px-2 py-0.5 rounded text-xs border ${colors[severity]}`}>
        {labels[severity]}
      </span>
      <span className="text-slate-300">{children}</span>
    </li>
  )
}

function ConformItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-sm text-slate-400">
      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      {children}
    </li>
  )
}
