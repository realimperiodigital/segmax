"use client"

import { useEffect, useMemo, useState } from "react"
import { listarAuditoria } from "@/lib/auditoria"

type LogAuditoria = {
  id: string
  usuario_nome: string | null
  usuario_role: string | null
  acao: string
  modulo: string
  entidade: string
  entidade_id: string | null
  dados_antes: any
  dados_depois: any
  observacao: string | null
  criado_em: string
}

const MODULOS = [
  "todos",
  "clientes",
  "usuarios",
  "corretoras",
  "seguradoras",
  "cotacoes",
  "financeiro",
  "analise-tecnica",
  "master",
]

const ACOES = [
  "todas",
  "criou",
  "editou",
  "solicitou_exclusao",
  "aprovou_exclusao",
  "recusou_exclusao",
]

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<LogAuditoria[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState("")
  const [modulo, setModulo] = useState("todos")
  const [acao, setAcao] = useState("todas")
  const [usuario, setUsuario] = useState("")
  const [expandido, setExpandido] = useState<string | null>(null)

  async function carregar() {
    try {
      setErro("")
      setLoading(true)

      const data = await listarAuditoria({
        limite: 100,
        modulo,
        acao,
        usuario,
      })

      setLogs(data)
    } catch (e: any) {
      setErro(e.message || "Não foi possível carregar a auditoria.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  function toggleExpandido(id: string) {
    setExpandido((prev) => (prev === id ? null : id))
  }

  const resumo = useMemo(() => {
    return {
      total: logs.length,
      criacoes: logs.filter((x) => x.acao === "criou").length,
      edicoes: logs.filter((x) => x.acao === "editou").length,
      exclusoes: logs.filter(
        (x) =>
          x.acao === "solicitou_exclusao" ||
          x.acao === "aprovou_exclusao" ||
          x.acao === "recusou_exclusao"
      ).length,
    }
  }, [logs])

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white md:px-8">
      <section className="rounded-[28px] border border-[#3a2a00] bg-[#050505] p-7">
        <h1 className="text-4xl font-bold">Auditoria completa</h1>
        <p className="mt-3 max-w-3xl text-zinc-400">
          Histórico central da operação SegMax com rastreio de criação, edição,
          solicitações de exclusão, aprovações e recusas.
        </p>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <CardResumo titulo="Total de logs" valor={String(resumo.total)} />
        <CardResumo titulo="Criações" valor={String(resumo.criacoes)} />
        <CardResumo titulo="Edições" valor={String(resumo.edicoes)} />
        <CardResumo titulo="Fluxos de exclusão" valor={String(resumo.exclusoes)} />
      </section>

      <section className="mt-6 rounded-[28px] border border-zinc-800 bg-[#050505] p-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr_1.2fr_auto]">
          <select
            value={modulo}
            onChange={(e) => setModulo(e.target.value)}
            className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
          >
            {MODULOS.map((item) => (
              <option key={item} value={item}>
                {item === "todos" ? "Todos os módulos" : item}
              </option>
            ))}
          </select>

          <select
            value={acao}
            onChange={(e) => setAcao(e.target.value)}
            className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
          >
            {ACOES.map((item) => (
              <option key={item} value={item}>
                {item === "todas" ? "Todas as ações" : item}
              </option>
            ))}
          </select>

          <input
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="Buscar por usuário"
            className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
          />

          <button
            onClick={carregar}
            className="rounded-2xl bg-[#d4a828] px-5 py-3 text-sm font-bold text-black transition hover:brightness-110"
          >
            Filtrar
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-zinc-800 bg-[#050505] p-6">
        {loading ? (
          <div className="py-10 text-center text-zinc-400">
            Carregando auditoria...
          </div>
        ) : erro ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300">
            {erro}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-10 text-center text-zinc-400">
            Nenhum registro encontrado.
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => {
              const aberto = expandido === log.id

              return (
                <div
                  key={log.id}
                  className="rounded-[24px] border border-zinc-800 bg-black p-5"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <TagAcao acao={log.acao} />
                        <TagModulo modulo={log.modulo} />
                      </div>

                      <h2 className="text-xl font-bold">
                        {log.entidade}
                        {log.entidade_id ? ` • ${log.entidade_id}` : ""}
                      </h2>

                      <div className="space-y-1 text-sm text-zinc-400">
                        <p>
                          <span className="text-white">Usuário:</span>{" "}
                          {log.usuario_nome || "Não informado"} (
                          {log.usuario_role || "sem perfil"})
                        </p>
                        <p>
                          <span className="text-white">Data:</span>{" "}
                          {new Date(log.criado_em).toLocaleString("pt-BR")}
                        </p>
                        {log.observacao ? (
                          <p>
                            <span className="text-white">Observação:</span>{" "}
                            {log.observacao}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpandido(log.id)}
                      className="rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-semibold transition hover:border-[#d4a828]"
                    >
                      {aberto ? "Ocultar detalhes" : "Ver detalhes"}
                    </button>
                  </div>

                  {aberto ? (
                    <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
                      <div className="rounded-2xl border border-zinc-800 bg-[#070707] p-4">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
                          Dados antes
                        </h3>

                        <pre className="mt-3 overflow-auto text-xs text-zinc-300">
                          {JSON.stringify(log.dados_antes, null, 2) || "null"}
                        </pre>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-[#070707] p-4">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
                          Dados depois
                        </h3>

                        <pre className="mt-3 overflow-auto text-xs text-zinc-300">
                          {JSON.stringify(log.dados_depois, null, 2) || "null"}
                        </pre>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

function CardResumo({
  titulo,
  valor,
}: {
  titulo: string
  valor: string
}) {
  return (
    <div className="rounded-[24px] border border-zinc-800 bg-[#05070b] p-6">
      <p className="text-sm text-zinc-400">{titulo}</p>
      <h2 className="mt-3 text-5xl font-bold">{valor}</h2>
    </div>
  )
}

function TagAcao({ acao }: { acao: string }) {
  const mapa: Record<string, string> = {
    criou: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    editou: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    solicitou_exclusao: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
    aprovou_exclusao: "border-green-500/20 bg-green-500/10 text-green-400",
    recusou_exclusao: "border-red-500/20 bg-red-500/10 text-red-400",
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        mapa[acao] || "border-zinc-700 bg-zinc-800 text-zinc-300"
      }`}
    >
      {acao}
    </span>
  )
}

function TagModulo({ modulo }: { modulo: string }) {
  return (
    <span className="inline-flex rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-300">
      {modulo}
    </span>
  )
}