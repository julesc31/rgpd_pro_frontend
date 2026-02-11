import Link from "next/link"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { ArrowLeft } from "lucide-react"

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PublicHeader />

      <main className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Conditions Générales d&apos;Utilisation</h1>
          
          <div className="prose prose-invert prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Article 1 — Objet</h2>
              <p className="text-slate-300 leading-relaxed">
                Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation 
                du service RGPD_PRO, accessible à l&apos;adresse rgpd.pro (ci-après « le Service »).
              </p>
              <p className="text-slate-300 leading-relaxed mt-4">
                Le Service est un outil d&apos;analyse automatisée permettant de détecter les violations 
                potentielles du RGPD sur les sites web et de fournir une estimation statistique du 
                risque financier associé.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Article 2 — Acceptation des CGU</h2>
              <p className="text-slate-300 leading-relaxed">
                L&apos;utilisation du Service implique l&apos;acceptation pleine et entière des présentes CGU. 
                En créant un compte ou en utilisant le Service, vous reconnaissez avoir lu, compris 
                et accepté ces conditions.
              </p>
              <p className="text-slate-300 leading-relaxed mt-4">
                RGPD_PRO se réserve le droit de modifier les présentes CGU à tout moment. Les 
                utilisateurs seront informés des modifications par email. La poursuite de l&apos;utilisation 
                du Service après notification vaut acceptation des nouvelles conditions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Article 3 — Description du Service</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Le Service propose :
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>L&apos;analyse automatisée de sites web pour détecter les violations potentielles du RGPD</li>
                <li>La génération de rapports détaillant les violations identifiées</li>
                <li>Une estimation statistique du risque financier basée sur la jurisprudence européenne</li>
                <li>Un plan de remédiation avec estimation des coûts</li>
                <li>La collecte de preuves forensiques</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Article 4 — Inscription et compte</h2>
              <p className="text-slate-300 leading-relaxed">
                L&apos;utilisation du Service nécessite la création d&apos;un compte. L&apos;utilisateur s&apos;engage à :
              </p>
              <ul className="list-disc list-inside text-slate-300 mt-4 space-y-2">
                <li>Fournir des informations exactes et à jour</li>
                <li>Maintenir la confidentialité de ses identifiants</li>
                <li>Notifier immédiatement toute utilisation non autorisée de son compte</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                RGPD_PRO se réserve le droit de suspendre ou supprimer tout compte en cas de 
                violation des présentes CGU.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Article 5 — Utilisation autorisée</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                L&apos;utilisateur peut utiliser le Service pour :
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Analyser ses propres sites web</li>
                <li>Analyser les sites web de ses clients avec leur autorisation</li>
                <li>Analyser tout site web public à des fins d&apos;audit</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                Le scanner n&apos;accède qu&apos;aux éléments publiquement accessibles des sites analysés 
                et ne tente pas de contourner les mesures de sécurité.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Article 6 — Utilisations interdites</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Il est interdit d&apos;utiliser le Service pour :
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Toute activité illégale ou frauduleuse</li>
                <li>Surcharger ou tenter de compromettre l&apos;infrastructure du Service</li>
                <li>Revendre ou redistribuer le Service sans autorisation</li>
                <li>Extraire systématiquement les données du Service (scraping)</li>
                <li>Usurper l&apos;identité d&apos;un tiers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Article 7 — Accès au service</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Le Service est actuellement en phase de test grandeur nature :
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li><strong className="text-white">Accès libre</strong> — Test de l&apos;outil sans limitation</li>
                <li><strong className="text-white">Authentification requise</strong> — Pour constituer une mailing liste et faire circuler des informations</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                Cette phase de test permet d&apos;évaluer l&apos;outil en conditions réelles. 
                Aucun paiement n&apos;est requis pour le moment.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Article 8 — Résiliation</h2>
              <p className="text-slate-300 leading-relaxed">
                L&apos;utilisateur peut supprimer son compte à tout moment depuis son espace personnel.
              </p>
              <p className="text-slate-300 leading-relaxed mt-4">
                RGPD_PRO peut résilier l&apos;accès au Service en cas de violation des CGU, avec un 
                préavis de 15 jours sauf en cas de violation grave.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Article 9 — Limitation de responsabilité</h2>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 text-amber-200">
                <p className="font-semibold mb-4">AVERTISSEMENT IMPORTANT</p>
                <p className="leading-relaxed">
                  RGPD_PRO est un outil d&apos;analyse technique automatisé. Il ne fournit PAS de conseil 
                  juridique et ne se substitue PAS à l&apos;expertise d&apos;un avocat ou d&apos;un DPO.
                </p>
              </div>
              
              <p className="text-slate-300 leading-relaxed mt-6">
                Les estimations d&apos;amendes sont des projections statistiques basées sur l&apos;analyse de 
                2 091 sanctions européennes. Elles sont fournies à titre indicatif avec une marge 
                d&apos;erreur de ±30% ou plus. Les amendes réelles dépendent de facteurs que le Service 
                ne peut pas évaluer (coopération, mesures correctives, circonstances spécifiques).
              </p>
              
              <p className="text-slate-300 leading-relaxed mt-4">
                RGPD_PRO décline toute responsabilité pour :
              </p>
              <ul className="list-disc list-inside text-slate-300 mt-4 space-y-2">
                <li>L&apos;exactitude ou l&apos;exhaustivité des détections</li>
                <li>Les décisions prises sur la base des rapports</li>
                <li>Les sanctions effectivement prononcées par les autorités</li>
                <li>Tout dommage direct ou indirect lié à l&apos;utilisation du Service</li>
              </ul>
              
              <p className="text-slate-300 leading-relaxed mt-4">
                Le Service analyse uniquement les éléments publiquement accessibles. Un scan 
                sans violation détectée ne garantit pas la conformité RGPD complète de l&apos;organisation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Article 10 — Propriété intellectuelle</h2>
              <p className="text-slate-300 leading-relaxed">
                Le Service, son code source, son algorithme et sa base de données sont la propriété 
                exclusive de RGPD_PRO et sont protégés par le droit de la propriété intellectuelle.
              </p>
              <p className="text-slate-300 leading-relaxed mt-4">
                Les rapports générés sont la propriété de l&apos;utilisateur. RGPD_PRO conserve un droit 
                d&apos;utilisation des données anonymisées à des fins d&apos;amélioration du Service et de 
                statistiques.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Article 11 — Données personnelles</h2>
              <p className="text-slate-300 leading-relaxed">
                Le traitement des données personnelles est décrit dans notre{" "}
                <a href="/confidentialite" className="text-cyan-400 hover:underline">
                  Politique de confidentialité
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Article 12 — Disponibilité</h2>
              <p className="text-slate-300 leading-relaxed">
                RGPD_PRO s&apos;efforce d&apos;assurer une disponibilité maximale du Service mais ne garantit 
                pas une disponibilité continue. Des interruptions pour maintenance peuvent survenir.
              </p>
              <p className="text-slate-300 leading-relaxed mt-4">
                En cas d&apos;interruption prolongée (plus de 48h), les utilisateurs seront informés.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Article 13 — Droit applicable et litiges</h2>
              <p className="text-slate-300 leading-relaxed">
                Les présentes CGU sont régies par le droit français.
              </p>
              <p className="text-slate-300 leading-relaxed mt-4">
                En cas de litige, les parties s&apos;engagent à rechercher une solution amiable. 
                À défaut, les tribunaux français seront seuls compétents.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Article 14 — Contact</h2>
              <p className="text-slate-300 leading-relaxed">
                Pour toute question relative aux présentes CGU :{" "}
                <a href="mailto:contact@rgpd.pro" className="text-cyan-400 hover:underline">
                  contact@rgpd.pro
                </a>
              </p>
            </section>

            <p className="text-slate-500 text-sm pt-8 border-t border-slate-800">
              Dernière mise à jour : Février 2025
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
