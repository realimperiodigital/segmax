"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

function getDestinoPorRole(role: string) {
  const normalized = String(role || "").trim().toLowerCase()

  switch (normalized) {
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
      return "/dashboard"
  }
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const password = String(formData.get("password") || "")

  if (!email || !password) {
    redirect("/login?error=Informe%20email%20e%20senha")
  }

  const supabase = await createClient()

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    redirect("/login?error=Credenciais%20inv%C3%A1lidas")
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login?error=Falha%20ao%20validar%20sess%C3%A3o")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile?.role) {
    redirect("/login?error=Perfil%20n%C3%A3o%20encontrado")
  }

  revalidatePath("/", "layout")

  redirect(getDestinoPorRole(profile.role))
}