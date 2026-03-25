import SegmaxShell from "@/components/segmaxshell"

type Solicitacao = {
  id: string
  cliente: string
  corretora: string
  solicitante: string
  motivo: string
  status: "pendente" | "aprovada" | "recusada"
  criadoEm: string
}

const solicitacoes: Solicitacao[] = [
  {
    id: "SOL-001",
    cliente: "Grupo Alpha Logística",
    corretora: "Prime Broker Seguros",
    solicitante: "Carlos Mendes",
    motivo: "Cliente duplicado na base",
    status: "pendente",
    criadoEm: "24/03/2026 08:10",
  },
  {
    id: "SOL-002",
    cliente: "Metalúrgica Horizonte",
    corretora: "Atlas Corretora",
    solicitante: "Fernanda Lima",
    motivo: "Registro encerrado por solicitação do corretor",
    status: "pendente",
    criadoEm: "24/03/2026 09:25",
  },
]

function getStatusClasses(status: Solicitacao["status"]) {
  switch (status) {
    case "aprovada":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
    case "recusada":
      return "border-red-500/30 bg-red-500/10 text-red-300"
    default:
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
  }
}

export default function AprovacoesExclusaoPage() {
  return (
    <SegmaxShell role="master">
      <main className="space-y-6">
        <section className="rounded-[28px] border border-zinc-800 bg-zinc-950 p-6 md:p-8">
          <div className="mb-3 inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-yellow-400">
            Aprovações de exclusão
          </div>

          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Central de validação
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
            Área do master para validar ou recusar pedidos de exclusão da base,
            mantendo rastreabilidade e segurança operacional.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-400">Solicitações pendentes</p>
            <p className="mt-3 text-4xl font-bold text-yellow-400">
              {solicitacoes.filter((item) => item.status === "pendente").length}
            </p>
          </div>

          <div className="rounded-[24px] border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-400">Aprovações hoje</p>
            <p className="mt-3 text-4xl font-bold text-white">0</p>
          </div>

          <div className="rounded-[24px] border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-400">Recusas hoje</p>
            <p className="mt-3 text-4xl font-bold text-white">0</p>
          </div>
        </section>

        <section className="rounded-[28px] border border-zinc-800 bg-zinc-950 p-4 md:p-6">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Solicitações na fila
              </h2>
              <p className="text-sm text-zinc-400">
                Revise o contexto antes de aprovar exclusões.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.22em] text-zinc-500">
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Cliente</th>
                  <th className="px-4 py-2">Corretora</th>
                  <th className="px-4 py-2">Solicitante</th>
                  <th className="px-4 py-2">Motivo</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Criado em</th>
                  <th className="px-4 py-2">Ações</th>
                </tr>
              </thead>

              <tbody>
                {solicitacoes.map((item) => (
                  <tr
                    key={item.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-200"
                  >
                    <td className="rounded-l-2xl px-4 py-4 font-semibold text-white">
                      {item.id}
                    </td>
                    <td className="px-4 py-4">{item.cliente}</td>
                    <td className="px-4 py-4">{item.corretora}</td>
                    <td className="px-4 py-4">{item.solicitante}</td>
                    <td className="px-4 py-4">{item.motivo}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusClasses(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-zinc-400">{item.criadoEm}</td>
                    <td className="rounded-r-2xl px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                        >
                          Aprovar
                        </button>

                        <button
                          type="button"
                          className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
                        >
                          Recusar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {solicitacoes.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-sm text-zinc-500"
                    >
                      Nenhuma solicitação encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </SegmaxShell>
  )
}