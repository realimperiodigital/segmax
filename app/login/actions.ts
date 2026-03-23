"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

function getDestinoPorRole(role?: string | null) {
  const r = String(role || "").trim().toLowerCase()

  if (r === "master") return "/dashboard"

  if (
    r === "financeiro" ||
    r === "diretora_financeira"
  ) {
    return "/dashboard/financeiro"
  }

  if (
    r === "tecnico" ||
    r === "diretora_tecnica"
  ) {
    return "/dashboard/tecnico"
  }

  if (r === "master_corretora") {
    return "/dashboard/corretora"
  }

  if (r === "usuario") {
    return "/dashboard/usuario"
  }

  return "/dashboard"
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const password = String(formData.get("password") || "").trim()

  if (!email || !password) {
    return { error: "Informe e-mail e senha." }
  }

  const supabase = await createClient()

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    })

  if (authError || !authData.user) {
    return { error: "Login ou senha inválidos." }
  }

  const { data: usuarioRow } = await supabase
    .from("usuarios")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle()

  if (!usuarioRow?.role) {
    return {
      error: "Usuário sem role definida.",
    }
  }

  revalidatePath("/", "layout")

  redirect(
    getDestinoPorRole(usuarioRow.role)
  )
}