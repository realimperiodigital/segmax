export default function MasterPage() {
  return (
    <section className="space-y-8">
      <div className="rounded-[32px] border border-[#2a2e37] bg-[linear-gradient(135deg,rgba(212,166,58,0.10),rgba(255,255,255,0.02))] px-8 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <h1 className="text-4xl font-black tracking-tight text-white">
          SEGMAX • Painel Super Master
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#a8b0bc]">
          Área principal de controle da plataforma, com visão estratégica sobre
          corretoras, usuários, clientes, cotações e operação interna.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border border-[#2a2e37] bg-[#11141b] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.20)]">
          <p className="text-sm text-[#9aa2af]">Corretoras ativas</p>
          <p className="mt-3 text-3xl font-black text-white">1</p>
        </div>

        <div className="rounded-[28px] border border-[#2a2e37] bg-[#11141b] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.20)]">
          <p className="text-sm text-[#9aa2af]">Usuários cadastrados</p>
          <p className="mt-3 text-3xl font-black text-white">3</p>
        </div>

        <div className="rounded-[28px] border border-[#2a2e37] bg-[#11141b] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.20)]">
          <p className="text-sm text-[#9aa2af]">Cotações no sistema</p>
          <p className="mt-3 text-3xl font-black text-white">0</p>
        </div>

        <div className="rounded-[28px] border border-[#2a2e37] bg-[#11141b] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.20)]">
          <p className="text-sm text-[#9aa2af]">Status geral</p>
          <p className="mt-3 text-2xl font-black text-[#d4a63a]">Operando</p>
        </div>
      </div>

      <div className="rounded-[32px] border border-[#2a2e37] bg-[#11141b] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Corretora Teste SegMax
            </h2>
            <p className="mt-2 text-sm text-[#9aa2af]">
              Responsável: Renato Silva • Plano: Prime • Contato:
              contato@segmax.com • Status: ativo
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:opacity-90">
              Ativar
            </button>

            <button className="rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-black transition hover:opacity-90">
              Suspender
            </button>

            <button className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:opacity-90">
              Bloquear
            </button>

            <button className="rounded-2xl border border-[#39404c] bg-[#1a1e27] px-5 py-3 text-sm font-bold text-white transition hover:border-[#d4a63a] hover:text-[#d4a63a]">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}