import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

import { Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'

// Initialize fonts
const _sourceSerif_4 = V0_Font_Source_Serif_4({ 
  subsets: ['latin'], 
  weight: ["200","300","400","500","600","700","800","900"], 
  variable: '--v0-font-source-serif-4' 
})

const _v0_fontVariables = `${GeistSans.variable} ${GeistMono.variable} ${_sourceSerif_4.variable}`

export const metadata: Metadata = {
  title: 'RGPD_PRO - Audit & Conformité RGPD',
  description: 'Scannez votre site comme la CNIL. Détectez les violations cookies, fingerprinting, dark patterns et estimez votre risque financier basé sur 2660 sanctions européennes.',
  generator: 'RGPD_PRO',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={_v0_fontVariables}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}