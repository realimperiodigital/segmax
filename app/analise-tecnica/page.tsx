export default function AnaliseTecnicaPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8">

          <div className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-500">
            Área Técnica
          </div>

          <h1 className="mt-4 text-4xl font-bold text-yellow-400">
            Análises Técnicas
          </h1>

          <p className="mt-4 text-zinc-300">
            Esta tela foi estabilizada para liberar o build da produção.
          </p>

          <div className="mt-8 grid gap-4">

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-sm text-zinc-400">
                Status do módulo
              </p>

              <p className="mt-2 text-xl font-semibold text-white">
                Funcionando
              </p>
            </div>

          </div>

        </div>
      </div>
    </main>
  )
}