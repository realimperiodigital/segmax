"use client";

import { useMemo, useState } from "react";
import {
  buscarResumoSimulacoes,
  criarSimulacaoSinistro,
  recalcularSimulacaoSinistro,
  TIPOS_EVENTO_SINISTRO,
  type SimulacaoResumo,
  type TipoEventoSinistro,
} from "@/lib/segmax/simulacao-sinistro";

export default function SimulacoesPage() {
  const [tipoEvento, setTipoEvento] = useState<TipoEventoSinistro>("colisao");
  const [descricao, setDescricao] = useState("");
  const [mensagem, setMensagem] = useState("");

  const simulacoes = useMemo<SimulacaoResumo[]>(() => {
    return buscarResumoSimulacoes();
  }, [mensagem]);

  function handleCriarSimulacao() {
    const nova = criarSimulacaoSinistro(tipoEvento, descricao.trim() || undefined);

    setMensagem(`Simulação criada com sucesso: ${nova.id}`);
    setDescricao("");
  }

  function handleRecalcular(simulacaoId: string) {
    const atualizada = recalcularSimulacaoSinistro(simulacaoId);

    if (!atualizada) {
      setMensagem("Não foi possível recalcular a simulação.");
      return;
    }

    setMensagem(`Simulação recalculada com sucesso: ${simulacaoId}`);
  }

  return (
    <main className="min-h-screen bg-[#0b1020] text-white p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Simulações de Sinistro</h1>
          <p className="text-sm text-white/70 mt-2">
            Cadastro e acompanhamento das simulações.
          </p>
        </div>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-xl font-semibold mb-4">Nova simulação</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-white/80">
                  Tipo do evento
                </label>
                <select
                  value={tipoEvento}
                  onChange={(e) =>
                    setTipoEvento(e.target.value as TipoEventoSinistro)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#11182b] px-4 py-3 text-white outline-none"
                >
                  {TIPOS_EVENTO_SINISTRO.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/80">
                  Descrição
                </label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={4}
                  placeholder="Descreva a simulação..."
                  className="w-full rounded-xl border border-white/10 bg-[#11182b] px-4 py-3 text-white outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleCriarSimulacao}
                className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-black transition hover:opacity-90"
              >
                Criar simulação
              </button>

              {mensagem ? (
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  {mensagem}
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-xl font-semibold mb-4">Resumo</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#11182b] p-4">
                <p className="text-sm text-white/60">Total de simulações</p>
                <p className="mt-2 text-3xl font-bold">{simulacoes.length}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#11182b] p-4">
                <p className="text-sm text-white/60">Última atualização</p>
                <p className="mt-2 text-sm font-medium">
                  {simulacoes[0]?.updated_at
                    ? new Date(simulacoes[0].updated_at).toLocaleString("pt-BR")
                    : "Sem dados"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-semibold mb-4">Lista de simulações</h2>

          {simulacoes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-white/70">
              Nenhuma simulação cadastrada ainda.
            </div>
          ) : (
            <div className="grid gap-4">
              {simulacoes.map((item) => (
                <div
                  key={item.simulacao_id}
                  className="rounded-2xl border border-white/10 bg-[#11182b] p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-semibold">{item.tipo_evento}</p>
                      <p className="text-sm text-white/70 mt-1">
                        {item.descricao || "Sem descrição"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-white/80">
                        <span className="rounded-full bg-white/10 px-3 py-1">
                          Score: {item.score}
                        </span>
                        <span className="rounded-full bg-white/10 px-3 py-1">
                          Risco: {item.nivel_risco}
                        </span>
                        <span className="rounded-full bg-white/10 px-3 py-1">
                          Criado: {new Date(item.created_at).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => handleRecalcular(item.simulacao_id)}
                        className="rounded-xl bg-blue-500 px-4 py-2 font-semibold text-white transition hover:opacity-90"
                      >
                        Recalcular
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}