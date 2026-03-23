import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {

  const { pathname } = request.nextUrl

  // rotas públicas
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next()
  }

  // aqui deixamos o controle real
  // para o dashboard/page.tsx

  return NextResponse.next()

}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}