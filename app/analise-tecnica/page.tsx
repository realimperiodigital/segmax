"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileSearch,
  Filter,
  Plus,
  Search,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import SegmaxShell, { SegmaxMenuItem } from "@/components/segmaxshell";

type StatusAnalise =
  | "Nova"
  | "Em análise"
  | "Parecer emitido"
  | "Aguardando ajuste"
  | "Concluída";

type NivelRisco = "Baixo" | "Médio" | "Alto" | "Crítico";

type AnaliseTecnica = {
  id: string;
  cliente: string;
  corretora: string;
  seguradora: string;
  ramo: string;
  analista: string;
  status: StatusAnalise;
  risco: NivelRisco;
  atualizadoEm: string;
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

const analisesBase: AnaliseTecnica[] = [
  {
    id: "1",
    cliente: "Grupo Alpha Logística",
    corretora: "Prime Broker Seguros",
    seguradora: "Porto Seguro",
    ramo: "Patrimonial Empresarial",
    analista: "Ana Paula",
    status: "Em análise",
    risco: "Médio",
    atualizadoEm: "16/03/2026 08:10",
  },
  {
    id: "2",
    cliente: "Metalúrgica Horizonte",
    corretora: "Atlas Corretora",
    seguradora: "Tokio Marine",
    ramo: "Patrimonial Industrial",
    analista: "Ana Paula",
    status: "Nova",
    risco: "Alto",
    atualizadoEm: "16/03/2026 07:42",
  },
  {
    id: "3",
    cliente: "Rede Nova Visão",
    corretora: "Alpha Consult",
    seguradora: "Allianz",
    ramo: "Patrimonial Comercial",
    analista: "Ana Paula",
    status: "Parecer emitido",
    risco: "Baixo",
    atualizadoEm: "15/03/2026 18:25",
  },
  {
    id: "4",
    cliente: "Construtora Vale Forte",
    corretora: "Prime Broker Seguros",
    seguradora: "Mapfre",
    ramo: "Patrimonial Construção",
    analista: "Ana Paula",
    status: "Aguardando ajuste",
    risco: "Crítico",
    atualizadoEm: "15/03/2026 16:50",
  },
  {
    id: "5",
    cliente: "Centro Log SP",
    corretora: "Fortis Risk",
    seguradora: "Porto Seguro",
    ramo: "Patrimonial Logístico",
    analista: "Ana Paula",
    status: "Concluída",
    risco: "Médio",
    atualizadoEm: "14/03/2026 14:20",
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
        "rounded-[28px] border border-[#d4af37]/14 bg-black/45 p-6 shadow-[0_0_30px_rgba(0,0,0,0.28)] backdrop-blur-sm",
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

function StatusBadge({ status }: { status: StatusAnalise }) {
  const styles: Record<StatusAnalise, string> = {
    Nova: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    "Em análise": "border-amber-500/30 bg-amber-500/10 text-amber-300",
    "Parecer emitido": "border-purple-500/30 bg-purple-500/10 text-purple-300",
    "Aguardando ajuste": "border-red-500/30 bg-red-500/10 text-red-300",
    Concluída: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  };

  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
        styles[status],
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function RiscoBadge({ risco }: { risco: NivelRisco }) {
  const styles: Record<NivelRisco, string> = {
    Baixo: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    Médio: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    Alto: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    Crítico: "border-red-500/30 bg-red-500/10 text-red-300",
  };

  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
        styles[risco],
      ].join(" ")}
    >
      {risco}
    </span>
  );
}

export default function AnaliseTecnicaPage() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"Todos" | StatusAnalise>("Todos");

  const analisesFiltradas = useMemo(() => {
    return analisesBase.filter((item) => {
      const termo = busca.trim().toLowerCase();

      const bateBusca =
        termo.length === 0 ||
        item.cliente.toLowerCase().includes(termo) ||
        item.corretora.toLowerCase().includes(termo) ||
        item.seguradora.toLowerCase().includes(termo) ||
        item.ramo.toLowerCase().includes(termo);

      const bateStatus = filtroStatus === "Todos" || item.status === filtroStatus;

      return bateBusca && bateStatus;
    });
  }, [busca, filtroStatus]);

  const totalAnalises = analisesBase.length;
  const emAnalise = analisesBase.filter((item) => item.status === "Em análise").length;
  const parecerEmitido = analisesBase.filter((item) => item.status === "Parecer emitido").length;
  const riscoCritico = analisesBase.filter((item) => item.risco === "Crítico").length;

  return (
    <SegmaxShell
      title="Análise técnica"
      subtitle="Gerencie a fila técnica da operação, priorize riscos sensíveis e acompanhe pareceres com visão estruturada e profissional."
      badge="Núcleo técnico SegMax"
      username="Ana Paula"
      userrole="Diretora Técnica"
      menuitems={menuItems}
      actions={
        <>
          <ActionButton
            href="/cotacoes/nova"
            label="Nova demanda"
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
              <p className="text-sm text-zinc-300">Análises na base</p>
              <h3 className="mt-4 text-5xl font-semibold leading-none text-white">
                {totalAnalises}
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Volume técnico em acompanhamento.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/8 text-[#d4af37]">
              <ClipboardCheck size={24} />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-300">Em análise</p>
              <h3 className="mt-4 text-5xl font-semibold leading-none text-white">
                {emAnalise}
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Processos em avaliação ativa.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
              <FileSearch size={24} />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-300">Parecer emitido</p>
              <h3 className="mt-4 text-5xl font-semibold leading-none text-white">
                {parecerEmitido}
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Demandas prontas para avanço.
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
              <p className="text-sm text-zinc-300">Risco crítico</p>
              <h3 className="mt-4 text-5xl font-semibold leading-none text-white">
                {riscoCritico}
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Casos que exigem atenção imediata.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300">
              <TriangleAlert size={24} />
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.65fr_0.95fr]">
        <SectionCard>
          <div className="flex flex-col gap-5 border-b border-white/8 pb-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Fila técnica de análises
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Localize rapidamente demandas, status e criticidade para priorização.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.2fr_240px]">
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                <Search size={18} className="text-zinc-500" />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por cliente, corretora, seguradora ou ramo"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                <Filter size={18} className="text-zinc-500" />
                <select
                  value={filtroStatus}
                  onChange={(e) =>
                    setFiltroStatus(e.target.value as "Todos" | StatusAnalise)
                  }
                  className="w-full bg-transparent text-sm text-white outline-none"
                >
                  <option value="Todos" className="bg-black text-white">
                    Todos os status
                  </option>
                  <option value="Nova" className="bg-black text-white">
                    Nova
                  </option>
                  <option value="Em análise" className="bg-black text-white">
                    Em análise
                  </option>
                  <option value="Parecer emitido" className="bg-black text-white">
                    Parecer emitido
                  </option>
                  <option value="Aguardando ajuste" className="bg-black text-white">
                    Aguardando ajuste
                  </option>
                  <option value="Concluída" className="bg-black text-white">
                    Concluída
                  </option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[1220px] border-separate border-spacing-y-3">
              <thead>
                <tr>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Cliente
                  </th>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Corretora
                  </th>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Seguradora
                  </th>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Ramo
                  </th>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Status
                  </th>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Risco
                  </th>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Atualização
                  </th>
                  <th className="px-4 text-right text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {analisesFiltradas.map((item) => (
                  <tr key={item.id}>
                    <td className="rounded-l-2xl border-y border-l border-white/6 bg-white/[0.03] px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.cliente}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          Analista: {item.analista}
                        </p>
                      </div>
                    </td>

                    <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4 text-sm text-white">
                      {item.corretora}
                    </td>

                    <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4 text-sm text-white">
                      {item.seguradora}
                    </td>

                    <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4 text-sm text-white">
                      {item.ramo}
                    </td>

                    <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4">
                      <RiscoBadge risco={item.risco} />
                    </td>

                    <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4 text-sm text-zinc-300">
                      {item.atualizadoEm}
                    </td>

                    <td className="rounded-r-2xl border-y border-r border-white/6 bg-white/[0.03] px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/analise-tecnica/${item.id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-xs font-semibold text-white transition hover:border-[#d4af37]/30 hover:bg-[#d4af37]/8"
                        >
                          <Eye size={15} />
                          Abrir
                        </Link>

                        <Link
                          href={`/analise-tecnica/${item.id}/parecer`}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/8 px-3 py-2 text-xs font-semibold text-[#f3d77a] transition hover:border-[#d4af37]/35 hover:bg-[#d4af37]/12"
                        >
                          Parecer
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}

                {analisesFiltradas.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-10 text-center"
                    >
                      <p className="text-base font-medium text-white">
                        Nenhuma análise encontrada
                      </p>
                      <p className="mt-2 text-sm text-zinc-500">
                        Ajuste a busca ou revise o filtro selecionado.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/8 text-[#d4af37]">
                <ShieldCheck size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  Direção técnica
                </h2>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Priorize riscos críticos, valide inconsistências documentais e
                  mantenha pareceres objetivos para acelerar a resposta comercial
                  sem perder profundidade técnica.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300">
                <AlertTriangle size={20} />
              </div>

              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Alertas de prioridade
                </h2>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-medium text-white">
                      Construtora Vale Forte
                    </p>
                    <p className="mt-1 text-xs leading-6 text-zinc-400">
                      Risco crítico com necessidade de ajuste antes do envio final.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-medium text-white">
                      Metalúrgica Horizonte
                    </p>
                    <p className="mt-1 text-xs leading-6 text-zinc-400">
                      Nova análise com sensibilidade industrial elevada.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10 text-sky-300">
                <ClipboardCheck size={20} />
              </div>

              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Prioridade do dia
                </h2>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Fechar os pareceres pendentes, revisar riscos altos e manter a
                  fila técnica organizada para sustentar o pré-lançamento com
                  qualidade e autoridade.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </SegmaxShell>
  );
}