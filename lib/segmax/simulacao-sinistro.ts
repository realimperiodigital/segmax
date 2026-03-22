// lib/segmax/simulacao-sinistro.ts

export type SeveridadeSinistro =
  | "BAIXA"
  | "MEDIA"
  | "ALTA"
  | "CRITICA";

export type TipoEventoSinistro =
  | "COLISAO"
  | "ROUBO"
  | "INCENDIO"
  | "DANOS_NATURAIS";

export type CriticidadeFinal =
  | "BAIXA"
  | "MEDIA"
  | "ALTA"
  | "CRITICA";

export type SimulacaoResumo = {
  id: string;
  descricao: string;
  valor_total: number;
};

export type StressTestResumo = {
  id: string;
  simulacao_id: string;
  criticidade: CriticidadeFinal;
};

let simulacoes: SimulacaoResumo[] = [];
let stressTests: StressTestResumo[] = [];

export function adicionarAtivoSimulado() {
  return true;
}

export function adicionarCoberturaSimulada() {
  return true;
}

export function buscarResumoSimulacoes(): SimulacaoResumo[] {
  return simulacoes;
}

export function criarSimulacaoSinistro(): SimulacaoResumo {

  const nova: SimulacaoResumo = {
    id: crypto.randomUUID(),
    descricao: "Simulação criada",
    valor_total: Math.floor(Math.random() * 50000),
  };

  simulacoes.push(nova);

  return nova;
}

export function recalcularSimulacaoSinistro(
  id: string
): SimulacaoResumo | null {

  const sim = simulacoes.find(s => s.id === id);

  if (!sim) return null;

  sim.valor_total =
    Math.floor(Math.random() * 50000);

  return sim;
}

export function adicionarItemStressTest() {
  return true;
}

export function buscarStressTestsResumo(): StressTestResumo[] {
  return stressTests;
}

export function calcularStressTest() {
  return true;
}

export function criarStressTest(): StressTestResumo {

  const novo: StressTestResumo = {
    id: crypto.randomUUID(),
    simulacao_id: crypto.randomUUID(),
    criticidade: "MEDIA",
  };

  stressTests.push(novo);

  return novo;
}