import type { LucideIcon } from "lucide-react"

interface StepCardProps {
  number: string
  title: string
  description: string
  icon: LucideIcon
}

export default function StepCard({ number, title, description, icon: Icon }: StepCardProps) {
  return (
    <div className="relative bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-bold text-xl mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-slate-100">{title}</h3>
      <p className="text-slate-400">{description}</p>
      <Icon className="absolute top-6 right-6 h-6 w-6 text-cyan-500/30" />
    </div>
  )
}
