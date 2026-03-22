"use client";

import { useEffect, useState } from "react";

import {
  aprovarSolicitacaoExclusaoMaster,
  listarSolicitacoesPendentesMaster,
  recusarSolicitacaoCorretora,
} from "@/lib/exclusao-aprovacao";

type Solicitacao = {
  id: string;
  tipo?: string;
  descricao?: string;
  criado_em?: string;
  tabela_alvo?: string;
  tabelaAlvo?: string;
};

export default function AprovacoesExclusaoPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState<string | null>(null);

  async function carregarSolicitacoes() {
    try {
      const lista = await listarSolicitacoesPendentesMaster();

      if (Array.isArray(lista)) {
        setSolicitacoes(lista as Solicitacao[]);
      } else {
        setSolicitacoes([]);
      }
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error);
      setSolicitacoes([]);
    } finally {
      setCarregando(false);
    }
  }

  async function aprovar(item: Solicitacao) {
    try {
      setProcessandoId(item.id);

      await aprovarSolicitacaoExclusaoMaster({
        solicitacaoId: item.id,
        tabelaAlvo: item.tabela_alvo || item.tabelaAlvo || "clientes",
      });

      await carregarSolicitacoes();
    } catch (error) {
      console.error("Erro ao aprovar:", error);
    } finally {
      setProcessandoId(null);
    }
  }

  async function recusar(item: Solicitacao) {
    try {
      setProcessandoId(item.id);

      await recusarSolicitacaoCorretora({
        solicitacaoId: item.id,
        motivoRecusa: "Solicitação recusada pelo master.",
      });

      await carregarSolicitacoes();
    } catch (error) {
      console.error("Erro ao recusar:", error);
    } finally {
      setProcessandoId(null);
    }
  }

  useEffect(() => {
    carregarSolicitacoes();
  }, []);

  if (carregando) {
    return <div className="p-6">Carregando solicitações...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Aprovações de Exclusão</h1>

      {solicitacoes.length === 0 ? (
        <div className="text-gray-500">Nenhuma solicitação pendente.</div>
      ) : (
        <div className="space-y-4">
          {solicitacoes.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 space-y-2 bg-white"
            >
              <div className="font-semibold">
                {item.tipo || "Solicitação de exclusão"}
              </div>

              <div className="text-sm text-gray-600">
                {item.descricao || "Sem descrição informada."}
              </div>

              <div className="text-xs text-gray-400">
                {item.criado_em || ""}
              </div>

              <div className="text-xs text-gray-500">
                Tabela alvo: {item.tabela_alvo || item.tabelaAlvo || "clientes"}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => aprovar(item)}
                  disabled={processandoId === item.id}
                  className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  {processandoId === item.id ? "Processando..." : "Aprovar"}
                </button>

                <button
                  onClick={() => recusar(item)}
                  disabled={processandoId === item.id}
                  className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  {processandoId === item.id ? "Processando..." : "Recusar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}