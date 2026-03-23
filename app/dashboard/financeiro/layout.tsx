import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getUserAccess } from "@/lib/get-user-access"

export default async function DashboardFinanceiroLayout({
  children,
}: {
  children: ReactNode
}) {
  const access = await getUserAccess()

  if (!access) {
    redirect("/login")
  }

  const role = String(access.role || "").trim().toLowerCase()

  if (role !== "master" && role !== "financeiro") {
    redirect("/dashboard")
  }

  return <>{children}</>
}