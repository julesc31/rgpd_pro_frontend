import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { downloadFromR2 } from "@/lib/r2"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const key = searchParams.get("key")
  if (!key) {
    return NextResponse.json({ error: "Paramètre key manquant" }, { status: 400 })
  }
  try {
    const blob = await downloadFromR2(key)
    const ext = key.split(".").pop()?.toLowerCase()
    const contentType =
      ext === "pdf" ? "application/pdf" :
      ext === "zip" ? "application/zip" :
      "application/octet-stream"
    return new NextResponse(blob, { headers: { "Content-Type": contentType } })
  } catch (err) {
    console.error("[r2/download]", err)
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 })
  }
}
