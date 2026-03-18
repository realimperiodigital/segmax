"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  permissao?: string;
  nome?: string;
  perfilLabel?: string;
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

function Item({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const ativo = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`group flex items-center justify-between rounded-2xl border px-4 py-4 transition ${
        ativo
          ? "border-yellow-600 bg-yellow-500/10 text-yellow-400"
          : "border-zinc-800 bg-zinc-950 text-zinc-200 hover:border-yellow-700 hover:text-yellow-400"
      }`}
    >
      <div>
        <div className="text-base font-medium">{label}</div>
        <div className={`text-sm ${ativo ? "text-yellow-500" : "text-zinc-500"}`}>
          {ativo ? "Tela atual" : "Acessar módulo"}
        </div>
      </div>

      <span className={ativo ? "text-yellow-400" : "text-zinc-600"}>›</span>
    </Link>
  );
}

export default function SegmaxSidebar({
  permissao = "",
  nome = "Usuário",
  perfilLabel = "Perfil",
}: Props) {
  const role = normalizarPermissao(permissao);

  return (
    <aside className="w-full max-w-[320px] min-h-screen border-r border-zinc-900 bg-black text-white">
      <div className="p-6">
        <div className="rounded-3xl border border-yellow-700/30 bg-zinc-950 p-6">
          <div className="mb-6 flex justify-center">
            <img
              src="/logo-segmax.png"
              alt="SegMax"
              className="h-20 w-auto object-contain"
            />
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black p-4">
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-zinc-500">
              Perfil conectado
            </p>
            <h3 className="text-xl font-semibold text-white">{nome}</h3>
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-yellow-500">
              {perfilLabel}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-zinc-500">
            Navegação
          </p>

          <nav className="space-y-3">
            {role === "master" && (
              <>
                <Item href="/dashboard" label="Centro de Controle" />
                <Item href="/corretoras" label="Corretoras" />
                <Item href="/usuarios" label="Usuários" />
                <Item href="/clientes" label="Clientes" />
                <Item href="/seguradoras" label="Seguradoras" />
                <Item href="/cotacoes" label="Cotações" />
                <Item href="/analise-tecnica" label="Análise Técnica" />
                <Item href="/financeiro" label="Financeiro" />
              </>
            )}

            {role === "diretora_tecnica" && (
              <>
                <Item href="/analise-tecnica" label="Análise Técnica" />
                <Item href="/corretoras" label="Corretoras" />
                <Item href="/usuarios" label="Usuários" />
                <Item href="/cotacoes" label="Cotações" />
              </>
            )}

            {role === "diretora_financeira" && (
              <>
                <Item href="/financeiro" label="Financeiro" />
                <Item href="/cotacoes" label="Cotações" />
              </>
            )}

            {role === "corretor" && (
              <>
                <Item href="/clientes" label="Clientes" />
                <Item href="/cotacoes" label="Cotações" />
              </>
            )}
          </nav>
        </div>
      </div>
    </aside>
  );
}