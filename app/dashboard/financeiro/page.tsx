import Link from "next/link"

export default function DashboardFinanceiroPage() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-yellow-400">
          Dashboard Financeiro
        </h1>

        <p className="mt-3 text-white/80">
          Área financeira carregada com sucesso.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Card
            title="Visão Financeira"
            description="Acompanhe indicadores financeiros, fluxo e status gerais."
            href="/dashboard/financeiro/painel"
            linkText="Abrir painel"
          />

          <Card
            title="Corretoras"
            description="Acesse informações organizadas das corretoras cadastradas."
            href="/dashboard/financeiro/corretoras"
            linkText="Ver corretoras"
          />

          <Card
            title="Clientes"
            description="Consulte clientes vinculados ao fluxo operacional."
            href="/dashboard/financeiro/clientes"
            linkText="Ver clientes"
          />

          <Card
            title="Cotações"
            description="Acompanhe cotações vinculadas ao processo comercial."
            href="/dashboard/financeiro/cotacoes"
            linkText="Ver cotações"
          />

          <Card
            title="Propostas"
            description="Visualize propostas e evolução do pipeline comercial."
            href="/dashboard/financeiro/propostas"
            linkText="Ver propostas"
          />
        </div>
      </div>
    </main>
  )
}

function Card({
  title,
  description,
  href,
  linkText,
}: {
  title: string
  description: string
  href: string
  linkText: string
}) {
  return (
    <section className="rounded-2xl border border-yellow-500/20 bg-white/5 p-6 shadow-xl">
      <h2 className="text-xl font-semibold text-yellow-400">{title}</h2>

      <p className="mt-3 text-sm leading-6 text-white/75">{description}</p>

      <Link
        href={href}
        className="mt-6 inline-flex text-base font-semibold text-yellow-400 transition hover:text-yellow-300"
      >
        {linkText} →
      </Link>
    </section>
  )
}