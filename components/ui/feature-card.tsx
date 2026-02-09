import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6 hover:border-cyan-500/50 transition-all duration-300">
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 mb-4">
        <Icon className="h-6 w-6 text-cyan-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-slate-100">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  )
}
