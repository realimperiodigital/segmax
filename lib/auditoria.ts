import { supabaseBrowser } from "@/lib/supabase-browser"

function getCookieValue(name: string) {
  if (typeof document === "undefined") return ""

  const match = document.cookie.match(
    new RegExp(
      "(^|; )" + name.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&") + "=([^;]*)"
    )
  )

  return match ? decodeURIComponent(match[2]) : ""
}

export type AuditoriaPayload = {
  acao: string
  modulo: string
  entidade: string
  entidadeId?: string
  dadosAntes?: any
  dadosDepois?: any
  observacao?: string
}

export async function registrarAuditoria({
  acao,
  modulo,
  entidade,
  entidadeId,
  dadosAntes,
  dadosDepois,
  observacao,
}: AuditoriaPayload) {
  const usuarioNome = getCookieValue("segmax_nome") || "Usuário"
  const usuarioRole = getCookieValue("segmax_role") || "usuario"

  const { error } = await supabaseBrowser.from("auditoria_logs").insert({
    usuario_nome: usuarioNome,
    usuario_role: usuarioRole,
    acao,
    modulo,
    entidade,
    entidade_id: entidadeId ?? null,
    dados_antes: dadosAntes ?? null,
    dados_depois: dadosDepois ?? null,
    observacao: observacao ?? null,
  })

  if (error) {
    throw new Error(error.message)
  }

  return true
}

export async function listarAuditoria({
  limite = 100,
  modulo,
  acao,
  usuario,
}: {
  limite?: number
  modulo?: string
  acao?: string
  usuario?: string
} = {}) {
  let query = supabaseBrowser
    .from("auditoria_logs")
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(limite)

  if (modulo && modulo !== "todos") {
    query = query.eq("modulo", modulo)
  }

  if (acao && acao !== "todas") {
    query = query.eq("acao", acao)
  }

  if (usuario && usuario.trim()) {
    query = query.ilike("usuario_nome", `%${usuario.trim()}%`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}