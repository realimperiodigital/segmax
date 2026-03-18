"use client";

import { ReactNode } from "react";
import SegmaxSidebar from "./segmaxsidebar";

type SegmaxShellProps = {
  children: ReactNode;
  nome?: string;
  perfilLabel?: string;
  permissao?: string;
  username?: string;
  userrole?: string;
  menuitems?: unknown;
};

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

function labelPerfil(permissao?: string) {
  const p = normalizarPermissao(permissao);

  if (p === "master") return "SUPER MASTER";
  if (p === "diretora_tecnica") return "DIRETORA TÉCNICA";
  if (p === "diretora_financeira") return "DIRETORA FINANCEIRA";
  return "CORRETOR";
}

export default function SegmaxShell({
  children,
  nome,
  perfilLabel,
  permissao,
  username,
  userrole,
}: SegmaxShellProps) {
  const nomeFinal = nome || username || "Usuário";
  const permissaoFinal = permissao || userrole || "";
  const perfilFinal = perfilLabel || labelPerfil(permissaoFinal);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen">
        <SegmaxSidebar
          nome={nomeFinal}
          perfilLabel={perfilFinal}
          permissao={permissaoFinal}
        />

        <main className="flex-1 overflow-x-hidden">
          <section className="relative z-10 px-6 py-6 md:px-8 md:py-8 lg:px-10">
            <div className="mx-auto w-full max-w-[1600px] space-y-6">
              {children}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}