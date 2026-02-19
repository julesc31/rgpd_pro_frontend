import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { ScreenshotLightbox } from "@/components/screenshot-lightbox"
import {
  Shield,
  Scale,
  ArrowRight,
  CheckCircle2,
  FileText,
  TrendingUp,
  Database,
  Clock,
  Lock,
  BarChart3,
  Target,
  Zap,
  ChevronDown,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PublicHeader />

      <main>
        {/* ── Hero ── */}
        <section className="container mx-auto px-6 py-20 md:py-28">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-8">
              <Database className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-300">Basé sur 2 091 sanctions européennes réelles</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight tracking-tight">
              Audit RGPD avec estimation<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                du risque financier
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Scannez votre site, détectez les violations et obtenez une estimation d&apos;amende
              basée sur la jurisprudence CNIL, ICO, AEPD et 15 autres autorités européennes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link href="/auth/register">
                <Button size="lg" className="btn-cta text-lg px-8 py-6 h-auto w-full sm:w-auto">
                  Tester gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 h-auto w-full sm:w-auto border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white bg-transparent"
                >
                  Voir un exemple de rapport
                </Button>
              </Link>
            </div>

            <p className="text-slate-500 text-sm">
              Sans carte bancaire &bull; Résultats en 30 sec à 5 min &bull; Rapport téléchargeable
            </p>
          </div>
        </section>

        {/* ── Screenshot Hero ── */}
        <section className="container mx-auto px-6 pb-20">
          <div className="max-w-6xl mx-auto">
            <ScreenshotLightbox
              src="/screenshots/executive-summary.png"
              alt="RGPD_PRO — Executive Summary avec niveau de risque, estimation d'amende et ROI"
              className="rounded-xl border border-slate-800 shadow-2xl shadow-blue-500/10"
            >
              <div className="relative aspect-[16/10] min-h-[380px] bg-slate-900">
                <Image
                  src="/screenshots/executive-summary.png"
                  alt="RGPD_PRO — Executive Summary avec niveau de risque, estimation d'amende et ROI"
                  fill
                  className="object-contain object-top"
                  priority
                  sizes="(max-width: 1280px) 100vw, 1152px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
              </div>
            </ScreenshotLightbox>
          </div>
        </section>

        {/* ── Chiffres clés ── */}
        <section className="border-y border-slate-800 bg-slate-900/50">
          <div className="container mx-auto px-6 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
              <Stat number="2 091" label="Sanctions analysées" />
              <Stat number="15+" label="Autorités européennes" />
              <Stat number="12" label="Types de violations" />
              <Stat number="3" label="Modes de scan" />
            </div>
          </div>
        </section>

        {/* ── 3 Modes de scan ── */}
        <section id="modes" className="container mx-auto px-6 py-20 scroll-mt-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Choisissez votre niveau d&apos;analyse
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                De la détection rapide en 30 secondes aux preuves forensiques recevables en contrôle CNIL.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Rapide */}
              <div className="relative p-6 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-green-500/40 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/30">
                    <Zap className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100">Scan Rapide</h3>
                    <span className="text-xs text-green-400 font-medium">Gratuit • ~30 secondes</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  Détection immédiate des violations les plus fréquentes.
                </p>
                <ul className="space-y-2">
                  {["Cookies & trackers", "Bandeau consentement", "Politique de confidentialité"].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Standard — recommandé */}
              <div className="relative p-6 bg-blue-500/5 border border-blue-500/40 rounded-xl shadow-lg shadow-blue-500/10">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Recommandé
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <Shield className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100">Scan Standard</h3>
                    <span className="text-xs text-blue-400 font-medium">Gratuit • ~2-3 minutes</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  Analyse complète avec estimation financière basée sur la jurisprudence.
                </p>
                <ul className="space-y-2">
                  {["Tout Rapide +", "Fingerprinting (Canvas, WebGL)", "Scripts tiers & transferts hors UE", "Estimation d'amende chiffrée"].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Forensique */}
              <div className="relative p-6 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-purple-500/40 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/30">
                    <Lock className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100">Scan Forensique</h3>
                    <span className="text-xs text-purple-400 font-medium">Pro • ~5-10 minutes</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  Preuves recevables pour contrôle CNIL ou contentieux.
                </p>
                <ul className="space-y-2">
                  {["Tout Standard +", "Captures d'écran horodatées", "Archive ZIP + hash SHA256", "Rapport PDF détaillé"].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link href="/auth/register">
                <Button className="btn-cta">
                  Lancer un scan gratuit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Ce que vous obtenez ── */}
        <section id="rapport" className="container mx-auto px-6 py-20 scroll-mt-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Un rapport complet, pas juste une liste de problèmes
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Chaque audit génère un dossier actionnable avec violations, estimation financière,
                plan de remédiation et preuves forensiques.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <FeatureCard
                icon={Target}
                title="Détection des violations"
                description="12 catégories analysées : cookies avant consentement, fingerprinting, dark patterns, transferts hors UE, défauts du bandeau..."
                image="/screenshots/violations.png"
                imageAlt="Détection des violations avec preuves techniques"
              />
              <FeatureCard
                icon={TrendingUp}
                title="Calcul du ROI"
                description="Matrice impact/effort pour prioriser les actions. Chaque correction affiche son coût et le risque évité."
                image="/screenshots/remediation-matrix.png"
                imageAlt="Matrice de priorisation avec ROI par action"
              />
              <FeatureCard
                icon={BarChart3}
                title="Plan de remédiation"
                description="Timeline Gantt avec jalons, livrables et budget. De 30 jours pour les quick wins à 6 mois pour une conformité complète."
                image="/screenshots/gantt-timeline.png"
                imageAlt="Diagramme de Gantt avec phases et jalons"
              />
              <FeatureCard
                icon={Lock}
                title="Preuves forensiques"
                description="Fichier HAR, captures d'écran horodatées, timeline des événements, hash SHA256. Recevable en cas de contrôle."
                image="/screenshots/forensic-analysis.png"
                imageAlt="Analyse forensique avec graphiques et artefacts"
              />
            </div>
          </div>
        </section>

        {/* ── 12 types de violations ── */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                12 catégories de violations analysées
              </h2>
              <p className="text-xl text-slate-400">
                Les mêmes que celles sanctionnées par la CNIL et les autres autorités.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <ViolationBadge>Tracking sans consentement</ViolationBadge>
              <ViolationBadge>Bandeau cookies défaillant</ViolationBadge>
              <ViolationBadge>Mur de consentement (pay or okay)</ViolationBadge>
              <ViolationBadge>Fingerprinting (Canvas, WebGL, Audio)</ViolationBadge>
              <ViolationBadge>Transferts hors UE</ViolationBadge>
              <ViolationBadge>Politique de confidentialité absente</ViolationBadge>
              <ViolationBadge>Durée de conservation excessive</ViolationBadge>
              <ViolationBadge>Cookies zombies</ViolationBadge>
              <ViolationBadge>Dark patterns</ViolationBadge>
              <ViolationBadge>Absence de base légale</ViolationBadge>
              <ViolationBadge>Sous-traitants non déclarés</ViolationBadge>
              <ViolationBadge>Défaut de sécurité</ViolationBadge>
            </div>
          </div>
        </section>

        {/* ── Pour qui ── */}
        <section className="border-y border-slate-800 bg-slate-900/30">
          <div className="container mx-auto px-6 py-20">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Pour les professionnels de la conformité
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <UseCase
                  title="DPO & équipes conformité"
                  items={[
                    "Audit avant contrôle CNIL",
                    "Suivi périodique des sites",
                    "Documentation de conformité",
                  ]}
                />
                <UseCase
                  title="Agences web & consultants"
                  items={[
                    "Audit des sites clients",
                    "Rapport chiffré pour justifier les corrections",
                    "Preuve de diligence",
                  ]}
                />
                <UseCase
                  title="Directions juridiques"
                  items={[
                    "Quantification du risque financier",
                    "Preuves forensiques recevables",
                    "Arbitrage budget conformité",
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Tarifs ── */}
        <section id="tarifs" className="container mx-auto px-6 py-20 scroll-mt-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Tarifs</h2>
              <p className="text-xl text-slate-400 max-w-xl mx-auto">
                Accès libre pendant la bêta. Les plans seront activés à la sortie officielle.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Free */}
              <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-100 mb-1">Gratuit</h3>
                  <div className="flex items-end gap-1 mb-3">
                    <span className="text-4xl font-bold text-white">0 €</span>
                    <span className="text-slate-400 mb-1">/mois</span>
                  </div>
                  <p className="text-slate-400 text-sm">Pour découvrir l&apos;outil et tester vos premiers sites.</p>
                </div>
                <ul className="space-y-3 mb-6 flex-1">
                  {[
                    "5 scans/mois",
                    "Scan Rapide & Standard",
                    "Rapport HTML interactif",
                    "Export JSON",
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className="block">
                  <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:border-slate-500 bg-transparent">
                    Commencer gratuitement
                  </Button>
                </Link>
              </div>

              {/* Pro — recommandé */}
              <div className="relative p-6 bg-blue-500/5 border border-blue-500/40 rounded-xl flex flex-col shadow-lg shadow-blue-500/10">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Recommandé
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-100 mb-1">Pro</h3>
                  <div className="flex items-end gap-1 mb-3">
                    <span className="text-4xl font-bold text-white">49 €</span>
                    <span className="text-slate-400 mb-1">/mois</span>
                  </div>
                  <p className="text-slate-400 text-sm">Pour les DPO, consultants et agences actives.</p>
                </div>
                <ul className="space-y-3 mb-6 flex-1">
                  {[
                    "50 scans/mois",
                    "Tous les modes de scan",
                    "Scan Forensique inclus",
                    "Archive ZIP + hash SHA256",
                    "Export PDF & JSON",
                    "Support prioritaire",
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className="block">
                  <Button className="btn-cta w-full">
                    Accès bêta gratuit
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Enterprise */}
              <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-100 mb-1">Enterprise</h3>
                  <div className="flex items-end gap-1 mb-3">
                    <span className="text-4xl font-bold text-white">Sur devis</span>
                  </div>
                  <p className="text-slate-400 text-sm">Pour les grands comptes et multi-sites.</p>
                </div>
                <ul className="space-y-3 mb-6 flex-1">
                  {[
                    "Scans illimités",
                    "API access",
                    "Multi-utilisateurs",
                    "SLA garanti",
                    "Onboarding dédié",
                    "Facturation sur bon de commande",
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="mailto:contact@rgpd.pro" className="block">
                  <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:border-slate-500 bg-transparent">
                    Nous contacter
                  </Button>
                </a>
              </div>
            </div>

            <p className="text-center text-slate-500 text-sm mt-6">
              Pendant la bêta, tous les scans sont gratuits et illimités.
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="border-t border-slate-800 bg-slate-900/30">
          <div className="container mx-auto px-6 py-20">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Questions fréquentes</h2>
              </div>
              <div className="space-y-6">
                <FAQ
                  q="Est-ce que c'est légalement contraignant ?"
                  a="Non. RGPD_PRO est un outil d'analyse technique. Les estimations d'amende sont des projections statistiques (±30%) basées sur la jurisprudence. Elles ne constituent pas un avis juridique. Consultez un avocat spécialisé pour toute question de conformité."
                />
                <FAQ
                  q="Quelles informations le scanner collecte-t-il ?"
                  a="Le scanner analyse uniquement les éléments publiquement accessibles de votre site : cookies déposés, scripts chargés, requêtes réseau, contenu visible. Il ne collecte aucune donnée personnelle de vos visiteurs."
                />
                <FAQ
                  q="Un scan clean garantit-il la conformité RGPD ?"
                  a="Non. Nous analysons uniquement les éléments techniques accessibles en front-end. La conformité RGPD couvre également des aspects organisationnels (registres, contrats sous-traitants, etc.) que cet outil ne couvre pas."
                />
                <FAQ
                  q="Combien de temps dure un scan ?"
                  a="Le Scan Rapide prend ~30 secondes. Le Scan Standard dure 2-3 minutes. Le Scan Forensique peut prendre 5 à 10 minutes selon la complexité du site analysé."
                />
                <FAQ
                  q="Les preuves forensiques sont-elles recevables ?"
                  a="L'archive forensique contient des captures d'écran horodatées, le fichier HAR complet et les hash SHA256 de chaque artefact. Ces éléments constituent une base solide pour documenter une infraction, mais leur recevabilité légale dépend du contexte. Consultez un juriste."
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Disclaimer ── */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Scale className="h-5 w-5 text-slate-400" />
                Avertissement
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                RGPD_PRO est un outil d&apos;analyse technique. Les estimations d&apos;amende sont des projections
                statistiques basées sur la jurisprudence (marge d&apos;erreur ±30%). Elles ne constituent pas
                un avis juridique. Consultez un avocat spécialisé pour toute question de conformité.
                Un scan clean ne garantit pas la conformité RGPD complète — nous analysons uniquement
                les éléments publiquement accessibles.
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA final ── */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Identifiez vos risques avant un contrôle
            </h2>
            <p className="text-xl text-slate-400 mb-10">
              Testez l&apos;outil en conditions réelles. Premier rapport en moins d&apos;une minute.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="btn-cta text-lg px-10 py-6 h-auto">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline"
                  className="text-lg px-10 py-6 h-auto border-slate-700 text-slate-300 hover:border-slate-500 bg-transparent">
                  Voir un exemple
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <p className="text-3xl md:text-4xl font-bold text-white mb-2">{number}</p>
      <p className="text-slate-400">{label}</p>
    </div>
  )
}

function FeatureCard({
  icon: Icon, title, description, image, imageAlt,
}: {
  icon: React.ElementType
  title: string
  description: string
  image: string
  imageAlt: string
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      <ScreenshotLightbox src={image} alt={imageAlt}>
        <div className="aspect-[16/10] min-h-[280px] relative overflow-hidden bg-slate-800">
          <Image src={image} alt={imageAlt} fill className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
      </ScreenshotLightbox>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <Icon className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-slate-400">{description}</p>
      </div>
    </div>
  )
}

function ViolationBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
      <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
      <span className="text-slate-300 text-sm">{children}</span>
    </div>
  )
}

function UseCase({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="border border-slate-800 rounded-xl p-6 bg-slate-900/30">
      <h3 className="font-semibold text-slate-100 mb-3 flex items-start gap-3">
        <ChevronDown className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        {q}
      </h3>
      <p className="text-slate-400 text-sm leading-relaxed pl-8">{a}</p>
    </div>
  )
}
