"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adicionarAtivoSimulado,
  adicionarCoberturaSimulada,
  buscarResumoSimulacoes,
  criarSimulacaoSinistro,
  recalcularSimulacaoSinistro,
  type SeveridadeSinistro,
  type TipoEventoSinistro,
} from "@/lib/segmax/simulacao-sinistro";

type SimulacaoResumo = {
  id: string;
  nome_cenario: string;
  tipo_evento: TipoEventoSinistro;
  severidade_base: SeveridadeSinistro;
  status: string;
  moeda: string;
  criado_em: string;
  atualizado_em: string;
  valor_total_exposto: number | null;
  perda_direta_estimada: number | null;
  lucro_cessante_estimado: number | null;
  custo_extra_estimado: number | null;
  pml: number | null;
  impacto_financeiro_bruto: number | null;
  valor_recuperavel_seguro: number | null;
  impacto_financeiro_liquido: number | null;
  tempo_recuperacao_dias: number | null;
  criticidade_final: "baixo" | "medio" | "alto" | "critico" | null;
  score_final: number | null;
  parecer_automatico: string | null;
};

type AtivoForm = {
  nome_ativo: string;
  categoria: string;
  descricao: string;
  quantidade: string;
  valor_unitario: string;
  valor_reposicao: string;
  valor_mercado: string;
  receita_diaria_impactada: string;
  custo_diario_extra: string;
  tempo_reposicao_dias: string;
  fator_criticidade: string;
  fator_vulnerabilidade: string;
  possui_protecao_local: boolean;
  possui_redundancia_local: boolean;
  segurado: boolean;
};

type CoberturaForm = {
  nome_cobertura: string;
  tipo_cobertura: string;
  limite_indenizacao: string;
  sublimite: string;
  franquia: string;
  carencia_dias: string;
  participa_do_pml: boolean;
  ativa: boolean;
  observacoes: string;
};

const TIPOS_EVENTO: { value: TipoEventoSinistro; label: string }[] = [
  { value: "incendio", label: "Incêndio" },
  { value: "alagamento", label: "Alagamento" },
  { value: "roubo", label: "Roubo" },
  { value: "quebra_maquina", label: "Quebra de Máquina" },
  { value: "pane_eletrica", label: "Pane Elétrica" },
  { value: "responsabilidade_civil", label: "Responsabilidade Civil" },
  { value: "cyber", label: "Cyber" },
  { value: "interrupcao_negocio", label: "Interrupção de Negócio" },
  { value: "vendaval", label: "Vendaval" },
  { value: "outro", label: "Outro" },
];

const SEVERIDADES: { value: SeveridadeSinistro; label: string }[] = [
  { value: "baixo", label: "Baixo" },
  { value: "medio", label: "Médio" },
  { value: "alto", label: "Alto" },
  { value: "critico", label: "Crítico" },
];

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
  const d = new Date(date);
  return d.toLocaleString("pt-BR");
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

function statusClasses(status?: string | null) {
  switch (status) {
    case "rascunho":
      return "bg-zinc-500/15 text-zinc-300 border border-zinc-500/30";
    case "calculada":
      return "bg-blue-500/15 text-blue-300 border border-blue-500/30";
    case "aprovada_tecnicamente":
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
    case "arquivada":
      return "bg-white/5 text-zinc-400 border border-white/10";
    default:
      return "bg-white/5 text-zinc-300 border border-white/10";
  }
}

export default function SimulacoesPage() {
  const [loading, setLoading] = useState(true);
  const [salvandoSimulacao, setSalvandoSimulacao] = useState(false);
  const [salvandoAtivo, setSalvandoAtivo] = useState(false);
  const [salvandoCobertura, setSalvandoCobertura] = useState(false);
  const [calculando, setCalculando] = useState(false);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [simulacoes, setSimulacoes] = useState<SimulacaoResumo[]>([]);
  const [simulacaoSelecionadaId, setSimulacaoSelecionadaId] = useState("");

  const [simulacaoForm, setSimulacaoForm] = useState({
    nome_cenario: "",
    descricao: "",
    tipo_evento: "incendio" as TipoEventoSinistro,
    severidade_base: "medio" as SeveridadeSinistro,
    receita_mensal: "",
    custos_fixos_mensais: "",
    margem_lucro_percentual: "",
    possui_plano_continuidade: false,
    redundancia_operacional: false,
    possui_backup_externo: false,
    possui_gerador: false,
    possui_sprinkler: false,
    possui_monitoramento_24h: false,
    dependencia_fornecedor_critico: false,
    dependencia_ti: false,
    dependencia_energia: false,
    dependencia_logistica: false,
    observacoes_tecnicas: "",
  });

  const [ativoForm, setAtivoForm] = useState<AtivoForm>({
    nome_ativo: "",
    categoria: "",
    descricao: "",
    quantidade: "1",
    valor_unitario: "0",
    valor_reposicao: "0",
    valor_mercado: "0",
    receita_diaria_impactada: "0",
    custo_diario_extra: "0",
    tempo_reposicao_dias: "0",
    fator_criticidade: "1",
    fator_vulnerabilidade: "1",
    possui_protecao_local: false,
    possui_redundancia_local: false,
    segurado: false,
  });

  const [coberturaForm, setCoberturaForm] = useState<CoberturaForm>({
    nome_cobertura: "",
    tipo_cobertura: "",
    limite_indenizacao: "0",
    sublimite: "0",
    franquia: "0",
    carencia_dias: "0",
    participa_do_pml: true,
    ativa: true,
    observacoes: "",
  });

  async function carregarSimulacoes() {
    try {
      setLoading(true);
      setErro("");
      const data = await buscarResumoSimulacoes();
      setSimulacoes((data ?? []) as SimulacaoResumo[]);

      if (!simulacaoSelecionadaId && data?.length) {
        setSimulacaoSelecionadaId(data[0].id);
      }

      if (
        simulacaoSelecionadaId &&
        data?.some((item) => item.id === simulacaoSelecionadaId) === false
      ) {
        setSimulacaoSelecionadaId(data?.[0]?.id ?? "");
      }
    } catch (e: any) {
      setErro(e?.message || "Erro ao carregar simulações.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarSimulacoes();
  }, []);

  const simulacaoSelecionada = useMemo(() => {
    return simulacoes.find((item) => item.id === simulacaoSelecionadaId) || null;
  }, [simulacoes, simulacaoSelecionadaId]);

  async function handleCriarSimulacao(e: React.FormEvent) {
    e.preventDefault();

    try {
      setErro("");
      setMensagem("");
      setSalvandoSimulacao(true);

      const criada = await criarSimulacaoSinistro({
        nome_cenario: simulacaoForm.nome_cenario,
        descricao: simulacaoForm.descricao || null,
        tipo_evento: simulacaoForm.tipo_evento,
        severidade_base: simulacaoForm.severidade_base,
        receita_mensal: Number(simulacaoForm.receita_mensal || 0),
        custos_fixos_mensais: Number(simulacaoForm.custos_fixos_mensais || 0),
        margem_lucro_percentual: Number(
          simulacaoForm.margem_lucro_percentual || 0
        ),
        possui_plano_continuidade: simulacaoForm.possui_plano_continuidade,
        redundancia_operacional: simulacaoForm.redundancia_operacional,
        possui_backup_externo: simulacaoForm.possui_backup_externo,
        possui_gerador: simulacaoForm.possui_gerador,
        possui_sprinkler: simulacaoForm.possui_sprinkler,
        possui_monitoramento_24h: simulacaoForm.possui_monitoramento_24h,
        dependencia_fornecedor_critico:
          simulacaoForm.dependencia_fornecedor_critico,
        dependencia_ti: simulacaoForm.dependencia_ti,
        dependencia_energia: simulacaoForm.dependencia_energia,
        dependencia_logistica: simulacaoForm.dependencia_logistica,
        observacoes_tecnicas: simulacaoForm.observacoes_tecnicas || null,
      });

      setMensagem("Simulação criada com sucesso.");
      setSimulacaoSelecionadaId(criada.id);

      setSimulacaoForm({
        nome_cenario: "",
        descricao: "",
        tipo_evento: "incendio",
        severidade_base: "medio",
        receita_mensal: "",
        custos_fixos_mensais: "",
        margem_lucro_percentual: "",
        possui_plano_continuidade: false,
        redundancia_operacional: false,
        possui_backup_externo: false,
        possui_gerador: false,
        possui_sprinkler: false,
        possui_monitoramento_24h: false,
        dependencia_fornecedor_critico: false,
        dependencia_ti: false,
        dependencia_energia: false,
        dependencia_logistica: false,
        observacoes_tecnicas: "",
      });

      await carregarSimulacoes();
    } catch (e: any) {
      setErro(e?.message || "Erro ao criar simulação.");
    } finally {
      setSalvandoSimulacao(false);
    }
  }

  async function handleAdicionarAtivo(e: React.FormEvent) {
    e.preventDefault();

    if (!simulacaoSelecionadaId) {
      setErro("Selecione ou crie uma simulação antes de adicionar ativos.");
      return;
    }

    try {
      setErro("");
      setMensagem("");
      setSalvandoAtivo(true);

      await adicionarAtivoSimulado({
        simulacao_id: simulacaoSelecionadaId,
        nome_ativo: ativoForm.nome_ativo,
        categoria: ativoForm.categoria || null,
        descricao: ativoForm.descricao || null,
        quantidade: Number(ativoForm.quantidade || 0),
        valor_unitario: Number(ativoForm.valor_unitario || 0),
        valor_reposicao: Number(ativoForm.valor_reposicao || 0),
        valor_mercado: Number(ativoForm.valor_mercado || 0),
        receita_diaria_impactada: Number(
          ativoForm.receita_diaria_impactada || 0
        ),
        custo_diario_extra: Number(ativoForm.custo_diario_extra || 0),
        tempo_reposicao_dias: Number(ativoForm.tempo_reposicao_dias || 0),
        fator_criticidade: Number(ativoForm.fator_criticidade || 1),
        fator_vulnerabilidade: Number(ativoForm.fator_vulnerabilidade || 1),
        possui_protecao_local: ativoForm.possui_protecao_local,
        possui_redundancia_local: ativoForm.possui_redundancia_local,
        segurado: ativoForm.segurado,
      });

      setMensagem("Ativo adicionado com sucesso.");
      setAtivoForm({
        nome_ativo: "",
        categoria: "",
        descricao: "",
        quantidade: "1",
        valor_unitario: "0",
        valor_reposicao: "0",
        valor_mercado: "0",
        receita_diaria_impactada: "0",
        custo_diario_extra: "0",
        tempo_reposicao_dias: "0",
        fator_criticidade: "1",
        fator_vulnerabilidade: "1",
        possui_protecao_local: false,
        possui_redundancia_local: false,
        segurado: false,
      });
    } catch (e: any) {
      setErro(e?.message || "Erro ao adicionar ativo.");
    } finally {
      setSalvandoAtivo(false);
    }
  }

  async function handleAdicionarCobertura(e: React.FormEvent) {
    e.preventDefault();

    if (!simulacaoSelecionadaId) {
      setErro("Selecione ou crie uma simulação antes de adicionar coberturas.");
      return;
    }

    try {
      setErro("");
      setMensagem("");
      setSalvandoCobertura(true);

      await adicionarCoberturaSimulada({
        simulacao_id: simulacaoSelecionadaId,
        nome_cobertura: coberturaForm.nome_cobertura,
        tipo_cobertura: coberturaForm.tipo_cobertura || null,
        limite_indenizacao: Number(coberturaForm.limite_indenizacao || 0),
        sublimite: Number(coberturaForm.sublimite || 0),
        franquia: Number(coberturaForm.franquia || 0),
        carencia_dias: Number(coberturaForm.carencia_dias || 0),
        participa_do_pml: coberturaForm.participa_do_pml,
        ativa: coberturaForm.ativa,
        observacoes: coberturaForm.observacoes || null,
      });

      setMensagem("Cobertura adicionada com sucesso.");
      setCoberturaForm({
        nome_cobertura: "",
        tipo_cobertura: "",
        limite_indenizacao: "0",
        sublimite: "0",
        franquia: "0",
        carencia_dias: "0",
        participa_do_pml: true,
        ativa: true,
        observacoes: "",
      });
    } catch (e: any) {
      setErro(e?.message || "Erro ao adicionar cobertura.");
    } finally {
      setSalvandoCobertura(false);
    }
  }

  async function handleCalcular() {
    if (!simulacaoSelecionadaId) {
      setErro("Selecione uma simulação antes de calcular.");
      return;
    }

    try {
      setErro("");
      setMensagem("");
      setCalculando(true);

      await recalcularSimulacaoSinistro(simulacaoSelecionadaId);
      setMensagem("Simulação calculada com sucesso.");
      await carregarSimulacoes();
    } catch (e: any) {
      setErro(
        e?.message ||
          "Erro ao calcular simulação. Verifique se há ativos e coberturas vinculados."
      );
    } finally {
      setCalculando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-[#0a0a0a] via-[#101010] to-[#0a0a0a] p-6 shadow-2xl shadow-black/40">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-yellow-500/80">
                SegMax • Simulação de Sinistro
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
                Motor de Simulação de Sinistro
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-zinc-400">
                Aqui começa a parte absurda do SegMax. Este módulo estima perda
                máxima provável, impacto financeiro, valor recuperável via seguro,
                tempo de recuperação e criticidade final do cenário.
              </p>
            </div>

            <button
              onClick={handleCalcular}
              disabled={calculando || !simulacaoSelecionadaId}
              className="rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-5 py-3 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {calculando ? "Calculando..." : "Calcular Simulação"}
            </button>
          </div>

          {mensagem ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {mensagem}
            </div>
          ) : null}

          {erro ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {erro}
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="xl:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-5 shadow-xl shadow-black/30">
              <h2 className="text-lg font-semibold text-white">
                Nova simulação
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Cadastre o cenário base que será usado para o cálculo.
              </p>

              <form onSubmit={handleCriarSimulacao} className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">
                    Nome do cenário
                  </label>
                  <input
                    value={simulacaoForm.nome_cenario}
                    onChange={(e) =>
                      setSimulacaoForm((prev) => ({
                        ...prev,
                        nome_cenario: e.target.value,
                      }))
                    }
                    placeholder="Ex: Incêndio no galpão principal"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-300">
                    Descrição
                  </label>
                  <textarea
                    value={simulacaoForm.descricao}
                    onChange={(e) =>
                      setSimulacaoForm((prev) => ({
                        ...prev,
                        descricao: e.target.value,
                      }))
                    }
                    placeholder="Descreva o cenário com detalhes técnicos"
                    rows={4}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-zinc-300">
                      Tipo do evento
                    </label>
                    <select
                      value={simulacaoForm.tipo_evento}
                      onChange={(e) =>
                        setSimulacaoForm((prev) => ({
                          ...prev,
                          tipo_evento: e.target.value as TipoEventoSinistro,
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                    >
                      {TIPOS_EVENTO.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-zinc-300">
                      Severidade base
                    </label>
                    <select
                      value={simulacaoForm.severidade_base}
                      onChange={(e) =>
                        setSimulacaoForm((prev) => ({
                          ...prev,
                          severidade_base: e.target.value as SeveridadeSinistro,
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                    >
                      {SEVERIDADES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm text-zinc-300">
                      Receita mensal
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={simulacaoForm.receita_mensal}
                      onChange={(e) =>
                        setSimulacaoForm((prev) => ({
                          ...prev,
                          receita_mensal: e.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-zinc-300">
                      Custos fixos mensais
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={simulacaoForm.custos_fixos_mensais}
                      onChange={(e) =>
                        setSimulacaoForm((prev) => ({
                          ...prev,
                          custos_fixos_mensais: e.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-zinc-300">
                      Margem lucro %
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={simulacaoForm.margem_lucro_percentual}
                      onChange={(e) =>
                        setSimulacaoForm((prev) => ({
                          ...prev,
                          margem_lucro_percentual: e.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="mb-3 text-sm font-semibold text-white">
                    Maturidade operacional
                  </p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {[
                      {
                        key: "possui_plano_continuidade",
                        label: "Possui plano de continuidade",
                      },
                      {
                        key: "redundancia_operacional",
                        label: "Possui redundância operacional",
                      },
                      {
                        key: "possui_backup_externo",
                        label: "Possui backup externo",
                      },
                      { key: "possui_gerador", label: "Possui gerador" },
                      { key: "possui_sprinkler", label: "Possui sprinkler" },
                      {
                        key: "possui_monitoramento_24h",
                        label: "Possui monitoramento 24h",
                      },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3 text-sm text-zinc-300"
                      >
                        <input
                          type="checkbox"
                          checked={(simulacaoForm as any)[item.key]}
                          onChange={(e) =>
                            setSimulacaoForm((prev) => ({
                              ...prev,
                              [item.key]: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-white/20 bg-black"
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="mb-3 text-sm font-semibold text-white">
                    Dependências críticas
                  </p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {[
                      {
                        key: "dependencia_fornecedor_critico",
                        label: "Fornecedor crítico",
                      },
                      { key: "dependencia_ti", label: "Dependência de TI" },
                      {
                        key: "dependencia_energia",
                        label: "Dependência de energia",
                      },
                      {
                        key: "dependencia_logistica",
                        label: "Dependência logística",
                      },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3 text-sm text-zinc-300"
                      >
                        <input
                          type="checkbox"
                          checked={(simulacaoForm as any)[item.key]}
                          onChange={(e) =>
                            setSimulacaoForm((prev) => ({
                              ...prev,
                              [item.key]: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-white/20 bg-black"
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-300">
                    Observações técnicas
                  </label>
                  <textarea
                    value={simulacaoForm.observacoes_tecnicas}
                    onChange={(e) =>
                      setSimulacaoForm((prev) => ({
                        ...prev,
                        observacoes_tecnicas: e.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Ex: operação sem redundância, concentração de estoque, risco elétrico elevado..."
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={salvandoSimulacao}
                  className="w-full rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {salvandoSimulacao ? "Salvando..." : "Criar Simulação"}
                </button>
              </form>
            </div>
          </section>

          <section className="xl:col-span-8">
            <div className="grid grid-cols-1 gap-6">
              <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-5 shadow-xl shadow-black/30">
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Simulações criadas
                    </h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      Selecione um cenário para alimentar e calcular.
                    </p>
                  </div>

                  <button
                    onClick={carregarSimulacoes}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
                  >
                    Atualizar lista
                  </button>
                </div>

                {loading ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-6 text-sm text-zinc-400">
                    Carregando simulações...
                  </div>
                ) : simulacoes.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-6 text-sm text-zinc-400">
                    Nenhuma simulação cadastrada ainda.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {simulacoes.map((item) => {
                      const isSelected = simulacaoSelecionadaId === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSimulacaoSelecionadaId(item.id)}
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
                                  {item.nome_cenario}
                                </h3>
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                                    item.status
                                  )}`}
                                >
                                  {item.status}
                                </span>
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${criticidadeClasses(
                                    item.criticidade_final
                                  )}`}
                                >
                                  {item.criticidade_final || "sem cálculo"}
                                </span>
                              </div>

                              <p className="mt-2 text-sm text-zinc-400">
                                Evento:{" "}
                                <span className="text-zinc-200">
                                  {item.tipo_evento}
                                </span>{" "}
                                • Severidade base:{" "}
                                <span className="text-zinc-200">
                                  {item.severidade_base}
                                </span>
                              </p>

                              <p className="mt-1 text-xs text-zinc-500">
                                Criado em {formatDate(item.criado_em)}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 lg:min-w-[360px]">
                              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                                  PML
                                </p>
                                <p className="mt-1 text-sm font-semibold text-white">
                                  {formatMoney(item.pml)}
                                </p>
                              </div>

                              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                                  Impacto líquido
                                </p>
                                <p className="mt-1 text-sm font-semibold text-white">
                                  {formatMoney(item.impacto_financeiro_liquido)}
                                </p>
                              </div>

                              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                                  Recuperação
                                </p>
                                <p className="mt-1 text-sm font-semibold text-white">
                                  {formatNumber(item.tempo_recuperacao_dias)} dias
                                </p>
                              </div>

                              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                                  Score
                                </p>
                                <p className="mt-1 text-sm font-semibold text-white">
                                  {formatNumber(item.score_final)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-5 shadow-xl shadow-black/30">
                  <h2 className="text-lg font-semibold text-white">
                    Adicionar ativo afetado
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Vinculado à simulação selecionada.
                  </p>

                  <form onSubmit={handleAdicionarAtivo} className="mt-5 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm text-zinc-300">
                        Nome do ativo
                      </label>
                      <input
                        value={ativoForm.nome_ativo}
                        onChange={(e) =>
                          setAtivoForm((prev) => ({
                            ...prev,
                            nome_ativo: e.target.value,
                          }))
                        }
                        placeholder="Ex: Galpão principal"
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm text-zinc-300">
                          Categoria
                        </label>
                        <input
                          value={ativoForm.categoria}
                          onChange={(e) =>
                            setAtivoForm((prev) => ({
                              ...prev,
                              categoria: e.target.value,
                            }))
                          }
                          placeholder="Ex: imóvel, estoque, máquina"
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-zinc-300">
                          Quantidade
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.0001"
                          value={ativoForm.quantidade}
                          onChange={(e) =>
                            setAtivoForm((prev) => ({
                              ...prev,
                              quantidade: e.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-zinc-300">
                        Descrição
                      </label>
                      <textarea
                        value={ativoForm.descricao}
                        onChange={(e) =>
                          setAtivoForm((prev) => ({
                            ...prev,
                            descricao: e.target.value,
                          }))
                        }
                        rows={3}
                        placeholder="Descreva o ativo e o impacto esperado"
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm text-zinc-300">
                          Valor unitário
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={ativoForm.valor_unitario}
                          onChange={(e) =>
                            setAtivoForm((prev) => ({
                              ...prev,
                              valor_unitario: e.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-zinc-300">
                          Valor de reposição
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={ativoForm.valor_reposicao}
                          onChange={(e) =>
                            setAtivoForm((prev) => ({
                              ...prev,
                              valor_reposicao: e.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-zinc-300">
                          Valor de mercado
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={ativoForm.valor_mercado}
                          onChange={(e) =>
                            setAtivoForm((prev) => ({
                              ...prev,
                              valor_mercado: e.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-zinc-300">
                          Tempo reposição dias
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={ativoForm.tempo_reposicao_dias}
                          onChange={(e) =>
                            setAtivoForm((prev) => ({
                              ...prev,
                              tempo_reposicao_dias: e.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-zinc-300">
                          Receita diária impactada
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={ativoForm.receita_diaria_impactada}
                          onChange={(e) =>
                            setAtivoForm((prev) => ({
                              ...prev,
                              receita_diaria_impactada: e.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-zinc-300">
                          Custo diário extra
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={ativoForm.custo_diario_extra}
                          onChange={(e) =>
                            setAtivoForm((prev) => ({
                              ...prev,
                              custo_diario_extra: e.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-zinc-300">
                          Fator criticidade
                        </label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.01"
                          value={ativoForm.fator_criticidade}
                          onChange={(e) =>
                            setAtivoForm((prev) => ({
                              ...prev,
                              fator_criticidade: e.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-zinc-300">
                          Fator vulnerabilidade
                        </label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.01"
                          value={ativoForm.fator_vulnerabilidade}
                          onChange={(e) =>
                            setAtivoForm((prev) => ({
                              ...prev,
                              fator_vulnerabilidade: e.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-zinc-300">
                        <input
                          type="checkbox"
                          checked={ativoForm.possui_protecao_local}
                          onChange={(e) =>
                            setAtivoForm((prev) => ({
                              ...prev,
                              possui_protecao_local: e.target.checked,
                            }))
                          }
                          className="h-4 w-4"
                        />
                        Proteção local
                      </label>

                      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-zinc-300">
                        <input
                          type="checkbox"
                          checked={ativoForm.possui_redundancia_local}
                          onChange={(e) =>
                            setAtivoForm((prev) => ({
                              ...prev,
                              possui_redundancia_local: e.target.checked,
                            }))
                          }
                          className="h-4 w-4"
                        />
                        Redundância local
                      </label>

                      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-zinc-300">
                        <input
                          type="checkbox"
                          checked={ativoForm.segurado}
                          onChange={(e) =>
                            setAtivoForm((prev) => ({
                              ...prev,
                              segurado: e.target.checked,
                            }))
                          }
                          className="h-4 w-4"
                        />
                        Ativo segurado
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={salvandoAtivo}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {salvandoAtivo ? "Salvando ativo..." : "Adicionar Ativo"}
                    </button>
                  </form>
                </div>

                <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-5 shadow-xl shadow-black/30">
                  <h2 className="text-lg font-semibold text-white">
                    Adicionar cobertura
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Informe os limites que reduzem o impacto líquido do cenário.
                  </p>

                  <form
                    onSubmit={handleAdicionarCobertura}
                    className="mt-5 space-y-4"
                  >
                    <div>
                      <label className="mb-2 block text-sm text-zinc-300">
                        Nome da cobertura
                      </label>
                      <input
                        value={coberturaForm.nome_cobertura}
                        onChange={(e) =>
                          setCoberturaForm((prev) => ({
                            ...prev,
                            nome_cobertura: e.target.value,
                          }))
                        }
                        placeholder="Ex: Incêndio / Lucros Cessantes"
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-zinc-300">
                        Tipo da cobertura
                      </label>
                      <input
                        value={coberturaForm.tipo_cobertura}
                        onChange={(e) =>
                          setCoberturaForm((prev) => ({
                            ...prev,
                            tipo_cobertura: e.target.value,
                          }))
                        }
                        placeholder="Ex: patrimonial, lucros cessantes, equipamentos"
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm text-zinc-300">
                          Limite indenização
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={coberturaForm.limite_indenizacao}
                          onChange={(e) =>
                            setCoberturaForm((prev) => ({
                              ...prev,
                              limite_indenizacao: e.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-zinc-300">
                          Sublimite
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={coberturaForm.sublimite}
                          onChange={(e) =>
                            setCoberturaForm((prev) => ({
                              ...prev,
                              sublimite: e.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-zinc-300">
                          Franquia
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={coberturaForm.franquia}
                          onChange={(e) =>
                            setCoberturaForm((prev) => ({
                              ...prev,
                              franquia: e.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-zinc-300">
                          Carência dias
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={coberturaForm.carencia_dias}
                          onChange={(e) =>
                            setCoberturaForm((prev) => ({
                              ...prev,
                              carencia_dias: e.target.value,
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
                        value={coberturaForm.observacoes}
                        onChange={(e) =>
                          setCoberturaForm((prev) => ({
                            ...prev,
                            observacoes: e.target.value,
                          }))
                        }
                        rows={3}
                        placeholder="Ex: cobertura sujeita a sublímite e franquia elevada"
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-zinc-300">
                        <input
                          type="checkbox"
                          checked={coberturaForm.participa_do_pml}
                          onChange={(e) =>
                            setCoberturaForm((prev) => ({
                              ...prev,
                              participa_do_pml: e.target.checked,
                            }))
                          }
                          className="h-4 w-4"
                        />
                        Participa do PML
                      </label>

                      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-zinc-300">
                        <input
                          type="checkbox"
                          checked={coberturaForm.ativa}
                          onChange={(e) =>
                            setCoberturaForm((prev) => ({
                              ...prev,
                              ativa: e.target.checked,
                            }))
                          }
                          className="h-4 w-4"
                        />
                        Cobertura ativa
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={salvandoCobertura}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {salvandoCobertura
                        ? "Salvando cobertura..."
                        : "Adicionar Cobertura"}
                    </button>
                  </form>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-5 shadow-xl shadow-black/30">
                <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Resultado da simulação
                    </h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      Painel executivo do cenário selecionado.
                    </p>
                  </div>

                  {simulacaoSelecionada ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                          simulacaoSelecionada.status
                        )}`}
                      >
                        {simulacaoSelecionada.status}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${criticidadeClasses(
                          simulacaoSelecionada.criticidade_final
                        )}`}
                      >
                        {simulacaoSelecionada.criticidade_final || "sem cálculo"}
                      </span>
                    </div>
                  ) : null}
                </div>

                {!simulacaoSelecionada ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-8 text-sm text-zinc-400">
                    Selecione uma simulação para visualizar o painel.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <CardKpi
                        titulo="Valor Total Exposto"
                        valor={formatMoney(simulacaoSelecionada.valor_total_exposto)}
                      />
                      <CardKpi
                        titulo="Perda Direta Estimada"
                        valor={formatMoney(
                          simulacaoSelecionada.perda_direta_estimada
                        )}
                      />
                      <CardKpi
                        titulo="Lucro Cessante"
                        valor={formatMoney(
                          simulacaoSelecionada.lucro_cessante_estimado
                        )}
                      />
                      <CardKpi
                        titulo="Custo Extra"
                        valor={formatMoney(
                          simulacaoSelecionada.custo_extra_estimado
                        )}
                      />
                      <CardKpi
                        titulo="PML"
                        valor={formatMoney(simulacaoSelecionada.pml)}
                        destaque
                      />
                      <CardKpi
                        titulo="Impacto Bruto"
                        valor={formatMoney(
                          simulacaoSelecionada.impacto_financeiro_bruto
                        )}
                      />
                      <CardKpi
                        titulo="Recuperável Seguro"
                        valor={formatMoney(
                          simulacaoSelecionada.valor_recuperavel_seguro
                        )}
                      />
                      <CardKpi
                        titulo="Impacto Líquido"
                        valor={formatMoney(
                          simulacaoSelecionada.impacto_financeiro_liquido
                        )}
                        destaque
                      />
                      <CardKpi
                        titulo="Tempo Recuperação"
                        valor={`${formatNumber(
                          simulacaoSelecionada.tempo_recuperacao_dias
                        )} dias`}
                      />
                      <CardKpi
                        titulo="Score Final"
                        valor={formatNumber(simulacaoSelecionada.score_final)}
                      />
                      <CardKpi
                        titulo="Evento"
                        valor={simulacaoSelecionada.tipo_evento}
                      />
                      <CardKpi
                        titulo="Severidade Base"
                        valor={simulacaoSelecionada.severidade_base}
                      />
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-sm font-semibold text-white">
                        Parecer automático
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                        {simulacaoSelecionada.parecer_automatico ||
                          "Ainda não há parecer. Clique em calcular simulação."}
                      </p>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-sm font-semibold text-white">
                          Última atualização
                        </p>
                        <p className="mt-2 text-sm text-zinc-300">
                          {formatDate(simulacaoSelecionada.atualizado_em)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-sm font-semibold text-white">
                          Nome do cenário
                        </p>
                        <p className="mt-2 text-sm text-zinc-300">
                          {simulacaoSelecionada.nome_cenario}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function CardKpi({
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
      <p className="mt-2 text-lg font-bold text-white">{valor}</p>
    </div>
  );
}