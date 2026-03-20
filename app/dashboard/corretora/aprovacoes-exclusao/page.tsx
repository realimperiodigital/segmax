"use client"

import { useEffect, useState } from "react"
import {
  aprovarSolicitacaoCorretora,
  encaminharSolicitacaoParaMaster,
  listarSolicitacoesPendentesCorretora,
  recusarSolicitacaoCorretora,
} from "@/lib/exclusao-aprovacao"

type Solicitacao = {
  id: string
  modulo: string
  entidade: string
  entidade_id: string
  solicitado_por_nome: string
  solicitado_por_role: string
  motivo: string
  status: string
  criado_em: string
  dados_alvo?: any
  aprovacao_nivel?: string
}

const MAPA_TABELAS: Record<string, string> = {
  clientes: "clientes",
  cotacoes: "cotacoes",
  usuarios: "usuarios",
}

function getCookieValue(name: string) {
  if (typeof document === "undefined") return ""

  const match = document.cookie.match(
    new RegExp(
      "(^|; )" + name.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&") + "=([^;]*)"
    )
  )

  return match ? decodeURIComponent(match[2]) : ""
}

export default function AprovacoesExclusaoCorretoraPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState("")
  const [processandoId, setProcessandoId] = useState<string | null>(null)
  const [corretoraId, setCorretoraId] = useState("")

  async function carregar(corretoraIdAtual: string) {
    try {
      setErro("")
      setLoading(true)

      if (!corretoraIdAtual) {
        setErro("Corretora não identificada na sessão.")
        setSolicitacoes([])
        return
      }

      const data = await listarSolicitacoesPendentesCorretora(corretoraIdAtual)
      setSolicitacoes(data)
    } catch (e: any) {
      setErro(e.message || "Não foi possível carregar as solicitações.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const id =
      getCookieValue("segmax_corretora_id") ||
      localStorage.getItem("segmax_corretora_id") ||
      ""

    setCorretoraId(id)
    carregar(id)
  }, [])

  async function handleAprovar(item: Solicitacao) {
    const confirmar = confirm(
      `Deseja aprovar a exclusão de ${item.entidade} (${item.entidade_id})?`
    )

    if (!confirmar) return

    const tabelaAlvo = MAPA_TABELAS[item.modulo]

    if (!tabelaAlvo) {
      alert("Esse módulo deve ser encaminhado para o master da SegMax.")
      return
    }

    try {
      setProcessandoId(item.id)
      await aprovarSolicitacaoCorretora({
        solicitacaoId: item.id,
        tabelaAlvo,
      })
      await carregar(corretoraId)
    } catch (e: any) {
      alert(e.message || "Erro ao aprovar solicitação.")
    } finally {
      setProcessandoId(null)
    }
  }

  async function handleRecusar(item: Solicitacao) {
    const motivoRecusa = prompt("Digite o motivo da recusa:") || ""

    if (!motivoRecusa.trim()) {
      alert("Informe o motivo da recusa.")
      return
    }

    try {
      setProcessandoId(item.id)
      await recusarSolicitacaoCorretora({
        solicitacaoId: item.id,
        motivoRecusa,
      })
      await carregar(corretoraId)
    } catch (e: any) {
      alert(e.message || "Erro ao recusar solicitação.")
    } finally {
      setProcessandoId(null)
    }
  }

  async function handleEncaminhar(item: Solicitacao) {
    const confirmar = confirm(
      "Deseja encaminhar essa solicitação para aprovação do master da SegMax?"
    )

    if (!confirmar) return

    try {
      setProcessandoId(item.id)
      await encaminharSolicitacaoParaMaster({
        solicitacaoId: item.id,
      })
      await carregar(corretoraId)
    } catch (e: any) {
      alert(e.message || "Erro ao encaminhar solicitação.")
    } finally {
      setProcessandoId(null)
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white md:px-8">
      <section className="rounded-[28px] border border-[#3a2a00] bg-[#050505] p-7">
        <h1 className="text-4xl font-bold">Aprovação de exclusão da corretora</h1>
        <p className="mt-3 max-w-3xl text-zinc-400">
          Aqui o master da corretora aprova, recusa ou encaminha pedidos de
          exclusão feitos pelos usuários da sua própria operação.
        </p>
      </section>

      <section className="mt-6 rounded-[28px] border border-zinc-800 bg-[#050505] p-6">
        {loading ? (
          <div className="py-10 text-center text-zinc-400">
            Carregando solicitações...
          </div>
        ) : erro ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300">
            {erro}
          </div>
        ) : solicitacoes.length === 0 ? (
          <div className="py-10 text-center text-zinc-400">
            Nenhuma solicitação pendente para esta corretora.
          </div>
        ) : (
          <div className="space-y-4">
            {solicitacoes.map((item) => {
              const tabelaAlvo = MAPA_TABELAS[item.modulo]
              const aprovacaoDireta = Boolean(tabelaAlvo)

              return (
                <div
                  key={item.id}
                  className="rounded-[24px] border border-zinc-800 bg-black p-5"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <div className="inline-flex rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400">
                        Pendente corretora
                      </div>

                      <h2 className="text-2xl font-bold">
                        {item.entidade} • {item.modulo}
                      </h2>

                      <div className="space-y-1 text-sm text-zinc-400">
                        <p>
                          <span className="text-white">ID:</span>{" "}
                          {item.entidade_id}
                        </p>
                        <p>
                          <span className="text-white">Solicitado por:</span>{" "}
                          {item.solicitado_por_nome} ({item.solicitado_por_role})
                        </p>
                        <p>
                          <span className="text-white">Motivo:</span> {item.motivo}
                        </p>
                        <p>
                          <span className="text-white">Criado em:</span>{" "}
                          {new Date(item.criado_em).toLocaleString("pt-BR")}
                        </p>
                      </div>

                      {item.dados_alvo ? (
                        <pre className="mt-4 overflow-auto rounded-2xl border border-zinc-800 bg-[#070707] p-4 text-xs text-zinc-300">
                          {JSON.stringify(item.dados_alvo, null, 2)}
                        </pre>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-3 xl:w-[260px]">
                      {aprovacaoDireta ? (
                        <button
                          onClick={() => handleAprovar(item)}
                          disabled={processandoId === item.id}
                          className="rounded-2xl bg-[#d4a828] px-5 py-4 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-60"
                        >
                          {processandoId === item.id
                            ? "Processando..."
                            : "Aprovar exclusão"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEncaminhar(item)}
                          disabled={processandoId === item.id}
                          className="rounded-2xl bg-[#d4a828] px-5 py-4 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-60"
                        >
                          {processandoId === item.id
                            ? "Processando..."
                            : "Encaminhar ao master"}
                        </button>
                      )}

                      <button
                        onClick={() => handleRecusar(item)}
                        disabled={processandoId === item.id}
                        className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
                      >
                        Recusar solicitação
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}