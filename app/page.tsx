import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
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
  
  Target
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PublicHeader />

      <main>
        {/* Hero */}
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
            
            <div className="flex justify-center mb-8">
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 py-6 h-auto font-semibold shadow-lg shadow-white/10">
                  Tester maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            <p className="text-slate-500">
              Test grandeur nature • Accès libre • Résultats en 2-3 minutes
            </p>
          </div>
        </section>

        {/* Screenshot Hero - Executive Summary */}
        <section className="container mx-auto px-6 pb-20">
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl shadow-blue-500/10">
              <Image
                src="/screenshots/executive-summary.png"
                alt="RGPD_PRO - Executive Summary avec niveau de risque, estimation d'amende et ROI"
                width={1200}
                height={800}
                className="w-full h-auto"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            </div>
          </div>
        </section>

        {/* Chiffres clés */}
        <section className="border-y border-slate-800 bg-slate-900/50">
          <div className="container mx-auto px-6 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
              <Stat number="2 091" label="Sanctions analysées" />
              <Stat number="15+" label="Autorités européennes" />
              <Stat number="12" label="Types de violations" />
              <Stat number="2-3 min" label="Durée du scan" />
            </div>
          </div>
        </section>

        {/* Ce que vous obtenez */}
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
              {/* Violations */}
              <FeatureCard
                icon={Target}
                title="Détection des violations"
                description="12 catégories analysées : cookies avant consentement, fingerprinting, dark patterns, transferts hors UE, défauts du bandeau..."
                image="/screenshots/violations.png"
                imageAlt="Détection des violations avec preuves techniques"
              />
              
              {/* ROI */}
              <FeatureCard
                icon={TrendingUp}
                title="Calcul du ROI"
                description="Matrice impact/effort pour prioriser les actions. Chaque correction affiche son coût et le risque évité."
                image="/screenshots/remediation-matrix.png"
                imageAlt="Matrice de priorisation avec ROI par action"
              />
              
              {/* Timeline */}
              <FeatureCard
                icon={BarChart3}
                title="Plan de remédiation"
                description="Timeline Gantt avec jalons, livrables et budget. De 30 jours pour les quick wins à 6 mois pour une conformité complète."
                image="/screenshots/gantt-timeline.png"
                imageAlt="Diagramme de Gantt avec phases et jalons"
              />
              
              {/* Forensic */}
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

        {/* Types de violations détectées */}
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

        {/* Pour qui */}
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
                    "Documentation de conformité"
                  ]}
                />
                <UseCase
                  title="Agences web & consultants"
                  items={[
                    "Audit des sites clients",
                    "Rapport chiffré pour justifier les corrections",
                    "Preuve de diligence"
                  ]}
                />
                <UseCase
                  title="Directions juridiques"
                  items={[
                    "Quantification du risque financier",
                    "Preuves forensiques recevables",
                    "Arbitrage budget conformité"
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer important */}
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

        {/* CTA final */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Identifiez vos risques avant un contrôle
            </h2>
            <p className="text-xl text-slate-400 mb-10">
              Testez l&apos;outil en conditions réelles. Rapport complet en 2-3 minutes.
            </p>
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-10 py-6 h-auto font-semibold shadow-lg shadow-white/10">
                Commencer le test
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <p className="text-3xl md:text-4xl font-bold text-white mb-2">{number}</p>
      <p className="text-slate-400">{label}</p>
    </div>
  )
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description,
  image,
  imageAlt
}: { 
  icon: React.ElementType
  title: string
  description: string
  image: string
  imageAlt: string
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      <div className="aspect-video relative overflow-hidden bg-slate-800">
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover object-top"
        />
      </div>
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
