import Link from "next/link";

const atalhos = [
  {
    titulo: "Cadastrar corretora",
    descricao: "Abre direto o cadastro de uma nova corretora.",
    href: "/corretoras/nova",
    cta: "Abrir cadastro",
  },
  {
    titulo: "Corretoras",
    descricao: "Ver lista, editar, ativar, bloquear e revisar dados.",
    href: "/corretoras",
    cta: "Abrir lista",
  },
  {
    titulo: "Usuários",
    descricao: "Gerenciar acessos, perfis e permissões do sistema.",
    href: "/usuarios",
    cta: "Abrir usuários",
  },
  {
    titulo: "Clientes",
    descricao: "Consultar e administrar a base de clientes.",
    href: "/clientes",
    cta: "Abrir clientes",
  },
  {
    titulo: "Cotações",
    descricao: "Entrar na central de cotações sem rota quebrada.",
    href: "/cotacoes",
    cta: "Abrir cotações",
  },
  {
    titulo: "Análise técnica",
    descricao: "Abrir análises, revisões e pareceres técnicos.",
    href: "/analise-tecnica",
    cta: "Abrir análises",
  },
  {
    titulo: "Propostas",
    descricao: "Acompanhar propostas, status e fluxo comercial.",
    href: "/propostas",
    cta: "Abrir propostas",
  },
  {
    titulo: "Financeiro",
    descricao: "Ver repasses, fechamento e controle financeiro.",
    href: "/financeiro",
    cta: "Abrir financeiro",
  },
  {
    titulo: "Aprovações de exclusão",
    descricao: "Validar ou recusar pedidos de exclusão da operação.",
    href: "/dashboard/master/aprovacoes-exclusao",
    cta: "Abrir aprovações",
  },
  {
    titulo: "Auditoria",
    descricao: "Consultar histórico, ações e rastreabilidade do sistema.",
    href: "/dashboard/master/auditoria",
    cta: "Abrir auditoria",
  },
];

export default function MasterPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-[28px] border border-zinc-800 bg-zinc-950 p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-amber-300">
                Painel master
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Centro de controle da operação
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
                Aqui ficam os atalhos principais do master. Os botões abaixo já
                estão apontando para as rotas finais corretas do sistema, sem
                jogar para caminhos antigos do dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/corretoras/nova"
                className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-3 text-sm font-medium text-amber-300 transition hover:bg-amber-500/15"
              >
                Cadastrar corretora
              </Link>

              <Link
                href="/cotacoes"
                className="rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:border-zinc-600 hover:bg-zinc-800"
              >
                Cotações
              </Link>
            </div>
          </div>
        </div>

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {atalhos.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-[24px] border border-zinc-800 bg-zinc-950 p-5 transition hover:border-amber-500/30 hover:bg-zinc-900"
            >
              <div className="flex h-full flex-col justify-between gap-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {item.titulo}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">
                    {item.descricao}
                  </p>
                </div>

                <div className="inline-flex items-center text-sm font-medium text-amber-300">
                  {item.cta}
                  <span className="ml-2 transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <InfoCard
            titulo="Rota correta de cadastro"
            texto="O botão principal de cadastro agora abre em /corretoras/nova."
          />
          <InfoCard
            titulo="Rota correta de cotações"
            texto="O acesso de cotações agora abre em /cotacoes."
          />
          <InfoCard
            titulo="Próximo teste"
            texto="Depois disso, valide clique por clique do painel master e me diga qual botão ainda falhou."
          />
        </section>
      </div>
    </main>
  );
}

function InfoCard({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="rounded-[24px] border border-zinc-800 bg-zinc-950 p-5">
      <h3 className="text-base font-semibold text-white">{titulo}</h3>
      <p className="mt-2 text-sm leading-7 text-zinc-400">{texto}</p>
    </div>
  );
}