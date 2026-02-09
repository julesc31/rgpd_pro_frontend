import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PublicHeader />

      <main className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-slate-400 text-lg mb-12">
            Tout ce qu&apos;il faut savoir pour utiliser RGPD_PRO.
          </p>

          {/* Premiers pas */}
          <Section title="Premiers pas">
            <ol className="list-decimal list-inside space-y-3 text-slate-400">
              <li>Créez un compte sur la page d&apos;inscription</li>
              <li>Confirmez votre email</li>
              <li>Connectez-vous et allez sur la page Scan</li>
              <li>Entrez l&apos;URL du site à analyser</li>
              <li>Renseignez le secteur d&apos;activité et la taille de l&apos;entreprise</li>
              <li>Lancez le scan et attendez environ 60 secondes</li>
            </ol>
          </Section>

          {/* Comprendre le rapport */}
          <Section title="Comprendre le rapport">
            <p className="text-slate-400 mb-4">
              Le rapport liste toutes les violations détectées, classées par gravité :
            </p>
            <ul className="space-y-3 text-slate-400">
              <li>
                <strong className="text-red-400">Élevé</strong> — Tracking actif avant 
                consentement (Google Analytics, Facebook Pixel, etc.). Ce sont les violations 
                les plus sanctionnées par les autorités.
              </li>
              <li>
                <strong className="text-amber-400">Moyen</strong> — Fingerprinting, cookies 
                avec durée excessive, transferts hors UE non documentés.
              </li>
              <li>
                <strong className="text-blue-400">Faible</strong> — Problèmes de bandeau 
                cookies, informations manquantes dans la politique de confidentialité.
              </li>
            </ul>
          </Section>

          {/* Estimation du risque */}
          <Section title="Estimation du risque financier">
            <p className="text-slate-400 mb-4">
              Le montant affiché est une fourchette basée sur les sanctions réellement 
              prononcées en Europe pour des violations similaires. Il prend en compte :
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li>Le type et le nombre de violations</li>
              <li>Votre secteur d&apos;activité</li>
              <li>La taille de votre entreprise (CA et effectif)</li>
            </ul>
            <p className="text-slate-400 mt-4">
              Ce n&apos;est pas une prédiction exacte, mais un ordre de grandeur basé sur 
              ce qui a été sanctionné par la CNIL, la DPC irlandaise, l&apos;AEPD espagnole, etc.
            </p>
          </Section>

          {/* Package forensique */}
          <Section title="Package forensique (abonnés)">
            <p className="text-slate-400 mb-4">
              Le package forensique est un fichier ZIP qui contient :
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li><strong className="text-white">Screenshots</strong> — Captures d&apos;écran 
              horodatées de la page avant et après consentement</li>
              <li><strong className="text-white">Fichier HAR</strong> — Tout le trafic réseau 
              enregistré pendant le scan</li>
              <li><strong className="text-white">Données JSON</strong> — Les données brutes 
              du scan, exploitables par d&apos;autres outils</li>
              <li><strong className="text-white">Hash SHA256</strong> — Empreinte cryptographique 
              pour prouver que les fichiers n&apos;ont pas été modifiés</li>
            </ul>
            <p className="text-slate-400 mt-4">
              Utile pour documenter un audit de conformité ou en cas de contrôle.
            </p>
          </Section>

          {/* Limites */}
          <Section title="Limites du scanner">
            <p className="text-slate-400 mb-4">
              Le scanner détecte beaucoup de choses, mais pas tout :
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li>Il n&apos;analyse que la page d&apos;accueil (pas tout le site)</li>
              <li>Il ne peut pas voir ce qui se passe côté serveur</li>
              <li>Certains scripts obfusqués peuvent passer inaperçus</li>
              <li>Il ne vérifie pas la conformité juridique de vos mentions légales</li>
            </ul>
            <p className="text-slate-400 mt-4">
              C&apos;est un outil de détection, pas un audit juridique complet.
            </p>
          </Section>

          {/* Contact */}
          <Section title="Besoin d'aide ?">
            <p className="text-slate-400">
              Si vous avez des questions, contactez-nous à{" "}
              <a href="mailto:support@rgpd-pro.fr" className="text-cyan-400 hover:underline">
                support@rgpd-pro.fr
              </a>
            </p>
          </Section>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

function Section({ 
  title, 
  children 
}: { 
  title: string
  children: React.ReactNode 
}) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {children}
    </section>
  )
}
