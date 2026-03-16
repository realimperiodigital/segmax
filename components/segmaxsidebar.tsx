"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  ChevronRight,
  ClipboardList,
  FileSpreadsheet,
  Home,
  LogOut,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

export type SegmaxMenuItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
  exact?: boolean;
};

type SegmaxSidebarProps = {
  username?: string;
  userrole?: string;
  menuitems?: SegmaxMenuItem[];
};

const defaultMenuItems: SegmaxMenuItem[] = [
  { label: "Centro de Controle", href: "/dashboard", icon: Home, exact: true },
  { label: "Corretoras", href: "/corretoras", icon: Building2 },
  { label: "Usuários", href: "/usuarios", icon: UserCog },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Seguradoras", href: "/seguradoras", icon: ShieldCheck },
  { label: "Cotações", href: "/cotacoes", icon: FileSpreadsheet },
  { label: "Análise Técnica", href: "/analise-tecnica", icon: ClipboardList },
  { label: "Financeiro", href: "/financeiro", icon: BarChart3 },
];

function isItemActive(pathname: string, item: SegmaxMenuItem) {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function SegmaxSidebar({
  username = "Renato",
  userrole = "Super Master",
  menuitems,
}: SegmaxSidebarProps) {
  const pathname = usePathname();
  const items = menuitems && menuitems.length > 0 ? menuitems : defaultMenuItems;

  return (
    <aside className="hidden w-[340px] shrink-0 border-r border-[#d4af37]/15 bg-[#020202] xl:flex xl:flex-col">
      <div className="flex h-full flex-col px-6 py-6">

        {/* CARD DA LOGO */}
        <div className="mb-6 rounded-[28px] border border-[#d4af37]/20 bg-gradient-to-b from-[#0c0c0c] to-[#050505] p-6 shadow-[0_0_35px_rgba(0,0,0,0.45)]">

          {/* LOGO MAIOR */}
          <div className="relative w-full h-[140px]">
            <Image
              src="/segmax-logo-clean.png"
              alt="SegMax"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* PERFIL */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
              Perfil conectado
            </p>

            <p className="mt-2 text-sm font-semibold text-white">
              {username}
            </p>

            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-zinc-400">
              {userrole}
            </p>
          </div>

        </div>

        {/* NAVEGAÇÃO */}
        <div>
          <p className="px-2 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
            Navegação
          </p>

          <nav className="mt-4 space-y-2">
            {items.map((item) => {
              const active = isItemActive(pathname, item);
              const Icon = item.icon ?? ChevronRight;

              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  className={[
                    "group flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-200",
                    active
                      ? "border-[#d4af37]/30 bg-gradient-to-r from-[#d4af37]/14 to-transparent text-white"
                      : "border-transparent bg-transparent text-zinc-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-200",
                      active
                        ? "border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]"
                        : "border-white/10 bg-white/[0.03] text-zinc-500 group-hover:text-white",
                    ].join(" ")}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={[
                        "truncate text-sm font-medium",
                        active ? "text-white" : "text-zinc-300 group-hover:text-white",
                      ].join(" ")}
                    >
                      {item.label}
                    </p>

                    <p
                      className={[
                        "mt-0.5 text-[11px]",
                        active ? "text-[#f3d77a]/75" : "text-zinc-500",
                      ].join(" ")}
                    >
                      {active ? "Tela atual" : "Acessar módulo"}
                    </p>
                  </div>

                  <ChevronRight
                    size={16}
                    className={active ? "text-[#d4af37]/80" : "text-zinc-600"}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* SAIR */}
        <div className="mt-auto pt-6">
          <Link
            href="/login"
            className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-red-200 transition-all duration-200 hover:border-red-400/30 hover:bg-red-500/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-300">
              <LogOut size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-none">
                Sair do sistema
              </p>

              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-red-300/70">
                encerrar sessão
              </p>
            </div>

            <ChevronRight size={16} className="text-red-300/70" />
          </Link>
        </div>

      </div>
    </aside>
  );
}