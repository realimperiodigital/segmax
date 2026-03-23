import { redirect } from "next/navigation"
import { getUserAccess } from "@/lib/get-user-access"

export default async function DashboardPage() {
  const access = await getUserAccess()

  if (!access) {
    redirect("/login")
  }

  const role = String(access.role || "")
    .trim()
    .toLowerCase()

  // MASTER permanece aqui
  if (role === "master") {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <h1 className="text-3xl font-bold">
          Aprovações do Master
        </h1>

        <section className="mt-6 rounded-[28px] border border-zinc-800 bg-[#050505] p-6">
          <div className="py-10 text-center text-zinc-400">
            Nenhuma solicitação pendente para o master.
          </div>
        </section>
      </main>
    )
  }

  // FINANCEIRO vai direto
  if (role === "financeiro") {
    redirect("/dashboard/financeiro")
  }

  // TECNICO vai direto
  if (role === "tecnico") {
    redirect("/dashboard/tecnico")
  }

  // fallback
  redirect("/login")
}