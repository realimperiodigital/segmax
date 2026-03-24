import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

function getDashboardByRole(role: string) {
  switch (role) {
    case "master":
      return "/dashboard/master"

    case "diretora_tecnica":
      return "/dashboard/tecnico"

    case "diretora_financeira":
      return "/dashboard/financeiro"

    case "corretora_admin":
      return "/dashboard/corretora"

    case "corretora":
      return "/dashboard/corretora"

    case "usuario":
      return "/dashboard/usuario"

    default:
      return "/dashboard/usuario"
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile?.role) {
    redirect("/login")
  }

  redirect(getDashboardByRole(profile.role))
}