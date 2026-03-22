import crypto from "crypto";

export type TipoEventoSinistro =
  | "colisao"
  | "roubo"
  | "furto"
  | "incendio"
  | "alagamento"
  | "terceiros"
  | "cyber"
  | "interrupcao_negocio"
  | "vendaval"
  | "outro";

export type CriticidadeStress = "baixa" | "media" | "alta" | "critica";

export interface SimulacaoSinistro {
  id: string;
  tipo_evento: TipoEventoSinistro;
  descricao?: string;
  created_at: string;
  updated_at: string;
  score: number;
  nivel_risco: CriticidadeStress;
}

export interface SimulacaoResumo {
  simulacao_id: string;
  tipo_evento: TipoEventoSinistro;
  descricao?: string;
  score: number;
  nivel_risco: CriticidadeStress;
  created_at: string;
  updated_at: string;
}

export interface StressTestResumo {
  id: string;
  simulacao_id: string;
  criticidade: CriticidadeStress;
  score: number;
  created_at: string;
}

export const TIPOS_EVENTO_SINISTRO: Array<{
  value: TipoEventoSinistro;
  label: string;
}> = [
  { value: "colisao", label: "Colisão" },
  { value: "roubo", label: "Roubo" },
  { value: "furto", label: "Furto" },
  { value: "incendio", label: "Incêndio" },
  { value: "alagamento", label: "Alagamento" },
  { value: "terceiros", label: "Danos a Terceiros" },
  { value: "cyber", label: "Cyber" },
  { value: "interrupcao_negocio", label: "Interrupção de Negócio" },
  { value: "vendaval", label: "Vendaval" },
  { value: "outro", label: "Outro" },
];

const simulacoes: SimulacaoSinistro[] = [];
const stressTests: StressTestResumo[] = [];

function agoraIso(): string {
  return new Date().toISOString();
}

function calcularScorePorTipo(tipo: TipoEventoSinistro): number {
  switch (tipo) {
    case "colisao":
      return 55;
    case "roubo":
      return 80;
    case "furto":
      return 70;
    case "incendio":
      return 90;
    case "alagamento":
      return 85;
    case "terceiros":
      return 50;
    case "cyber":
      return 75;
    case "interrupcao_negocio":
      return 88;
    case "vendaval":
      return 78;
    case "outro":
    default:
      return 40;
  }
}

function calcularNivelRisco(score: number): CriticidadeStress {
  if (score >= 85) return "critica";
  if (score >= 70) return "alta";
  if (score >= 50) return "media";
  return "baixa";
}

function transformarEmResumo(
  simulacao: SimulacaoSinistro
): SimulacaoResumo {
  return {
    simulacao_id: simulacao.id,
    tipo_evento: simulacao.tipo_evento,
    descricao: simulacao.descricao,
    score: simulacao.score,
    nivel_risco: simulacao.nivel_risco,
    created_at: simulacao.created_at,
    updated_at: simulacao.updated_at,
  };
}

export function criarSimulacaoSinistro(
  tipo: TipoEventoSinistro,
  descricao?: string
): SimulacaoSinistro {
  const score = calcularScorePorTipo(tipo);

  const nova: SimulacaoSinistro = {
    id: crypto.randomUUID(),
    tipo_evento: tipo,
    descricao,
    created_at: agoraIso(),
    updated_at: agoraIso(),
    score,
    nivel_risco: calcularNivelRisco(score),
  };

  simulacoes.push(nova);

  return nova;
}

export function listarSimulacoes(): SimulacaoSinistro[] {
  return [...simulacoes];
}

export function buscarSimulacaoSinistroPorId(
  id: string
): SimulacaoSinistro | null {
  return simulacoes.find((item) => item.id === id) ?? null;
}

export function recalcularSimulacaoSinistro(
  simulacaoId: string
): SimulacaoSinistro | null {
  const simulacao = simulacoes.find((item) => item.id === simulacaoId);

  if (!simulacao) {
    return null;
  }

  const novoScore = calcularScorePorTipo(simulacao.tipo_evento);

  simulacao.score = novoScore;
  simulacao.nivel_risco = calcularNivelRisco(novoScore);
  simulacao.updated_at = agoraIso();

  return simulacao;
}

export function atualizarSimulacaoSinistro(
  simulacaoId: string,
  dados: Partial<Pick<SimulacaoSinistro, "tipo_evento" | "descricao">>
): SimulacaoSinistro | null {
  const simulacao = simulacoes.find((item) => item.id === simulacaoId);

  if (!simulacao) {
    return null;
  }

  if (dados.tipo_evento) {
    simulacao.tipo_evento = dados.tipo_evento;
  }

  if (typeof dados.descricao !== "undefined") {
    simulacao.descricao = dados.descricao;
  }

  const novoScore = calcularScorePorTipo(simulacao.tipo_evento);

  simulacao.score = novoScore;
  simulacao.nivel_risco = calcularNivelRisco(novoScore);
  simulacao.updated_at = agoraIso();

  return simulacao;
}

export function excluirSimulacaoSinistro(simulacaoId: string): boolean {
  const indice = simulacoes.findIndex((item) => item.id === simulacaoId);

  if (indice === -1) {
    return false;
  }

  simulacoes.splice(indice, 1);

  for (let i = stressTests.length - 1; i >= 0; i -= 1) {
    if (stressTests[i].simulacao_id === simulacaoId) {
      stressTests.splice(i, 1);
    }
  }

  return true;
}

export function buscarResumoSimulacoes(): SimulacaoResumo[] {
  return simulacoes.map(transformarEmResumo);
}

export function buscarResumoSimulacaoPorId(
  simulacaoId: string
): SimulacaoResumo | null {
  const simulacao = simulacoes.find((item) => item.id === simulacaoId);

  if (!simulacao) {
    return null;
  }

  return transformarEmResumo(simulacao);
}

export function calcularStressTest(simulacaoId?: string): boolean {
  if (!simulacaoId) {
    return true;
  }

  return simulacoes.some((item) => item.id === simulacaoId);
}

export function criarStressTest(simulacaoId?: string): StressTestResumo {
  const simulacao = simulacaoId
    ? simulacoes.find((item) => item.id === simulacaoId) ?? null
    : null;

  const score = simulacao?.score ?? 50;
  const criticidade = simulacao?.nivel_risco ?? calcularNivelRisco(score);

  const novo: StressTestResumo = {
    id: crypto.randomUUID(),
    simulacao_id: simulacao?.id ?? crypto.randomUUID(),
    criticidade,
    score,
    created_at: agoraIso(),
  };

  stressTests.push(novo);

  return novo;
}

export function listarStressTests(): StressTestResumo[] {
  return [...stressTests];
}

export function buscarStressTestsResumo(
  simulacaoId?: string
): StressTestResumo[] {
  if (!simulacaoId) {
    return [...stressTests];
  }

  return stressTests.filter((item) => item.simulacao_id === simulacaoId);
}

export function buscarUltimoStressTest(
  simulacaoId: string
): StressTestResumo | null {
  const itens = stressTests
    .filter((item) => item.simulacao_id === simulacaoId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return itens[0] ?? null;
}

export function buscarUltimoStressTestResumo(
  simulacaoId: string
): StressTestResumo | null {
  return buscarUltimoStressTest(simulacaoId);
}

export function limparSimulacoesSinistro(): void {
  simulacoes.splice(0, simulacoes.length);
  stressTests.splice(0, stressTests.length);
}