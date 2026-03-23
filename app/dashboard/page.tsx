import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile?.role) {
    redirect("/login")
  }

  const role = profile.role

  // MASTER
  if (role === "master") {
    redirect("/dashboard/master")
  }

  // FINANCEIRO
  if (role === "financeiro") {
    redirect("/dashboard/financeiro")
  }

  // CORRETORA
  if (role === "corretora") {
    redirect("/dashboard/corretora")
  }

  // TECNICO
  if (role === "tecnico") {
    redirect("/dashboard/tecnico")
  }

  // USUARIO
  if (role === "usuario") {
    redirect("/dashboard/usuario")
  }

  // fallback
  redirect("/login")

}