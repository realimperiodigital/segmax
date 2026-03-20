"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import {
  SegmaxRole,
  normalizarRole,
  podeAcessarModulo,
} from "@/lib/permissoes"
import { limparSessaoSegmax } from "@/lib/logout"

export type SegmaxMenuItem = {
  label: string
  href: string
  helper?: string
  exact?: boolean
  modulo?:
    | "master"
    | "corretora"
    | "financeiro"
    | "analise-tecnica"
    | "corretoras"
    | "usuarios"
    | "clientes"
    | "cotacoes"
    | "seguradoras"
    | "simulacoes"
}

type SegmaxShellProps = {
  children: React.ReactNode

  // NOVO FORMATO
  role?: SegmaxRole
  nome?: string
  perfilLabel?: string
  permissao?: string

  // FORMATO ANTIGO
  title?: string
  subtitle?: string
  badge?: string
  username?: string
  userrole?: string
  menuitems?: SegmaxMenuItem[]
  actions?: React.ReactNode
}

type ProfileData = {
  name: string
  label: string
  role: SegmaxRole
}

export default function SegmaxShell({
  children,
  role,
  nome,
  perfilLabel,
  permissao,
  title,
  subtitle,
  badge,
  username,
  userrole,
  menuitems,
  actions,
}: SegmaxShellProps) {
  const pathname = usePathname()

  const resolvedRole = resolveRole(
    pathname,
    role,
    permissao || userrole,
    perfilLabel || userrole
  )

  const profile = getProfileData({
    resolvedRole,
    nome: nome || username,
    perfilLabel: perfilLabel || userrole,
  })

  const itensBase = (menuitems && menuitems.length > 0
    ? menuitems
    : getNavItemsByRole(resolvedRole)
  ).filter((item) => {
    if (!item.modulo) return true
    return podeAcessarModulo(resolvedRole, item.modulo)
  })

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-[290px] shrink-0 border-r border-[#151515] bg-black xl:flex xl:flex-col">
          <div className="px-5 pb-6 pt-6">
            <div className="rounded-[28px] border border-[#3a2a00] bg-[#050505] p-5">
              <div className="flex items-center justify-center py-3">
                <img
                  src="/logo.png"
                  alt="SegMax"
                  className="h-16 w-auto object-contain"
                  onError={(e) => {
                    ;(e.currentTarget as HTMLImageElement).src = "/favicon.ico"
                  }}
                />
              </div>

              <div className="mt-5 rounded-[22px] border border-zinc-800 bg-black p-4">
                <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">
                  Perfil conectado
                </p>

                <h3 className="mt-3 text-[19px] font-bold">{profile.name}</h3>

                <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.28em] text-[#d4a828]">
                  {profile.label}
                </p>
              </div>
            </div>
          </div>

          <div className="px-5">
            <p className="mb-4 text-[11px] uppercase tracking-[0.35em] text-zinc-500">
              Navegação
            </p>

            <nav className="space-y-3">
              {itensBase.map((item) => {
                const active = isActive(pathname, item.href, item.exact)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between rounded-[20px] border px-4 py-4 transition ${
                      active
                        ? "border-[#d4a828] bg-[#1a1303]"
                        : "border-zinc-800 bg-[#05070b] hover:border-[#4a3500]"
                    }`}
                  >
                    <div>
                      <p className="text-[17px] font-semibold">{item.label}</p>

                      <p className="mt-1 text-sm text-zinc-500">
                        {active ? "Tela atual" : item.helper || "Acessar módulo"}
                      </p>
                    </div>

                    <ChevronRight size={18} />
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="mt-auto px-5 pb-5 pt-8 space-y-4">
            <button
              onClick={() => {
                const confirmar = confirm("Deseja sair do sistema?")
                if (!confirmar) return

                limparSessaoSegmax()
                window.location.href = "/login"
              }}
              className="w-full rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
            >
              Sair do sistema
            </button>

            <div className="rounded-[20px] border border-zinc-900 bg-[#050505] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#4a3500] bg-[#1a1303] text-[#d4a828]">
                  ✦
                </div>
                <div>
                  <p className="text-sm font-semibold">Base SegMax</p>
                  <p className="text-xs text-zinc-500">
                    Estrutura premium ativa
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {title || subtitle || badge || actions ? (
            <div className="px-6 py-8 md:px-8">
              <section className="rounded-[28px] border border-[#3a2a00] bg-[#050505] p-7">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div className="max-w-4xl">
                    {badge ? (
                      <div className="mb-4 inline-flex rounded-full border border-[#4a3500] bg-[#1a1303] px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#d4a828]">
                        {badge}
                      </div>
                    ) : null}

                    {title ? (
                      <h1 className="text-4xl font-bold">{title}</h1>
                    ) : null}

                    {subtitle ? (
                      <p className="mt-3 max-w-3xl text-zinc-400">
                        {subtitle}
                      </p>
                    ) : null}
                  </div>

                  {actions ? <div>{actions}</div> : null}
                </div>
              </section>

              <div className="mt-6">{children}</div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  )
}

function resolveRole(
  pathname: string,
  forcedRole?: SegmaxRole,
  permissao?: string,
  perfilLabel?: string
): SegmaxRole {
  if (forcedRole) return forcedRole

  const p = normalizarRole(permissao)
  const l = normalizarRole(perfilLabel)

  if (p !== "usuario") return p
  if (l !== "usuario") return l

  if (pathname.startsWith("/dashboard/master")) return "master"
  if (pathname.startsWith("/dashboard/corretora")) return "master_corretora"
  if (pathname.startsWith("/financeiro")) return "financeiro"
  if (pathname.startsWith("/analise-tecnica")) return "tecnico"

  return "usuario"
}

function getProfileData({
  resolvedRole,
  nome,
  perfilLabel,
}: {
  resolvedRole: SegmaxRole
  nome?: string
  perfilLabel?: string
}): ProfileData {
  if (nome || perfilLabel) {
    return {
      name: nome || "Usuário",
      label: perfilLabel || "Perfil",
      role: resolvedRole,
    }
  }

  if (resolvedRole === "master") {
    return {
      name: "Renato Silva",
      label: "Super Master",
      role: "master",
    }
  }

  if (resolvedRole === "master_corretora") {
    return {
      name: "Master da Corretora",
      label: "Gestor da Corretora",
      role: "master_corretora",
    }
  }

  if (resolvedRole === "financeiro") {
    return {
      name: "Alessandra Mendes",
      label: "Diretora Financeira",
      role: "financeiro",
    }
  }

  if (resolvedRole === "tecnico") {
    return {
      name: "Ana Paula",
      label: "Diretora Técnica",
      role: "tecnico",
    }
  }

  if (resolvedRole === "corretor") {
    return {
      name: "Corretor",
      label: "Operação Comercial",
      role: "corretor",
    }
  }

  if (resolvedRole === "vendedor") {
    return {
      name: "Vendedor",
      label: "Operação Comercial",
      role: "vendedor",
    }
  }

  return {
    name: "Usuário",
    label: "Corretor",
    role: "usuario",
  }
}

function getNavItemsByRole(role: SegmaxRole): SegmaxMenuItem[] {
  if (role === "master") {
    return [
      {
        label: "Master",
        href: "/dashboard/master",
        helper: "Visão executiva",
        modulo: "master",
        exact: true,
      },
      {
        label: "Aprovações",
        href: "/dashboard/master/aprovacoes-exclusao",
        helper: "Exclusões pendentes",
        modulo: "master",
      },
      {
        label: "Auditoria",
        href: "/dashboard/master/auditoria",
        helper: "Logs completos",
        modulo: "master",
      },
      {
        label: "Corretoras",
        href: "/corretoras",
        helper: "Acessar módulo",
        modulo: "corretoras",
      },
      {
        label: "Usuários",
        href: "/usuarios",
        helper: "Acessar módulo",
        modulo: "usuarios",
      },
      {
        label: "Clientes",
        href: "/clientes",
        helper: "Acessar módulo",
        modulo: "clientes",
      },
      {
        label: "Cotações",
        href: "/cotacoes",
        helper: "Acessar módulo",
        modulo: "cotacoes",
      },
      {
        label: "Seguradoras",
        href: "/seguradoras",
        helper: "Acessar módulo",
        modulo: "seguradoras",
      },
      {
        label: "Financeiro",
        href: "/financeiro",
        helper: "Acessar módulo",
        modulo: "financeiro",
      },
      {
        label: "Análise Técnica",
        href: "/analise-tecnica",
        helper: "Acessar módulo",
        modulo: "analise-tecnica",
      },
    ]
  }

  if (role === "master_corretora") {
    return [
      {
        label: "Corretora",
        href: "/dashboard/corretora",
        helper: "Painel da corretora",
        modulo: "corretora",
        exact: true,
      },
      {
        label: "Aprovações",
        href: "/dashboard/corretora/aprovacoes-exclusao",
        helper: "Exclusões pendentes",
        modulo: "corretora",
      },
      {
        label: "Usuários",
        href: "/usuarios",
        helper: "Gerenciar equipe",
        modulo: "usuarios",
      },
      {
        label: "Clientes",
        href: "/clientes",
        helper: "Gerenciar base",
        modulo: "clientes",
      },
      {
        label: "Cotações",
        href: "/cotacoes",
        helper: "Gerenciar cotações",
        modulo: "cotacoes",
      },
      {
        label: "Seguradoras",
        href: "/seguradoras",
        helper: "Consulta de mercado",
        modulo: "seguradoras",
      },
    ]
  }

  if (role === "tecnico") {
    return [
      {
        label: "Análise Técnica",
        href: "/analise-tecnica",
        helper: "Tela atual",
        modulo: "analise-tecnica",
        exact: true,
      },
      {
        label: "Clientes",
        href: "/clientes",
        helper: "Acessar módulo",
        modulo: "clientes",
      },
      {
        label: "Seguradoras",
        href: "/seguradoras",
        helper: "Acessar módulo",
        modulo: "seguradoras",
      },
      {
        label: "Corretoras",
        href: "/corretoras",
        helper: "Acessar módulo",
        modulo: "corretoras",
      },
      {
        label: "Usuários",
        href: "/usuarios",
        helper: "Acessar módulo",
        modulo: "usuarios",
      },
      {
        label: "Cotações",
        href: "/cotacoes",
        helper: "Acessar módulo",
        modulo: "cotacoes",
      },
    ]
  }

  if (role === "financeiro") {
    return [
      {
        label: "Financeiro",
        href: "/financeiro",
        helper: "Tela atual",
        modulo: "financeiro",
        exact: true,
      },
      {
        label: "Corretoras",
        href: "/corretoras",
        helper: "Acessar módulo",
        modulo: "corretoras",
      },
      {
        label: "Usuários",
        href: "/usuarios",
        helper: "Acessar módulo",
        modulo: "usuarios",
      },
      {
        label: "Seguradoras",
        href: "/seguradoras",
        helper: "Acessar módulo",
        modulo: "seguradoras",
      },
    ]
  }

  if (role === "corretor" || role === "vendedor") {
    return [
      {
        label: "Clientes",
        href: "/clientes",
        helper: "Acessar módulo",
        modulo: "clientes",
        exact: true,
      },
      {
        label: "Cotações",
        href: "/cotacoes",
        helper: "Acessar módulo",
        modulo: "cotacoes",
      },
    ]
  }

  return [
    {
      label: "Clientes",
      href: "/clientes",
      helper: "Acessar módulo",
      modulo: "clientes",
      exact: true,
    },
    {
      label: "Cotações",
      href: "/cotacoes",
      helper: "Acessar módulo",
      modulo: "cotacoes",
    },
  ]
}

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}