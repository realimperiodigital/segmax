"use client";

import type { ReactNode } from "react";
import SegmaxSidebar, { type SegmaxMenuItem } from "@/components/segmaxsidebar";

type SegmaxShellProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  username?: string;
  userrole?: string;
  arealabel?: string;
  menuitems: SegmaxMenuItem[];
  actions?: ReactNode;
  children: ReactNode;
};

export default function SegmaxShell({
  title,
  subtitle = "Painel estratégico da operação SegMax",
  badge = "SEGMAX CONTROL",
  username = "Usuário",
  userrole = "Acesso autorizado",
  arealabel = "PAINEL SEGMAX",
  menuitems,
  actions,
  children,
}: SegmaxShellProps) {
  return (
    <div className="min-h-screen bg-[#040404] text-white">
      <div className="flex min-h-screen">
        <SegmaxSidebar
          menuitems={menuitems}
          arealabel={arealabel}
          username={username}
          userrole={userrole}
        />

        <main className="relative flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]">
            <img
              src="/segmax-logo.png"
              alt="Marca d'água SegMax"
              className="w-[500px] object-contain"
            />
          </div>

          <header className="border-b border-[#d4af37]/10 bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col gap-5 px-6 py-6 md:px-10">
              <div className="inline-flex rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#e8c768]">
                {badge}
              </div>

              <h1 className="text-4xl font-black leading-none tracking-tight md:text-6xl">
                {title}
              </h1>

              <p className="max-w-3xl text-lg text-zinc-400">{subtitle}</p>

              {actions ? (
                <div className="flex flex-wrap gap-3">{actions}</div>
              ) : null}
            </div>
          </header>

          <section className="relative z-10 px-6 py-8 md:px-10">
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}