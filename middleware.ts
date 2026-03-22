import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rotasPublicas = [
    "/",
    "/login",
  ];

  const isArquivoPublico =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public") ||
    pathname.includes(".");

  if (isArquivoPublico) {
    return NextResponse.next();
  }

  const isPublica = rotasPublicas.some((rota) => pathname === rota);

  if (isPublica) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api).*)"],
};