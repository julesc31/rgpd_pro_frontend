import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PublicHeader />

      <main className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Politique de confidentialité</h1>
          
          <div className="prose prose-invert prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Responsable du traitement</h2>
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 space-y-2 text-slate-300">
                <p><strong className="text-white">RGPD_PRO</strong></p>
                <p>Email : dpo@rgpd-pro.fr</p>
                <p>Adresse : [À compléter]</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Données collectées</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Dans le cadre de l&apos;utilisation de notre service, nous collectons les données suivantes :
              </p>
              
              <h3 className="text-lg font-medium mb-2 text-white">Données de compte</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-1 mb-4">
                <li>Adresse email</li>
                <li>Nom (facultatif)</li>
                <li>Entreprise (facultatif)</li>
                <li>Mot de passe (chiffré)</li>
              </ul>

              <h3 className="text-lg font-medium mb-2 text-white">Données de scan</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-1 mb-4">
                <li>URLs des sites analysés</li>
                <li>Informations sur l&apos;entreprise (secteur, CA, effectif) — si fournies</li>
                <li>Résultats des analyses (violations détectées, estimations)</li>
                <li>Rapports générés</li>
              </ul>

              <h3 className="text-lg font-medium mb-2 text-white">Données techniques</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>Adresse IP</li>
                <li>Type de navigateur</li>
                <li>Pages consultées et horodatages</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Finalités du traitement</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 pr-4 text-white">Finalité</th>
                      <th className="text-left py-3 pr-4 text-white">Base légale</th>
                      <th className="text-left py-3 text-white">Durée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="py-3 pr-4">Gestion du compte utilisateur</td>
                      <td className="py-3 pr-4">Exécution du contrat</td>
                      <td className="py-3">Durée du compte + 3 ans</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">Fourniture du service de scan</td>
                      <td className="py-3 pr-4">Exécution du contrat</td>
                      <td className="py-3">1 an après le scan</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">Facturation</td>
                      <td className="py-3 pr-4">Obligation légale</td>
                      <td className="py-3">10 ans</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">Amélioration du service</td>
                      <td className="py-3 pr-4">Intérêt légitime</td>
                      <td className="py-3">Données anonymisées</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">Emails de service</td>
                      <td className="py-3 pr-4">Exécution du contrat</td>
                      <td className="py-3">Durée du compte</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Destinataires des données</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Vos données sont traitées par :
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li><strong className="text-white">Supabase</strong> (hébergement base de données) — UE/US avec clauses contractuelles types</li>
                <li><strong className="text-white">Vercel</strong> (hébergement application) — US avec clauses contractuelles types</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                Nous ne vendons ni ne louons vos données à des tiers. Aucune donnée n&apos;est partagée 
                à des fins publicitaires.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Transferts hors UE</h2>
              <p className="text-slate-300 leading-relaxed">
                Certains de nos sous-traitants sont situés aux États-Unis. Ces transferts sont encadrés par :
              </p>
              <ul className="list-disc list-inside text-slate-300 mt-4 space-y-2">
                <li>Les clauses contractuelles types de la Commission européenne</li>
                <li>Des mesures de sécurité complémentaires (chiffrement, pseudonymisation)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Sécurité</h2>
              <p className="text-slate-300 leading-relaxed">
                Nous mettons en œuvre les mesures suivantes pour protéger vos données :
              </p>
              <ul className="list-disc list-inside text-slate-300 mt-4 space-y-2">
                <li>Chiffrement des données en transit (TLS 1.3) et au repos</li>
                <li>Authentification sécurisée avec hachage des mots de passe</li>
                <li>Accès restreint aux données selon le principe du moindre privilège</li>
                <li>Journalisation des accès</li>
                <li>Sauvegardes régulières</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Vos droits</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li><strong className="text-white">Accès</strong> — obtenir une copie de vos données</li>
                <li><strong className="text-white">Rectification</strong> — corriger vos données inexactes</li>
                <li><strong className="text-white">Effacement</strong> — demander la suppression de vos données</li>
                <li><strong className="text-white">Limitation</strong> — restreindre le traitement</li>
                <li><strong className="text-white">Portabilité</strong> — recevoir vos données dans un format structuré</li>
                <li><strong className="text-white">Opposition</strong> — vous opposer au traitement</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                Pour exercer ces droits, contactez-nous à : <a href="mailto:dpo@rgpd-pro.fr" className="text-cyan-400 hover:underline">dpo@rgpd-pro.fr</a>
              </p>
              <p className="text-slate-300 leading-relaxed mt-4">
                Vous pouvez également introduire une réclamation auprès de la CNIL : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">www.cnil.fr</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Cookies</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Notre site utilise uniquement des cookies strictement nécessaires au fonctionnement du service :
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 pr-4 text-white">Cookie</th>
                      <th className="text-left py-3 pr-4 text-white">Finalité</th>
                      <th className="text-left py-3 text-white">Durée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="py-3 pr-4 font-mono text-xs">sb-access-token</td>
                      <td className="py-3 pr-4">Authentification</td>
                      <td className="py-3">Session</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-mono text-xs">sb-refresh-token</td>
                      <td className="py-3 pr-4">Renouvellement session</td>
                      <td className="py-3">7 jours</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-slate-300 leading-relaxed mt-4">
                Aucun cookie publicitaire ou de tracking tiers n&apos;est utilisé.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Modifications</h2>
              <p className="text-slate-300 leading-relaxed">
                Nous nous réservons le droit de modifier cette politique de confidentialité. 
                En cas de modification substantielle, vous serez informé par email.
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
