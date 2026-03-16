"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileBarChart2,
  FileSearch,
  History,
  LayoutDashboard,
  ShieldAlert,
  UserCog,
  Users,
  LogOut,
} from "lucide-react";

type StatusAnalise =
  | "Pendente"
  | "Em andamento"
  | "Parecer emitido"
  | "Crítico";

type Prioridade = "Alta" | "Média" | "Baixa";

type FilaAnalise = {
  id: number;
  cliente: string;
  corretora: string;
  seguro: string;
  status: StatusAnalise;
  prioridade: Prioridade;
};

type ParecerRecente = {
  id: number;
  cliente: string;
  corretora: string;
  risco: "Baixo" | "Médio" | "Alto" | "Crítico";
  data: string;
  status: string;
};

type Pendencia = {
  id: number;
  titulo: string;
  descricao: string;
  nivel: "atenção" | "crítico" | "ok";
};

const cardsResumo = [
  {
    titulo: "Análises pendentes",
    valor: "18",
    detalhe: "Aguardando início técnico",
    icon: ClipboardList,
  },
  {
    titulo: "Em andamento",
    valor: "9",
    detalhe: "Processos em avaliação",
    icon: Activity,
  },
  {
    titulo: "Pareceres hoje",
    valor: "6",
    detalhe: "Emitidos nas últimas horas",
    icon: CheckCircle2,
  },
  {
    titulo: "Cotações em revisão",
    valor: "11",
    detalhe: "Dependem do parecer técnico",
    icon: FileSearch,
  },
  {
    titulo: "Clientes de alto risco",
    valor: "5",
    detalhe: "Exigem atenção imediata",
    icon: ShieldAlert,
  },
  {
    titulo: "Corretoras ativas",
    valor: "14",
    detalhe: "Com operação técnica aberta",
    icon: Building2,
  },
];

const filaAnalises: FilaAnalise[] = [
  {
    id: 1,
    cliente: "Metalúrgica Forte Vale",
    corretora: "Seguros Prime Broker",
    seguro: "Patrimonial",
    status: "Pendente",
    prioridade: "Alta",
  },
  {
    id: 2,
    cliente: "Centro Logístico União",
    corretora: "Alpha Corretora",
    seguro: "Empresarial",
    status: "Em andamento",
    prioridade: "Alta",
  },
  {
    id: 3,
    cliente: "Rede Super Mais",
    corretora: "Protege Brasil",
    seguro: "Patrimonial",
    status: "Parecer emitido",
    prioridade: "Média",
  },
  {
    id: 4,
    cliente: "Indústria Nova Era",
    corretora: "Fortis Seguros",
    seguro: "Riscos Operacionais",
    status: "Crítico",
    prioridade: "Alta",
  },
  {
    id: 5,
    cliente: "Atacadista Horizonte",
    corretora: "Atlas Corretora",
    seguro: "Patrimonial",
    status: "Em andamento",
    prioridade: "Baixa",
  },
];

const pareceresRecentes: ParecerRecente[] = [
  {
    id: 1,
    cliente: "Grupo Monte Real",
    corretora: "Seguros Prime Broker",
    risco: "Médio",
    data: "15/03/2026 08:30",
    status: "Emitido",
  },
  {
    id: 2,
    cliente: "Transportadora Sol Nascente",
    corretora: "Atlas Corretora",
    risco: "Alto",
    data: "15/03/2026 09:10",
    status: "Em revisão",
  },
  {
    id: 3,
    cliente: "Polo Industrial Delta",
    corretora: "Fortis Seguros",
    risco: "Crítico",
    data: "15/03/2026 10:20",
    status: "Prioritário",
  },
];

const pendenciasTecnicas: Pendencia[] = [
  {
    id: 1,
    titulo: "Documentação incompleta",
    descricao: "3 clientes sem laudo complementar anexado.",
    nivel: "atenção",
  },
  {
    id: 2,
    titulo: "Risco crítico identificado",
    descricao: "1 operação patrimonial com vulnerabilidade elevada.",
    nivel: "crítico",
  },
  {
    id: 3,
    titulo: "Retorno da corretora pendente",
    descricao: "4 propostas aguardando resposta para continuidade.",
    nivel: "atenção",
  },
  {
    id: 4,
    titulo: "Fluxo técnico estável",
    descricao: "Pareceres emitidos dentro do prazo em 82% dos casos.",
    nivel: "ok",
  },
];

const menuItems = [
  {
    label: "Dashboard Técnico",
    href: "/analise-tecnica",
    icon: LayoutDashboard,
    active: true,
  },
  {
    label: "Corretoras",
    href: "/corretoras",
    icon: Building2,
    active: false,
  },
  {
    label: "Usuários",
    href: "/usuarios",
    icon: UserCog,
    active: false,
  },
  {
    label: "Clientes",
    href: "/clientes",
    icon: Users,
    active: false,
  },
  {
    label: "Nova Análise",
    href: "/analise-tecnica/nova",
    icon: ClipboardList,
    active: false,
  },
  {
    label: "Motor de Risco",
    href: "/analise-tecnica/motor-risco",
    icon: ShieldAlert,
    active: false,
  },
  {
    label: "Pareceres Técnicos",
    href: "/analise-tecnica/pareceres",
    icon: FileSearch,
    active: false,
  },
  {
    label: "Cotações em Análise",
    href: "/analise-tecnica/cotacoes",
    icon: Activity,
    active: false,
  },
  {
    label: "Relatórios Técnicos",
    href: "/analise-tecnica/relatorios",
    icon: FileBarChart2,
    active: false,
  },
  {
    label: "Histórico",
    href: "/analise-tecnica/historico",
    icon: History,
    active: false,
  },
];

function badgeStatusColor(status: StatusAnalise) {
  switch (status) {
    case "Pendente":
      return "bg-yellow-500/15 text-yellow-300 border-yellow-500/30";
    case "Em andamento":
      return "bg-blue-500/15 text-blue-300 border-blue-500/30";
    case "Parecer emitido":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "Crítico":
      return "bg-red-500/15 text-red-300 border-red-500/30";
    default:
      return "bg-white/10 text-white border-white/10";
  }
}

function badgePrioridadeColor(prioridade: Prioridade) {
  switch (prioridade) {
    case "Alta":
      return "bg-red-500/15 text-red-300 border-red-500/30";
    case "Média":
      return "bg-yellow-500/15 text-yellow-300 border-yellow-500/30";
    case "Baixa":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    default:
      return "bg-white/10 text-white border-white/10";
  }
}

function badgeRiscoColor(risco: ParecerRecente["risco"]) {
  switch (risco) {
    case "Baixo":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "Médio":
      return "bg-yellow-500/15 text-yellow-300 border-yellow-500/30";
    case "Alto":
      return "bg-orange-500/15 text-orange-300 border-orange-500/30";
    case "Crítico":
      return "bg-red-500/15 text-red-300 border-red-500/30";
    default:
      return "bg-white/10 text-white border-white/10";
  }
}

function pendenciaColor(nivel: Pendencia["nivel"]) {
  switch (nivel) {
    case "crítico":
      return "border-red-500/30 bg-red-500/10";
    case "atenção":
      return "border-yellow-500/30 bg-yellow-500/10";
    case "ok":
      return "border-emerald-500/30 bg-emerald-500/10";
    default:
      return "border-white/10 bg-white/5";
  }
}

export default function AnaliseTecnicaDashboardPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-80 border-r border-[#C8A44D]/20 bg-black/90 xl:flex xl:flex-col">
          <div className="border-b border-[#C8A44D]/15 px-6 py-6">
            <div className="mb-3 h-12 w-12 rounded-2xl border border-[#C8A44D]/30 bg-gradient-to-br from-[#C8A44D]/25 to-transparent" />
            <h1 className="text-2xl font-semibold tracking-wide text-[#E7C46A]">
              SegMax
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Central técnica da Ana Paula
            </p>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-5">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group flex items-center justify-between rounded-2xl border px-4 py-3 transition-all ${
                    item.active
                      ? "border-[#C8A44D]/40 bg-[#C8A44D]/12 text-[#F3D585]"
                      : "border-white/5 bg-white/[0.02] text-zinc-300 hover:border-[#C8A44D]/20 hover:bg-[#C8A44D]/8 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <ChevronRight
                    size={16}
                    className="opacity-40 transition group-hover:opacity-100"
                  />
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-[#C8A44D]/15 p-4">
            <Link
              href="/login"
              className="flex items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300 transition hover:bg-red-500/15"
            >
              <div className="flex items-center gap-3">
                <LogOut size={18} />
                <span className="text-sm font-medium">Sair</span>
              </div>
              <ChevronRight size={16} />
            </Link>
          </div>
        </aside>

        <main className="flex-1">
          <header className="border-b border-[#C8A44D]/15 bg-gradient-to-r from-black via-[#0B0B0B] to-black px-5 py-5 md:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C8A44D]">
                  Área Técnica
                </p>
                <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
                  Dashboard da Ana Paula
                </h2>
                <p className="mt-2 max-w-3xl text-sm text-zinc-400 md:text-base">
                  Controle técnico completo das análises, pareceres, clientes
                  críticos e acompanhamento operacional do SegMax.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/analise-tecnica/nova"
                  className="rounded-2xl border border-[#C8A44D]/40 bg-[#C8A44D] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
                >
                  Nova análise
                </Link>
                <Link
                  href="/analise-tecnica/motor-risco"
                  className="rounded-2xl border border-[#C8A44D]/25 bg-transparent px-5 py-3 text-sm font-semibold text-[#F3D585] transition hover:bg-[#C8A44D]/10"
                >
                  Abrir motor de risco
                </Link>
              </div>
            </div>
          </header>

          <section className="px-5 py-6 md:px-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {cardsResumo.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.titulo}
                    className="rounded-3xl border border-[#C8A44D]/15 bg-gradient-to-br from-zinc-900 to-black p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-zinc-400">{card.titulo}</p>
                        <h3 className="mt-3 text-3xl font-bold text-white">
                          {card.valor}
                        </h3>
                        <p className="mt-2 text-sm text-zinc-500">
                          {card.detalhe}
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#C8A44D]/25 bg-[#C8A44D]/10 text-[#E7C46A]">
                        <Icon size={22} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 2xl:grid-cols-[1.45fr_1fr]">
              <div className="rounded-3xl border border-[#C8A44D]/15 bg-zinc-950/90 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Fila técnica</h3>
                    <p className="text-sm text-zinc-400">
                      Análises que exigem acompanhamento imediato.
                    </p>
                  </div>
                  <Link
                    href="/analise-tecnica/cotacoes"
                    className="rounded-xl border border-[#C8A44D]/20 px-3 py-2 text-sm text-[#E7C46A] transition hover:bg-[#C8A44D]/10"
                  >
                    Ver tudo
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-3">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-[0.2em] text-zinc-500">
                        <th className="px-3">Cliente</th>
                        <th className="px-3">Corretora</th>
                        <th className="px-3">Seguro</th>
                        <th className="px-3">Status</th>
                        <th className="px-3">Prioridade</th>
                        <th className="px-3">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filaAnalises.map((item) => (
                        <tr
                          key={item.id}
                          className="rounded-2xl bg-white/[0.03] text-sm text-zinc-200"
                        >
                          <td className="rounded-l-2xl px-3 py-4 font-medium">
                            {item.cliente}
                          </td>
                          <td className="px-3 py-4 text-zinc-300">
                            {item.corretora}
                          </td>
                          <td className="px-3 py-4 text-zinc-300">
                            {item.seguro}
                          </td>
                          <td className="px-3 py-4">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badgeStatusColor(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-3 py-4">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badgePrioridadeColor(
                                item.prioridade
                              )}`}
                            >
                              {item.prioridade}
                            </span>
                          </td>
                          <td className="rounded-r-2xl px-3 py-4">
                            <Link
                              href="/analise-tecnica/motor-risco"
                              className="inline-flex rounded-xl border border-[#C8A44D]/25 px-3 py-2 text-xs font-semibold text-[#F3D585] transition hover:bg-[#C8A44D]/10"
                            >
                              Abrir análise
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-[#C8A44D]/15 bg-zinc-950/90 p-5">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Atalhos rápidos</h3>
                    <p className="text-sm text-zinc-400">
                      Acesso direto ao núcleo técnico.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <Link
                      href="/analise-tecnica/nova"
                      className="rounded-2xl border border-[#C8A44D]/20 bg-[#C8A44D]/8 px-4 py-4 text-sm font-medium text-white transition hover:bg-[#C8A44D]/14"
                    >
                      Nova análise
                    </Link>
                    <Link
                      href="/analise-tecnica/motor-risco"
                      className="rounded-2xl border border-[#C8A44D]/20 bg-white/[0.02] px-4 py-4 text-sm font-medium text-white transition hover:bg-[#C8A44D]/10"
                    >
                      Motor de risco
                    </Link>
                    <Link
                      href="/analise-tecnica/pareceres"
                      className="rounded-2xl border border-[#C8A44D]/20 bg-white/[0.02] px-4 py-4 text-sm font-medium text-white transition hover:bg-[#C8A44D]/10"
                    >
                      Emitir e revisar pareceres
                    </Link>
                    <Link
                      href="/analise-tecnica/relatorios"
                      className="rounded-2xl border border-[#C8A44D]/20 bg-white/[0.02] px-4 py-4 text-sm font-medium text-white transition hover:bg-[#C8A44D]/10"
                    >
                      Relatórios técnicos
                    </Link>
                    <Link
                      href="/clientes"
                      className="rounded-2xl border border-[#C8A44D]/20 bg-white/[0.02] px-4 py-4 text-sm font-medium text-white transition hover:bg-[#C8A44D]/10"
                    >
                      Clientes críticos
                    </Link>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#C8A44D]/15 bg-zinc-950/90 p-5">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Últimos pareceres</h3>
                    <p className="text-sm text-zinc-400">
                      Situação recente da operação técnica.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {pareceresRecentes.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-white/5 bg-white/[0.03] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-white">
                              {item.cliente}
                            </p>
                            <p className="mt-1 text-sm text-zinc-400">
                              {item.corretora}
                            </p>
                          </div>

                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badgeRiscoColor(
                              item.risco
                            )}`}
                          >
                            Risco {item.risco}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-sm text-zinc-400">
                          <span>{item.data}</span>
                          <span>{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-3xl border border-[#C8A44D]/15 bg-zinc-950/90 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <AlertTriangle className="text-[#E7C46A]" size={20} />
                  <div>
                    <h3 className="text-lg font-semibold">Pendências técnicas</h3>
                    <p className="text-sm text-zinc-400">
                      Pontos que precisam de atenção no fluxo.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {pendenciasTecnicas.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-2xl border p-4 ${pendenciaColor(
                        item.nivel
                      )}`}
                    >
                      <p className="font-medium text-white">{item.titulo}</p>
                      <p className="mt-1 text-sm text-zinc-300">
                        {item.descricao}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-[#C8A44D]/15 bg-zinc-950/90 p-5">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">
                    Visão estratégica da área técnica
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Resumo operacional para tomada de decisão.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                    <p className="text-sm text-zinc-400">Tempo médio de análise</p>
                    <p className="mt-2 text-2xl font-bold text-white">3h42</p>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                    <p className="text-sm text-zinc-400">Conversão técnica</p>
                    <p className="mt-2 text-2xl font-bold text-white">74%</p>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                    <p className="text-sm text-zinc-400">Processos críticos</p>
                    <p className="mt-2 text-2xl font-bold text-white">2</p>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                    <p className="text-sm text-zinc-400">Documentos pendentes</p>
                    <p className="mt-2 text-2xl font-bold text-white">7</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#C8A44D]/20 bg-gradient-to-r from-[#C8A44D]/10 to-transparent p-4">
                  <p className="text-sm font-medium text-[#F3D585]">
                    Direção recomendada
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    Priorizar hoje os clientes com status crítico e as análises
                    patrimoniais pendentes de documentação. Isso ajuda a reduzir
                    gargalo no parecer técnico e acelerar a cotação comercial.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}