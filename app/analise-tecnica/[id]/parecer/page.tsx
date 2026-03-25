type Props = {
  params: {
    id: string
  }
}

export default function ParecerPage({ params }: Props) {
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8">
          <div className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-500">
            Análise Técnica
          </div>

          <h1 className="mt-4 text-4xl font-bold text-yellow-400">
            Parecer Técnico
          </h1>

          <p className="mt-4 text-zinc-300">
            Esta página foi estabilizada para liberar o build da produção.
          </p>

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">ID da análise</p>
            <p className="mt-2 text-2xl font-semibold text-white">{params.id}</p>
          </div>
        </div>
      </div>
    </main>
  )
}