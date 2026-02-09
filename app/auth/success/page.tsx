import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowLeft } from "lucide-react"

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
              <div className="mx-auto p-3 bg-cyan-500/10 rounded-full border border-cyan-500/30 w-fit mb-4">
                <Mail className="h-8 w-8 text-cyan-400" />
              </div>
              <CardTitle className="text-xl text-white">Vérifiez votre email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-6">
                Nous vous avons envoyé un lien de confirmation. 
                Cliquez dessus pour activer votre compte.
              </p>
              <Link href="/auth/login">
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                  Aller à la connexion
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
