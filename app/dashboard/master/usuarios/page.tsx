import Link from "next/link"

export default function DashboardMasterUsuariosPage() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-yellow-500">
              Master
            </p>

            <h1 className="mt-2 text-3xl font-bold text-yellow-400">
              Usuários do Master
            </h1>

            <p className="mt-3 text-white/75">
              Área master dedicada para gestão de acessos, perfis e permissões do sistema.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/dashboard/master/usuarios/novo"
              className="rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-black transition hover:brightness-110"
            >
              Novo usuário
            </Link>

            <Link
              href="/dashboard/master"
              className="rounded-xl border border-yellow-500/20 px-5 py-3 font-semibold text-yellow-400 transition hover:bg-yellow-500/10"
            >
              Voltar ao painel
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-white/5 p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-yellow-400">
            Gestão de usuários
          </h2>

          <p className="mt-3 text-white/75">
            Aqui ficará a visão master de usuários, com listagem, controle de acessos,
            perfis, permissões e manutenção administrativa.
          </p>
        </div>
      </div>
    </main>
  )
}