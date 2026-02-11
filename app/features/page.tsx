import Link from "next/link"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { Button } from "@/components/ui/button"
import { 
  Cookie, 
  Fingerprint, 
  FileWarning, 
  Globe,
  Camera,
  FileJson,
  Scale,
  Clock,
  ShieldCheck,
  FileText,
  ArrowRight,
  ArrowLeft
} from "lucide-react"

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PublicHeader />

      <main className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto mb-16">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Ce que RGPD_PRO analyse
          </h1>
          <p className="text-slate-400 text-lg">
            Le scanner reproduit ce que fait un contrôleur : il charge votre site dans un 
            navigateur, observe ce qui se passe avant et après le consentement, et documente tout.
          </p>
        </div>

        {/* Détection */}
        <section className="mb-20">
          <h2 className="text-xl font-bold mb-8">Détection des violations</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Cookie}
              title="Cookies"
              description="Cookies déposés avant consentement, cookies tiers, durées de conservation. Le scanner compare l'état avant/après clic sur le bandeau."
            />
            <FeatureCard
              icon={Fingerprint}
              title="Fingerprinting"
              description="Canvas fingerprinting, WebGL, AudioContext, énumération des polices. Techniques qui permettent de vous identifier sans cookies."
            />
            <FeatureCard
              icon={FileWarning}
              title="Bandeau cookies"
              description="Présence d'un mécanisme de consentement, possibilité de refuser, cases pré-cochées, dark patterns."
            />
            <FeatureCard
              icon={Globe}
              title="Transferts hors UE"
              description="Requêtes vers des serveurs situés hors de l'Union Européenne, notamment États-Unis, Chine."
            />
            <FeatureCard
              icon={FileText}
              title="Scripts tiers"
              description="Google Analytics, Facebook Pixel, scripts publicitaires, outils de tracking chargés sans consentement."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="LocalStorage & Session"
              description="Données stockées dans le navigateur qui peuvent servir au tracking, même sans cookies."
            />
          </div>
        </section>

        {/* Output */}
        <section className="mb-20">
          <h2 className="text-xl font-bold mb-8">Ce que vous obtenez</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard
              icon={FileText}
              title="Rapport HTML interactif"
              description="Document consultable en ligne avec la liste de toutes les violations détectées, leur gravité, et des explications."
            />
            <FeatureCard
              icon={Scale}
              title="Estimation du risque financier"
              description="Fourchette d'amende calculée à partir des sanctions réelles prononcées en Europe, ajustée à votre secteur."
            />
            <FeatureCard
              icon={Camera}
              title="Captures d'écran"
              description="Screenshots horodatés de votre site au moment du scan, avant et après consentement. (Abonnés)"
            />
            <FeatureCard
              icon={FileJson}
              title="Package forensique"
              description="Fichier HAR du trafic réseau, données JSON brutes, hash SHA256 pour prouver l'intégrité. (Abonnés)"
            />
          </div>
        </section>

        {/* Specs techniques */}
        <section className="max-w-3xl">
          <h2 className="text-xl font-bold mb-8">Détails techniques</h2>
            <div className="space-y-4 text-slate-400">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-slate-600 mt-0.5" />
              <p><strong className="text-white">Durée du scan :</strong> environ 60 secondes. Le scanner attend que la page soit complètement chargée avant d'analyser.</p>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-slate-600 mt-0.5" />
              <p><strong className="text-white">Navigateur :</strong> Chromium headless. Le scanner simule un vrai navigateur avec JavaScript activé.</p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-slate-600 mt-0.5" />
              <p><strong className="text-white">Pas d'impact sur votre site :</strong> Le scanner est passif, il ne modifie rien. Il se comporte comme un visiteur normal.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-2xl mx-auto mt-20 pt-16 border-t border-slate-800 text-center">
          <p className="text-slate-400 mb-6">
            Prêt à analyser votre site ?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
                Voir un exemple
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="btn-cta">
                Tester gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType
  title: string
  description: string 
}) {
  return (
    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
      <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30 w-fit mb-4">
        <Icon className="h-5 w-5 text-cyan-400" />
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  )
}
