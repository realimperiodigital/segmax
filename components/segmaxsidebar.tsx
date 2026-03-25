"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  ClipboardList,
  FileCheck2,
  FileText,
  ShieldCheck,
  Users,
  UserSquare2,
  Wallet,
  History,
} from "lucide-react";

type SegmaxSidebarProps = {
  role: "master" | "financeiro" | "tecnico" | "corretora" | "usuario";
};

type MenuItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function SegmaxSidebar({ role }: SegmaxSidebarProps) {
  const pathname = usePathname();

  const masterItems: MenuItem[] = [
    {
      label: "Centro de Controle",
      href: "/dashboard/master",
      icon: BarChart3,
      subtitle: "Painel principal",
    },
    {
      label: "Corretoras",
      href: "/corretoras",
      icon: Building2,
      subtitle: "Gestão estrutural",
    },
    {
      label: "Usuários",
      href: "/usuarios",
      icon: Users,
      subtitle: "Acessos e perfis",
    },
    {
      label: "Seguradoras",
      href: "/seguradoras",
      icon: ShieldCheck,
      subtitle: "Base seguradoras",
    },
    {
      label: "Clientes",
      href: "/clientes",
      icon: UserSquare2,
      subtitle: "Base comercial",
    },
    {
      label: "Cotações",
      href: "/cotacoes",
      icon: ClipboardList,
      subtitle: "Fluxo operacional",
    },
    {
      label: "Análise Técnica",
      href: "/analise-tecnica",
      icon: FileCheck2,
      subtitle: "Pareceres e revisão",
    },
    {
      label: "Propostas",
      href: "/propostas",
      icon: FileText,
      subtitle: "Área comercial",
    },
    {
      label: "Financeiro",
      href: "/dashboard/financeiro",
      icon: Wallet,
      subtitle: "Controle financeiro",
    },
    {
      label: "Aprovações",
      href: "/aprovacoes-exclusao",
      icon: ShieldCheck,
      subtitle: "Exclusões pendentes",
    },
    {
      label: "Auditoria",
      href: "/exclusoes-historico",
      icon: History,
      subtitle: "Logs completos",
    },
  ];

  const tecnicoItems: MenuItem[] = [
    {
      label: "Painel Técnico",
      href: "/dashboard/tecnico",
      icon: BarChart3,
      subtitle: "Visão técnica",
    },
    {
      label: "Análise Técnica",
      href: "/analise-tecnica",
      icon: FileCheck2,
      subtitle: "Pareceres e revisão",
    },
    {
      label: "Cotações",
      href: "/cotacoes",
      icon: ClipboardList,
      subtitle: "Fluxo operacional",
    },
    {
      label: "Propostas",
      href: "/propostas",
      icon: FileText,
      subtitle: "Área comercial",
    },
    {
      label: "Corretoras",
      href: "/corretoras",
      icon: Building2,
      subtitle: "Consulta estrutural",
    },
    {
      label: "Usuários",
      href: "/usuarios",
      icon: Users,
      subtitle: "Consulta acessos",
    },
  ];

  const financeiroItems: MenuItem[] = [
    {
      label: "Painel Financeiro",
      href: "/dashboard/financeiro",
      icon: BarChart3,
      subtitle: "Visão financeira",
    },
    {
      label: "Corretoras",
      href: "/corretoras",
      icon: Building2,
      subtitle: "Consulta estrutural",
    },
    {
      label: "Usuários",
      href: "/usuarios",
      icon: Users,
      subtitle: "Consulta acessos",
    },
    {
      label: "Propostas",
      href: "/propostas",
      icon: FileText,
      subtitle: "Acompanhamento",
    },
  ];

  const corretoraItems: MenuItem[] = [
    {
      label: "Painel Corretora",
      href: "/dashboard/corretora",
      icon: BarChart3,
      subtitle: "Visão da corretora",
    },
    {
      label: "Usuários",
      href: "/usuarios",
      icon: Users,
      subtitle: "Equipe cadastrada",
    },
    {
      label: "Clientes",
      href: "/clientes",
      icon: UserSquare2,
      subtitle: "Base comercial",
    },
    {
      label: "Cotações",
      href: "/cotacoes",
      icon: ClipboardList,
      subtitle: "Fluxo operacional",
    },
    {
      label: "Propostas",
      href: "/propostas",
      icon: FileText,
      subtitle: "Área comercial",
    },
  ];

  const usuarioItems: MenuItem[] = [
    {
      label: "Meu Painel",
      href: "/dashboard/usuario",
      icon: BarChart3,
      subtitle: "Visão resumida",
    },
    {
      label: "Clientes",
      href: "/clientes",
      icon: UserSquare2,
      subtitle: "Minha base",
    },
    {
      label: "Cotações",
      href: "/cotacoes",
      icon: ClipboardList,
      subtitle: "Minhas cotações",
    },
    {
      label: "Propostas",
      href: "/propostas",
      icon: FileText,
      subtitle: "Minhas propostas",
    },
  ];

  const menuMap: Record<SegmaxSidebarProps["role"], MenuItem[]> = {
    master: masterItems,
    tecnico: tecnicoItems,
    financeiro: financeiroItems,
    corretora: corretoraItems,
    usuario: usuarioItems,
  };

  const items = menuMap[role] ?? masterItems;

  return (
    <aside className="w-[100px] min-h-screen border-r border-zinc-800 bg-black px-2 py-3">
      <div className="mb-4 flex flex-col items-center">
        <div className="mb-2 flex h-[58px] w-[58px] items-center justify-center rounded-xl border border-amber-500/40 bg-zinc-950 shadow-[0_0_20px_rgba(245,158,11,0.10)]">
          <div className="text-center leading-none">
            <div className="text-[11px] font-bold tracking-wide text-amber-400">
              SM
            </div>
            <div className="mt-1 text-[6px] tracking-[0.25em] text-zinc-500">
              SEGMAX
            </div>
          </div>
        </div>

        <div className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-2 py-2">
          <div className="mb-1 text-[6px] uppercase tracking-[0.28em] text-zinc-500">
            Perfil conectado
          </div>
          <div className="text-[10px] font-semibold text-white">Usuário</div>
          <div className="text-[8px] uppercase tracking-[0.18em] text-amber-400">
            {role === "master"
              ? "Super Master"
              : role === "tecnico"
                ? "Técnico"
                : role === "financeiro"
                  ? "Financeiro"
                  : role === "corretora"
                    ? "Corretora"
                    : "Usuário"}
          </div>
        </div>
      </div>

      <div className="mb-2 px-1 text-[6px] uppercase tracking-[0.28em] text-zinc-500">
        Navegação
      </div>

      <nav className="flex flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cx(
                "group rounded-xl border px-2 py-2 transition-all",
                active
                  ? "border-amber-500/70 bg-amber-500/10 shadow-[0_0_18px_rgba(245,158,11,0.10)]"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900"
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cx(
                    "flex h-6 w-6 items-center justify-center rounded-lg border",
                    active
                      ? "border-amber-500/40 bg-amber-500/10"
                      : "border-zinc-800 bg-black"
                  )}
                >
                  <Icon
                    className={cx(
                      "h-3.5 w-3.5",
                      active ? "text-amber-400" : "text-zinc-400"
                    )}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className={cx(
                      "truncate text-[8px] font-semibold",
                      active ? "text-white" : "text-zinc-200"
                    )}
                  >
                    {item.label}
                  </div>
                  <div className="truncate text-[6px] text-zinc-500">
                    {item.subtitle || ""}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}