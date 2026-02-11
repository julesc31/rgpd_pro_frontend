'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ZoomIn } from 'lucide-react'

interface ScreenshotLightboxProps {
  src: string
  alt: string
  children: React.ReactNode
  className?: string
}

export function ScreenshotLightbox({ src, alt, children, className }: ScreenshotLightboxProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative block w-full cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded-lg ${className ?? ''}`}
        aria-label={`Agrandir : ${alt}`}
      >
        {children}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm text-white">
            <ZoomIn className="h-4 w-4" />
            Cliquez pour agrandir
          </span>
        </div>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-[95vw] max-h-[95vh] w-fit p-0 border-slate-800 bg-slate-950 overflow-hidden [&>button]:right-2 [&>button]:top-2 [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:p-2 [&>button]:hover:bg-black/70"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full max-h-[90vh] flex items-center justify-center">
            <Image
              src={src}
              alt={alt}
              width={1600}
              height={1000}
              className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
