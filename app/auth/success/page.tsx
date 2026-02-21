import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ArrowLeft } from "lucide-react"

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm">
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Card className="bg-slate-900/50 border-slate-800 text-center">
            <CardHeader>
              <div className="mx-auto p-3 bg-green-500/10 rounded-full border border-green-500/30 w-fit mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <CardTitle className="text-xl text-white">Compte créé avec succès</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-6">
                Votre compte est actif. Vous pouvez vous connecter dès maintenant.
              </p>
              <Link href="/auth/login">
                <Button className="btn-cta w-full">
                  Se connecter
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
