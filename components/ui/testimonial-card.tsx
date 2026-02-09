import { Star } from "lucide-react"

interface TestimonialCardProps {
  name: string
  role: string
  content: string
  rating: number
}

export default function TestimonialCard({ name, role, content, rating }: TestimonialCardProps) {
  return (
    <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6">
      <div className="flex items-center mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
        ))}
      </div>
      <p className="text-slate-300 mb-4 italic">"{content}"</p>
      <div>
        <p className="font-semibold text-slate-100">{name}</p>
        <p className="text-sm text-slate-400">{role}</p>
      </div>
    </div>
  )
}
