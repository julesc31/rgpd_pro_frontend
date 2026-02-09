"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export function PublicHeader() {
  const pathname = usePathname()
  
  const navLinks = [
    { href: "/features", label: "Fonctionnalités" },
    { href: "/docs", label: "Documentation" },
  ]

  return (
    <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <svg width="36" height="36" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-105 transition-transform">
              <path d="M22 2L4 10v12c0 11 8 18 18 20 10-2 18-9 18-20V10L22 2z" fill="url(#sg-h)" stroke="url(#ss-h)" strokeWidth="1.5"/>
              <path d="M22 8L10 14v8c0 7.5 5.5 12 12 13.5 6.5-1.5 12-6 12-13.5v-8L22 8z" fill="#0a0f1a" fillOpacity="0.6"/>
              <path d="M16 22l4 4 8-8" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="sg-h" x1="4" y1="2" x2="40" y2="42" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1e3a8a"/><stop offset="1" stopColor="#0891b2"/>
                </linearGradient>
                <linearGradient id="ss-h" x1="4" y1="2" x2="40" y2="42" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3b82f6"/><stop offset="1" stopColor="#22d3ee"/>
                </linearGradient>
              </defs>
            </svg>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none">
                <span className="text-white">RGPD</span>
                <span className="text-cyan-400">_PRO</span>
              </span>
              <span className="text-[10px] text-slate-500 tracking-wider">AUDIT & CONFORMITÉ</span>
            </div>
          </Link>

          {/* Navigation centrale */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button 
                  variant="ghost" 
                  className={`text-sm ${
                    pathname === link.href 
                      ? "text-cyan-400 bg-cyan-400/10" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-slate-400 hover:text-white">
                Connexion
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                Tester maintenant
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
