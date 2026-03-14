export default function MasterFinanceiroPage() {
  return (
    <main className="min-h-screen bg-zinc-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-zinc-900">
            SEGMAX • Painel Master Financeiro
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Área financeira da Alessandra para faturamento, cobrança e planos.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Receita mensal</p>
            <h2 className="mt-2 text-3xl font-bold text-zinc-900">R$ 29.970</h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Corretoras ativas</p>
            <h2 className="mt-2 text-3xl font-bold text-zinc-900">8</h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Pagamentos pendentes</p>
            <h2 className="mt-2 text-3xl font-bold text-zinc-900">2</h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Inadimplência</p>
            <h2 className="mt-2 text-3xl font-bold text-zinc-900">R$ 4.997</h2>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-zinc-900">
            Controle financeiro das corretoras
          </h3>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-sm text-zinc-500">
                  <th className="border-b border-zinc-200 px-4 py-3">Corretora</th>
                  <th className="border-b border-zinc-200 px-4 py-3">Plano</th>
                  <th className="border-b border-zinc-200 px-4 py-3">Mensalidade</th>
                  <th className="border-b border-zinc-200 px-4 py-3">Vencimento</th>
                  <th className="border-b border-zinc-200 px-4 py-3">Status</th>
                  <th className="border-b border-zinc-200 px-4 py-3">Ação</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-sm text-zinc-700">
                  <td className="border-b border-zinc-100 px-4 py-4 font-medium">
                    Corretora Teste SegMax
                  </td>
                  <td className="border-b border-zinc-100 px-4 py-4">Prime</td>
                  <td className="border-b border-zinc-100 px-4 py-4">R$ 2.997</td>
                  <td className="border-b border-zinc-100 px-4 py-4">15/03/2026</td>
                  <td className="border-b border-zinc-100 px-4 py-4">Pago</td>
                  <td className="border-b border-zinc-100 px-4 py-4">
                    <button className="rounded-xl bg-zinc-900 px-4 py-2 text-white">
                      Ver detalhes
                    </button>
                  </td>
                </tr>

                <tr className="text-sm text-zinc-700">
                  <td className="border-b border-zinc-100 px-4 py-4 font-medium">
                    Corretora Elite Sul
                  </td>
                  <td className="border-b border-zinc-100 px-4 py-4">Elite</td>
                  <td className="border-b border-zinc-100 px-4 py-4">R$ 4.997</td>
                  <td className="border-b border-zinc-100 px-4 py-4">18/03/2026</td>
                  <td className="border-b border-zinc-100 px-4 py-4">Pendente</td>
                  <td className="border-b border-zinc-100 px-4 py-4">
                    <button className="rounded-xl bg-zinc-900 px-4 py-2 text-white">
                      Cobrar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}