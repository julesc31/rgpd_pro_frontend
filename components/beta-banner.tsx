"use client"

import { Beaker } from "lucide-react"

export function BetaBanner() {
  return (
    <div className="bg-amber-500/90 text-slate-900 py-2 px-4 text-center text-sm font-medium">
      <span className="inline-flex items-center gap-2">
        <Beaker className="h-4 w-4" />
        Application en phase Beta de test — Vos retours nous aident à améliorer le service.
        <a
          href="mailto:contact@rgpd.pro"
          className="underline hover:no-underline font-semibold"
        >
          contact@rgpd.pro
        </a>
      </span>
    </div>
  )
}
