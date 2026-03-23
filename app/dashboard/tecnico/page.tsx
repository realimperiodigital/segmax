import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardTecnicoPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, nome")
    .eq("id", user.id)
    .single()

  if (!profile) {
    redirect("/login")
  }

  if (profile.role !== "tecnico" && profile.role !== "master") {
    redirect("/dashboard")
  }

  const nome = profile.nome || user.email || "Usuário"

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-yellow-500/20 bg-zinc-950/80 p-5 lg:flex lg:flex-col">
          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5">
            <div className="mb-6 flex h-28 items-center justify-center rounded-2xl border border-zinc-800 bg-black">
              <span className="text-3xl font-black tracking-widest text-yellow-400">
                SM
              </span>
            </div>

            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
              Perfil conectado
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-tight">{nome}</h2>

            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
              Técnico
            </p>
          </div>

          <div className="mt-8">
            <p className="mb-4 text-xs uppercase tracking-[0.4em] text-zinc-500">
              Navegação
            </p>

            <nav className="space-y-3">
              <div className="rounded-3xl border border-yellow-500 bg-yellow-500/10 p-5">
                <p className="text-3xl font-bold">Técnico</p>
                <p className="mt-2 text-base text-zinc-400">Tela atual</p>
              </div>

              <Link
                href="/dashboard/master"
                className="block rounded-3xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-yellow-500/40 hover:bg-zinc-900"
              >
                <p className="text-2xl font-semibold">Master</p>
                <p className="mt-2 text-base text-zinc-400">Painel principal</p>
              </Link>

              <Link
                href="/clientes"
                className="block rounded-3xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-yellow-500/40 hover:bg-zinc-900"
              >
                <p className="text-2xl font-semibold">Clientes</p>
                <p className="mt-2 text-base text-zinc-400">
                  Base operacional
                </p>
              </Link>

              <Link
                href="/cotacoes"
                className="block rounded-3xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-yellow-500/40 hover:bg-zinc-900"
              >
                <p className="text-2xl font-semibold">Cotações</p>
                <p className="mt-2 text-base text-zinc-400">
                  Esteira técnica
                </p>
              </Link>
            </nav>
          </div>
        </aside>

        <section className="flex-1 p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            <header className="rounded-[2rem] border border-yellow-500/20 bg-[#050816] px-8 py-10 shadow-2xl shadow-yellow-500/5">
              <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm font-bold uppercase tracking-[0.35em] text-yellow-400">
                    Painel técnico
                  </p>

                  <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                    Centro de operação técnica
                  </h1>

                  <p className="mt-5 text-lg leading-8 text-zinc-300">
                    Esta área concentra análise técnica, suporte operacional,
                    acompanhamento de esteira e acesso às rotas principais do
                    time técnico.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/analise-tecnica"
                    className="rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-6 py-4 text-lg font-semibold text-yellow-200 transition hover:bg-yellow-500/20"
                  >
                    Abrir análise técnica
                  </Link>

                  <Link
                    href="/clientes"
                    className="rounded-2xl border border-zinc-700 bg-zinc-900 px-6 py-4 text-lg font-semibold text-white transition hover:border-zinc-500 hover:bg-zinc-800"
                  >
                    Clientes
                  </Link>
                </div>
              </div>
            </header>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <Card
                title="Análise técnica"
                description="Entrar no fluxo técnico e acompanhar tratativas operacionais."
                href="/analise-tecnica"
                linkText="Abrir análise"
              />

              <Card
                title="Clientes"
                description="Consultar dados de clientes ligados à operação técnica."
                href="/clientes"
                linkText="Abrir clientes"
              />

              <Card
                title="Cotações"
                description="Acompanhar demandas técnicas relacionadas às cotações."
                href="/cotacoes"
                linkText="Abrir cotações"
              />

              <Card
                title="Propostas"
                description="Ver impacto da análise técnica na esteira comercial."
                href="/propostas"
                linkText="Abrir propostas"
              />

              <Card
                title="Exclusões"
                description="Revisar histórico e aprovações que dependem de validação técnica."
                href="/exclusoes-historico"
                linkText="Abrir exclusões"
              />

              <Card
                title="Auditoria"
                description="Ter visão de rastreabilidade e revisão operacional."
                href="/dashboard/tecnico"
                linkText="Abrir auditoria"
              />
            </div>
          </div>
        </section>
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
    <section className="rounded-[2rem] border border-zinc-800 bg-[#050816] p-6 transition hover:border-yellow-500/30">
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>

      <p className="mt-4 text-lg leading-8 text-zinc-400">{description}</p>

      <Link
        href={href}
        className="mt-8 inline-flex text-xl font-semibold text-yellow-400 transition hover:text-yellow-300"
      >
        {linkText} →
      </Link>
    </section>
  )
}