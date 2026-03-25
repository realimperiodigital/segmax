import Link from "next/link"

type ModuleCardProps = {
  title: string
  description: string
  href: string
  actionLabel: string
}

const modules: ModuleCardProps[] = [
  {
    title: "Cadastrar corretora",
    description: "Abra direto o cadastro de uma nova corretora.",
    href: "/dashboard/master/corretoras/nova",
    actionLabel: "Abrir cadastro",
  },
  {
    title: "Corretoras",
    description: "Ver lista, editar, ativar, bloquear e revisar dados.",
    href: "/dashboard/master/corretoras",
    actionLabel: "Abrir lista",
  },
  {
    title: "Usuários",
    description: "Gerenciar acessos, perfis e permissões do sistema.",
    href: "/dashboard/master/usuarios",
    actionLabel: "Abrir usuários",
  },
  {
    title: "Clientes",
    description: "Consultar e administrar a base de clientes.",
    href: "/dashboard/master/clientes",
    actionLabel: "Abrir clientes",
  },
  {
    title: "Cotações",
    description: "Entrar na central de cotações sem rota quebrada.",
    href: "/dashboard/master/cotacoes",
    actionLabel: "Abrir cotações",
  },
  {
    title: "Análise técnica",
    description: "Abrir análises, revisões e pareceres técnicos.",
    href: "/dashboard/master/analises",
    actionLabel: "Abrir análises",
  },
  {
    title: "Propostas",
    description: "Acompanhar propostas, status e fluxo comercial.",
    href: "/dashboard/master/propostas",
    actionLabel: "Abrir propostas",
  },
  {
    title: "Financeiro",
    description: "Ver repasses, fechamento e controle financeiro.",
    href: "/dashboard/master/financeiro",
    actionLabel: "Abrir financeiro",
  },
  {
    title: "Aprovações de exclusão",
    description: "Validar ou recusar pedidos de exclusão da operação.",
    href: "/dashboard/master/aprovacoes-exclusao",
    actionLabel: "Abrir aprovações",
  },
  {
    title: "Auditoria",
    description: "Monitorar histórico, ações e rastreabilidade do sistema.",
    href: "/dashboard/master/auditoria",
    actionLabel: "Abrir auditoria",
  },
]

export default function MasterPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl p-8">
        <section className="rounded-[32px] border border-yellow-500/15 bg-[#05070c] p-8 shadow-[0_0_0_1px_rgba(234,179,8,0.04)]">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-4xl">
              <div className="text-xs font-semibold uppercase tracking-[0.35em] text-yellow-400">
                Painel Master
              </div>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
                Centro de controle da operação
              </h1>

              <p className="mt-5 max-w-4xl text-lg leading-8 text-zinc-400">
                Aqui ficam os atalhos principais do master. Os botões abaixo já
                estão apontando para as rotas finais corretas do sistema, sem
                jogar para caminhos antigos do dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/master/corretoras/nova"
                className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-6 py-4 text-base font-semibold text-white transition hover:bg-yellow-500/20"
              >
                Cadastrar corretora
              </Link>

              <Link
                href="/dashboard/master/cotacoes"
                className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-4 text-base font-semibold text-white transition hover:border-zinc-700 hover:bg-zinc-800"
              >
                Cotações
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <ModuleCard
              key={module.href}
              title={module.title}
              description={module.description}
              href={module.href}
              actionLabel={module.actionLabel}
            />
          ))}
        </section>
      </div>
    </main>
  )
}

function ModuleCard({
  title,
  description,
  href,
  actionLabel,
}: ModuleCardProps) {
  return (
    <section className="rounded-[28px] border border-zinc-800 bg-[#05070c] p-6 transition hover:border-yellow-500/20">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>

      <p className="mt-4 min-h-[72px] text-base leading-7 text-zinc-400">
        {description}
      </p>

      <Link
        href={href}
        className="mt-6 inline-flex items-center gap-2 text-lg font-semibold text-yellow-400 transition hover:text-yellow-300"
      >
        {actionLabel}
        <span aria-hidden>→</span>
      </Link>
    </section>
  )
}