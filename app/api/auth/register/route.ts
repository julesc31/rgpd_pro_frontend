import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { email, password, full_name } = await req.json()
    if (!email || !password || password.length < 8) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 })
    }
    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`
    if (existing.length > 0) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 })
    }
    const password_hash = await bcrypt.hash(password, 12)
    const [user] = await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${email.toLowerCase()}, ${password_hash})
      RETURNING id, email
    `
    return NextResponse.json({ user }, { status: 201 })
  } catch (err) {
    console.error("[register]", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
