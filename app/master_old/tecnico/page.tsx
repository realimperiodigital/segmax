"use client";

import { useMemo, useState } from "react";

type CotacaoItem = {
  id: string;
  cliente: string;
  corretora: string;
  plano: "Prime" | "Elite" | "Executive" | "Full";
  tipo: string;
  risco: "Baixo" | "Médio" | "Alto" | "Crítico";
  status: "Aguardando análise" | "Em revisão" | "Concluída";
  oportunidadeUpgrade: boolean;
  prioridadeAnaPaula: "Baixa" | "Média" | "Alta" | "Máxima";
  responsavel: string;
  dataEntrada: string;
};

const cotacoesMock: CotacaoItem[] = [
  {
    id: "COT-001",
    cliente: "Empresa Alpha Ltda",
    corretora: "Corretora Prime Sul",
    plano: "Full",
    tipo: "Empresarial",
    risco: "Crítico",
    status: "Aguardando análise",
    oportunidadeUpgrade: false,
    prioridadeAnaPaula: "Máxima",
    responsavel: "Ana Paula",
    dataEntrada: "13/03/2026",
  },
  {
    id: "COT-002",
    cliente: "Indústria Beta",
    corretora: "Corretora Horizonte",
    plano: "Executive",
    tipo: "Patrimonial",
    risco: "Alto",
    status: "Em revisão",
    oportunidadeUpgrade: false,
    prioridadeAnaPaula: "Alta",
    responsavel: "Ana Paula",
    dataEntrada: "13/03/2026",
  },
  {
    id: "COT-003",
    cliente: "Comercial Gama",
    corretora: "Corretora Elite SP",
    plano: "Elite",
    tipo: "RC Geral",
    risco: "Médio",
    status: "Aguardando análise",
    oportunidadeUpgrade: true,
    prioridadeAnaPaula: "Média",
    responsavel: "Ana Paula",
    dataEntrada: "12/03/2026",
  },
  {
    id: "COT-004",
    cliente: "Loja Delta",
    corretora: "Corretora Prime Sul",
    plano: "Prime",
    tipo: "Empresarial",
    risco: "Médio",
    status: "Aguardando análise",
    oportunidadeUpgrade: true,
    prioridadeAnaPaula: "Média",
    responsavel: "Ana Paula",
    dataEntrada: "12/03/2026",
  },
  {
    id: "COT-005",
    cliente: "Grupo Ômega",
    corretora: "Corretora Max",
    plano: "Full",
    tipo: "Patrimonial",
    risco: "Alto",
    status: "Concluída",
    oportunidadeUpgrade: false,
    prioridadeAnaPaula: "Máxima",
    responsavel: "Ana Paula",
    dataEntrada: "11/03/2026",
  },
  {
    id: "COT-006",
    cliente: "Transportes Zeta",
    corretora: "Corretora Horizonte",
    plano: "Executive",
    tipo: "Frota",
    risco: "Alto",
    status: "Aguardando análise",
    oportunidadeUpgrade: false,
    prioridadeAnaPaula: "Alta",
    responsavel: "Ana Paula",
    dataEntrada: "11/03/2026",
  },
  {
    id: "COT-007",
    cliente: "Mercado Sol",
    corretora: "Corretora Leste",
    plano: "Elite",
    tipo: "Empresarial",
    risco: "Baixo",
    status: "Concluída",
    oportunidadeUpgrade: true,
    prioridadeAnaPaula: "Baixa",
    responsavel: "Ana Paula",
    dataEntrada: "10/03/2026",
  },
  {
    id: "COT-008",
    cliente: "Clínica Vida",
    corretora: "Corretora Saúde",
    plano: "Prime",
    tipo: "Responsabilidade Civil",
    risco: "Médio",
    status: "Em revisão",
    oportunidadeUpgrade: true,
    prioridadeAnaPaula: "Média",
    responsavel: "Ana Paula",
    dataEntrada: "10/03/2026",
  },
];

function StatCard({
  titulo,
  valor,
  subtitulo,
}: {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
      <p className="text-sm text-zinc-500">{titulo}</p>
      <h3 className="mt-2 text-3xl font-bold text-zinc-900">{valor}</h3>
      {subtitulo ? <p className="mt-2 text-xs text-zinc-500">{subtitulo}</p> : null}
    </div>
  );
}

function Badge({
  children,
  tipo = "default",
}: {
  children: React.ReactNode;
  tipo?: "default" | "danger" | "warning" | "success" | "info";
}) {
  const classes =
    tipo === "danger"
      ? "bg-red-100 text-red-700"
      : tipo === "warning"
      ? "bg-amber-100 text-amber-700"
      : tipo === "success"
      ? "bg-emerald-100 text-emerald-700"
      : tipo === "info"
      ? "bg-blue-100 text-blue-700"
      : "bg-zinc-100 text-zinc-700";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
      {children}
    </span>
  );
}

function BarChart({
  titulo,
  dados,
}: {
  titulo: string;
  dados: { label: string; value: number }[];
}) {
  const maior = Math.max(...dados.map((item) => item.value), 1);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
      <h3 className="text-lg font-semibold text-zinc-900">{titulo}</h3>

      <div className="mt-6 space-y-4">
        {dados.map((item) => {
          const width = `${(item.value / maior) * 100}%`;

          return (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-700">{item.label}</span>
                <span className="text-zinc-500">{item.value}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-zinc-200">
                <div
                  className="h-3 rounded-full bg-zinc-900 transition-all"
                  style={{ width }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MasterTecnicoPage() {
  const [filtroPlano, setFiltroPlano] = useState("Todos");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroUpgrade, setFiltroUpgrade] = useState("Todos");

  const cotacoesFiltradas = useMemo(() => {
    return cotacoesMock.filter((item) => {
      const planoOk = filtroPlano === "Todos" || item.plano === filtroPlano;
      const statusOk = filtroStatus === "Todos" || item.status === filtroStatus;
      const upgradeOk =
        filtroUpgrade === "Todos" ||
        (filtroUpgrade === "Com Upgrade" && item.oportunidadeUpgrade) ||
        (filtroUpgrade === "Sem Upgrade" && !item.oportunidadeUpgrade);

      return planoOk && statusOk && upgradeOk;
    });
  }, [filtroPlano, filtroStatus, filtroUpgrade]);

  const totais = useMemo(() => {
    const total = cotacoesMock.length;
    const full = cotacoesMock.filter((item) => item.plano === "Full").length;
    const executive = cotacoesMock.filter((item) => item.plano === "Executive").length;
    const prime = cotacoesMock.filter((item) => item.plano === "Prime").length;
    const elite = cotacoesMock.filter((item) => item.plano === "Elite").length;
    const upgrade = cotacoesMock.filter((item) => item.oportunidadeUpgrade).length;
    const fullPendentes = cotacoesMock.filter(
      (item) => item.plano === "Full" && item.status !== "Concluída"
    ).length;

    return {
      total,
      full,
      executive,
      prime,
      elite,
      upgrade,
      fullPendentes,
    };
  }, []);

  const dadosPlano = useMemo(
    () => [
      { label: "Prime", value: totais.prime },
      { label: "Elite", value: totais.elite },
      { label: "Executive", value: totais.executive },
      { label: "Full", value: totais.full },
    ],
    [totais]
  );

  const dadosFila = useMemo(
    () => [
      {
        label: "Aguardando análise",
        value: cotacoesMock.filter((item) => item.status === "Aguardando análise").length,
      },
      {
        label: "Em revisão",
        value: cotacoesMock.filter((item) => item.status === "Em revisão").length,
      },
      {
        label: "Concluída",
        value: cotacoesMock.filter((item) => item.status === "Concluída").length,
      },
    ],
    []
  );

  const dadosRisco = useMemo(
    () => [
      {
        label: "Baixo",
        value: cotacoesMock.filter((item) => item.risco === "Baixo").length,
      },
      {
        label: "Médio",
        value: cotacoesMock.filter((item) => item.risco === "Médio").length,
      },
      {
        label: "Alto",
        value: cotacoesMock.filter((item) => item.risco === "Alto").length,
      },
      {
        label: "Crítico",
        value: cotacoesMock.filter((item) => item.risco === "Crítico").length,
      },
    ],
    []
  );

  return (
    <main className="min-h-screen bg-zinc-100 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">
                SEGMAX
              </p>
              <h1 className="mt-2 text-3xl font-bold">Painel Master Técnico</h1>
              <p className="mt-2 max-w-3xl text-sm text-zinc-300">
                Central da Ana Paula para acompanhar todas as cotações, priorizar
                Full, atender Executive quando possível e identificar oportunidades
                de upgrade em Prime e Elite.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-zinc-200">
              Full = prioridade máxima • Executive = quando houver capacidade •
              Prime e Elite = porta de upgrade
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <StatCard titulo="Total de cotações" valor={totais.total} />
          <StatCard titulo="Prime" valor={totais.prime} />
          <StatCard titulo="Elite" valor={totais.elite} />
          <StatCard titulo="Executive" valor={totais.executive} />
          <StatCard titulo="Full" valor={totais.full} />
          <StatCard
            titulo="Full pendentes"
            valor={totais.fullPendentes}
            subtitulo="Prioridade máxima da Ana Paula"
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard
            titulo="Oportunidades de upgrade"
            valor={totais.upgrade}
            subtitulo="Prime e Elite com potencial de migração"
          />
          <StatCard
            titulo="Executive em atenção"
            valor={cotacoesMock.filter((item) => item.plano === "Executive" && item.status !== "Concluída").length}
            subtitulo="Analisar quando houver disponibilidade"
          />
          <StatCard
            titulo="Concluídas"
            valor={cotacoesMock.filter((item) => item.status === "Concluída").length}
            subtitulo="Análises já finalizadas"
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <BarChart titulo="Distribuição por plano" dados={dadosPlano} />
          <BarChart titulo="Fila de análise" dados={dadosFila} />
          <BarChart titulo="Mapa de risco" dados={dadosRisco} />
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                Relatório sintético
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Visão rápida do que merece atenção técnica e comercial.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-zinc-200 p-4">
              <p className="text-sm text-zinc-500">Prioridade absoluta</p>
              <p className="mt-2 text-lg font-bold text-zinc-900">
                {totais.fullPendentes} Full aguardando
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Todos precisam de análise humana.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 p-4">
              <p className="text-sm text-zinc-500">Fila intermediária</p>
              <p className="mt-2 text-lg font-bold text-zinc-900">
                {cotacoesMock.filter((item) => item.plano === "Executive" && item.status !== "Concluída").length} Executive ativos
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Entram quando houver disponibilidade.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 p-4">
              <p className="text-sm text-zinc-500">Upsell técnico</p>
              <p className="mt-2 text-lg font-bold text-zinc-900">
                {totais.upgrade} oportunidades
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Prime e Elite com chance de upgrade.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 p-4">
              <p className="text-sm text-zinc-500">Riscos altos/críticos</p>
              <p className="mt-2 text-lg font-bold text-zinc-900">
                {
                  cotacoesMock.filter(
                    (item) => item.risco === "Alto" || item.risco === "Crítico"
                  ).length
                }{" "}
                casos
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Merecem leitura mais cuidadosa.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                Relatório analítico das cotações
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Fila completa para leitura técnica, priorização e upgrade.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  Plano
                </label>
                <select
                  value={filtroPlano}
                  onChange={(e) => setFiltroPlano(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none"
                >
                  <option>Todos</option>
                  <option>Prime</option>
                  <option>Elite</option>
                  <option>Executive</option>
                  <option>Full</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  Status
                </label>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none"
                >
                  <option>Todos</option>
                  <option>Aguardando análise</option>
                  <option>Em revisão</option>
                  <option>Concluída</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  Upgrade
                </label>
                <select
                  value={filtroUpgrade}
                  onChange={(e) => setFiltroUpgrade(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none"
                >
                  <option>Todos</option>
                  <option>Com Upgrade</option>
                  <option>Sem Upgrade</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="border-b border-zinc-200 px-4 py-3">ID</th>
                  <th className="border-b border-zinc-200 px-4 py-3">Cliente</th>
                  <th className="border-b border-zinc-200 px-4 py-3">Corretora</th>
                  <th className="border-b border-zinc-200 px-4 py-3">Plano</th>
                  <th className="border-b border-zinc-200 px-4 py-3">Risco</th>
                  <th className="border-b border-zinc-200 px-4 py-3">Status</th>
                  <th className="border-b border-zinc-200 px-4 py-3">Prioridade</th>
                  <th className="border-b border-zinc-200 px-4 py-3">Upgrade</th>
                  <th className="border-b border-zinc-200 px-4 py-3">Entrada</th>
                  <th className="border-b border-zinc-200 px-4 py-3">Ação</th>
                </tr>
              </thead>
              <tbody>
                {cotacoesFiltradas.map((item) => (
                  <tr
                    key={item.id}
                    className={`text-sm text-zinc-700 ${
                      item.plano === "Full"
                        ? "bg-red-50"
                        : item.plano === "Executive"
                        ? "bg-amber-50"
                        : item.oportunidadeUpgrade
                        ? "bg-blue-50"
                        : "bg-white"
                    }`}
                  >
                    <td className="border-b border-zinc-100 px-4 py-4 font-semibold">
                      {item.id}
                    </td>
                    <td className="border-b border-zinc-100 px-4 py-4">
                      <div className="font-medium text-zinc-900">{item.cliente}</div>
                      <div className="text-xs text-zinc-500">{item.tipo}</div>
                    </td>
                    <td className="border-b border-zinc-100 px-4 py-4">
                      {item.corretora}
                    </td>
                    <td className="border-b border-zinc-100 px-4 py-4">
                      {item.plano === "Full" ? (
                        <Badge tipo="danger">Full</Badge>
                      ) : item.plano === "Executive" ? (
                        <Badge tipo="warning">Executive</Badge>
                      ) : item.plano === "Elite" ? (
                        <Badge tipo="info">Elite</Badge>
                      ) : (
                        <Badge>Prime</Badge>
                      )}
                    </td>
                    <td className="border-b border-zinc-100 px-4 py-4">
                      {item.risco === "Crítico" ? (
                        <Badge tipo="danger">Crítico</Badge>
                      ) : item.risco === "Alto" ? (
                        <Badge tipo="warning">Alto</Badge>
                      ) : item.risco === "Médio" ? (
                        <Badge tipo="info">Médio</Badge>
                      ) : (
                        <Badge tipo="success">Baixo</Badge>
                      )}
                    </td>
                    <td className="border-b border-zinc-100 px-4 py-4">
                      {item.status === "Concluída" ? (
                        <Badge tipo="success">Concluída</Badge>
                      ) : item.status === "Em revisão" ? (
                        <Badge tipo="warning">Em revisão</Badge>
                      ) : (
                        <Badge> Aguardando análise </Badge>
                      )}
                    </td>
                    <td className="border-b border-zinc-100 px-4 py-4">
                      {item.prioridadeAnaPaula === "Máxima" ? (
                        <Badge tipo="danger">Máxima</Badge>
                      ) : item.prioridadeAnaPaula === "Alta" ? (
                        <Badge tipo="warning">Alta</Badge>
                      ) : item.prioridadeAnaPaula === "Média" ? (
                        <Badge tipo="info">Média</Badge>
                      ) : (
                        <Badge>Baixa</Badge>
                      )}
                    </td>
                    <td className="border-b border-zinc-100 px-4 py-4">
                      {item.oportunidadeUpgrade ? (
                        <Badge tipo="info">Sim</Badge>
                      ) : (
                        <Badge>Não</Badge>
                      )}
                    </td>
                    <td className="border-b border-zinc-100 px-4 py-4">
                      {item.dataEntrada}
                    </td>
                    <td className="border-b border-zinc-100 px-4 py-4">
                      <button className="rounded-xl bg-zinc-900 px-4 py-2 text-white transition hover:opacity-90">
                        Abrir análise
                      </button>
                    </td>
                  </tr>
                ))}

                {cotacoesFiltradas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-10 text-center text-sm text-zinc-500"
                    >
                      Nenhuma cotação encontrada para os filtros selecionados.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}