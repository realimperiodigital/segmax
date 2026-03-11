"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Corretora = {
  id: string;
  nome_fantasia: string | null;
};

type Usuario = {
  id: string;
  nome: string | null;
  corretora_id: string | null;
};

type Cliente = {
  id: string;
  nome: string | null;
  corretora_id: string | null;
};

type Cotacao = {
  id: string;
  corretora_id: string | null;
  usuario_id: string | null;
  cliente_id: string | null;
  produto: string | null;
  numero_proposta: string | null;
  renovacao: boolean;
  inicio_vigencia: string | null;
  fim_vigencia: string | null;
  moeda: string | null;
  status: "em_analise" | "cotando" | "proposta_emitida" | "fechada" | "recusada" | string;
  created_at: string | null;
  excluido: boolean;
};

export default function CotacoesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const corretoraIdUrl = searchParams.get("corretora_id") || "";

  const [corretoras, setCorretoras] = useState<Corretora[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);

  const [corretoraId, setCorretoraId] = useState(corretoraIdUrl);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [loading, setLoading] = useState(true);

  async function carregarBase() {
    setLoading(true);

    const [
      { data: corretorasData, error: corretorasError },
      { data: usuariosData, error: usuariosError },
      { data: clientesData, error: clientesError },
      { data: cotacoesData, error: cotacoesError },
    ] = await Promise.all([
      supabase
        .from("corretoras")
        .select("id, nome_fantasia")
        .eq("excluido", false)
        .order("nome_fantasia"),
      supabase
        .from("usuarios")
        .select("id, nome, corretora_id")
        .eq("excluido", false)
        .order("nome"),
      supabase
        .from("clientes")
        .select("id, nome, corretora_id")
        .eq("excluido", false)
        .order("nome"),
      supabase
        .from("cotacoes")
        .select(
          "id, corretora_id, usuario_id, cliente_id, produto, numero_proposta, renovacao, inicio_vigencia, fim_vigencia, moeda, status, created_at, excluido"
        )
        .eq("excluido", false)
        .order("created_at", { ascending: false }),
    ]);

    if (corretorasError) {
      alert(`Erro ao carregar corretoras: ${corretorasError.message}`);
      setLoading(false);
      return;
    }

    if (usuariosError) {
      alert(`Erro ao carregar usuários: ${usuariosError.message}`);
      setLoading(false);
      return;
    }

    if (clientesError) {
      alert(`Erro ao carregar clientes: ${clientesError.message}`);
      setLoading(false);
      return;
    }

    if (cotacoesError) {
      alert(`Erro ao carregar cotações: ${cotacoesError.message}`);
      setLoading(false);
      return;
    }

    setCorretoras(corretorasData || []);
    setUsuarios(usuariosData || []);
    setClientes(clientesData || []);
    setCotacoes(cotacoesData || []);
    setLoading(false);
  }

  useEffect(() => {
    carregarBase();
  }, []);

  useEffect(() => {
    setCorretoraId(corretoraIdUrl);
  }, [corretoraIdUrl]);

  const nomeCorretoraSelecionada = useMemo(() => {
    if (!corretoraId) return "";
    const corretora = corretoras.find((item) => item.id === corretoraId);
    return corretora?.nome_fantasia || "";
  }, [corretoras, corretoraId]);

  const cotacoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return cotacoes.filter((cotacao) => {
      const corretora = corretoras.find((c) => c.id === cotacao.corretora_id);
      const usuario = usuarios.find((u) => u.id === cotacao.usuario_id);
      const cliente = clientes.find((c) => c.id === cotacao.cliente_id);

      const matchCorretora = !corretoraId || cotacao.corretora_id === corretoraId;

      const matchBusca =
        termo === "" ||
        (cotacao.produto || "").toLowerCase().includes(termo) ||
        (cotacao.numero_proposta || "").toLowerCase().includes(termo) ||
        (cliente?.nome || "").toLowerCase().includes(termo) ||
        (usuario?.nome || "").toLowerCase().includes(termo) ||
        (corretora?.nome_fantasia || "").toLowerCase().includes(termo);

      const matchStatus =
        statusFiltro === "todos" || cotacao.status === statusFiltro;

      return matchCorretora && matchBusca && matchStatus;
    });
  }, [cotacoes, corretoras, usuarios, clientes, corretoraId, busca, statusFiltro]);

  const totalCotacoes = cotacoesFiltradas.length;
  const totalAnalise = cotacoesFiltradas.filter((c) => c.status === "em_analise").length;
  const totalCotando = cotacoesFiltradas.filter((c) => c.status === "cotando").length;
  const totalFechadas = cotacoesFiltradas.filter((c) => c.status === "fechada").length;

  function formatarData(data: string | null) {
    if (!data) return "-";

    try {
      return new Date(data).toLocaleDateString("pt-BR");
    } catch {
      return "-";
    }
  }

  function labelStatus(status: string) {
    if (status === "em_analise") return "Em análise";
    if (status === "cotando") return "Cotando";
    if (status === "proposta_emitida") return "Proposta emitida";
    if (status === "fechada") return "Fechada";
    if (status === "recusada") return "Recusada";
    return status || "-";
  }

  function statusBadge(status: string): React.CSSProperties {
    if (status === "em_analise") {
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
        border: "1px solid #93c5fd",
      };
    }

    if (status === "cotando") {
      return {
        background: "#fef3c7",
        color: "#92400e",
        border: "1px solid #fcd34d",
      };
    }

    if (status === "proposta_emitida") {
      return {
        background: "#ede9fe",
        color: "#6d28d9",
        border: "1px solid #c4b5fd",
      };
    }

    if (status === "fechada") {
      return {
        background: "#dcfce7",
        color: "#166534",
        border: "1px solid #86efac",
      };
    }

    if (status === "recusada") {
      return {
        background: "#fee2e2",
        color: "#991b1b",
        border: "1px solid #fecaca",
      };
    }

    return {
      background: "#e5e7eb",
      color: "#111827",
      border: "1px solid #d1d5db",
    };
  }

  async function alterarStatus(
    id: string,
    novoStatus: "em_analise" | "cotando" | "proposta_emitida" | "fechada" | "recusada"
  ) {
    const confirmar = window.confirm(
      `Deseja realmente alterar o status da cotação para "${labelStatus(novoStatus)}"?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("cotacoes")
      .update({ status: novoStatus })
      .eq("id", id);

    if (error) {
      alert(`Erro ao atualizar status da cotação: ${error.message}`);
      return;
    }

    await carregarBase();
  }

  async function excluirCotacao(id: string) {
    const confirmar = window.confirm(
      "Deseja realmente excluir esta cotação? Essa ação será apenas exclusão lógica."
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("cotacoes")
      .update({ excluido: true })
      .eq("id", id);

    if (error) {
      alert(`Erro ao excluir cotação: ${error.message}`);
      return;
    }

    await carregarBase();
  }

  return (
    <div style={pageStyle}>
      <div style={headerRow}>
        <div>
          <h1 style={titleStyle}>Cotações</h1>
          <p style={subtitleStyle}>
            {nomeCorretoraSelecionada
              ? `Gerencie as cotações da corretora ${nomeCorretoraSelecionada}.`
              : "Gerencie as cotações vinculadas às corretoras do SEGMAX CRM."}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() =>
              corretoraId
                ? router.push(`/cotacoes/nova?corretora_id=${corretoraId}`)
                : router.push("/cotacoes/nova")
            }
            style={primaryButton}
          >
            + Nova Cotação
          </button>

          <button
            type="button"
            onClick={() => router.push("/corretoras")}
            style={secondaryButton}
          >
            Voltar para Corretoras
          </button>
        </div>
      </div>

      <div style={cardsGrid}>
        <ResumoCard titulo="Total" valor={String(totalCotacoes)} />
        <ResumoCard titulo="Em análise" valor={String(totalAnalise)} />
        <ResumoCard titulo="Cotando" valor={String(totalCotando)} />
        <ResumoCard titulo="Fechadas" valor={String(totalFechadas)} />
      </div>

      <div style={filterCard}>
        <div style={filterGrid}>
          <select
            value={corretoraId}
            onChange={(e) => setCorretoraId(e.target.value)}
            style={inputStyle}
          >
            <option value="">Todas as corretoras</option>
            {corretoras.map((corretora) => (
              <option key={corretora.id} value={corretora.id}>
                {corretora.nome_fantasia || "Corretora sem nome"}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Buscar por produto, proposta, cliente, usuário ou corretora"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={inputStyle}
          />

          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            style={inputStyle}
          >
            <option value="todos">Todos os status</option>
            <option value="em_analise">Em análise</option>
            <option value="cotando">Cotando</option>
            <option value="proposta_emitida">Proposta emitida</option>
            <option value="fechada">Fechada</option>
            <option value="recusada">Recusada</option>
          </select>
        </div>
      </div>

      <div style={tableCard}>
        {loading ? (
          <div style={emptyBox}>Carregando cotações...</div>
        ) : cotacoesFiltradas.length === 0 ? (
          <div style={emptyBox}>Nenhuma cotação encontrada.</div>
        ) : (
          <div style={tableWrapper}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Cotação</th>
                  <th style={thStyle}>Corretora</th>
                  <th style={thStyle}>Cliente</th>
                  <th style={thStyle}>Usuário</th>
                  <th style={thStyle}>Vigência</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Cadastro</th>
                  <th style={thStyle}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {cotacoesFiltradas.map((cotacao) => {
                  const corretora = corretoras.find((c) => c.id === cotacao.corretora_id);
                  const usuario = usuarios.find((u) => u.id === cotacao.usuario_id);
                  const cliente = clientes.find((c) => c.id === cotacao.cliente_id);

                  return (
                    <tr key={cotacao.id}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700, color: "#111827" }}>
                          {cotacao.produto || "-"}
                        </div>
                        <div style={subInfoStyle}>
                          Proposta: {cotacao.numero_proposta || "-"}
                        </div>
                        <div style={subInfoStyle}>
                          Renovação: {cotacao.renovacao ? "Sim" : "Não"}
                        </div>
                        <div style={subInfoStyle}>
                          Moeda: {cotacao.moeda || "BRL"}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <div style={subInfoStrong}>
                          {corretora?.nome_fantasia || "-"}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <div style={subInfoStrong}>
                          {cliente?.nome || "-"}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <div style={subInfoStrong}>
                          {usuario?.nome || "-"}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <div style={subInfoStrong}>
                          Início: {formatarData(cotacao.inicio_vigencia)}
                        </div>
                        <div style={subInfoStyle}>
                          Fim: {formatarData(cotacao.fim_vigencia)}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <span style={{ ...badgeStyle, ...statusBadge(cotacao.status) }}>
                          {labelStatus(cotacao.status)}
                        </span>
                      </td>

                      <td style={tdStyle}>{formatarData(cotacao.created_at)}</td>

                      <td style={tdStyle}>
                        <div style={actionsWrap}>
                          <select
                            value={cotacao.status}
                            onChange={(e) =>
                              alterarStatus(
                                cotacao.id,
                                e.target.value as
                                  | "em_analise"
                                  | "cotando"
                                  | "proposta_emitida"
                                  | "fechada"
                                  | "recusada"
                              )
                            }
                            style={statusSelect}
                          >
                            <option value="em_analise">Em análise</option>
                            <option value="cotando">Cotando</option>
                            <option value="proposta_emitida">Proposta emitida</option>
                            <option value="fechada">Fechada</option>
                            <option value="recusada">Recusada</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => excluirCotacao(cotacao.id)}
                            style={dangerButton}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ResumoCard({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div style={summaryCard}>
      <div style={summaryTitle}>{titulo}</div>
      <div style={summaryValue}>{valor}</div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
};

const headerRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 32,
  color: "#111827",
};

const subtitleStyle: React.CSSProperties = {
  margin: "6px 0 0 0",
  color: "#6b7280",
  fontSize: 15,
};

const cardsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const summaryCard: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  border: "1px solid #eef2f7",
};

const summaryTitle: React.CSSProperties = {
  fontSize: 14,
  color: "#6b7280",
  marginBottom: 8,
};

const summaryValue: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 800,
  color: "#111827",
};

const filterCard: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  border: "1px solid #eef2f7",
};

const filterGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.1fr 1.8fr 1fr",
  gap: 12,
};

const tableCard: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  border: "1px solid #eef2f7",
};

const tableWrapper: React.CSSProperties = {
  width: "100%",
  overflowX: "auto",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 1250,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 12px",
  borderBottom: "1px solid #e5e7eb",
  color: "#374151",
  fontSize: 13,
  fontWeight: 700,
  background: "#f9fafb",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 12px",
  borderBottom: "1px solid #f3f4f6",
  verticalAlign: "top",
  color: "#111827",
  fontSize: 14,
};

const inputStyle: React.CSSProperties = {
  padding: 12,
  border: "1px solid #d1d5db",
  borderRadius: 10,
  fontSize: 15,
  background: "#fff",
  width: "100%",
};

const primaryButton: React.CSSProperties = {
  padding: "12px 16px",
  background: "#07163a",
  color: "#ffffff",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
};

const secondaryButton: React.CSSProperties = {
  padding: "10px 12px",
  background: "#e5e7eb",
  color: "#111827",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};

const dangerButton: React.CSSProperties = {
  padding: "10px 12px",
  background: "#fee2e2",
  color: "#991b1b",
  border: "1px solid #fecaca",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const emptyBox: React.CSSProperties = {
  padding: 28,
  textAlign: "center",
  color: "#6b7280",
  fontSize: 15,
};

const subInfoStyle: React.CSSProperties = {
  marginTop: 4,
  color: "#6b7280",
  fontSize: 13,
};

const subInfoStrong: React.CSSProperties = {
  color: "#111827",
  fontSize: 14,
  fontWeight: 600,
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  textTransform: "capitalize",
};

const actionsWrap: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const statusSelect: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  background: "#fff",
  cursor: "pointer",
  minWidth: 160,
};