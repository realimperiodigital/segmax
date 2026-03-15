import { supabase } from "@/lib/supabase";

export type TipoEventoSinistro =
  | "incendio"
  | "alagamento"
  | "roubo"
  | "quebra_maquina"
  | "pane_eletrica"
  | "responsabilidade_civil"
  | "cyber"
  | "interrupcao_negocio"
  | "vendaval"
  | "outro";

export type SeveridadeSinistro = "baixo" | "medio" | "alto" | "critico";

export type CriticidadeFinal = "baixo" | "medio" | "alto" | "critico";

export type CriarSimulacaoSinistroPayload = {
  corretora_id?: string | null;
  cliente_id?: string | null;
  cotacao_id?: string | null;
  usuario_id?: string | null;
  nome_cenario: string;
  descricao?: string | null;
  tipo_evento: TipoEventoSinistro;
  severidade_base: SeveridadeSinistro;
  receita_mensal?: number;
  custos_fixos_mensais?: number;
  margem_lucro_percentual?: number;
  possui_plano_continuidade?: boolean;
  redundancia_operacional?: boolean;
  possui_backup_externo?: boolean;
  possui_gerador?: boolean;
  possui_sprinkler?: boolean;
  possui_monitoramento_24h?: boolean;
  dependencia_fornecedor_critico?: boolean;
  dependencia_ti?: boolean;
  dependencia_energia?: boolean;
  dependencia_logistica?: boolean;
  observacoes_tecnicas?: string | null;
};

export type AtivoSimuladoPayload = {
  simulacao_id: string;
  nome_ativo: string;
  categoria?: string | null;
  descricao?: string | null;
  quantidade?: number;
  valor_unitario?: number;
  valor_reposicao?: number;
  valor_mercado?: number;
  receita_diaria_impactada?: number;
  custo_diario_extra?: number;
  tempo_reposicao_dias?: number;
  fator_criticidade?: number;
  fator_vulnerabilidade?: number;
  possui_protecao_local?: boolean;
  possui_redundancia_local?: boolean;
  segurado?: boolean;
};

export type CoberturaSimuladaPayload = {
  simulacao_id: string;
  nome_cobertura: string;
  tipo_cobertura?: string | null;
  limite_indenizacao?: number;
  sublimite?: number;
  franquia?: number;
  carencia_dias?: number;
  participa_do_pml?: boolean;
  ativa?: boolean;
  observacoes?: string | null;
};

export type SimulacaoResumo = {
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
  criticidade_final: CriticidadeFinal | null;
  score_final: number | null;
  parecer_automatico: string | null;
};

export type CriarStressTestPayload = {
  nome: string;
  descricao?: string | null;
  corretora_id?: string | null;
  cliente_id?: string | null;
  cotacao_id?: string | null;
  usuario_id?: string | null;
};

export type AdicionarStressTestItemPayload = {
  stress_test_id: string;
  simulacao_id: string;
  peso?: number;
  ordem?: number;
  observacoes?: string | null;
};

export type StressTestResumo = {
  id: string;
  nome: string;
  descricao: string | null;
  corretora_id: string | null;
  cliente_id: string | null;
  cotacao_id: string | null;
  usuario_id: string | null;
  criado_em: string;
  atualizado_em: string;
  total_cenarios: number | null;
  pml_maximo: number | null;
  impacto_liquido_maximo: number | null;
  tempo_recuperacao_maximo_dias: number | null;
  score_medio: number | null;
  simulacao_mais_critica_id: string | null;
  criticidade_predominante: CriticidadeFinal | null;
  ranking: any[] | null;
  parecer_consolidado: string | null;
};

export async function criarSimulacaoSinistro(
  payload: CriarSimulacaoSinistroPayload
) {
  const { data, error } = await supabase
    .from("sinistro_simulacoes")
    .insert({
      corretora_id: payload.corretora_id ?? null,
      cliente_id: payload.cliente_id ?? null,
      cotacao_id: payload.cotacao_id ?? null,
      usuario_id: payload.usuario_id ?? null,
      nome_cenario: payload.nome_cenario,
      descricao: payload.descricao ?? null,
      tipo_evento: payload.tipo_evento,
      severidade_base: payload.severidade_base,
      receita_mensal: payload.receita_mensal ?? 0,
      custos_fixos_mensais: payload.custos_fixos_mensais ?? 0,
      margem_lucro_percentual: payload.margem_lucro_percentual ?? 0,
      possui_plano_continuidade: payload.possui_plano_continuidade ?? false,
      redundancia_operacional: payload.redundancia_operacional ?? false,
      possui_backup_externo: payload.possui_backup_externo ?? false,
      possui_gerador: payload.possui_gerador ?? false,
      possui_sprinkler: payload.possui_sprinkler ?? false,
      possui_monitoramento_24h: payload.possui_monitoramento_24h ?? false,
      dependencia_fornecedor_critico:
        payload.dependencia_fornecedor_critico ?? false,
      dependencia_ti: payload.dependencia_ti ?? false,
      dependencia_energia: payload.dependencia_energia ?? false,
      dependencia_logistica: payload.dependencia_logistica ?? false,
      observacoes_tecnicas: payload.observacoes_tecnicas ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function adicionarAtivoSimulado(payload: AtivoSimuladoPayload) {
  const { data, error } = await supabase
    .from("sinistro_simulacao_ativos")
    .insert({
      simulacao_id: payload.simulacao_id,
      nome_ativo: payload.nome_ativo,
      categoria: payload.categoria ?? null,
      descricao: payload.descricao ?? null,
      quantidade: payload.quantidade ?? 1,
      valor_unitario: payload.valor_unitario ?? 0,
      valor_reposicao: payload.valor_reposicao ?? 0,
      valor_mercado: payload.valor_mercado ?? 0,
      receita_diaria_impactada: payload.receita_diaria_impactada ?? 0,
      custo_diario_extra: payload.custo_diario_extra ?? 0,
      tempo_reposicao_dias: payload.tempo_reposicao_dias ?? 0,
      fator_criticidade: payload.fator_criticidade ?? 1,
      fator_vulnerabilidade: payload.fator_vulnerabilidade ?? 1,
      possui_protecao_local: payload.possui_protecao_local ?? false,
      possui_redundancia_local: payload.possui_redundancia_local ?? false,
      segurado: payload.segurado ?? false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function adicionarCoberturaSimulada(
  payload: CoberturaSimuladaPayload
) {
  const { data, error } = await supabase
    .from("sinistro_simulacao_coberturas")
    .insert({
      simulacao_id: payload.simulacao_id,
      nome_cobertura: payload.nome_cobertura,
      tipo_cobertura: payload.tipo_cobertura ?? null,
      limite_indenizacao: payload.limite_indenizacao ?? 0,
      sublimite: payload.sublimite ?? 0,
      franquia: payload.franquia ?? 0,
      carencia_dias: payload.carencia_dias ?? 0,
      participa_do_pml: payload.participa_do_pml ?? true,
      ativa: payload.ativa ?? true,
      observacoes: payload.observacoes ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function recalcularSimulacaoSinistro(simulacaoId: string) {
  const { data, error } = await supabase.rpc("calcular_simulacao_sinistro", {
    p_simulacao_id: simulacaoId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function buscarResumoSimulacoes() {
  const { data, error } = await supabase
    .from("vw_sinistro_simulacoes_resumo")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as SimulacaoResumo[];
}

export async function buscarSimulacaoPorId(simulacaoId: string) {
  const { data, error } = await supabase
    .from("vw_sinistro_simulacoes_resumo")
    .select("*")
    .eq("id", simulacaoId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as SimulacaoResumo;
}

export async function criarStressTest(payload: CriarStressTestPayload) {
  const { data, error } = await supabase
    .from("sinistro_stress_tests")
    .insert({
      nome: payload.nome,
      descricao: payload.descricao ?? null,
      corretora_id: payload.corretora_id ?? null,
      cliente_id: payload.cliente_id ?? null,
      cotacao_id: payload.cotacao_id ?? null,
      usuario_id: payload.usuario_id ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function adicionarItemStressTest(
  payload: AdicionarStressTestItemPayload
) {
  const { data, error } = await supabase
    .from("sinistro_stress_test_itens")
    .insert({
      stress_test_id: payload.stress_test_id,
      simulacao_id: payload.simulacao_id,
      peso: payload.peso ?? 1,
      ordem: payload.ordem ?? 0,
      observacoes: payload.observacoes ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function calcularStressTest(stressTestId: string) {
  const { data, error } = await supabase.rpc("calcular_stress_test_sinistro", {
    p_stress_test_id: stressTestId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function buscarStressTestsResumo() {
  const { data, error } = await supabase
    .from("vw_sinistro_stress_tests_resumo")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as StressTestResumo[];
}

export async function buscarStressTestPorId(stressTestId: string) {
  const { data, error } = await supabase
    .from("vw_sinistro_stress_tests_resumo")
    .select("*")
    .eq("id", stressTestId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as StressTestResumo;
}