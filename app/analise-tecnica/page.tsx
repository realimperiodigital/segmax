import Link from "next/link";
import SegmaxShell from "@/components/segmaxshell";

const analises = [
  {
    id: "cot-001",
    cliente: "Grupo Alpha Logística",
    corretora: "Prime Broker Seguros",
    seguradora: "Porto Seguro",
    ramo: "Patrimonial Empresarial",
    status: "Em análise",
    risco: "Médio",
    atualizadoEm: "16/03/2026 08:10",
    analista: "Ana Paula",
  },
  {
    id: "cot-002",
    cliente: "Metalúrgica Horizonte",
    corretora: "Atlas Corretora",
    seguradora: "Tokio Marine",
    ramo: "Patrimonial Industrial",
    status: "Nova",
    risco: "Alto",
    atualizadoEm: "16/03/2026 07:42",
    analista: "Ana Paula",
  },
  {
    id: "cot-003",
    cliente: "Rede Nova Visão",
    corretora: "Alpha Consult",
    seguradora: "Allianz",
    ramo: "Patrimonial Comercial",
    status: "Parecer emitido",
    risco: "Baixo",
    atualizadoEm: "15/03/2026 18:25",
    analista: "Ana Paula",
  },
  {
    id: "cot-004",
    cliente: "Construtora Vale Forte",
    corretora: "Prime Broker Seguros",
    seguradora: "Mapfre",
    ramo: "Patrimonial Construção",
    status: "Aguardando ajuste",
    risco: "Crítico",
    atualizadoEm: "15/03/2026 16:50",
    analista: "Ana Paula",
  },
  {
    id: "cot-005",
    cliente: "StartMed Equipamentos",
    corretora: "Prime Broker Seguros",
    seguradora: "HDI",
    ramo: "Patrimonial Equipamentos",
    status: "Em análise",
    risco: "Médio",
    atualizadoEm: "15/03/2026 15:20",
    analista: "Ana Paula",
  },
];

function statusClasses(status: string) {
  const s = status.toLowerCase();

  if (s.includes("nova")) {
    return "border-blue-700/30 bg-blue-500/10 text-blue-300";
  }

  if (s.includes("parecer")) {
    return "border-purple-700/30 bg-purple-500/10 text-purple-300";
  }

  if (s.includes("aguardando")) {
    return "border-red-700/30 bg-red-500/10 text-red-300";
  }

  return "border-yellow-700/30 bg-yellow-500/10 text-yellow-300";
}

function riscoClasses(risco: string) {
  const r = risco.toLowerCase();

  if (r.includes("baixo")) {
    return "border-emerald-700/30 bg-emerald-500/10 text-emerald-300";
  }

  if (r.includes("médio") || r.includes("medio")) {
    return "border-yellow-700/30 bg-yellow-500/10 text-yellow-300";
  }

  if (r.includes("alto")) {
    return "border-orange-700/30 bg-orange-500/10 text-orange-300";
  }

  return "border-red-700/30 bg-red-500/10 text-red-300";
}

export default function AnaliseTecnicaPage() {
  return (
    <SegmaxShell
      nome="Ana Paula"
      perfilLabel="DIRETORA TÉCNICA"
      permissao="diretora_tecnica"
    >
      <div className="space-y-6">
        <section className="rounded-3xl border border-yellow-700/20 bg-zinc-950 p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-yellow-700/30 bg-yellow-500/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.25em] text-yellow-400">
                Núcleo técnico SegMax
              </div>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
                Análise técnica
              </h1>

              <p className="mt-3 max-w-4xl text-base leading-8 text-zinc-400">
                Gerencie a fila técnica da operação, priorize riscos sensíveis e
                acompanhe pareceres com visão estruturada e profissional.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="rounded-2xl border border-yellow-600 bg-yellow-500 px-5 py-3 font-semibold text-black transition hover:bg-yellow-400">
                + Nova demanda
              </button>

              <Link
                href="/analise-tecnica"
                className="rounded-2xl border border-yellow-700/30 bg-black px-5 py-3 font-semibold text-white transition hover:border-yellow-600 hover:text-yellow-400"
              >
                Voltar ao painel
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-4">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7">
            <p className="text-sm text-zinc-400">Análises na base</p>
            <div className="mt-4 text-5xl font-bold text-white">5</div>
            <p className="mt-4 text-sm leading-6 text-zinc-500">
              Volume técnico em acompanhamento.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7">
            <p className="text-sm text-zinc-400">Em análise</p>
            <div className="mt-4 text-5xl font-bold text-white">1</div>
            <p className="mt-4 text-sm leading-6 text-zinc-500">
              Processos em avaliação ativa.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7">
            <p className="text-sm text-zinc-400">Parecer emitido</p>
            <div className="mt-4 text-5xl font-bold text-white">1</div>
            <p className="mt-4 text-sm leading-6 text-zinc-500">
              Demandas prontas para avanço.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7">
            <p className="text-sm text-zinc-400">Risco crítico</p>
            <div className="mt-4 text-5xl font-bold text-white">1</div>
            <p className="mt-4 text-sm leading-6 text-zinc-500">
              Casos que exigem atenção imediata.
            </p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Fila técnica de análises
                </h2>
                <p className="mt-2 text-sm leading-7 text-zinc-400">
                  Localize rapidamente demandas, status e criticidade para
                  priorização.
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  type="text"
                  placeholder="Buscar por cliente, corretora ou seguradora"
                  className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-yellow-600 md:w-[340px]"
                />

                <select className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none focus:border-yellow-600">
                  <option>Todos os status</option>
                  <option>Nova</option>
                  <option>Em análise</option>
                  <option>Parecer emitido</option>
                  <option>Aguardando ajuste</option>
                </select>
              </div>
            </div>

            <div className="mt-8 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.25em] text-zinc-500">
                    <th className="pb-2">Cliente</th>
                    <th className="pb-2">Corretora</th>
                    <th className="pb-2">Seguradora</th>
                    <th className="pb-2">Ramo</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Risco</th>
                    <th className="pb-2">Atualização</th>
                    <th className="pb-2 text-right">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {analises.map((item) => (
                    <tr key={item.id} className="rounded-2xl bg-black">
                      <td className="rounded-l-2xl border-y border-l border-zinc-800 px-4 py-4 align-top">
                        <div className="font-semibold text-white">
                          {item.cliente}
                        </div>
                        <div className="mt-1 text-sm text-zinc-500">
                          Analista: {item.analista}
                        </div>
                      </td>

                      <td className="border-y border-zinc-800 px-4 py-4 text-zinc-200">
                        {item.corretora}
                      </td>

                      <td className="border-y border-zinc-800 px-4 py-4 text-zinc-200">
                        {item.seguradora}
                      </td>

                      <td className="border-y border-zinc-800 px-4 py-4 text-zinc-200">
                        {item.ramo}
                      </td>

                      <td className="border-y border-zinc-800 px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="border-y border-zinc-800 px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${riscoClasses(
                            item.risco
                          )}`}
                        >
                          {item.risco}
                        </span>
                      </td>

                      <td className="border-y border-zinc-800 px-4 py-4 text-zinc-300">
                        {item.atualizadoEm}
                      </td>

                      <td className="rounded-r-2xl border-y border-r border-zinc-800 px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/analise-tecnica/${item.id}`}
                            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:border-yellow-600 hover:text-yellow-400"
                          >
                            Abrir
                          </Link>

                          <Link
                            href={`/analise-tecnica/${item.id}/parecer`}
                            className="rounded-xl border border-yellow-700/30 bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-300 transition hover:border-yellow-600 hover:text-yellow-200"
                          >
                            Parecer
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-2xl font-semibold text-white">
                Direção técnica
              </h3>

              <p className="mt-4 text-sm leading-8 text-zinc-300">
                Priorize riscos críticos, valide inconsistências documentais e
                mantenha pareceres objetivos para acelerar a resposta comercial
                sem perder profundidade técnica.
              </p>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-xl font-semibold text-white">
                Prioridade do dia
              </h3>

              <p className="mt-4 text-sm leading-8 text-zinc-300">
                Fechar os pareceres pendentes, revisar riscos altos e manter a
                fila técnica organizada para sustentar o pré-lançamento com
                qualidade e autoridade.
              </p>
            </section>
          </div>
        </section>
      </div>
    </SegmaxShell>
  );
}