import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { CheckCircle2, ArrowRight, Zap, Shield, Lock, X } from "lucide-react"

const PLANS = [
  {
    name: "Gratuit",
    price: "0 €",
    period: "/mois",
    description: "Pour découvrir l'outil et tester vos premiers sites.",
    badge: null,
    cta: "Commencer gratuitement",
    ctaHref: "/auth/register",
    ctaVariant: "outline" as const,
    features: [
      { text: "5 scans/mois", included: true },
      { text: "Scan Rapide & Standard", included: true },
      { text: "Rapport HTML interactif", included: true },
      { text: "Export JSON", included: true },
      { text: "Scan Forensique", included: false },
      { text: "Archive ZIP forensique", included: false },
      { text: "Export PDF", included: false },
      { text: "Support prioritaire", included: false },
    ],
  },
  {
    name: "Pro",
    price: "49 €",
    period: "/mois",
    description: "Pour les DPO, consultants et agences actives.",
    badge: "Recommandé",
    cta: "Accès bêta gratuit",
    ctaHref: "/auth/register",
    ctaVariant: "cta" as const,
    features: [
      { text: "50 scans/mois", included: true },
      { text: "Tous les modes de scan", included: true },
      { text: "Rapport HTML interactif", included: true },
      { text: "Export JSON", included: true },
      { text: "Scan Forensique inclus", included: true },
      { text: "Archive ZIP + hash SHA256", included: true },
      { text: "Export PDF", included: true },
      { text: "Support prioritaire", included: true },
    ],
  },
  {
    name: "Enterprise",
    price: "Sur devis",
    period: "",
    description: "Pour les grands comptes, multi-sites et intégrations API.",
    badge: null,
    cta: "Nous contacter",
    ctaHref: "mailto:contact@rgpd.pro",
    ctaVariant: "outline" as const,
    features: [
      { text: "Scans illimités", included: true },
      { text: "Tous les modes de scan", included: true },
      { text: "Rapport HTML interactif", included: true },
      { text: "Export JSON", included: true },
      { text: "Scan Forensique inclus", included: true },
      { text: "Archive ZIP + hash SHA256", included: true },
      { text: "Export PDF", included: true },
      { text: "API, multi-utilisateurs, SLA garanti", included: true },
    ],
  },
]

const SCAN_COMPARISON = [
  {
    icon: Zap,
    color: "text-green-400",
    name: "Scan Rapide",
    duration: "~30 sec",
    free: true,
    pro: true,
    features: ["Cookies & trackers", "Bandeau consentement", "Politique de confidentialité"],
  },
  {
    icon: Shield,
    color: "text-blue-400",
    name: "Scan Standard",
    duration: "~2-3 min",
    free: true,
    pro: true,
    features: ["Fingerprinting (Canvas, WebGL)", "Scripts tiers & transferts hors UE", "Estimation d'amende chiffrée", "Rapport HTML interactif"],
  },
  {
    icon: Lock,
    color: "text-purple-400",
    name: "Scan Forensique",
    duration: "~5-10 min",
    free: false,
    pro: true,
    features: ["Captures d'écran horodatées", "Archive ZIP complète", "Hash SHA256 de chaque artefact", "Rapport PDF détaillé"],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PublicHeader />

      <main className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto">

          {/* ── Hero ── */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
              <span className="text-sm text-blue-300 font-medium">Accès bêta — gratuit pendant la phase de test</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Tarifs</h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Simple et transparent. Pendant la bêta, tous les scans sont gratuits et illimités.
            </p>
          </div>

          {/* ── Plans ── */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-xl p-6 ${
                  plan.badge
                    ? "bg-blue-500/5 border border-blue-500/40 shadow-lg shadow-blue-500/10"
                    : "bg-slate-900/50 border border-slate-800"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
                  <div className="flex items-end gap-1 mb-3">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.period && <span className="text-slate-400 mb-1">{plan.period}</span>}
                  </div>
                  <p className="text-slate-400 text-sm">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-center gap-2 text-sm">
                      {f.included ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-slate-600 flex-shrink-0" />
                      )}
                      <span className={f.included ? "text-slate-300" : "text-slate-600"}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.ctaVariant === "cta" ? (
                  <Link href={plan.ctaHref}>
                    <Button className="btn-cta w-full">
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : plan.ctaHref.startsWith("mailto:") ? (
                  <a href={plan.ctaHref}>
                    <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:border-slate-500 bg-transparent">
                      {plan.cta}
                    </Button>
                  </a>
                ) : (
                  <Link href={plan.ctaHref}>
                    <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:border-slate-500 bg-transparent">
                      {plan.cta}
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* ── Comparaison des modes de scan ── */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-10">Détail des modes de scan</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {SCAN_COMPARISON.map(({ icon: Icon, color, name, duration, free, pro, features }) => (
                <div key={name} className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">{name}</h3>
                      <p className={`text-xs font-medium ${color}`}>{duration}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 mb-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                      free
                        ? "bg-green-500/10 text-green-400 border-green-500/30"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                    }`}>
                      {free ? "Gratuit" : "Pro uniquement"}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-blue-500/10 text-blue-400 border-blue-500/30">
                      Pro
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-slate-400">
                        <CheckCircle2 className={`h-3.5 w-3.5 ${color} flex-shrink-0 mt-0.5`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* ── FAQ ── */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 mb-16">
            <h2 className="text-2xl font-bold mb-6">Questions sur les tarifs</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-100 mb-2">Quand les plans payants seront-ils activés ?</h3>
                <p className="text-slate-400 text-sm">Nous sommes en phase bêta. Les plans payants seront annoncés par email avant l&apos;activation. Tous les comptes bêta bénéficieront d&apos;un tarif préférentiel.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 mb-2">Le plan gratuit nécessite-t-il une carte bancaire ?</h3>
                <p className="text-slate-400 text-sm">Non. Le plan gratuit est accessible sans aucune information de paiement. Créez votre compte avec juste votre email.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 mb-2">Qu&apos;est-ce qui justifie le plan Pro ?</h3>
                <p className="text-slate-400 text-sm">Le Scan Forensique produit des preuves recevables (captures horodatées, archive ZIP signée, hash SHA256). Ces éléments sont essentiels pour documenter une infraction ou préparer un contrôle CNIL.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 mb-2">Existe-t-il une offre pour les administrations ?</h3>
                <p className="text-slate-400 text-sm">Oui, contactez-nous pour une offre Enterprise adaptée (facturation sur bon de commande, multi-utilisateurs, SLA dédié).</p>
              </div>
            </div>
          </div>

          {/* ── CTA ── */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Commencez gratuitement</h2>
            <p className="text-slate-400 mb-8">Premier rapport en moins d&apos;une minute. Sans carte bancaire.</p>
            <Link href="/auth/register">
              <Button size="lg" className="btn-cta text-lg px-10 py-6 h-auto">
                Créer un compte gratuit
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
