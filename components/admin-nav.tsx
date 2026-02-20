"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LayoutDashboard, Users, Activity, BarChart3, Settings, LogOut, Bell, Menu, X } from "lucide-react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function AdminNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" })
  }

  const navItems = [
    { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/admin/users", label: "Utilisateurs", icon: Users },
    { href: "/admin/scans", label: "Scans", icon: Activity },
    { href: "/admin/metrics", label: "Métriques", icon: BarChart3 },
    { href: "/admin/settings", label: "Paramètres", icon: Settings },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-between py-4 border-b border-slate-700/50 mb-6">
        <Link href="/admin" className="flex items-center space-x-3">
          <svg width="36" height="36" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L4 10v12c0 11 8 18 18 20 10-2 18-9 18-20V10L22 2z" fill="url(#sg-admin)" stroke="url(#ss-admin)" strokeWidth="1.5"/>
            <path d="M22 8L10 14v8c0 7.5 5.5 12 12 13.5 6.5-1.5 12-6 12-13.5v-8L22 8z" fill="#0a0f1a" fillOpacity="0.6"/>
            <path d="M16 22l4 4 8-8" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="sg-admin" x1="4" y1="2" x2="40" y2="42" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1e3a8a"/><stop offset="1" stopColor="#0891b2"/>
              </linearGradient>
              <linearGradient id="ss-admin" x1="4" y1="2" x2="40" y2="42" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3b82f6"/><stop offset="1" stopColor="#22d3ee"/>
              </linearGradient>
            </defs>
          </svg>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">
              <span className="text-white">RGPD</span>
              <span className="text-cyan-400">_PRO</span>
            </span>
            <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/50 px-2 py-0.5 rounded">
              ADMIN
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`${
                  pathname === item.href ? "bg-slate-800/70 text-cyan-400" : "text-slate-400 hover:text-slate-100"
                }`}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-100">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
          </Button>

          <Avatar className="cursor-pointer">
            <AvatarFallback className="bg-purple-700 text-white">{userEmail.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-slate-400 hover:text-slate-100"
            title="Déconnexion"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden flex items-center justify-between py-4 border-b border-slate-700/50 mb-6">
        <Link href="/admin" className="flex items-center space-x-2">
          <svg width="28" height="28" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L4 10v12c0 11 8 18 18 20 10-2 18-9 18-20V10L22 2z" fill="url(#sg-admin-m)" stroke="url(#ss-admin-m)" strokeWidth="1.5"/>
            <path d="M16 22l4 4 8-8" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="sg-admin-m" x1="4" y1="2" x2="40" y2="42" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1e3a8a"/><stop offset="1" stopColor="#0891b2"/>
              </linearGradient>
              <linearGradient id="ss-admin-m" x1="4" y1="2" x2="40" y2="42" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3b82f6"/><stop offset="1" stopColor="#22d3ee"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="text-lg font-bold text-purple-400">Admin</span>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-400"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 border border-slate-700/50 rounded-lg p-4 mb-6 backdrop-blur-sm">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    pathname === item.href ? "bg-slate-800/70 text-cyan-400" : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-slate-400 hover:text-slate-100"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
