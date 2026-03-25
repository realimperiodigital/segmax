import Link from "next/link"

export default function MasterPage() {
  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-red-500 bg-red-950/20 p-8">
          <div className="text-sm font-bold uppercase tracking-[0.35em] text-red-400">
            TESTE REAL MASTER
          </div>

          <h1 className="mt-4 text-5xl font-black text-red-300">
            ESTA É A NOVA TELA DO MASTER
          </h1>

          <p className="mt-4 text-lg text-zinc-300">
            Se você colou no arquivo certo, esta tela precisa substituir totalmente a antiga.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/dashboard/master/corretoras"
              className="rounded-2xl border border-red-400 bg-red-500/10 px-6 py-4 font-bold text-red-200"
            >
              TESTAR CORRETORAS MASTER
            </Link>

            <Link
              href="/dashboard/master/usuarios"
              className="rounded-2xl border border-red-400 bg-red-500/10 px-6 py-4 font-bold text-red-200"
            >
              TESTAR USUÁRIOS MASTER
            </Link>

            <Link
              href="/dashboard/master/financeiro"
              className="rounded-2xl border border-red-400 bg-red-500/10 px-6 py-4 font-bold text-red-200"
            >
              TESTAR FINANCEIRO MASTER
            </Link>

            <Link
              href="/dashboard/master/corretoras/nova"
              className="rounded-2xl border border-red-400 bg-red-500/10 px-6 py-4 font-bold text-red-200"
            >
              TESTAR NOVA CORRETORA MASTER
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}