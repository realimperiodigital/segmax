import { ReactNode } from "react"
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

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const access = await getUserAccess()

  if (!access) {
    redirect("/login")
  }

  const destino = getDestinoPorRole(access.role)

  if (destino) {
    redirect(destino)
  }

  return <>{children}</>
}