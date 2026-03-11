"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Corretora = {
  id: string;
  nome_fantasia: string | null;
};

type Cliente = {
  id: string;
  corretora_id: string | null;
  nome: string | null;
  tipo_pessoa: "pf" | "pj" | string;
  cpf_cnpj: string | null;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  ativo: boolean;
  excluido: boolean;
  created_at: string | null;
};

export default function ClientesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const corretoraIdUrl = searchParams.get("corretora_id") || "";

  const [corretoras, setCorretoras] = useState<Corretora[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [corretoraId, setCorretoraId] = useState(corretoraIdUrl);
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [loading, setLoading] = useState(true);

  async function carregarBase() {
    setLoading(true);

    const [
      { data: corretorasData, error: corretorasError },
      { data: clientesData, error: clientesError },
    ] = await Promise.all([
      supabase
        .from("corretoras")
        .select("id, nome_fantasia")
        .eq("excluido", false)
        .order("nome_fantasia"),
      supabase
        .from("clientes")
        .select(
          "id, corretora_id, nome, tipo_pessoa, cpf_cnpj, email, telefone, cidade, estado, ativo, excluido, created_at"
        )
        .eq("excluido", false)
        .order("created_at", { ascending: false }),
    ]);

    if (corretorasError) {
      alert(`Erro ao carregar corretoras: ${corretorasError.message}`);
      setLoading(false);
      return;
    }

    if (clientesError) {
      alert(`Erro ao carregar clientes: ${clientesError.message}`);
      setLoading(false);
      return;
    }

    setCorretoras(corretorasData || []);
    setClientes(clientesData || []);
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

  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return clientes.filter((cliente) => {
      const matchCorretora = !corretoraId || cliente.corretora_id === corretoraId;

      const matchBusca =
        termo === "" ||
        (cliente.nome || "").toLowerCase().includes(termo) ||
        (cliente.cpf_cnpj || "").toLowerCase().includes(termo) ||
        (cliente.email || "").toLowerCase().includes(termo) ||
        (cliente.telefone || "").toLowerCase().includes(termo) ||
        (cliente.cidade || "").toLowerCase().includes(termo) ||
        (cliente.estado || "").toLowerCase().includes(termo);

      const matchTipo =
        tipoFiltro === "todos" || cliente.tipo_pessoa === tipoFiltro;

      const matchStatus =
        statusFiltro === "todos" ||
        (statusFiltro === "ativos" && cliente.ativo) ||
        (statusFiltro === "inativos" && !cliente.ativo);

      return matchCorretora && matchBusca && matchTipo && matchStatus;
    });
  }, [clientes, corretoraId, busca, tipoFiltro, statusFiltro]);

  const totalClientes = clientesFiltrados.length;
  const totalAtivos = clientesFiltrados.filter((c) => c.ativo).length;
  const totalInativos = clientesFiltrados.filter((c) => !c.ativo).length;
  const totalPJ = clientesFiltrados.filter((c) => c.tipo_pessoa === "pj").length;

  function formatarData(data: string | null) {
    if (!data) return "-";

    try {
      return new Date(data).toLocaleDateString("pt-BR");
    } catch {
      return "-";
    }
  }

  function formatarDocumento(valor: string | null, tipo: string) {
    if (!valor) return "-";

    const numeros = valor.replace(/\D/g, "");

    if (tipo === "pf") {
      if (numeros.length !== 11) return valor;
      return numeros.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
    }

    if (tipo === "pj") {
      if (numeros.length !== 14) return valor;
      return numeros.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        "$1.$2.$3/$4-$5"
      );
    }

    return valor;
  }

  function labelTipo(tipo: string) {
    if (tipo === "pf") return "Pessoa Física";
    if (tipo === "pj") return "Pessoa Jurídica";
    return tipo || "-";
  }

  async function alterarStatus(id: string, ativo: boolean) {
    const confirmar = window.confirm(
      `Deseja realmente ${ativo ? "ativar" : "inativar"} este cliente?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("clientes")
      .update({ ativo })
      .eq("id", id);

    if (error) {
      alert(`Erro ao atualizar cliente: ${error.message}`);
      return;
    }

    await carregarBase();
  }

  async function excluirCliente(id: string) {
    const confirmar = window.confirm(
      "Deseja realmente excluir este cliente? Essa ação será apenas exclusão lógica."
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("clientes")
      .update({
        excluido: true,
        ativo: false,
      })
      .eq("id", id);

    if (error) {
      alert(`Erro ao excluir cliente: ${error.message}`);
      return;
    }

    await carregarBase();
  }

  return (
    <div style={pageStyle}>
      <div style={headerRow}>
        <div>
          <h1 style={titleStyle}>Clientes</h1>
          <p style={subtitleStyle}>
            {nomeCorretoraSelecionada
              ? `Gerencie os clientes da corretora ${nomeCorretoraSelecionada}.`
              : "Gerencie os clientes vinculados às corretoras do SEGMAX CRM."}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() =>
              corretoraId
                ? router.push(`/clientes/novo?corretora_id=${corretoraId}`)
                : router.push("/clientes/novo")
            }
            style={primaryButton}
          >
            + Novo Cliente
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
        <ResumoCard titulo="Total" valor={String(totalClientes)} />
        <ResumoCard titulo="Ativos" valor={String(totalAtivos)} />
        <ResumoCard titulo="Inativos" valor={String(totalInativos)} />
        <ResumoCard titulo="Pessoa Jurídica" valor={String(totalPJ)} />
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
            placeholder="Buscar por nome, documento, email, telefone, cidade ou estado"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={inputStyle}
          />

          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            style={inputStyle}
          >
            <option value="todos">Todos os tipos</option>
            <option value="pf">Pessoa Física</option>
            <option value="pj">Pessoa Jurídica</option>
          </select>

          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            style={inputStyle}
          >
            <option value="todos">Todos os status</option>
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
          </select>
        </div>
      </div>

      <div style={tableCard}>
        {loading ? (
          <div style={emptyBox}>Carregando clientes...</div>
        ) : clientesFiltrados.length === 0 ? (
          <div style={emptyBox}>Nenhum cliente encontrado.</div>
        ) : (
          <div style={tableWrapper}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Cliente</th>
                  <th style={thStyle}>Corretora</th>
                  <th style={thStyle}>Tipo</th>
                  <th style={thStyle}>Documento</th>
                  <th style={thStyle}>Contato</th>
                  <th style={thStyle}>Localidade</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Cadastro</th>
                  <th style={thStyle}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((cliente) => {
                  const corretora = corretoras.find((c) => c.id === cliente.corretora_id);

                  return (
                    <tr key={cliente.id}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700, color: "#111827" }}>
                          {cliente.nome || "-"}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <div style={subInfoStrong}>
                          {corretora?.nome_fantasia || "-"}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <span style={{ ...badgeStyle, ...tipoBadge(cliente.tipo_pessoa) }}>
                          {labelTipo(cliente.tipo_pessoa)}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        {formatarDocumento(cliente.cpf_cnpj, cliente.tipo_pessoa)}
                      </td>

                      <td style={tdStyle}>
                        <div style={subInfoStrong}>{cliente.email || "-"}</div>
                        <div style={subInfoStyle}>{cliente.telefone || "-"}</div>
                      </td>

                      <td style={tdStyle}>
                        <div style={subInfoStrong}>{cliente.cidade || "-"}</div>
                        <div style={subInfoStyle}>{cliente.estado || "-"}</div>
                      </td>

                      <td style={tdStyle}>
                        <span style={{ ...badgeStyle, ...statusBadge(cliente.ativo) }}>
                          {cliente.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>

                      <td style={tdStyle}>{formatarData(cliente.created_at)}</td>

                      <td style={tdStyle}>
                        <div style={actionsWrap}>
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/cotacoes/nova?corretora_id=${cliente.corretora_id || ""}`)
                            }
                            style={secondaryButton}
                          >
                            Nova Cotação
                          </button>

                          <button
                            type="button"
                            onClick={() => alterarStatus(cliente.id, !cliente.ativo)}
                            style={cliente.ativo ? warningButton : successButton}
                          >
                            {cliente.ativo ? "Inativar" : "Ativar"}
                          </button>

                          <button
                            type="button"
                            onClick={() => excluirCliente(cliente.id)}
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

function statusBadge(ativo: boolean): React.CSSProperties {
  if (ativo) {
    return {
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #86efac",
    };
  }

  return {
    background: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
  };
}

function tipoBadge(tipo: string): React.CSSProperties {
  if (tipo === "pf") {
    return {
      background: "#dbeafe",
      color: "#1d4ed8",
      border: "1px solid #93c5fd",
    };
  }

  if (tipo === "pj") {
    return {
      background: "#ede9fe",
      color: "#6d28d9",
      border: "1px solid #c4b5fd",
    };
  }

  return {
    background: "#e5e7eb",
    color: "#111827",
    border: "1px solid #d1d5db",
  };
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
  gridTemplateColumns: "1.2fr 1.6fr 1fr 1fr",
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

const warningButton: React.CSSProperties = {
  padding: "10px 12px",
  background: "#fef3c7",
  color: "#92400e",
  border: "1px solid #fcd34d",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const successButton: React.CSSProperties = {
  padding: "10px 12px",
  background: "#dcfce7",
  color: "#166534",
  border: "1px solid #86efac",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
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