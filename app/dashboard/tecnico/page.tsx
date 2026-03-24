import Link from "next/link"

export default function DashboardTecnicoPage() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-yellow-400">
          Dashboard Técnico
        </h1>

        <p className="mt-3 text-white/80">
          Área técnica carregada com sucesso.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Card
            title="Análise Técnica"
            description="Acesse o núcleo técnico para avaliação e parecer operacional."
            href="/analise-tecnica"
            linkText="Abrir análise"
          />

          <Card
            title="Cotações"
            description="Visualize e acompanhe as cotações disponíveis para análise."
            href="/cotacoes"
            linkText="Ver cotações"
          />

          <Card
            title="Clientes"
            description="Consulte os clientes vinculados às análises e ao fluxo técnico."
            href="/clientes"
            linkText="Ver clientes"
          />

          <Card
            title="Propostas"
            description="Acompanhe propostas em andamento e desdobramentos técnicos."
            href="/propostas"
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