import { getToken } from "next-auth/jwt"
import { NextResponse, type NextRequest } from "next/server"

const PROTECTED = ["/dashboard", "/report", "/reports", "/timeline", "/settings", "/admin", "/scan"]
const AUTH_PAGES = ["/auth/login", "/auth/register"]

export async function middleware(request: NextRequest) {
  // Chrome DevTools — éviter le 404
  if (request.nextUrl.pathname === "/.well-known/appspecific/com.chrome.devtools.json") {
    return new Response(null, { status: 204 })
  }

  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p))

  if (!token && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  if (token && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = "/scan"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
