import Link from "next/link"

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-800/50 bg-slate-950">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <svg width="32" height="32" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L4 10v12c0 11 8 18 18 20 10-2 18-9 18-20V10L22 2z" fill="url(#sg-f)" stroke="url(#ss-f)" strokeWidth="1.5"/>
                <path d="M16 22l4 4 8-8" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="sg-f" x1="4" y1="2" x2="40" y2="42" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1e3a8a"/><stop offset="1" stopColor="#0891b2"/>
                  </linearGradient>
                  <linearGradient id="ss-f" x1="4" y1="2" x2="40" y2="42" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3b82f6"/><stop offset="1" stopColor="#22d3ee"/>
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-lg font-bold">
                <span className="text-white">RGPD</span>
                <span className="text-cyan-400">_PRO</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm max-w-md">
              Scanner de conformité RGPD. Détecte les cookies, trackers et violations 
              de vie privée sur vos sites web.
            </p>
          </div>

          {/* Liens produit */}
          <div>
            <h4 className="text-white font-medium mb-4">Produit</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link href="/demo" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                  Exemple de rapport
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Liens légaux */}
          <div>
            <h4 className="text-white font-medium mb-4">Légal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/mentions-legales" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                  CGU
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} RGPD_PRO. Tous droits réservés.
          </p>
          <p className="text-slate-600 text-sm">
            Fait en France 🇫🇷
          </p>
        </div>
      </div>
    </footer>
  )
}
