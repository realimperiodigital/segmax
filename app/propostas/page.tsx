"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  PropostaEtapa,
  PropostaExecutiva,
  PropostaStatus,
} from "@/types/proposta-executiva";

function formatMoney(value: number | null | undefined) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

function formatDate(date: string | null | undefined) {
  if (!date) return "-";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

function getStatusStyle(status: string) {
  switch (status) {
    case "rascunho":
      return "bg-zinc-500/15 text-zinc-300 border border-zinc-500/30";
    case "em_analise":
      return "bg-amber-500/15 text-amber-300 border border-amber-500/30";
    case "aguardando_aprovacao":
      return "bg-sky-500/15 text-sky-300 border border-sky-500/30";
    case "aprovada":
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
    case "rejeitada":
      return "bg-red-500/15 text-red-300 border border-red-500/30";
    case "cancelada":
      return "bg-zinc-700/30 text-zinc-300 border border-zinc-700/40";
    case "emitida":
      return "bg-violet-500/15 text-violet-300 border border-violet-500/30";
    case "pos_venda":
      return "bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30";
    default:
      return "bg-zinc-500/15 text-zinc-300 border border-zinc-500/30";
  }
}

function getEtapaLabel(etapa: string) {
  switch (etapa) {
    case "criacao":
      return "Criação";
    case "analise":
      return "Análise";
    case "aprovacao":
      return "Aprovação";
    case "emissao":
      return "Emissão";
    case "implantacao":
      return "Implantação";
    case "pos_venda":
      return "Pós-venda";
    default:
      return etapa;
  }
}

const STATUS_OPTIONS: { value: PropostaStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos os status" },
  { value: "rascunho", label: "Rascunho" },
  { value: "em_analise", label: "Em análise" },
  { value: "aguardando_aprovacao", label: "Aguardando aprovação" },
  { value: "aprovada", label: "Aprovada" },
  { value: "rejeitada", label: "Rejeitada" },
  { value: "cancelada", label: "Cancelada" },
  { value: "emitida", label: "Emitida" },
  { value: "pos_venda", label: "Pós-venda" },
];

const ETAPA_OPTIONS: { value: PropostaEtapa | "todas"; label: string }[] = [
  { value: "todas", label: "Todas as etapas" },
  { value: "criacao", label: "Criação" },
  { value: "analise", label: "Análise" },
  { value: "aprovacao", label: "Aprovação" },
  { value: "emissao", label: "Emissão" },
  { value: "implantacao", label: "Implantação" },
  { value: "pos_venda", label: "Pós-venda" },
];

type ApiListResponse = {
  success?: boolean;
  data?: PropostaExecutiva[];
  error?: string;
};

export default function PropostasPage() {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [propostas, setPropostas] = useState<PropostaExecutiva[]>([]);

  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<PropostaStatus | "todos">("todos");
  const [etapaFiltro, setEtapaFiltro] = useState<PropostaEtapa | "todas">("todas");

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        setErro("");

        const response = await fetch("/api/propostas/lista", {
          method: "GET",
          cache: "no-store",
        });

        const result = (await response.json()) as ApiListResponse;

        if (!response.ok) {
          throw new Error(result?.error || "Erro ao carregar propostas.");
        }

        setPropostas(result.data || []);
      } catch (error) {
        setErro(error instanceof Error ? error.message : "Erro inesperado.");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  function limparFiltros() {
    setBusca("");
    setStatusFiltro("todos");
    setEtapaFiltro("todas");
  }

  const propostasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return propostas.filter((item) => {
      const bateBusca =
        !termo ||
        (item.codigo || "").toLowerCase().includes(termo) ||
        (item.titulo || "").toLowerCase().includes(termo) ||
        (item.cliente_nome || "").toLowerCase().includes(termo) ||
        (item.corretora_nome || "").toLowerCase().includes(termo) ||
        (item.seguradora_nome || "").toLowerCase().includes(termo) ||
        (item.responsavel_nome || "").toLowerCase().includes(termo);

      const bateStatus =
        statusFiltro === "todos" ? true : item.status === statusFiltro;

      const bateEtapa =
        etapaFiltro === "todas" ? true : item.etapa === etapaFiltro;

      return bateBusca && bateStatus && bateEtapa;
    });
  }, [propostas, busca, statusFiltro, etapaFiltro]);

  const total = propostasFiltradas.length;
  const emAnalise = propostasFiltradas.filter((item) => item.status === "em_analise").length;
  const aguardandoAprovacao = propostasFiltradas.filter(
    (item) => item.status === "aguardando_aprovacao"
  ).length;
  const aprovadas = propostasFiltradas.filter((item) => item.status === "aprovada").length;
  const emitidas = propostasFiltradas.filter((item) => item.status === "emitida").length;
  const posVenda = propostasFiltradas.filter((item) => item.status === "pos_venda").length;

  const volumePremio = propostasFiltradas.reduce(
    (acc, item) => acc + Number(item.valor_premio || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#060816] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
              SegMax CRM
            </span>
            <h1 className="text-3xl font-bold tracking-tight">
              Central de Propostas
            </h1>
            <p className="max-w-3xl text-sm text-zinc-300">
              Pipeline comercial completo com busca rápida, filtros, acompanhamento de status e acesso direto ao detalhe, edição e pós-venda.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
            >
              Voltar ao dashboard
            </Link>

            <Link
              href="/propostas/nova"
              className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Nova proposta
            </Link>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Busca e filtros</h2>

            <button
              type="button"
              onClick={limparFiltros}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
            >
              Limpar filtros
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <label className="mb-2 block text-sm text-zinc-300">Buscar</label>
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                placeholder="Código, cliente, corretora, seguradora..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Status</label>
              <select
                value={statusFiltro}
                onChange={(e) =>
                  setStatusFiltro(e.target.value as PropostaStatus | "todos")
                }
                className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-900">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Etapa</label>
              <select
                value={etapaFiltro}
                onChange={(e) =>
                  setEtapaFiltro(e.target.value as PropostaEtapa | "todas")
                }
                className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
              >
                {ETAPA_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-900">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Total filtrado</p>
            <p className="mt-2 text-3xl font-bold">{total}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Em análise</p>
            <p className="mt-2 text-3xl font-bold text-amber-300">{emAnalise}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Aguardando aprovação</p>
            <p className="mt-2 text-3xl font-bold text-sky-300">{aguardandoAprovacao}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Aprovadas</p>
            <p className="mt-2 text-3xl font-bold text-emerald-300">{aprovadas}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Emitidas</p>
            <p className="mt-2 text-3xl font-bold text-violet-300">{emitidas}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Volume em prêmio</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300">
              {formatMoney(volumePremio)}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <div className="border-b border-white/10 px-6 py-4">
            <h2 className="text-lg font-semibold">Pipeline de propostas</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Resultado filtrado em tempo real. Em pós-venda agora: {posVenda}
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-zinc-400">
              Carregando propostas...
            </div>
          ) : erro ? (
            <div className="p-6 text-sm text-red-300">
              Erro ao carregar propostas: {erro}
            </div>
          ) : propostasFiltradas.length === 0 ? (
            <div className="p-10 text-center text-zinc-400">
              Nenhuma proposta encontrada com os filtros atuais.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white/[0.03] text-left text-zinc-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Código</th>
                    <th className="px-6 py-4 font-medium">Cliente</th>
                    <th className="px-6 py-4 font-medium">Corretora</th>
                    <th className="px-6 py-4 font-medium">Seguradora</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Etapa</th>
                    <th className="px-6 py-4 font-medium">Prêmio</th>
                    <th className="px-6 py-4 font-medium">Última movimentação</th>
                    <th className="px-6 py-4 font-medium">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {propostasFiltradas.map((proposta) => (
                    <tr
                      key={proposta.id}
                      className="border-t border-white/5 transition hover:bg-white/[0.03]"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">
                          {proposta.codigo || "-"}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {formatDate(proposta.created_at)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-white">
                          {proposta.cliente_nome}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {proposta.responsavel_nome || "Sem responsável"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-zinc-200">
                        {proposta.corretora_nome || "-"}
                      </td>

                      <td className="px-6 py-4 text-zinc-200">
                        {proposta.seguradora_nome || "-"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            proposta.status
                          )}`}
                        >
                          {proposta.status.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-zinc-200">
                        {getEtapaLabel(proposta.etapa)}
                      </td>

                      <td className="px-6 py-4 font-semibold text-cyan-300">
                        {formatMoney(proposta.valor_premio)}
                      </td>

                      <td className="px-6 py-4 text-zinc-400">
                        {formatDate(proposta.ultima_movimentacao_em || proposta.updated_at)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/propostas/${proposta.id}`}
                            className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-400/20"
                          >
                            Abrir
                          </Link>

                          <Link
                            href={`/propostas/${proposta.id}/editar`}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-white/10"
                          >
                            Editar
                          </Link>

                          <Link
                            href={`/propostas/${proposta.id}/pos-venda`}
                            className="rounded-xl border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1.5 text-xs font-medium text-fuchsia-300 transition hover:bg-fuchsia-400/20"
                          >
                            Pós-venda
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}