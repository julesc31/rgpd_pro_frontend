import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PublicHeader />

      <main className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Mentions légales</h1>
          
          <div className="prose prose-invert prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Éditeur du site</h2>
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 space-y-2 text-slate-300">
                <p><strong className="text-white">RGPD_PRO</strong></p>
                <p>Micro-entreprise</p>
                <p>SIRET : [À compléter]</p>
                <p>Adresse : [À compléter]</p>
                <p>Email : contact@rgpd-pro.fr</p>
                <p>Directeur de la publication : [À compléter]</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Hébergement</h2>
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 space-y-2 text-slate-300">
                <p><strong className="text-white">Vercel Inc.</strong></p>
                <p>440 N Barranca Ave #4133</p>
                <p>Covina, CA 91723, États-Unis</p>
                <p>Site : vercel.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Propriété intellectuelle</h2>
              <p className="text-slate-300 leading-relaxed">
                L&apos;ensemble du contenu de ce site (textes, images, logo, code source, rapports générés) 
                est protégé par le droit d&apos;auteur. Toute reproduction, représentation, modification, 
                publication ou adaptation de tout ou partie des éléments du site est interdite sans 
                autorisation écrite préalable de l&apos;éditeur.
              </p>
              <p className="text-slate-300 leading-relaxed mt-4">
                Les rapports générés par le service sont la propriété de l&apos;utilisateur qui les a commandés. 
                RGPD_PRO conserve un droit d&apos;utilisation anonymisé à des fins statistiques et d&apos;amélioration 
                du service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Limitation de responsabilité</h2>
              <p className="text-slate-300 leading-relaxed">
                RGPD_PRO est un outil d&apos;analyse technique automatisé. Les informations fournies, 
                notamment les estimations d&apos;amendes, sont des projections statistiques basées sur 
                la jurisprudence publique et ne constituent en aucun cas :
              </p>
              <ul className="list-disc list-inside text-slate-300 mt-4 space-y-2">
                <li>Un avis juridique</li>
                <li>Une garantie de conformité RGPD</li>
                <li>Une prédiction certaine des sanctions</li>
                <li>Un conseil en matière de protection des données</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                L&apos;utilisateur est invité à consulter un avocat spécialisé ou un DPO certifié pour 
                toute question relative à la conformité de son organisation au RGPD.
              </p>
              <p className="text-slate-300 leading-relaxed mt-4">
                RGPD_PRO ne saurait être tenu responsable des décisions prises sur la base des 
                rapports générés, ni des éventuelles sanctions prononcées par les autorités de 
                contrôle.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Données personnelles</h2>
              <p className="text-slate-300 leading-relaxed">
                Pour connaître les modalités de traitement de vos données personnelles, veuillez 
                consulter notre <a href="/confidentialite" className="text-cyan-400 hover:underline">Politique de confidentialité</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Droit applicable</h2>
              <p className="text-slate-300 leading-relaxed">
                Les présentes mentions légales sont régies par le droit français. En cas de litige, 
                les tribunaux français seront seuls compétents.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Contact</h2>
              <p className="text-slate-300 leading-relaxed">
                Pour toute question concernant ces mentions légales, vous pouvez nous contacter à 
                l&apos;adresse : <a href="mailto:contact@rgpd-pro.fr" className="text-cyan-400 hover:underline">contact@rgpd-pro.fr</a>
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
