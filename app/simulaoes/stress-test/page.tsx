"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adicionarItemStressTest,
  buscarResumoSimulacoes,
  buscarStressTestsResumo,
  calcularStressTest,
  criarStressTest,
  type CriticidadeFinal,
  type SimulacaoResumo,
  type StressTestResumo,
} from "@/lib/segmax/simulacao-sinistro";

type RankingItem = {
  simulacao_id: string;
  nome_cenario: string;
  tipo_evento: string;
  peso: number;
  pml: number;
  impacto_liquido: number;
  tempo_recuperacao_dias: number;
  score_final: number;
  criticidade_final: CriticidadeFinal;
  indice_gravidade: number;
};

function formatMoney(value?: number | null) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(date?: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleString("pt-BR");
}

function criticidadeClasses(criticidade?: string | null) {
  switch (criticidade) {
    case "baixo":
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
    case "medio":
      return "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30";
    case "alto":
      return "bg-orange-500/15 text-orange-300 border border-orange-500/30";
    case "critico":
      return "bg-red-500/15 text-red-300 border border-red-500/30";
    default:
      return "bg-white/5 text-zinc-300 border border-white/10";
  }
}

export default function StressTestPage() {
  const [loading, setLoading] = useState(true);
  const [criando, setCriando] = useState(false);
  const [adicionando, setAdicionando] = useState(false);
  const [calculando, setCalculando] = useState(false);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [simulacoes, setSimulacoes] = useState<SimulacaoResumo[]>([]);
  const [stressTests, setStressTests] = useState<StressTestResumo[]>([]);
  const [stressTestSelecionadoId, setStressTestSelecionadoId] = useState("");

  const [novoStressTest, setNovoStressTest] = useState({
    nome: "",
    descricao: "",
  });

  const [novoItem, setNovoItem] = useState({
    simulacao_id: "",
    peso: "1",
    ordem: "0",
    observacoes: "",
  });

  async function carregarTudo() {
    try {
      setLoading(true);
      setErro("");

      const [simulacoesData, stressData] = await Promise.all([
        buscarResumoSimulacoes(),
        buscarStressTestsResumo(),
      ]);

      setSimulacoes(simulacoesData);
      setStressTests(stressData);

      if (!stressTestSelecionadoId && stressData.length > 0) {
        setStressTestSelecionadoId(stressData[0].id);
      }

      if (
        stressTestSelecionadoId &&
        stressData.some((item) => item.id === stressTestSelecionadoId) === false
      ) {
        setStressTestSelecionadoId(stressData[0]?.id ?? "");
      }
    } catch (e: any) {
      setErro(e?.message || "Erro ao carregar stress tests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  const stressSelecionado = useMemo(() => {
    return (
      stressTests.find((item) => item.id === stressTestSelecionadoId) || null
    );
  }, [stressTests, stressTestSelecionadoId]);

  const ranking = useMemo(() => {
    if (!stressSelecionado?.ranking || !Array.isArray(stressSelecionado.ranking)) {
      return [] as RankingItem[];
    }

    return stressSelecionado.ranking as RankingItem[];
  }, [stressSelecionado]);

  async function handleCriarStressTest(e: React.FormEvent) {
    e.preventDefault();

    try {
      setCriando(true);
      setErro("");
      setMensagem("");

      const created = await criarStressTest({
        nome: novoStressTest.nome,
        descricao: novoStressTest.descricao || null,
      });

      setMensagem("Stress test criado com sucesso.");
      setNovoStressTest({
        nome: "",
        descricao: "",
      });

      await carregarTudo();
      setStressTestSelecionadoId(created.id);
    } catch (e: any) {
      setErro(e?.message || "Erro ao criar stress test.");
    } finally {
      setCriando(false);
    }
  }

  async function handleAdicionarItem(e: React.FormEvent) {
    e.preventDefault();

    if (!stressTestSelecionadoId) {
      setErro("Selecione ou crie um stress test antes de adicionar cenários.");
      return;
    }

    if (!novoItem.simulacao_id) {
      setErro("Selecione uma simulação para adicionar ao stress test.");
      return;
    }

    try {
      setAdicionando(true);
      setErro("");
      setMensagem("");

      await adicionarItemStressTest({
        stress_test_id: stressTestSelecionadoId,
        simulacao_id: novoItem.simulacao_id,
        peso: Number(novoItem.peso || 1),
        ordem: Number(novoItem.ordem || 0),
        observacoes: novoItem.observacoes || null,
      });

      setMensagem("Cenário adicionado ao stress test.");
      setNovoItem({
        simulacao_id: "",
        peso: "1",
        ordem: "0",
        observacoes: "",
      });

      await carregarTudo();
    } catch (e: any) {
      setErro(e?.message || "Erro ao adicionar cenário ao stress test.");
    } finally {
      setAdicionando(false);
    }
  }

  async function handleCalcularStressTest() {
    if (!stressTestSelecionadoId) {
      setErro("Selecione um stress test antes de calcular.");
      return;
    }

    try {
      setCalculando(true);
      setErro("");
      setMensagem("");

      await calcularStressTest(stressTestSelecionadoId);
      setMensagem("Stress test calculado com sucesso.");
      await carregarTudo();
    } catch (e: any) {
      setErro(e?.message || "Erro ao calcular stress test.");
    } finally {
      setCalculando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-[#0a0a0a] via-[#101010] to-[#0a0a0a] p-6 shadow-2xl shadow-black/40">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-yellow-500/80">
                SegMax • Stress Test
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
                Stress Test Multicenário
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-zinc-400">
                Compare vários cenários de sinistro, consolide o risco máximo da
                operação e descubra qual cenário realmente destrói caixa,
                patrimônio e tempo de recuperação.
              </p>
            </div>

            <button
              onClick={handleCalcularStressTest}
              disabled={calculando || !stressTestSelecionadoId}
              className="rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-5 py-3 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {calculando ? "Calculando..." : "Calcular Stress Test"}
            </button>
          </div>

          {mensagem ? (
            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {mensagem}
            </div>
          ) : null}

          {erro ? (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {erro}
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="xl:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-5 shadow-xl shadow-black/30">
              <h2 className="text-lg font-semibold text-white">
                Novo stress test
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Crie um conjunto comparativo de cenários.
              </p>

              <form onSubmit={handleCriarStressTest} className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">
                    Nome
                  </label>
                  <input
                    value={novoStressTest.nome}
                    onChange={(e) =>
                      setNovoStressTest((prev) => ({
                        ...prev,
                        nome: e.target.value,
                      }))
                    }
                    placeholder="Ex: Stress test indústria metalúrgica"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-300">
                    Descrição
                  </label>
                  <textarea
                    value={novoStressTest.descricao}
                    onChange={(e) =>
                      setNovoStressTest((prev) => ({
                        ...prev,
                        descricao: e.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Descreva a carteira, operação ou cliente alvo"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={criando}
                  className="w-full rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {criando ? "Criando..." : "Criar Stress Test"}
                </button>
              </form>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-[#0d0d0d] p-5 shadow-xl shadow-black/30">
              <h2 className="text-lg font-semibold text-white">
                Adicionar cenário
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Vincule simulações já criadas ao grupo comparativo.
              </p>

              <form onSubmit={handleAdicionarItem} className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">
                    Simulação
                  </label>
                  <select
                    value={novoItem.simulacao_id}
                    onChange={(e) =>
                      setNovoItem((prev) => ({
                        ...prev,
                        simulacao_id: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                    required
                  >
                    <option value="">Selecione</option>
                    {simulacoes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nome_cenario} • {item.tipo_evento}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm text-zinc-300">
                      Peso
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.01"
                      value={novoItem.peso}
                      onChange={(e) =>
                        setNovoItem((prev) => ({
                          ...prev,
                          peso: e.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-zinc-300">
                      Ordem
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={novoItem.ordem}
                      onChange={(e) =>
                        setNovoItem((prev) => ({
                          ...prev,
                          ordem: e.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-300">
                    Observações
                  </label>
                  <textarea
                    value={novoItem.observacoes}
                    onChange={(e) =>
                      setNovoItem((prev) => ({
                        ...prev,
                        observacoes: e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Ex: cenário prioritário para análise técnica"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={adicionando}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {adicionando ? "Adicionando..." : "Adicionar Cenário"}
                </button>
              </form>
            </div>
          </section>

          <section className="xl:col-span-8">
            <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-5 shadow-xl shadow-black/30">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Stress tests criados
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Escolha um grupo para ver o consolidado.
                  </p>
                </div>

                <button
                  onClick={carregarTudo}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
                >
                  Atualizar
                </button>
              </div>

              {loading ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-6 text-sm text-zinc-400">
                  Carregando...
                </div>
              ) : stressTests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-6 text-sm text-zinc-400">
                  Nenhum stress test cadastrado ainda.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {stressTests.map((item) => {
                    const isSelected = item.id === stressTestSelecionadoId;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setStressTestSelecionadoId(item.id)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          isSelected
                            ? "border-yellow-500/40 bg-yellow-500/10"
                            : "border-white/10 bg-black/20 hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-semibold text-white">
                                {item.nome}
                              </h3>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${criticidadeClasses(
                                  item.criticidade_predominante
                                )}`}
                              >
                                {item.criticidade_predominante || "sem cálculo"}
                              </span>
                            </div>

                            <p className="mt-2 text-sm text-zinc-400">
                              {item.descricao || "Sem descrição"}
                            </p>

                            <p className="mt-2 text-xs text-zinc-500">
                              Criado em {formatDate(item.criado_em)}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 lg:min-w-[360px]">
                            <MiniKpi
                              label="Cenários"
                              value={formatNumber(item.total_cenarios)}
                            />
                            <MiniKpi
                              label="PML Máximo"
                              value={formatMoney(item.pml_maximo)}
                            />
                            <MiniKpi
                              label="Impacto Máximo"
                              value={formatMoney(item.impacto_liquido_maximo)}
                            />
                            <MiniKpi
                              label="Score Médio"
                              value={formatNumber(item.score_medio)}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-[#0d0d0d] p-5 shadow-xl shadow-black/30">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Consolidado do stress test
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Visão executiva do pior caso e ranking técnico dos cenários.
                </p>
              </div>

              {!stressSelecionado ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-8 text-sm text-zinc-400">
                  Selecione um stress test para visualizar o consolidado.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                      titulo="Total de Cenários"
                      valor={formatNumber(stressSelecionado.total_cenarios)}
                    />
                    <KpiCard
                      titulo="PML Máximo"
                      valor={formatMoney(stressSelecionado.pml_maximo)}
                      destaque
                    />
                    <KpiCard
                      titulo="Impacto Líquido Máximo"
                      valor={formatMoney(stressSelecionado.impacto_liquido_maximo)}
                      destaque
                    />
                    <KpiCard
                      titulo="Maior Recuperação"
                      valor={`${formatNumber(
                        stressSelecionado.tempo_recuperacao_maximo_dias
                      )} dias`}
                    />
                    <KpiCard
                      titulo="Score Médio"
                      valor={formatNumber(stressSelecionado.score_medio)}
                    />
                    <KpiCard
                      titulo="Criticidade Predominante"
                      valor={stressSelecionado.criticidade_predominante || "-"}
                    />
                    <KpiCard
                      titulo="Mais Crítica"
                      valor={stressSelecionado.simulacao_mais_critica_id || "-"}
                    />
                    <KpiCard
                      titulo="Atualizado"
                      valor={formatDate(stressSelecionado.atualizado_em)}
                    />
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-sm font-semibold text-white">
                      Parecer consolidado
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                      {stressSelecionado.parecer_consolidado ||
                        "Ainda não há parecer consolidado. Clique em calcular stress test."}
                    </p>
                  </div>

                  <div className="mt-5">
                    <p className="mb-3 text-sm font-semibold text-white">
                      Ranking técnico dos cenários
                    </p>

                    {ranking.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-6 text-sm text-zinc-400">
                        Ainda não há ranking calculado.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {ranking.map((item, index) => (
                          <div
                            key={`${item.simulacao_id}-${index}`}
                            className="rounded-2xl border border-white/10 bg-black/20 p-4"
                          >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-300">
                                    #{index + 1}
                                  </span>
                                  <h3 className="text-base font-semibold text-white">
                                    {item.nome_cenario}
                                  </h3>
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${criticidadeClasses(
                                      item.criticidade_final
                                    )}`}
                                  >
                                    {item.criticidade_final}
                                  </span>
                                </div>

                                <p className="mt-2 text-sm text-zinc-400">
                                  Evento:{" "}
                                  <span className="text-zinc-200">
                                    {item.tipo_evento}
                                  </span>{" "}
                                  • Peso:{" "}
                                  <span className="text-zinc-200">
                                    {formatNumber(item.peso)}
                                  </span>{" "}
                                  • Índice de gravidade:{" "}
                                  <span className="text-zinc-200">
                                    {formatNumber(item.indice_gravidade)}
                                  </span>
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-3 lg:min-w-[360px]">
                                <MiniKpi
                                  label="PML"
                                  value={formatMoney(item.pml)}
                                />
                                <MiniKpi
                                  label="Impacto Líquido"
                                  value={formatMoney(item.impacto_liquido)}
                                />
                                <MiniKpi
                                  label="Recuperação"
                                  value={`${formatNumber(
                                    item.tempo_recuperacao_dias
                                  )} dias`}
                                />
                                <MiniKpi
                                  label="Score"
                                  value={formatNumber(item.score_final)}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function KpiCard({
  titulo,
  valor,
  destaque = false,
}: {
  titulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        destaque
          ? "border-yellow-500/30 bg-yellow-500/10"
          : "border-white/10 bg-black/20"
      }`}
    >
      <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">
        {titulo}
      </p>
      <p className="mt-2 text-lg font-bold text-white break-all">{valor}</p>
    </div>
  );
}

function MiniKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}