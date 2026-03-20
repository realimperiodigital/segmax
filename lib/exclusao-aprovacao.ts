import { supabaseBrowser } from "@/lib/supabase-browser"
import { registrarAuditoria } from "@/lib/auditoria"

function getCookieValue(name: string) {
  if (typeof document === "undefined") return ""

  const match = document.cookie.match(
    new RegExp(
      "(^|; )" + name.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&") + "=([^;]*)"
    )
  )

  return match ? decodeURIComponent(match[2]) : ""
}

export type SolicitacaoExclusaoPayload = {
  modulo: string
  entidade: string
  entidadeId: string
  motivo: string
  dadosAlvo?: any
  corretoraId?: string
  aprovacaoNivel?: "corretora" | "plataforma"
  aprovadorDestino?: "master_corretora" | "master_segmax"
}

export async function solicitarExclusao({
  modulo,
  entidade,
  entidadeId,
  motivo,
  dadosAlvo,
  corretoraId,
  aprovacaoNivel = "corretora",
  aprovadorDestino = "master_corretora",
}: SolicitacaoExclusaoPayload) {
  const solicitadoPorNome = getCookieValue("segmax_nome") || "Usuário"
  const solicitadoPorRole = getCookieValue("segmax_role") || "usuario"
  const corretoraIdFinal =
    corretoraId ||
    getCookieValue("segmax_corretora_id") ||
    localStorage.getItem("segmax_corretora_id") ||
    ""

  const { data, error } = await supabaseBrowser
    .from("solicitacoes_exclusao")
    .insert({
      modulo,
      entidade,
      entidade_id: entidadeId,
      solicitado_por_nome: solicitadoPorNome,
      solicitado_por_role: solicitadoPorRole,
      motivo,
      dados_alvo: dadosAlvo ?? null,
      corretora_id: corretoraIdFinal || null,
      aprovacao_nivel: aprovacaoNivel,
      aprovador_destino: aprovadorDestino,
      status:
        aprovacaoNivel === "corretora" ? "pendente_corretora" : "pendente",
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  await registrarAuditoria({
    acao: "solicitou_exclusao",
    modulo,
    entidade,
    entidadeId,
    dadosAntes: dadosAlvo ?? null,
    observacao:
      aprovacaoNivel === "corretora"
        ? "Solicitação enviada para aprovação do master da corretora"
        : "Solicitação enviada para aprovação do master da SegMax",
  })

  return data
}

export async function listarSolicitacoesPendentesCorretora(corretoraId: string) {
  const { data, error } = await supabaseBrowser
    .from("solicitacoes_exclusao")
    .select("*")
    .eq("corretora_id", corretoraId)
    .eq("status", "pendente_corretora")
    .order("criado_em", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export async function listarSolicitacoesPendentesMaster() {
  const { data, error } = await supabaseBrowser
    .from("solicitacoes_exclusao")
    .select("*")
    .in("status", ["pendente", "pendente_master"])
    .order("criado_em", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export async function aprovarSolicitacaoCorretora({
  solicitacaoId,
  tabelaAlvo,
}: {
  solicitacaoId: string
  tabelaAlvo: string
}) {
  const aprovadoPorNome = getCookieValue("segmax_nome") || "Master Corretora"
  const aprovadoPorRole =
    getCookieValue("segmax_role") || "master_corretora"

  const { data: solicitacao, error: erroBusca } = await supabaseBrowser
    .from("solicitacoes_exclusao")
    .select("*")
    .eq("id", solicitacaoId)
    .single()

  if (erroBusca || !solicitacao) {
    throw new Error(erroBusca?.message || "Solicitação não encontrada.")
  }

  const { error: erroDelete } = await supabaseBrowser
    .from(tabelaAlvo)
    .delete()
    .eq("id", solicitacao.entidade_id)

  if (erroDelete) {
    throw new Error(erroDelete.message)
  }

  const { error: erroAtualizacao } = await supabaseBrowser
    .from("solicitacoes_exclusao")
    .update({
      status: "aprovada_corretora",
      aprovado_por_corretora_nome: aprovadoPorNome,
      aprovado_por_corretora_role: aprovadoPorRole,
      aprovado_por_corretora_em: new Date().toISOString(),
    })
    .eq("id", solicitacaoId)

  if (erroAtualizacao) {
    throw new Error(erroAtualizacao.message)
  }

  await registrarAuditoria({
    acao: "aprovou_exclusao",
    modulo: solicitacao.modulo,
    entidade: solicitacao.entidade,
    entidadeId: solicitacao.entidade_id,
    dadosAntes: solicitacao.dados_alvo ?? null,
    observacao: "Exclusão aprovada pelo master da corretora",
  })

  return true
}

export async function recusarSolicitacaoCorretora({
  solicitacaoId,
  motivoRecusa,
}: {
  solicitacaoId: string
  motivoRecusa: string
}) {
  const recusadoPorNome = getCookieValue("segmax_nome") || "Master Corretora"
  const recusadoPorRole =
    getCookieValue("segmax_role") || "master_corretora"

  const { data: solicitacao, error: erroBusca } = await supabaseBrowser
    .from("solicitacoes_exclusao")
    .select("*")
    .eq("id", solicitacaoId)
    .single()

  if (erroBusca || !solicitacao) {
    throw new Error(erroBusca?.message || "Solicitação não encontrada.")
  }

  const { error } = await supabaseBrowser
    .from("solicitacoes_exclusao")
    .update({
      status: "recusada_corretora",
      recusado_por_nome: recusadoPorNome,
      recusado_por_role: recusadoPorRole,
      recusado_em: new Date().toISOString(),
      motivo_recusa: motivoRecusa,
    })
    .eq("id", solicitacaoId)

  if (error) {
    throw new Error(error.message)
  }

  await registrarAuditoria({
    acao: "recusou_exclusao",
    modulo: solicitacao.modulo,
    entidade: solicitacao.entidade,
    entidadeId: solicitacao.entidade_id,
    dadosAntes: solicitacao.dados_alvo ?? null,
    observacao: `Exclusão recusada pelo master da corretora. Motivo: ${motivoRecusa}`,
  })

  return true
}

export async function encaminharSolicitacaoParaMaster({
  solicitacaoId,
}: {
  solicitacaoId: string
}) {
  const aprovadoPorNome = getCookieValue("segmax_nome") || "Master Corretora"
  const aprovadoPorRole =
    getCookieValue("segmax_role") || "master_corretora"

  const { data: solicitacao, error: erroBusca } = await supabaseBrowser
    .from("solicitacoes_exclusao")
    .select("*")
    .eq("id", solicitacaoId)
    .single()

  if (erroBusca || !solicitacao) {
    throw new Error(erroBusca?.message || "Solicitação não encontrada.")
  }

  const { error } = await supabaseBrowser
    .from("solicitacoes_exclusao")
    .update({
      status: "pendente_master",
      aprovador_destino: "master_segmax",
      encaminhado_para_master_em: new Date().toISOString(),
      aprovado_por_corretora_nome: aprovadoPorNome,
      aprovado_por_corretora_role: aprovadoPorRole,
      aprovado_por_corretora_em: new Date().toISOString(),
    })
    .eq("id", solicitacaoId)

  if (error) {
    throw new Error(error.message)
  }

  await registrarAuditoria({
    acao: "encaminhou_exclusao_master",
    modulo: solicitacao.modulo,
    entidade: solicitacao.entidade,
    entidadeId: solicitacao.entidade_id,
    dadosAntes: solicitacao.dados_alvo ?? null,
    observacao: "Solicitação encaminhada pelo master da corretora para o master da SegMax",
  })

  return true
}

export async function aprovarSolicitacaoExclusaoMaster({
  solicitacaoId,
  tabelaAlvo,
}: {
  solicitacaoId: string
  tabelaAlvo: string
}) {
  const aprovadoPorNome = getCookieValue("segmax_nome") || "Master"
  const aprovadoPorRole = getCookieValue("segmax_role") || "master"

  const { data: solicitacao, error: erroBusca } = await supabaseBrowser
    .from("solicitacoes_exclusao")
    .select("*")
    .eq("id", solicitacaoId)
    .single()

  if (erroBusca || !solicitacao) {
    throw new Error(erroBusca?.message || "Solicitação não encontrada.")
  }

  const { error: erroDelete } = await supabaseBrowser
    .from(tabelaAlvo)
    .delete()
    .eq("id", solicitacao.entidade_id)

  if (erroDelete) {
    throw new Error(erroDelete.message)
  }

  const { error: erroAtualizacao } = await supabaseBrowser
    .from("solicitacoes_exclusao")
    .update({
      status: "aprovada",
      aprovado_por_nome: aprovadoPorNome,
      aprovado_por_role: aprovadoPorRole,
      aprovado_em: new Date().toISOString(),
    })
    .eq("id", solicitacaoId)

  if (erroAtualizacao) {
    throw new Error(erroAtualizacao.message)
  }

  await registrarAuditoria({
    acao: "aprovou_exclusao",
    modulo: solicitacao.modulo,
    entidade: solicitacao.entidade,
    entidadeId: solicitacao.entidade_id,
    dadosAntes: solicitacao.dados_alvo ?? null,
    observacao: "Exclusão aprovada pelo master da SegMax",
  })

  return true
}