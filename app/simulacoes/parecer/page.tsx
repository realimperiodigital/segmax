"use client";

import { useMemo, useState } from "react";
import {
  buscarStressTestsResumo,
  type StressTestResumo,
} from "@/lib/segmax/simulacao-sinistro";

function corCriticidade(criticidade: StressTestResumo["criticidade"]) {
  switch (criticidade) {
    case "critica":
      return "bg-red-500/15 text-red-300 border-red-400/30";
    case "alta":
      return "bg-orange-500/15 text-orange-300 border-orange-400/30";
    case "media":
      return "bg-yellow-500/15 text-yellow-300 border-yellow-300/30";
    case "baixa":
    default:
      return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
  }
}

function textoParecer(item: StressTestResumo) {
  switch (item.criticidade) {
    case "critica":
      return "Risco muito elevado. Recomendado reavaliar as condições da operação, limites e proteções antes de seguir.";
    case "alta":
      return "Risco alto. Vale revisar premissas, exposição e medidas mitigadoras antes da aprovação.";
    case "media":
      return "Risco moderado. Operação viável, mas pede acompanhamento e validação dos pontos sensíveis.";
    case "baixa":
    default:
      return "Risco controlado. Cenário mais estável dentro dos parâmetros atuais.";
  }
}

export default function ParecerSimulacoesPage() {
  const [filtroSimulacaoId, setFiltroSimulacaoId] = useState("");

  const stressTests = useMemo<StressTestResumo[]>(() => {
    return buscarStressTestsResumo();
  }, []);

  const resultados = useMemo(() => {
    if (!filtroSimulacaoId.trim()) {
      return stressTests;
    }

    return stressTests.filter((item) =>
      item.simulacao_id.toLowerCase().includes(filtroSimulacaoId.toLowerCase())
    );
  }, [stressTests, filtroSimulacaoId]);

  return (
    <main className="min-h-screen bg-[#0b1020] p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Parecer das Simulações</h1>
          <p className="mt-2 text-sm text-white/70">
            Leitura final dos stress tests com visão objetiva da criticidade.
          </p>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Filtro</h2>
              <p className="mt-1 text-sm text-white/60">
                Busque por ID da simulação para localizar um parecer específico.
              </p>
            </div>

            <div className="w-full md:max-w-md">
              <label className="mb-2 block text-sm text-white/80">
                Simulação ID
              </label>
              <input
                type="text"
                value={filtroSimulacaoId}
                onChange={(e) => setFiltroSimulacaoId(e.target.value)}
                placeholder="Digite o ID da simulação"
                className="w-full rounded-xl border border-white/10 bg-[#11182b] px-4 py-3 text-white outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#11182b] p-4">
              <p className="text-sm text-white/60">Total de pareceres</p>
              <p className="mt-2 text-3xl font-bold">{resultados.length}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#11182b] p-4">
              <p className="text-sm text-white/60">Críticos</p>
              <p className="mt-2 text-3xl font-bold">
                {resultados.filter((item) => item.criticidade === "critica").length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#11182b] p-4">
              <p className="text-sm text-white/60">Altos</p>
              <p className="mt-2 text-3xl font-bold">
                {resultados.filter((item) => item.criticidade === "alta").length}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-xl font-semibold">Parecer técnico</h2>

          {resultados.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-white/70">
              Nenhum parecer encontrado com esse filtro.
            </div>
          ) : (
            <div className="grid gap-4">
              {resultados.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-[#11182b] p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                          Stress Test: {item.id}
                        </span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                          Simulação: {item.simulacao_id}
                        </span>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${corCriticidade(
                            item.criticidade
                          )}`}
                        >
                          Criticidade: {item.criticidade}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm text-white/75">
                        <span className="rounded-full bg-white/10 px-3 py-1">
                          Score: {item.score}
                        </span>
                        <span className="rounded-full bg-white/10 px-3 py-1">
                          Criado em: {new Date(item.created_at).toLocaleString("pt-BR")}
                        </span>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm font-semibold text-white">
                          Parecer
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/75">
                          {textoParecer(item)}
                        </p>
                      </div>
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