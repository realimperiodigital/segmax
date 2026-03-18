import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function normalizarPermissao(valor?: string | null) {
  const v = String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (
    v === "master" ||
    v === "super master" ||
    v === "super_master" ||
    v === "supermaster"
  ) {
    return "master";
  }

  if (
    v === "tecnico" ||
    v === "tecnica" ||
    v === "diretora tecnica" ||
    v === "diretor tecnico" ||
    v === "diretora_tecnica" ||
    v === "analise tecnica" ||
    v === "analista tecnico"
  ) {
    return "diretora_tecnica";
  }

  if (
    v === "financeiro" ||
    v === "diretora financeira" ||
    v === "diretor financeiro" ||
    v === "diretora_financeira"
  ) {
    return "diretora_financeira";
  }

  if (
    v === "operacional" ||
    v === "usuario" ||
    v === "usuário" ||
    v === "corretor" ||
    v === "corretora" ||
    v === "admin_corretora"
  ) {
    return "corretor";
  }

  return "";
}

function rotaInicialPorPermissao(permissao: string) {
  if (permissao === "master") return "/dashboard";
  if (permissao === "diretora_tecnica") return "/analise-tecnica";
  if (permissao === "diretora_financeira") return "/financeiro";
  if (permissao === "corretor") return "/cotacoes";
  return "/login";
}

function podeAcessar(permissao: string, pathname: string) {
  if (permissao === "master") return true;

  if (permissao === "diretora_tecnica") {
    return (
      pathname === "/analise-tecnica" ||
      pathname.startsWith("/analise-tecnica/") ||
      pathname === "/corretoras" ||
      pathname.startsWith("/corretoras/") ||
      pathname === "/usuarios" ||
      pathname.startsWith("/usuarios/") ||
      pathname === "/cotacoes" ||
      pathname.startsWith("/cotacoes/")
    );
  }

  if (permissao === "diretora_financeira") {
    return pathname === "/financeiro" || pathname.startsWith("/financeiro/");
  }

  if (permissao === "corretor") {
    return (
      pathname === "/cotacoes" ||
      pathname.startsWith("/cotacoes/") ||
      pathname === "/clientes" ||
      pathname.startsWith("/clientes/")
    );
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (pathname === "/login") return response;
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("email, permissao")
    .eq("email", user.email)
    .maybeSingle();

  const permissao = normalizarPermissao(usuario?.permissao);
  const destino = rotaInicialPorPermissao(permissao);

  if (!permissao) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/" || pathname === "/login") {
    return NextResponse.redirect(new URL(destino, request.url));
  }

  if (!podeAcessar(permissao, pathname)) {
    return NextResponse.redirect(new URL(destino, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};