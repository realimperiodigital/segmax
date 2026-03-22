"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PropostaItem = {
  id: string;
  numero: string | null;
  titulo: string | null;
  cliente: string | null;
  corretora: string | null;
  seguradora: string | null;
  ramo: string | null;
  status: string | null;
  valorSegurado: number | string | null;
  criadoEm: string | null;
  atualizadoEm: string | null;
};

type ApiResponse = {
  ok: boolean;
  etapa?: string;
  total?: number;
  itens?: PropostaItem[];
  error?: string;
};

function formatarStatus(status: string | null) {
  if (!status) return "Sem status";

  const mapa: Record<string, string> = {
    em_analise: "Em análise",
    aprovada: "Aprovada",
    reprovada: "Reprovada",
    emitida: "Emitida",
    pendente: "Pendente",
    cancelada: "Cancelada",
  };

  return mapa[status] ?? status.replaceAll("_", " ");
}

function formatarValor(valor: number | string | null) {
  if (valor === null || valor === undefined || valor === "") return "—";

  const numero =
    typeof valor === "number"
      ? valor
      : Number(String(valor).replace(",", "."));

  if (Number.isNaN(numero)) return String(valor);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(numero);
}

function formatarData(data: string | null) {
  if (!data) return "—";

  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return data;

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

function corStatus(status: string | null) {
  switch (status) {
    case "aprovada":
      return "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30";
    case "reprovada":
      return "bg-red-500/15 text-red-300 ring-1 ring-red-500/30";
    case "emitida":
      return "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30";
    case "em_analise":
      return "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30";
    case "pendente":
      return "bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-500/30";
    default:
      return "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30";
  }
}

export default function PropostasPage() {
  const [propostas, setPropostas] = useState<PropostaItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  async function carregarPropostas() {
    try {
      setCarregando(true);
      setErro(null);

      const response = await fetch("/api/propostas/lista", {
        method: "GET",
        cache: "no-store",
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Não foi possível carregar as propostas.");
      }

      setPropostas(Array.isArray(data.itens) ? data.itens : []);
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : "Erro inesperado ao carregar propostas.";
      setErro(mensagem);
      setPropostas([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPropostas();
  }, []);

  const propostasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return propostas;

    return propostas.filter((item) => {
      const texto = [
        item.numero,
        item.titulo,
        item.cliente,
        item.corretora,
        item.seguradora,
        item.ramo,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return texto.includes(termo);
    });
  }, [propostas, busca]);

  const totalPropostas = propostas.length;
  const totalEmAnalise = propostas.filter((p) => p.status === "em_analise").length;
  const totalAprovadas = propostas.filter((p) => p.status === "aprovada").length;
  const totalValorSegurado = propostas.reduce((acc, item) => {
    const numero =
      typeof item.valorSegurado === "number"
        ? item.valorSegurado
        : Number(item.valorSegurado ?? 0);

    return acc + (Number.isNaN(numero) ? 0 : numero);
  }, 0);

  return (
    <main className="min-h-screen bg-[#070b17] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-cyan-300/80">
              Área Comercial
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Propostas Executivas
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Visualize, acompanhe e consulte todas as propostas cadastradas no sistema.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={carregarPropostas}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Atualizar lista
            </button>

            <Link
              href="/proposta-executiva"
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Nova proposta
            </Link>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Total de propostas</p>
            <p className="mt-2 text-3xl font-semibold">{totalPropostas}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Em análise</p>
            <p className="mt-2 text-3xl font-semibold">{totalEmAnalise}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Aprovadas</p>
            <p className="mt-2 text-3xl font-semibold">{totalAprovadas}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Valor segurado total</p>
            <p className="mt-2 text-2xl font-semibold">
              {formatarValor(totalValorSegurado)}
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-medium">Lista de propostas</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Consulte por número, cliente, corretora, seguradora ou status.
              </p>
            </div>

            <div className="w-full lg:w-96">
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar proposta..."
                className="w-full rounded-xl border border-white/10 bg-[#0c1324] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {carregando ? (
            <div className="p-8 text-sm text-zinc-400">Carregando propostas...</div>
          ) : erro ? (
            <div className="p-8">
              <p className="text-sm font-semibold text-red-300">
                Erro ao carregar a lista
              </p>
              <p className="mt-2 text-sm text-zinc-400">{erro}</p>

              <button
                onClick={carregarPropostas}
                className="mt-4 rounded-xl bg-red-500/15 px-4 py-2 text-sm font-medium text-red-200 ring-1 ring-red-500/30 transition hover:bg-red-500/25"
              >
                Tentar novamente
              </button>
            </div>
          ) : propostasFiltradas.length === 0 ? (
            <div className="p-8">
              <p className="text-base font-semibold text-white">
                Nenhuma proposta encontrada
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                {propostas.length === 0
                  ? "Ainda não existem propostas cadastradas para exibir nesta tela."
                  : "Nenhum resultado encontrado para a busca informada."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white/5">
                  <tr className="text-left text-zinc-300">
                    <th className="px-4 py-4 font-medium">Número</th>
                    <th className="px-4 py-4 font-medium">Título</th>
                    <th className="px-4 py-4 font-medium">Cliente</th>
                    <th className="px-4 py-4 font-medium">Corretora</th>
                    <th className="px-4 py-4 font-medium">Seguradora</th>
                    <th className="px-4 py-4 font-medium">Ramo</th>
                    <th className="px-4 py-4 font-medium">Status</th>
                    <th className="px-4 py-4 font-medium">Valor segurado</th>
                    <th className="px-4 py-4 font-medium">Criado em</th>
                    <th className="px-4 py-4 font-medium">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {propostasFiltradas.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-white/10 text-zinc-200 transition hover:bg-white/5"
                    >
                      <td className="px-4 py-4 font-medium text-cyan-300">
                        {item.numero || "—"}
                      </td>

                      <td className="px-4 py-4">
                        <div className="max-w-[280px]">
                          <p className="truncate font-medium text-white">
                            {item.titulo || "Sem título"}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4">{item.cliente || "—"}</td>
                      <td className="px-4 py-4">{item.corretora || "—"}</td>
                      <td className="px-4 py-4">{item.seguradora || "—"}</td>
                      <td className="px-4 py-4">{item.ramo || "—"}</td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${corStatus(
                            item.status
                          )}`}
                        >
                          {formatarStatus(item.status)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {formatarValor(item.valorSegurado)}
                      </td>

                      <td className="px-4 py-4">{formatarData(item.criadoEm)}</td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/propostas/${item.id}`}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10"
                          >
                            Ver
                          </Link>

                          <Link
                            href={`/propostas/${item.id}/imprimir`}
                            className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-200 transition hover:bg-cyan-500/20"
                          >
                            Imprimir
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
    </main>
  );
}