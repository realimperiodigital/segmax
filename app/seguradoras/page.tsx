"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  Landmark,
  Plus,
  Search,
  Shield,
  ShieldAlert,
} from "lucide-react";

import SegmaxShell, { SegmaxMenuItem } from "@/components/segmaxshell";

type StatusSeguradora = "Ativa" | "Suspensa" | "Restrita";

type Seguradora = {
  id: string;
  nome: string;
  cnpj: string;
  responsavel: string;
  email: string;
  telefone: string;
  status: StatusSeguradora;
  patrimonial: boolean;
  ramos: string[];
  cidade: string;
  estado: string;
};

const menuItems: SegmaxMenuItem[] = [
  { label: "Centro de Controle", href: "/dashboard", exact: true },
  { label: "Corretoras", href: "/corretoras" },
  { label: "Usuários", href: "/usuarios" },
  { label: "Clientes", href: "/clientes" },
  { label: "Seguradoras", href: "/seguradoras" },
  { label: "Cotações", href: "/cotacoes" },
  { label: "Análise Técnica", href: "/analise-tecnica" },
  { label: "Financeiro", href: "/financeiro" },
];

const seguradorasBase: Seguradora[] = [
  {
    id: "1",
    nome: "Porto Seguro",
    cnpj: "61.198.164/0001-60",
    responsavel: "Equipe Comercial SP",
    email: "comercial.sp@porto.com",
    telefone: "(11) 3003-9393",
    status: "Ativa",
    patrimonial: true,
    ramos: ["Patrimonial", "Empresarial", "Responsabilidade Civil"],
    cidade: "São Paulo",
    estado: "SP",
  },
  {
    id: "2",
    nome: "Tokio Marine",
    cnpj: "33.164.021/0001-00",
    responsavel: "Canal Corporativo",
    email: "corporativo@tokiomarine.com",
    telefone: "(11) 99555-1122",
    status: "Ativa",
    patrimonial: true,
    ramos: ["Patrimonial", "Condomínio", "Riscos Diversos"],
    cidade: "São Paulo",
    estado: "SP",
  },
  {
    id: "3",
    nome: "Mapfre Seguros",
    cnpj: "61.074.175/0001-38",
    responsavel: "Atendimento Técnico",
    email: "tecnico@mapfre.com",
    telefone: "(11) 94444-2233",
    status: "Suspensa",
    patrimonial: true,
    ramos: ["Patrimonial", "Empresarial"],
    cidade: "São Paulo",
    estado: "SP",
  },
  {
    id: "4",
    nome: "Allianz Seguros",
    cnpj: "61.573.796/0001-66",
    responsavel: "Mesa de Negócios",
    email: "negocios@allianz.com",
    telefone: "(11) 93333-4455",
    status: "Ativa",
    patrimonial: true,
    ramos: ["Patrimonial", "Transportes", "RC"],
    cidade: "São Paulo",
    estado: "SP",
  },
  {
    id: "5",
    nome: "Seguradora Horizonte",
    cnpj: "12.456.999/0001-80",
    responsavel: "Relacionamento Institucional",
    email: "relacionamento@horizonte.com",
    telefone: "(11) 92222-6677",
    status: "Restrita",
    patrimonial: false,
    ramos: ["Vida", "Saúde"],
    cidade: "Campinas",
    estado: "SP",
  },
];

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "rounded-[28px]",
        "border border-[#d4af37]/14",
        "bg-black/45",
        "p-6",
        "shadow-[0_0_30px_rgba(0,0,0,0.28)]",
        "backdrop-blur-sm",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}

function ActionButton({
  href,
  label,
  primary = false,
  icon,
}: {
  href: string;
  label: string;
  primary?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-200",
        primary
          ? "border-[#d4af37] bg-[#d4af37] text-black hover:brightness-110"
          : "border-[#d4af37]/25 bg-black/30 text-white hover:border-[#d4af37]/40 hover:bg-[#d4af37]/8",
      ].join(" ")}
    >
      {icon}
      {label}
    </Link>
  );
}

function StatusBadge({ status }: { status: StatusSeguradora }) {
  if (status === "Ativa") {
    return (
      <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
        Ativa
      </span>
    );
  }

  if (status === "Suspensa") {
    return (
      <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
        Suspensa
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
      Restrita
    </span>
  );
}

function PatrimonialBadge({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
      Habilitada
    </span>
  ) : (
    <span className="inline-flex rounded-full border border-zinc-500/30 bg-zinc-500/10 px-3 py-1 text-xs font-semibold text-zinc-300">
      Não habilitada
    </span>
  );
}

export default function SeguradorasPage() {
  const [busca, setBusca] = useState("");

  const seguradorasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return seguradorasBase.filter((seguradora) => {
      if (!termo) return true;

      return (
        seguradora.nome.toLowerCase().includes(termo) ||
        seguradora.cnpj.toLowerCase().includes(termo) ||
        seguradora.responsavel.toLowerCase().includes(termo) ||
        seguradora.cidade.toLowerCase().includes(termo) ||
        seguradora.ramos.join(" ").toLowerCase().includes(termo)
      );
    });
  }, [busca]);

  const totalSeguradoras = seguradorasBase.length;
  const totalAtivas = seguradorasBase.filter((s) => s.status === "Ativa").length;
  const totalPatrimonial = seguradorasBase.filter((s) => s.patrimonial).length;
  const totalRestritas = seguradorasBase.filter((s) => s.status === "Restrita").length;

  return (
    <SegmaxShell
      title="Base de seguradoras"
      subtitle="Mantenha o cadastro técnico organizado, monitore disponibilidade operacional e prepare a base para análise e cotação."
      badge="Base técnica SegMax"
      username="Renato"
      userrole="Super Master"
      menuitems={menuItems}
      actions={
        <>
          <ActionButton
            href="/seguradoras/nova"
            label="Nova seguradora"
            primary
            icon={<Plus size={18} />}
          />
          <ActionButton
            href="/dashboard"
            label="Voltar ao painel"
            icon={<ArrowRight size={18} />}
          />
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-300">Seguradoras cadastradas</p>
              <h3 className="mt-4 text-5xl font-semibold leading-none text-white">
                {totalSeguradoras}
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Base total disponível no sistema.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/8 text-[#d4af37]">
              <Landmark size={24} />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-300">Ativas</p>
              <h3 className="mt-4 text-5xl font-semibold leading-none text-white">
                {totalAtivas}
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Aptas para operação imediata.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-300">Patrimonial</p>
              <h3 className="mt-4 text-5xl font-semibold leading-none text-white">
                {totalPatrimonial}
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Seguradoras prontas para foco atual.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10 text-sky-300">
              <Shield size={24} />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-300">Restritas</p>
              <h3 className="mt-4 text-5xl font-semibold leading-none text-white">
                {totalRestritas}
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Exigem revisão antes de operar.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300">
              <ShieldAlert size={24} />
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard>
        <div className="flex flex-col gap-5 border-b border-white/8 pb-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Cadastro técnico de seguradoras
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Consulte rapidamente dados centrais, aptidão patrimonial e canais de contato.
            </p>
          </div>

          <label className="flex w-full max-w-[420px] items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
            <Search size={18} className="text-zinc-500" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, CNPJ, responsável, cidade ou ramo"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            />
          </label>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[1280px] border-separate border-spacing-y-3">
            <thead>
              <tr>
                <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                  Seguradora
                </th>
                <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                  Contato
                </th>
                <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                  Status
                </th>
                <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                  Patrimonial
                </th>
                <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                  Ramos
                </th>
                <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                  Cidade
                </th>
                <th className="px-4 text-right text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {seguradorasFiltradas.map((seguradora) => (
                <tr key={seguradora.id}>
                  <td className="rounded-l-2xl border-y border-l border-white/6 bg-white/[0.03] px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/8 text-[#d4af37]">
                        <Building2 size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-white">
                          {seguradora.nome}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {seguradora.cnpj}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4">
                    <p className="text-sm text-white">{seguradora.responsavel}</p>
                    <p className="mt-1 text-xs text-zinc-500">{seguradora.email}</p>
                    <p className="mt-1 text-xs text-zinc-500">{seguradora.telefone}</p>
                  </td>

                  <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4">
                    <StatusBadge status={seguradora.status} />
                  </td>

                  <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4">
                    <PatrimonialBadge value={seguradora.patrimonial} />
                  </td>

                  <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {seguradora.ramos.map((ramo) => (
                        <span
                          key={ramo}
                          className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-300"
                        >
                          {ramo}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4">
                    <p className="text-sm text-white">{seguradora.cidade}</p>
                    <p className="mt-1 text-xs text-zinc-500">{seguradora.estado}</p>
                  </td>

                  <td className="rounded-r-2xl border-y border-r border-white/6 bg-white/[0.03] px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/seguradoras/${seguradora.id}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-xs font-semibold text-white transition hover:border-[#d4af37]/30 hover:bg-[#d4af37]/8"
                      >
                        <Eye size={15} />
                        Abrir
                      </Link>

                      <Link
                        href={`/seguradoras/${seguradora.id}/editar`}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/8 px-3 py-2 text-xs font-semibold text-[#f3d77a] transition hover:border-[#d4af37]/35 hover:bg-[#d4af37]/12"
                      >
                        Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {seguradorasFiltradas.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-10 text-center"
                  >
                    <p className="text-base font-medium text-white">
                      Nenhuma seguradora encontrada
                    </p>
                    <p className="mt-2 text-sm text-zinc-500">
                      Ajuste a busca ou cadastre uma nova seguradora.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </SegmaxShell>
  );
}