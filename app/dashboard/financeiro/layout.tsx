import { redirect } from "next/navigation"
import { getUserAccess } from "@/lib/get-user-access"

function getDestinoPorRole(role?: string | null) {
  const r = String(role || "").trim().toLowerCase()

  if (r === "master") return null
  if (r === "financeiro") return "/dashboard/financeiro"
  if (r === "tecnico") return "/dashboard/tecnico"
  if (r === "master_corretora") return "/dashboard/corretora"
  if (r === "usuario") return "/dashboard/usuario"

  return "/login"
}

export default async function DashboardPage() {
  const access = await getUserAccess()

  if (!access) {
    redirect("/login")
  }

  const destino = getDestinoPorRole(access.role)

  if (destino) {
    redirect(destino)
  }

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white md:px-8">
      <section className="rounded-[28px] border border-[#3a2a00] bg-[#050505] p-7">
        <h1 className="text-4xl font-bold">Aprovações do Master</h1>
        <p className="mt-3 max-w-3xl text-zinc-400">
          Aqui ficam as solicitações que chegaram para aprovação final da SegMax.
        </p>
      </section>

      <section className="mt-6 rounded-[28px] border border-zinc-800 bg-[#050505] p-6">
        <div className="py-10 text-center text-zinc-400">
          Nenhuma solicitação pendente para o master.
        </div>
      </section>
    </main>
  )
}