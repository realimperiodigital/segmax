import { createClient } from "@/lib/supabase/server"
import {
  hasPermission,
  type Permission,
  type UserRole,
} from "@/lib/access-control"

function normalizeUserRole(role?: string | null): UserRole | null {
  const r = String(role || "").trim().toLowerCase()

  if (r === "master") return "master"

  if (r === "financeiro" || r === "diretora_financeira") {
    return "financeiro"
  }

  if (r === "tecnico" || r === "diretora_tecnica") {
    return "tecnico"
  }

  if (r === "corretora_geral" || r === "master_corretora") {
    return "corretora_geral"
  }

  if (r === "corretora_financeiro") return "corretora_financeiro"
  if (r === "corretora_gerente") return "corretora_gerente"
  if (r === "corretora_supervisor") return "corretora_supervisor"
  if (r === "corretora_tecnico") return "corretora_tecnico"
  if (r === "corretora_corretor") return "corretora_corretor"

  return null
}

export type UserAccess = {
  userId: string
  role: UserRole
  corretora_id: string | null
  can: (permission: Permission) => boolean
}

export async function getUserAccess(): Promise<UserAccess | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return null
  }

  const { data, error } = await supabase
    .from("usuarios")
    .select("role, corretora_id")
    .eq("id", user.id)
    .maybeSingle()

  if (error || !data?.role) {
    return null
  }

  const role = normalizeUserRole(data.role)

  if (!role) {
    return null
  }

  const corretora_id = data.corretora_id ?? null

  return {
    userId: user.id,
    role,
    corretora_id,
    can: (permission: Permission) => hasPermission(role, permission),
  }
}