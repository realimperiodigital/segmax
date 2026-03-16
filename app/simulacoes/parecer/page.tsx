"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buscarStressTestsResumo,
  type CriticidadeFinal,
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

function gerarResumoExecutivo(stress: StressTestResumo | null, ranking: RankingItem[]) {
  if (!stress) return "";

  const principal = ranking[0];

  return [
    `Este parecer executivo consolida a análise multicenário do grupo "${stress.nome}".`,
    `Foram considerados ${formatNumber(stress.total_cenarios)} cenários de sinistro para avaliar a exposição máxima da operação.`,
    `O maior PML identificado foi de ${formatMoney(stress.pml_maximo)}, com impacto financeiro líquido máximo estimado em ${formatMoney(stress.impacto_liquido_maximo)}.`,
    `O maior tempo estimado de recuperação foi de ${formatNumber(stress.tempo_recuperacao_maximo_dias)} dias, com criticidade predominante classificada como ${String(
      stress.criticidade_predominante || "-"
    ).toUpperCase()}.`,
    principal
      ? `O cenário atualmente mais sensível é "${principal.nome_cenario}", vinculado ao evento ${principal.tipo_evento}, com índice de gravidade de ${formatNumber(
          principal.indice_gravidade
        )}.`
      : "Ainda não há cenário líder calculado.",
  ].join(" ");
}

function gerarLeituraTecnica(stress: StressTestResumo | null) {
  if (!stress) return [];

  const criticidade = stress.criticidade_predominante || "medio";
  const pml = Number(stress.pml_maximo || 0);
  const impacto = Number(stress.impacto_liquido_maximo || 0);
  const tempo = Number(stress.tempo_recuperacao_maximo_dias || 0);

  const linhas: string[] = [];

  if (criticidade === "critico") {
    linhas.push(
      "A operação apresenta vulnerabilidade elevada e potencial relevante de desorganização financeira em evento severo."
    );
  } else if (criticidade === "alto") {
    linhas.push(
      "A operação apresenta sensibilidade importante a eventos críticos e exige reforço técnico em prevenção, contingência e transferência de risco."
    );
  } else if (criticidade === "medio") {
    linhas.push(
      "A operação apresenta risco administrável, mas com pontos de fragilidade que podem ampliar perdas se não forem tratados."
    );
  } else {
    linhas.push(
      "A operação demonstra perfil relativamente controlado, embora ainda requeira disciplina de prevenção e continuidade."
    );
  }

  if (pml >= 1000000) {
    linhas.push(
      "O valor máximo de perda provável encontra-se em faixa alta, o que justifica revisão cuidadosa de limites, sub-limites e franquias."
    );
  } else if (pml >= 300000) {
    linhas.push(
      "O PML calculado encontra-se em faixa intermediária relevante, exigindo alinhamento entre proteção operacional e estrutura de cobertura."
    );
  } else {
    linhas.push(
      "O PML apurado encontra-se em faixa mais moderada, mas ainda precisa ser confrontado com a capacidade financeira da operação."
    );
  }

  if (impacto >= 500000) {
    linhas.push(
      "O impacto líquido estimado mostra que a dependência da indenização securitária é material para preservar caixa e continuidade do negócio."
    );
  }

  if (tempo >= 30) {
    linhas.push(
      "O tempo de recuperação estimado é elevado e indica necessidade imediata de plano de continuidade, redundância e resposta operacional."
    );
  } else if (tempo >= 10) {
    linhas.push(
      "O tempo de recuperação é relevante e pode comprometer fluxo operacional, atendimento e estabilidade financeira."
    );
  } else {
    linhas.push(
      "O tempo de recuperação está em faixa mais curta, mas ainda deve ser considerado na calibração de lucros cessantes e despesas fixas."
    );
  }

  return linhas;
}

function gerarRecomendacoes(stress: StressTestResumo | null, ranking: RankingItem[]) {
  if (!stress) return [];

  const principal = ranking[0];
  const criticidade = stress.criticidade_predominante || "medio";
  const recs: string[] = [];

  recs.push("Revisar limites de indenização à luz do PML máximo consolidado.");
  recs.push("Reavaliar franquias, sub-limites e aderência das coberturas ao cenário operacional real.");
  recs.push("Fortalecer plano de continuidade de negócios e resposta a incidentes críticos.");

  if (principal?.tipo_evento === "incendio") {
    recs.push("Priorizar inspeção elétrica, compartimentação, combate inicial e proteção contra incêndio.");
  }

  if (principal?.tipo_evento === "alagamento") {
    recs.push("Priorizar drenagem, barreiras físicas, proteção de ativos sensíveis e revisão de localização crítica.");
  }

  if (principal?.tipo_evento === "cyber") {
    recs.push("Priorizar backup externo, segregação de acesso, contingência digital e resposta a incidente cibernético.");
  }

  if (principal?.tipo_evento === "quebra_maquina" || principal?.tipo_evento === "pane_eletrica") {
    recs.push("Priorizar manutenção preventiva, redundância técnica e proteção elétrica dos ativos críticos.");
  }

  if (criticidade === "alto" || criticidade === "critico") {
    recs.push("Recomenda-se parecer técnico humano complementar antes da definição final do desenho securitário.");
  }

  return Array.from(new Set(recs));
}

export default function ParecerTecnicoPage() {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [stressTests, setStressTests] = useState<StressTestResumo[]>([]);
  const [stressSelecionadoId, setStressSelecionadoId] = useState("");

  async function carregar() {
    try {
      setLoading(true);
      setErro("");

      const data = await buscarStressTestsResumo();
      setStressTests(data);

      if (!stressSelecionadoId && data.length > 0) {
        setStressSelecionadoId(data[0].id);
      }

      if (
        stressSelecionadoId &&
        data.some((item) => item.id === stressSelecionadoId) === false
      ) {
        setStressSelecionadoId(data[0]?.id ?? "");
      }
    } catch (e: any) {
      setErro(e?.message || "Erro ao carregar parecer técnico.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const stressSelecionado = useMemo(() => {
    return stressTests.find((item) => item.id === stressSelecionadoId) || null;
  }, [stressTests, stressSelecionadoId]);

  const ranking = useMemo(() => {
    if (!stressSelecionado?.ranking || !Array.isArray(stressSelecionado.ranking)) {
      return [] as RankingItem[];
    }
    return stressSelecionado.ranking as RankingItem[];
  }, [stressSelecionado]);

  const resumoExecutivo = useMemo(() => {
    return gerarResumoExecutivo(stressSelecionado, ranking);
  }, [stressSelecionado, ranking]);

  const leituraTecnica = useMemo(() => {
    return gerarLeituraTecnica(stressSelecionado);
  }, [stressSelecionado]);

  const recomendacoes = useMemo(() => {
    return gerarRecomendacoes(stressSelecionado, ranking);
  }, [stressSelecionado, ranking]);

  const principal = ranking[0] || null;

  return (
    <main className="min-h-screen bg-[#050505] text-white print:bg-white print:text-black">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8 print:max-w-none print:px-0">
        <div className="mb-6 rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-[#0a0a0a] via-[#101010] to-[#0a0a0a] p-6 shadow-2xl shadow-black/40 print:hidden">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-yellow-500/80">
                SegMax • Parecer Executivo
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
                Parecer Técnico Executivo Premium
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-zinc-400">
                Transforme o stress test em um parecer profissional para análise,
                apresentação e validação técnica.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.print()}
                className="rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-5 py-3 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/20"
              >
                Imprimir / Salvar PDF
              </button>

              <button
                onClick={carregar}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-white/10"
              >
                Atualizar
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 print:hidden">
          <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-5 shadow-xl shadow-black/30">
            <label className="mb-2 block text-sm text-zinc-300">
              Selecione o stress test
            </label>
            <select
              value={stressSelecionadoId}
              onChange={(e) => setStressSelecionadoId(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
            >
              <option value="">Selecione</option>
              {stressTests.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-8 text-sm text-zinc-400">
            Carregando parecer técnico...
          </div>
        ) : erro ? (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-sm text-red-300">
            {erro}
          </div>
        ) : !stressSelecionado ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-[#0d0d0d] p-8 text-sm text-zinc-400">
            Nenhum stress test selecionado.
          </div>
        ) : (
          <section className="rounded-3xl border border-white/10 bg-white text-black shadow-2xl print:rounded-none print:border-0 print:shadow-none">
            <div className="border-b border-black/10 px-8 py-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-zinc-500">
                    SegMax CRM
                  </p>
                  <h2 className="mt-3 text-3xl font-bold text-zinc-950">
                    Parecer Técnico Executivo
                  </h2>
                  <p className="mt-2 text-sm text-zinc-600">
                    Documento executivo de análise multicenário e exposição técnica
                  </p>
                </div>

                <div className="text-sm text-zinc-600">
                  <p>
                    <strong>Stress test:</strong> {stressSelecionado.nome}
                  </p>
                  <p>
                    <strong>Gerado em:</strong> {formatDate(new Date().toISOString())}
                  </p>
                  <p>
                    <strong>Última atualização:</strong>{" "}
                    {formatDate(stressSelecionado.atualizado_em)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 px-8 py-8 lg:grid-cols-4">
              <Kpi titulo="Total de cenários" valor={formatNumber(stressSelecionado.total_cenarios)} />
              <Kpi titulo="PML máximo" valor={formatMoney(stressSelecionado.pml_maximo)} destaque />
              <Kpi
                titulo="Impacto líquido máximo"
                valor={formatMoney(stressSelecionado.impacto_liquido_maximo)}
                destaque
              />
              <Kpi
                titulo="Tempo máximo de recuperação"
                valor={`${formatNumber(stressSelecionado.tempo_recuperacao_maximo_dias)} dias`}
              />
            </div>

            <div className="px-8 pb-8">
              <div className="rounded-2xl border border-black/10 bg-zinc-50 p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
                      Classificação consolidada
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${criticidadeClasses(
                          stressSelecionado.criticidade_predominante
                        )}`}
                      >
                        {String(stressSelecionado.criticidade_predominante || "-").toUpperCase()}
                      </span>

                      <span className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-zinc-800">
                        Score médio: {formatNumber(stressSelecionado.score_medio)}
                      </span>
                    </div>
                  </div>

                  <div className="max-w-xl text-sm leading-7 text-zinc-700">
                    {stressSelecionado.parecer_consolidado ||
                      "Ainda não há parecer consolidado calculado para este stress test."}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 px-8 pb-8 lg:grid-cols-2">
              <Bloco titulo="1. Resumo executivo">
                <p className="leading-8 text-zinc-700">{resumoExecutivo}</p>
              </Bloco>

              <Bloco titulo="2. Leitura técnica">
                <ul className="space-y-3 text-zinc-700">
                  {leituraTecnica.map((item, index) => (
                    <li key={index} className="leading-8">
                      • {item}
                    </li>
                  ))}
                </ul>
              </Bloco>

              <Bloco titulo="3. Cenário de maior sensibilidade">
                {principal ? (
                  <div className="space-y-3 text-zinc-700">
                    <p>
                      <strong>Cenário:</strong> {principal.nome_cenario}
                    </p>
                    <p>
                      <strong>Evento:</strong> {principal.tipo_evento}
                    </p>
                    <p>
                      <strong>PML:</strong> {formatMoney(principal.pml)}
                    </p>
                    <p>
                      <strong>Impacto líquido:</strong> {formatMoney(principal.impacto_liquido)}
                    </p>
                    <p>
                      <strong>Recuperação:</strong> {formatNumber(principal.tempo_recuperacao_dias)} dias
                    </p>
                    <p>
                      <strong>Score:</strong> {formatNumber(principal.score_final)}
                    </p>
                    <p>
                      <strong>Índice de gravidade:</strong> {formatNumber(principal.indice_gravidade)}
                    </p>
                  </div>
                ) : (
                  <p className="leading-8 text-zinc-700">
                    Ainda não há ranking calculado para este stress test.
                  </p>
                )}
              </Bloco>

              <Bloco titulo="4. Recomendações prioritárias">
                <ul className="space-y-3 text-zinc-700">
                  {recomendacoes.map((item, index) => (
                    <li key={index} className="leading-8">
                      • {item}
                    </li>
                  ))}
                </ul>
              </Bloco>
            </div>

            <div className="px-8 pb-8">
              <Bloco titulo="5. Ranking técnico dos cenários">
                {ranking.length === 0 ? (
                  <p className="leading-8 text-zinc-700">
                    Ainda não há ranking calculado.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="border-b border-black/10 text-left">
                          <th className="px-3 py-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
                            Ordem
                          </th>
                          <th className="px-3 py-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
                            Cenário
                          </th>
                          <th className="px-3 py-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
                            Evento
                          </th>
                          <th className="px-3 py-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
                            PML
                          </th>
                          <th className="px-3 py-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
                            Impacto líquido
                          </th>
                          <th className="px-3 py-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
                            Recuperação
                          </th>
                          <th className="px-3 py-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
                            Score
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {ranking.map((item, index) => (
                          <tr key={`${item.simulacao_id}-${index}`} className="border-b border-black/5">
                            <td className="px-3 py-4 text-sm text-zinc-700">#{index + 1}</td>
                            <td className="px-3 py-4 text-sm font-semibold text-zinc-900">
                              {item.nome_cenario}
                            </td>
                            <td className="px-3 py-4 text-sm text-zinc-700">{item.tipo_evento}</td>
                            <td className="px-3 py-4 text-sm text-zinc-700">{formatMoney(item.pml)}</td>
                            <td className="px-3 py-4 text-sm text-zinc-700">
                              {formatMoney(item.impacto_liquido)}
                            </td>
                            <td className="px-3 py-4 text-sm text-zinc-700">
                              {formatNumber(item.tempo_recuperacao_dias)} dias
                            </td>
                            <td className="px-3 py-4 text-sm text-zinc-700">
                              {formatNumber(item.score_final)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Bloco>
            </div>

            <div className="border-t border-black/10 px-8 py-6 text-sm text-zinc-500">
              Documento gerado automaticamente pelo motor técnico do SegMax.
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Kpi({
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
      className={`rounded-2xl border p-5 ${
        destaque ? "border-yellow-400 bg-yellow-50" : "border-black/10 bg-white"
      }`}
    >
      <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">
        {titulo}
      </p>
      <p className="mt-2 text-2xl font-bold text-zinc-950 break-words">{valor}</p>
    </div>
  );
}

function Bloco({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6">
      <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
        {titulo}
      </p>
      {children}
    </div>
  );
}