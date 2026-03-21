"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Proposta = Record<string, any>;

type HistoricoItem = {
  id?: string;
  acao?: string;
  observacao?: string | null;
  usuario_nome?: string | null;
  criado_em?: string;
};

function formatarData(valor?: string | null) {
  if (!valor) return "-";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return "-";

  return data.toLocaleString("pt-BR");
}

function formatarMoeda(valor: any) {
  const numero =
    typeof valor === "number"
      ? valor
      : typeof valor === "string"
        ? Number(valor)
        : NaN;

  if (Number.isNaN(numero)) return "-";

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function corStatus(status?: string | null) {
  const s = (status || "").toLowerCase();

  if (
    s.includes("aprov") ||
    s.includes("emitid") ||
    s.includes("fechad")
  ) {
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  }

  if (
    s.includes("recus") ||
    s.includes("reprov") ||
    s.includes("cancel")
  ) {
    return "bg-red-500/15 text-red-300 border-red-500/30";
  }

  if (
    s.includes("analis") ||
    s.includes("analise") ||
    s.includes("aguard")
  ) {
    return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  }

  return "bg-sky-500/15 text-sky-300 border-sky-500/30";
}

function textoStatus(status?: string | null) {
  if (!status) return "Sem status";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function primeiroValor(obj: Record<string, any>, chaves: string[]) {
  for (const chave of chaves) {
    const valor = obj?.[chave];
    if (valor !== undefined && valor !== null && valor !== "") {
      return valor;
    }
  }
  return null;
}

export default function PropostaDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || "");

  const [proposta, setProposta] = useState<Proposta | null>(null);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [observacao, setObservacao] = useState("");
  const [usuarioNome, setUsuarioNome] = useState("Master");

  async function carregar() {
    try {
      setLoading(true);
      setErro("");

      const response = await fetch(`/api/propostas/${id}`, {
        cache: "no-store"
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || "Erro ao carregar proposta");
      }

      setProposta(json.proposta || null);
      setHistorico(Array.isArray(json.historico) ? json.historico : []);
    } catch (error: any) {
      setErro(error.message || "Erro ao carregar proposta");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    carregar();
  }, [id]);

  async function executarAcao(acao: string) {
    try {
      setSalvando(true);
      setErro("");
      setSucesso("");

      const response = await fetch(`/api/propostas/${id}/acoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          acao,
          observacao,
          usuario_nome: usuarioNome
        })
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || "Erro ao executar ação");
      }

      setSucesso("Ação registrada com sucesso.");
      setObservacao("");
      await carregar();
      router.refresh();
    } catch (error: any) {
      setErro(error.message || "Erro ao executar ação");
    } finally {
      setSalvando(false);
    }
  }

  const dados = useMemo(() => {
    const p = proposta || {};

    return {
      numero: primeiroValor(p, ["numero", "numero_proposta", "codigo"]),
      cliente: primeiroValor(p, [
        "cliente_nome",
        "nome_cliente",
        "segurado_nome",
        "nome"
      ]),
      corretora: primeiroValor(p, ["corretora_nome", "corretora"]),
      seguradora: primeiroValor(p, ["seguradora_nome", "seguradora"]),
      produto: primeiroValor(p, ["produto_nome", "produto", "ramo"]),
      premio: primeiroValor(p, ["premio_total", "valor_total", "valor"]),
      status: primeiroValor(p, ["status"]),
      criadoEm: primeiroValor(p, ["criado_em", "created_at"]),
      atualizadoEm: primeiroValor(p, ["atualizado_em", "updated_at"])
    };
  }, [proposta]);

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">
                Central de Propostas
              </p>
              <h1 className="mt-1 text-2xl font-semibold md:text-3xl">
                Proposta Executiva
              </h1>
              <p className="mt-2 text-sm text-white/70">
                Visualização completa, ações rápidas e histórico operacional.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/propostas"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
              >
                Voltar
              </Link>

              <button
                onClick={carregar}
                className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
              >
                Atualizar
              </button>
            </div>
          </div>

          {dados.status && (
            <div>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${corStatus(String(dados.status))}`}
              >
                Status: {textoStatus(String(dados.status))}
              </span>
            </div>
          )}
        </div>

        {erro && (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {sucesso}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white/70">
            Carregando proposta...
          </div>
        ) : !proposta ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white/70">
            Proposta não encontrada.
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <h2 className="mb-4 text-lg font-semibold">
                  Dados principais
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wide text-white/50">
                      Número
                    </p>
                    <p className="mt-2 text-base font-medium text-white">
                      {dados.numero || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wide text-white/50">
                      Cliente
                    </p>
                    <p className="mt-2 text-base font-medium text-white">
                      {dados.cliente || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wide text-white/50">
                      Corretora
                    </p>
                    <p className="mt-2 text-base font-medium text-white">
                      {dados.corretora || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wide text-white/50">
                      Seguradora
                    </p>
                    <p className="mt-2 text-base font-medium text-white">
                      {dados.seguradora || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wide text-white/50">
                      Produto
                    </p>
                    <p className="mt-2 text-base font-medium text-white">
                      {dados.produto || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wide text-white/50">
                      Valor
                    </p>
                    <p className="mt-2 text-base font-medium text-white">
                      {formatarMoeda(dados.premio)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wide text-white/50">
                      Criado em
                    </p>
                    <p className="mt-2 text-base font-medium text-white">
                      {formatarData(String(dados.criadoEm || ""))}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wide text-white/50">
                      Atualizado em
                    </p>
                    <p className="mt-2 text-base font-medium text-white">
                      {formatarData(String(dados.atualizadoEm || ""))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <h2 className="mb-4 text-lg font-semibold">
                  Histórico operacional
                </h2>

                {historico.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/60">
                    Nenhum histórico registrado até agora.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historico.map((item, index) => (
                      <div
                        key={item.id || `${item.criado_em}-${index}`}
                        className="rounded-2xl border border-white/10 bg-black/20 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {textoStatus(item.acao || "Ação")}
                            </p>
                            <p className="mt-1 text-xs text-white/50">
                              {formatarData(item.criado_em)}
                            </p>
                          </div>

                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                            {item.usuario_nome || "Sistema"}
                          </span>
                        </div>

                        <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
                          {item.observacao?.trim()
                            ? item.observacao
                            : "Sem observação informada."}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <h2 className="mb-4 text-lg font-semibold">
                  Painel de decisão
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-white/70">
                      Responsável pela ação
                    </label>
                    <input
                      value={usuarioNome}
                      onChange={(e) => setUsuarioNome(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-cyan-400/40"
                      placeholder="Nome do usuário"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-white/70">
                      Observação da decisão
                    </label>
                    <textarea
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                      rows={5}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-cyan-400/40"
                      placeholder="Descreva a análise, pendência, aprovação, ajuste solicitado ou motivo da recusa..."
                    />
                  </div>

                  <div className="grid gap-3">
                    <button
                      disabled={salvando}
                      onClick={() => executarAcao("em_analise")}
                      className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {salvando ? "Processando..." : "Enviar para análise"}
                    </button>

                    <button
                      disabled={salvando}
                      onClick={() => executarAcao("aprovada")}
                      className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {salvando ? "Processando..." : "Aprovar proposta"}
                    </button>

                    <button
                      disabled={salvando}
                      onClick={() => executarAcao("recusada")}
                      className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {salvando ? "Processando..." : "Recusar proposta"}
                    </button>

                    <button
                      disabled={salvando}
                      onClick={() => executarAcao("pendente")}
                      className="rounded-2xl border border-sky-400/30 bg-sky-500/10 px-4 py-3 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {salvando ? "Processando..." : "Marcar como pendente"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <h2 className="mb-4 text-lg font-semibold">
                  Fechamento do fluxo
                </h2>

                <div className="space-y-3 text-sm text-white/75">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    A proposta agora tem leitura por ID, histórico completo e
                    decisão operacional centralizada.
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    Isso já deixa a operação pronta para teste real com corretora,
                    aprovação técnica e acompanhamento do andamento.
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}