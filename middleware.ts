import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Chrome DevTools demande cette URL quand les outils sont ouverts → éviter le 404
  if (request.nextUrl.pathname === "/.well-known/appspecific/com.chrome.devtools.json") {
    return new Response(null, { status: 204 })
  }
  return await updateSession(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
