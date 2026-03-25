"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import SegmaxShell from "@/components/segmaxshell";
import { Plus, Search, FileText } from "lucide-react";

type StatusCotacao =
  | "Nova"
  | "Em análise"
  | "Aguardando seguradora"
  | "Proposta pronta"
  | "Fechada"
  | "Recusada";

type Cotacao = {
  id: string;
  numero?: string | null;
  titulo?: string | null;
  cliente_nome?: string | null;
  corretora_nome?: string | null;
  status?: StatusCotacao | null;
  created_at?: string | null;
};

export default function CotacoesPage() {
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    async function carregarCotacoes() {
      try {
        const response = await fetch("/api/cotacoes", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Erro ao carregar cotações");
        }

        const data = await response.json();
        setCotacoes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao buscar cotações:", error);
        setCotacoes([]);
      }
    }

    carregarCotacoes();
  }, []);

  const cotacoesFiltradas = cotacoes.filter((cotacao) => {
    const termo = busca.toLowerCase();

    return (
      cotacao.numero?.toLowerCase().includes(termo) ||
      cotacao.titulo?.toLowerCase().includes(termo) ||
      cotacao.cliente_nome?.toLowerCase().includes(termo) ||
      cotacao.corretora_nome?.toLowerCase().includes(termo) ||
      cotacao.status?.toLowerCase().includes(termo)
    );
  });

  return (
    <SegmaxShell role="master">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-semibold text-white">Cotações</h1>
          </div>

          <Link
            href="/cotacoes/nova"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition hover:bg-amber-700"
          >
            <Plus className="h-4 w-4" />
            Nova Cotação
          </Link>
        </div>

        <div className="mb-6 flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cotação..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <table className="w-full text-sm">
            <thead className="bg-zinc-800 text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left">Número</th>
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Corretora</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Criada em</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {cotacoesFiltradas.map((cotacao) => (
                <tr
                  key={cotacao.id}
                  className="border-t border-zinc-800 transition hover:bg-zinc-800"
                >
                  <td className="px-4 py-3 text-white">
                    {cotacao.numero || "-"}
                  </td>

                  <td className="px-4 py-3 text-white">
                    {cotacao.titulo || "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-400">
                    {cotacao.cliente_nome || "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-400">
                    {cotacao.corretora_nome || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded bg-amber-600 px-2 py-1 text-xs text-white">
                      {cotacao.status || "Nova"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-gray-400">
                    {cotacao.created_at
                      ? new Date(cotacao.created_at).toLocaleDateString("pt-BR")
                      : "-"}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/cotacoes/${cotacao.id}`}
                      className="text-sm text-amber-500 hover:text-amber-400"
                    >
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))}

              {cotacoesFiltradas.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    Nenhuma cotação encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SegmaxShell>
  );
}