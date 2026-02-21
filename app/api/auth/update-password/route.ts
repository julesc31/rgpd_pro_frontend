import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/db"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }
  try {
    const { currentPassword, newPassword } = await req.json()
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 })
    }
    const [user] = await sql`SELECT password_hash FROM users WHERE id = ${session.user.id}`
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })
    const valid = await bcrypt.compare(currentPassword, user.password_hash as string)
    if (!valid) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 })
    }
    const hash = await bcrypt.hash(newPassword, 12)
    await sql`UPDATE users SET password_hash = ${hash} WHERE id = ${session.user.id}`
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[update-password]", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
