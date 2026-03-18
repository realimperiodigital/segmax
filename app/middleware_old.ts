import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rotasProtegidas = [
  "/dashboard",
  "/master",
  "/clientes",
  "/corretoras",
  "/usuarios",
  "/cotacoes",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const acessandoRotaProtegida = rotasProtegidas.some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`)
  );

  const token =
    request.cookies.get("sb-access-token")?.value ||
    request.cookies.get("sb-refresh-token")?.value ||
    request.cookies.get("supabase-auth-token")?.value;

  if (acessandoRotaProtegida && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/master/:path*",
    "/clientes/:path*",
    "/corretoras/:path*",
    "/usuarios/:path*",
    "/cotacoes/:path*",
  ],
};