import SegmaxShell from "@/components/segmaxshell"

type Analise = {
  id: string
  cliente: string
  corretora: string
  responsavel: string
  status: "em_analise" | "concluida"
  criadoEm: string
}

const analises: Analise[] = [
  {
    id: "AN-001",
    cliente: "Metalúrgica Horizonte",
    corretora: "Atlas Corretora",
    responsavel: "Ana Paula",
    status: "em_analise",
    criadoEm: "24/03/2026 08:40",
  },
  {
    id: "AN-002",
    cliente: "Grupo Alpha Logística",
    corretora: "Prime Broker Seguros",
    responsavel: "Ana Paula",
    status: "concluida",
    criadoEm: "24/03/2026 09:15",
  },
]

function getStatusClasses(status: Analise["status"]) {
  switch (status) {
    case "concluida":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
    default:
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
  }
}

export default function AnaliseTecnicaPage() {
  return (
    <SegmaxShell role="tecnico">
      <main className="space-y-6">
        <section className="rounded-[28px] border border-zinc-800 bg-zinc-950 p-6 md:p-8">
          <div className="mb-3 inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-yellow-400">
            Análise técnica
          </div>

          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Central técnica SegMax
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
            Painel técnico para validação, acompanhamento e conclusão das
            análises de risco enviadas pelas corretoras.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-400">Em análise</p>
            <p className="mt-3 text-4xl font-bold text-yellow-400">
              {
                analises.filter(
                  (item) => item.status === "em_analise"
                ).length
              }
            </p>
          </div>

          <div className="rounded-[24px] border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-400">Concluídas</p>
            <p className="mt-3 text-4xl font-bold text-white">
              {
                analises.filter(
                  (item) => item.status === "concluida"
                ).length
              }
            </p>
          </div>

          <div className="rounded-[24px] border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-400">Total</p>
            <p className="mt-3 text-4xl font-bold text-white">
              {analises.length}
            </p>
          </div>
        </section>

        <section className="rounded-[28px] border border-zinc-800 bg-zinc-950 p-4 md:p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Análises registradas
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.22em] text-zinc-500">
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Cliente</th>
                  <th className="px-4 py-2">Corretora</th>
                  <th className="px-4 py-2">Responsável</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Criado em</th>
                </tr>
              </thead>

              <tbody>
                {analises.map((item) => (
                  <tr
                    key={item.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-200"
                  >
                    <td className="rounded-l-2xl px-4 py-4 font-semibold text-white">
                      {item.id}
                    </td>
                    <td className="px-4 py-4">{item.cliente}</td>
                    <td className="px-4 py-4">{item.corretora}</td>
                    <td className="px-4 py-4">{item.responsavel}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusClasses(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="rounded-r-2xl px-4 py-4 text-zinc-400">
                      {item.criadoEm}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </SegmaxShell>
  )
}