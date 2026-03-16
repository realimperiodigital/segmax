"use client";

import React from "react";
import Image from "next/image";
import SegmaxSidebar from "./segmaxsidebar";
export type { SegmaxMenuItem } from "./segmaxsidebar";
import type { SegmaxMenuItem } from "./segmaxsidebar";

type SegmaxShellProps = {
  title?: string;
  subtitle?: string;
  badge?: string;
  username?: string;
  userrole?: string;
  arealabel?: string;
  menuitems?: SegmaxMenuItem[];
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export default function SegmaxShell({
  title,
  subtitle,
  badge,
  username,
  userrole,
  arealabel,
  menuitems,
  actions,
  children,
}: SegmaxShellProps) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-black text-white">
      <SegmaxSidebar
        username={username}
        userrole={userrole}
        menuitems={menuitems}
      />

      <main className="relative flex min-w-0 flex-1 flex-col bg-gradient-to-br from-black via-[#050505] to-black">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.10),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.08),transparent_22%)]" />

          <div className="absolute left-1/2 top-1/2 h-[980px] w-[980px] -translate-x-1/2 -translate-y-1/2 opacity-[0.12]">
            <Image
              src="/segmax-logo-clean.png"
              alt="Marca d'água SegMax"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="absolute right-[-120px] top-[80px] h-[420px] w-[420px] rounded-full bg-[#d4af37]/[0.07] blur-3xl" />
          <div className="absolute bottom-[-120px] left-[80px] h-[360px] w-[360px] rounded-full bg-[#d4af37]/[0.05] blur-3xl" />
        </div>

        {(title || subtitle || actions) && (
          <header className="relative z-20 border-b border-white/10 bg-black/55 backdrop-blur-xl">
            <div className="px-8 py-6 md:px-10">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  {badge ? (
                    <span className="mb-3 inline-flex rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f3d77a]">
                      {badge}
                    </span>
                  ) : null}

                  {title ? (
                    <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                      {title}
                    </h1>
                  ) : null}

                  {subtitle ? (
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 md:text-[15px]">
                      {subtitle}
                    </p>
                  ) : null}
                </div>

                {actions ? (
                  <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                    {actions}
                  </div>
                ) : null}
              </div>
            </div>
          </header>
        )}

        <section className="relative z-10 flex-1 px-6 py-6 md:px-8 md:py-8 lg:px-10">
          <div className="mx-auto w-full max-w-[1600px] space-y-6">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}