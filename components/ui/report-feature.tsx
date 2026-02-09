import { CheckCircle2 } from "lucide-react"

interface ReportFeatureProps {
  title: string
  description: string
}

export default function ReportFeature({ title, description }: ReportFeatureProps) {
  return (
    <div className="flex items-start space-x-4 bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6">
      <div className="flex-shrink-0">
        <CheckCircle2 className="h-6 w-6 text-cyan-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2 text-slate-100">{title}</h3>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </div>
  )
}
