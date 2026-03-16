"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LogOut } from "lucide-react";

export type SegmaxMenuItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

type SegmaxSidebarProps = {
  menuitems: SegmaxMenuItem[];
  arealabel?: string;
  username?: string;
  userrole?: string;
  logouthref?: string;
};

export default function SegmaxSidebar({
  menuitems,
  arealabel = "PAINEL SEGMAX",
  username = "Usuário do sistema",
  userrole = "Acesso autorizado",
  logouthref = "/login",
}: SegmaxSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden xl:flex xl:w-80 xl:flex-col xl:border-r xl:border-[#d4af37]/15 xl:bg-black/90">
      <div className="border-b border-[#d4af37]/10 px-6 py-6">
        <div className="rounded-3xl border border-[#d4af37]/15 bg-[#050505] p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10">
              <img
                src="/segmax-logo.png"
                alt="SegMax"
                className="h-9 w-9 object-contain"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-wide text-[#e8c768]">
                SegMax
              </h2>
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                CRM INTELLIGENCE
              </p>
            </div>
          </div>

          <div className="inline-flex rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#e8c768]">
            {arealabel}
          </div>

          <div className="mt-5 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
            <p className="text-2xl font-semibold text-white">{username}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.30em] text-zinc-500">
              {userrole}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-5">
        {menuitems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-2xl border px-4 py-3.5 transition-all ${
                active
                  ? "border-[#d4af37]/35 bg-[#d4af37]/12 text-[#f6dc8a]"
                  : "border-white/5 bg-white/[0.02] text-zinc-300 hover:border-[#d4af37]/20 hover:bg-[#d4af37]/8 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                    active
                      ? "border-[#d4af37]/30 bg-[#d4af37]/10 text-[#e8c768]"
                      : "border-white/5 bg-white/[0.03] text-zinc-400"
                  }`}
                >
                  <Icon size={18} />
                </div>

                <span className="text-sm font-medium">{item.label}</span>
              </div>

              <ChevronRight size={16} />
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#d4af37]/10 p-4">
        <Link
          href={logouthref}
          className="flex items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3.5 text-red-300 transition hover:bg-red-500/15"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
              <LogOut size={18} />
            </div>

            <span className="text-sm font-medium">Sair do sistema</span>
          </div>

          <ChevronRight size={16} />
        </Link>
      </div>
    </aside>
  );
}