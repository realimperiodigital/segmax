"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  ClipboardList,
  FileText,
  Home,
  SearchCheck,
  Shield,
  Users,
  Wallet,
  Briefcase,
  UserCog,
} from "lucide-react"

export type SegmaxRole =
  | "master"
  | "diretora_tecnica"
  | "diretora_financeira"
  | "corretora_admin"
  | "corretor"
  | "usuario"
  | "tecnico"
  | "financeiro"

type NavItem = {
  href: string
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  exact?: boolean
}

type SegmaxSidebarProps = {
  role: SegmaxRole | string
  profileName?: string
  name?: string
  profileLabel?: string
  label?: string
}

function normalizeRole(role: string): SegmaxRole | string {
  const value = String(role || "").trim().toLowerCase()

  if (value === "tecnico") return "diretora_tecnica"
  if (value === "financeiro") return "diretora_financeira"

  return value
}

function getProfileLabel(role: string) {
  const normalized = normalizeRole(role)

  switch (normalized) {
    case "master":
      return "SUPER MASTER"
    case "diretora_tecnica":
      return "DIRETORA TÉCNICA"
    case "diretora_financeira":
      return "DIRETORA FINANCEIRA"
    case "corretora_admin":
      return "CORRETORA ADMIN"
    case "corretor":
      return "CORRETOR"
    case "usuario":
      return "USUÁRIO"
    default:
      return "USUÁRIO"
  }
}

function getNavItemsByRole(role: string): NavItem[] {
  const normalized = normalizeRole(role)

  if (normalized === "master") {
    return [
      {
        href: "/dashboard/master",
        label: "Centro de Controle",
        description: "Painel principal",
        icon: Home,
        exact: true,
      },
      {
        href: "/dashboard/master/corretoras",
        label: "Corretoras",
        description: "Gestão estrutural",
        icon: Building2,
      },
      {
        href: "/dashboard/master/usuarios",
        label: "Usuários",
        description: "Acessos e perfis",
        icon: Users,
      },
      {
        href: "/dashboard/master/clientes",
        label: "Clientes",
        description: "Base comercial",
        icon: Briefcase,
      },
      {
        href: "/dashboard/master/cotacoes",
        label: "Cotações",
        description: "Fluxo operacional",
        icon: ClipboardList,
      },
      {
        href: "/dashboard/master/analises",
        label: "Análise Técnica",
        description: "Pareceres e revisão",
        icon: SearchCheck,
      },
      {
        href: "/dashboard/master/propostas",
        label: "Propostas",
        description: "Área comercial",
        icon: FileText,
      },
      {
        href: "/dashboard/master/financeiro",
        label: "Financeiro",
        description: "Controle financeiro",
        icon: Wallet,
      },
      {
        href: "/dashboard/master/aprovacoes-exclusao",
        label: "Aprovações",
        description: "Exclusões pendentes",
        icon: Shield,
      },
      {
        href: "/dashboard/master/auditoria",
        label: "Auditoria",
        description: "Logs completos",
        icon: UserCog,
      },
    ]
  }

  if (normalized === "diretora_tecnica") {
    return [
      {
        href: "/dashboard/tecnico",
        label: "Centro Técnico",
        description: "Painel principal",
        icon: Home,
        exact: true,
      },
      {
        href: "/dashboard/tecnico/analises",
        label: "Análise Técnica",
        description: "Fila técnica",
        icon: SearchCheck,
      },
      {
        href: "/dashboard/tecnico/clientes",
        label: "Clientes",
        description: "Consulta técnica",
        icon: Briefcase,
      },
      {
        href: "/dashboard/tecnico/corretoras",
        label: "Corretoras",
        description: "Parceiros da operação",
        icon: Building2,
      },
      {
        href: "/dashboard/tecnico/seguradoras",
        label: "Seguradoras",
        description: "Mercado e produtos",
        icon: Shield,
      },
      {
        href: "/dashboard/tecnico/cotacoes",
        label: "Cotações",
        description: "Análises em andamento",
        icon: ClipboardList,
      },
      {
        href: "/dashboard/tecnico/propostas",
        label: "Propostas",
        description: "Fluxo técnico",
        icon: FileText,
      },
    ]
  }

  if (normalized === "diretora_financeira") {
    return [
      {
        href: "/dashboard/financeiro",
        label: "Centro Financeiro",
        description: "Painel principal",
        icon: Home,
        exact: true,
      },
      {
        href: "/dashboard/financeiro/painel",
        label: "Painel",
        description: "Visão financeira",
        icon: Wallet,
      },
      {
        href: "/dashboard/financeiro/corretoras",
        label: "Corretoras",
        description: "Acompanhamento",
        icon: Building2,
      },
      {
        href: "/dashboard/financeiro/clientes",
        label: "Clientes",
        description: "Base operacional",
        icon: Briefcase,
      },
      {
        href: "/dashboard/financeiro/cotacoes",
        label: "Cotações",
        description: "Fluxo comercial",
        icon: ClipboardList,
      },
      {
        href: "/dashboard/financeiro/propostas",
        label: "Propostas",
        description: "Pipeline e repasses",
        icon: FileText,
      },
    ]
  }

  if (normalized === "corretora_admin") {
    return [
      {
        href: "/dashboard/corretora",
        label: "Centro de Controle",
        description: "Painel da corretora",
        icon: Home,
        exact: true,
      },
      {
        href: "/dashboard/corretora/clientes",
        label: "Clientes",
        description: "Carteira da corretora",
        icon: Briefcase,
      },
      {
        href: "/dashboard/corretora/cotacoes",
        label: "Cotações",
        description: "Fluxo comercial",
        icon: ClipboardList,
      },
      {
        href: "/dashboard/corretora/usuarios",
        label: "Usuários",
        description: "Equipe da corretora",
        icon: Users,
      },
      {
        href: "/dashboard/corretora/propostas",
        label: "Propostas",
        description: "Acompanhamento",
        icon: FileText,
      },
    ]
  }

  return [
    {
      href: "/dashboard/usuario",
      label: "Centro de Controle",
      description: "Painel principal",
      icon: Home,
      exact: true,
    },
    {
      href: "/dashboard/usuario/clientes",
      label: "Clientes",
      description: "Base do usuário",
      icon: Briefcase,
    },
    {
      href: "/dashboard/usuario/cotacoes",
      label: "Cotações",
      description: "Fluxo operacional",
      icon: ClipboardList,
    },
  ]
}

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

function Item({
  item,
  pathname,
}: {
  item: NavItem
  pathname: string
}) {
  const active = isActive(pathname, item.href, item.exact)
  const Icon = item.icon ?? Home

  return (
    <Link
      href={item.href}
      className={[
        "group flex items-center justify-between rounded-2xl border px-4 py-4 transition",
        active
          ? "border-yellow-500/40 bg-yellow-500/10"
          : "border-zinc-800 bg-zinc-950 hover:border-yellow-500/20 hover:bg-zinc-900",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={[
            "mt-0.5 rounded-xl p-2",
            active ? "bg-yellow-500/15 text-yellow-400" : "bg-zinc-900 text-zinc-400",
          ].join(" ")}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <div
            className={[
              "truncate text-base font-semibold",
              active ? "text-white" : "text-zinc-100",
            ].join(" ")}
          >
            {item.label}
          </div>

          {item.description ? (
            <div className="mt-1 text-sm text-zinc-500">{item.description}</div>
          ) : null}
        </div>
      </div>

      <span
        className={[
          "text-lg transition",
          active ? "text-yellow-400" : "text-zinc-500 group-hover:text-zinc-300",
        ].join(" ")}
      >
        ›
      </span>
    </Link>
  )
}

export default function SegmaxSidebar({
  role,
  profileName,
  name,
  profileLabel,
  label,
}: SegmaxSidebarProps) {
  const pathname = usePathname()
  const items = getNavItemsByRole(role)
  const displayName = profileName || name || "Usuário"
  const displayLabel = profileLabel || label || getProfileLabel(role)

  return (
    <aside className="w-full max-w-[280px] border-r border-zinc-900 bg-black px-5 py-6">
      <div className="rounded-[28px] border border-yellow-500/20 bg-zinc-950 p-4">
        <div className="flex justify-center rounded-[20px] bg-black p-5">
          <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-yellow-500/20 bg-zinc-950 text-center">
            <div>
              <div className="text-4xl font-black tracking-tight text-yellow-400">SM</div>
              <div className="mt-1 text-sm font-semibold tracking-[0.25em] text-zinc-300">
                SEGMAX
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-zinc-800 bg-black p-4">
          <div className="text-xs uppercase tracking-[0.35em] text-zinc-500">
            Perfil conectado
          </div>

          <div className="mt-4 text-[20px] font-bold text-white">{displayName}</div>

          <div className="mt-2 text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
            {displayLabel}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 text-xs uppercase tracking-[0.35em] text-zinc-500">
          Navegação
        </div>

        <nav className="space-y-3">
          {items.map((item) => (
            <Item key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>
      </div>
    </aside>
  )
}