import Link from "next/link"

const modules = [
  {
    title: "Cadastrar corretora",
    description: "Abra direto o cadastro de uma nova corretora.",
    href: "/dashboard/master/corretoras/nova",
    action: "Abrir cadastro",
  },
  {
    title: "Corretoras",
    description: "Ver lista, editar, ativar, bloquear e revisar dados.",
    href: "/dashboard/master/corretoras",
    action: "Abrir lista",
  },
  {
    title: "Usuários",
    description: "Gerenciar acessos, perfis e permissões do sistema.",
    href: "/dashboard/master/usuarios",
    action: "Abrir usuários",
  },
  {
    title: "Clientes",
    description: "Consultar e administrar a base de clientes.",
    href: "/dashboard/master/clientes",
    action: "Abrir clientes",
  },
  {
    title: "Cotações",
    description: "Entrar na central de cotações sem rota quebrada.",
    href: "/dashboard/master/cotacoes",
    action: "Abrir cotações",
  },
  {
    title: "Análise técnica",
    description: "Abrir análises, revisões e pareceres técnicos.",
    href: "/dashboard/master/analises",
    action: "Abrir análises",
  },
  {
    title: "Propostas",
    description: "Acompanhar propostas, status e fluxo comercial.",
    href: "/dashboard/master/propostas",
    action: "Abrir propostas",
  },
  {
    title: "Financeiro",
    description: "Ver repasses, fechamento e controle financeiro.",
    href: "/dashboard/master/financeiro",
    action: "Abrir financeiro",
  },
  {
    title: "Aprovações de exclusão",
    description: "Validar ou recusar pedidos de exclusão da operação.",
    href: "/dashboard/master/aprovacoes-exclusao",
    action: "Abrir aprovações",
  },
  {
    title: "Auditoria",
    description: "Monitorar histórico, ações e rastreabilidade do sistema.",
    href: "/dashboard/master/auditoria",
    action: "Abrir auditoria",
  },
]

const quickActions = [
  {
    label: "Cadastrar corretora",
    href: "/dashboard/master/corretoras/nova",
    primary: true,
  },
  {
    label: "Cotações",
    href: "/dashboard/master/cotacoes",
    primary: false,
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
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={[
                    "rounded-2xl px-6 py-4 text-base font-semibold transition",
                    action.primary
                      ? "border border-yellow-500/30 bg-yellow-500/10 text-white hover:bg-yellow-500/20"
                      : "border border-zinc-800 bg-zinc-900 text-white hover:border-zinc-700 hover:bg-zinc-800",
                  ].join(" ")}
                >
                  {action.label}
                </Link>
              ))}
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
              action={module.action}
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
  action,
}: {
  title: string
  description: string
  href: string
  action: string
}) {
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
        {action}
        <span aria-hidden>→</span>
      </Link>
    </section>
  )
}