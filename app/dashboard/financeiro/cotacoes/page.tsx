import Link from "next/link"

export default function DashboardFinanceiroCotacoesPage() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-yellow-500">
              Financeiro
            </p>

            <h1 className="mt-2 text-3xl font-bold text-yellow-400">
              Cotações do Financeiro
            </h1>

            <p className="mt-3 text-white/75">
              Área financeira dedicada para acompanhamento das cotações ligadas ao fluxo comercial.
            </p>
          </div>

          <Link
            href="/dashboard/financeiro"
            className="rounded-xl border border-yellow-500/20 px-5 py-3 font-semibold text-yellow-400 hover:bg-yellow-500/10"
          >
            Voltar ao painel
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-white/5 p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-yellow-400">
            Área de cotações
          </h2>

          <p className="mt-3 text-white/75">
            Aqui ficará a visão financeira das cotações, com foco em acompanhamento administrativo e comercial.
          </p>
        </div>
      </div>
    </main>
  )
}