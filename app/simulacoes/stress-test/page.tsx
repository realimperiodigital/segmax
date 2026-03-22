"use client";

import { useMemo, useState } from "react";
import {
  buscarResumoSimulacoes,
  buscarStressTestsResumo,
  calcularStressTest,
  criarStressTest,
  type SimulacaoResumo,
  type StressTestResumo,
} from "@/lib/segmax/simulacao-sinistro";

export default function StressTestPage() {
  const [simulacaoId, setSimulacaoId] = useState("");
  const [mensagem, setMensagem] = useState("");

  const simulacoes = useMemo<SimulacaoResumo[]>(() => {
    return buscarResumoSimulacoes();
  }, [mensagem]);

  const stressTests = useMemo<StressTestResumo[]>(() => {
    return buscarStressTestsResumo(simulacaoId || undefined);
  }, [simulacaoId, mensagem]);

  function handleCriarStressTest() {
    const ok = calcularStressTest(simulacaoId || undefined);

    if (!ok) {
      setMensagem("A simulação informada não foi encontrada.");
      return;
    }

    const novo = criarStressTest(simulacaoId || undefined);
    setMensagem(`Stress test criado com sucesso: ${novo.id}`);
  }

  return (
    <main className="min-h-screen bg-[#0b1020] text-white p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Stress Test</h1>
          <p className="text-sm text-white/70 mt-2">
            Geração e leitura dos testes de stress das simulações.
          </p>
        </div>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-xl font-semibold mb-4">Novo stress test</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-white/80">
                  Simulação
                </label>
                <select
                  value={simulacaoId}
                  onChange={(e) => setSimulacaoId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#11182b] px-4 py-3 text-white outline-none"
                >
                  <option value="">Sem vínculo específico</option>
                  {simulacoes.map((item) => (
                    <option key={item.simulacao_id} value={item.simulacao_id}>
                      {item.tipo_evento} - {item.simulacao_id}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleCriarStressTest}
                className="rounded-xl bg-amber-400 px-5 py-3 font-semibold text-black transition hover:opacity-90"
              >
                Gerar stress test
              </button>

              {mensagem ? (
                <div className="rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
                  {mensagem}
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-xl font-semibold mb-4">Indicadores</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#11182b] p-4">
                <p className="text-sm text-white/60">Simulações</p>
                <p className="mt-2 text-3xl font-bold">{simulacoes.length}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#11182b] p-4">
                <p className="text-sm text-white/60">Stress tests</p>
                <p className="mt-2 text-3xl font-bold">{stressTests.length}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-semibold mb-4">Resultados</h2>

          {stressTests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-white/70">
              Nenhum stress test encontrado.
            </div>
          ) : (
            <div className="grid gap-4">
              {stressTests.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-[#11182b] p-4"
                >
                  <div className="flex flex-wrap gap-3 text-sm text-white/85">
                    <span className="rounded-full bg-white/10 px-3 py-1">
                      ID: {item.id}
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1">
                      Simulação: {item.simulacao_id}
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1">
                      Criticidade: {item.criticidade}
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1">
                      Score: {item.score}
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1">
                      Criado: {new Date(item.created_at).toLocaleString("pt-BR")}
                    </span>
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