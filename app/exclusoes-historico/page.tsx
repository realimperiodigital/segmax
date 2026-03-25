"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import SegmaxShell from "@/components/segmaxshell";
import { ArrowLeft, History, Search } from "lucide-react";

type HistoricoItem = {
  id: string;
  entidade?: string | null;
  entidade_nome?: string | null;
  solicitado_por?: string | null;
  aprovado_por?: string | null;
  status?: "Pendente" | "Aprovada" | "Recusada" | "Executada" | null;
  created_at?: string | null;
};

export default function ExclusoesHistoricoPage() {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    async function carregarHistorico() {
      try {
        const response = await fetch("/api/exclusoes-historico", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Erro ao carregar histórico");
        }

        const data = await response.json();
        setHistorico(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao buscar histórico de exclusões:", error);
        setHistorico([]);
      }
    }

    carregarHistorico();
  }, []);

  const historicoFiltrado = historico.filter((item) => {
    const termo = busca.toLowerCase();

    return (
      item.entidade?.toLowerCase().includes(termo) ||
      item.entidade_nome?.toLowerCase().includes(termo) ||
      item.solicitado_por?.toLowerCase().includes(termo) ||
      item.aprovado_por?.toLowerCase().includes(termo) ||
      item.status?.toLowerCase().includes(termo)
    );
  });

  return (
    <SegmaxShell role="master">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-semibold text-white">
              Histórico de Exclusões
            </h1>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 font-medium text-gray-300 transition hover:bg-zinc-800 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>

        <div className="mb-6 flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar no histórico..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <table className="w-full text-sm">
            <thead className="bg-zinc-800 text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left">Entidade</th>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Solicitado por</th>
                <th className="px-4 py-3 text-left">Aprovado por</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Data</th>
              </tr>
            </thead>

            <tbody>
              {historicoFiltrado.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-zinc-800 transition hover:bg-zinc-800"
                >
                  <td className="px-4 py-3 text-white">
                    {item.entidade || "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-300">
                    {item.entidade_nome || "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-400">
                    {item.solicitado_por || "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-400">
                    {item.aprovado_por || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded bg-amber-600 px-2 py-1 text-xs text-white">
                      {item.status || "Pendente"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-gray-400">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString("pt-BR")
                      : "-"}
                  </td>
                </tr>
              ))}

              {historicoFiltrado.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">
                    Nenhum registro encontrado
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