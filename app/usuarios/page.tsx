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
  corretora_id: string | null;
  nome: string | null;
  email: string | null;
  login: string | null;
  permissao: "admin_corretora" | "gestor" | "vendedor" | "tecnico" | "financeiro" | string;
  ativo: boolean;
  excluido: boolean;
  created_at: string | null;
};

export default function UsuariosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const corretoraIdUrl = searchParams.get("corretora_id") || "";

  const [corretoras, setCorretoras] = useState<Corretora[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [corretoraId, setCorretoraId] = useState(corretoraIdUrl);
  const [busca, setBusca] = useState("");
  const [permissaoFiltro, setPermissaoFiltro] = useState("todas");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [loading, setLoading] = useState(true);

  async function carregarBase() {
    setLoading(true);

    const [
      { data: corretorasData, error: corretorasError },
      { data: usuariosData, error: usuariosError },
    ] = await Promise.all([
      supabase
        .from("corretoras")
        .select("id, nome_fantasia")
        .eq("excluido", false)
        .order("nome_fantasia"),
      supabase
        .from("usuarios")
        .select("id, corretora_id, nome, email, login, permissao, ativo, excluido, created_at")
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

    setCorretoras(corretorasData || []);
    setUsuarios(usuariosData || []);
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

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return usuarios.filter((usuario) => {
      const matchCorretora = !corretoraId || usuario.corretora_id === corretoraId;

      const matchBusca =
        termo === "" ||
        (usuario.nome || "").toLowerCase().includes(termo) ||
        (usuario.email || "").toLowerCase().includes(termo) ||
        (usuario.login || "").toLowerCase().includes(termo);

      const matchPermissao =
        permissaoFiltro === "todas" || usuario.permissao === permissaoFiltro;

      const matchStatus =
        statusFiltro === "todos" ||
        (statusFiltro === "ativos" && usuario.ativo) ||
        (statusFiltro === "inativos" && !usuario.ativo);

      return matchCorretora && matchBusca && matchPermissao && matchStatus;
    });
  }, [usuarios, corretoraId, busca, permissaoFiltro, statusFiltro]);

  const totalUsuarios = usuariosFiltrados.length;
  const totalAtivos = usuariosFiltrados.filter((u) => u.ativo).length;
  const totalInativos = usuariosFiltrados.filter((u) => !u.ativo).length;
  const totalAdmins = usuariosFiltrados.filter((u) => u.permissao === "admin_corretora").length;

  function formatarData(data: string | null) {
    if (!data) return "-";

    try {
      return new Date(data).toLocaleDateString("pt-BR");
    } catch {
      return "-";
    }
  }

  function labelPermissao(permissao: string) {
    if (permissao === "admin_corretora") return "Admin Corretora";
    if (permissao === "gestor") return "Gestor";
    if (permissao === "vendedor") return "Vendedor";
    if (permissao === "tecnico") return "Técnico";
    if (permissao === "financeiro") return "Financeiro";
    return permissao || "-";
  }

  async function alterarStatus(id: string, ativo: boolean) {
    const confirmar = window.confirm(
      `Deseja realmente ${ativo ? "ativar" : "inativar"} este usuário?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("usuarios")
      .update({ ativo })
      .eq("id", id);

    if (error) {
      alert(`Erro ao atualizar usuário: ${error.message}`);
      return;
    }

    await carregarBase();
  }

  async function excluirUsuario(id: string) {
    const confirmar = window.confirm(
      "Deseja realmente excluir este usuário? Essa ação será apenas exclusão lógica."
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("usuarios")
      .update({
        excluido: true,
        ativo: false,
      })
      .eq("id", id);

    if (error) {
      alert(`Erro ao excluir usuário: ${error.message}`);
      return;
    }

    await carregarBase();
  }

  return (
    <div style={pageStyle}>
      <div style={headerRow}>
        <div>
          <h1 style={titleStyle}>Usuários</h1>
          <p style={subtitleStyle}>
            {nomeCorretoraSelecionada
              ? `Gerencie os usuários da corretora ${nomeCorretoraSelecionada}.`
              : "Gerencie os usuários vinculados às corretoras do SEGMAX CRM."}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() =>
              corretoraId
                ? router.push(`/usuarios/novo?corretora_id=${corretoraId}`)
                : router.push("/usuarios/novo")
            }
            style={primaryButton}
          >
            + Novo Usuário
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
        <ResumoCard titulo="Total" valor={String(totalUsuarios)} />
        <ResumoCard titulo="Ativos" valor={String(totalAtivos)} />
        <ResumoCard titulo="Inativos" valor={String(totalInativos)} />
        <ResumoCard titulo="Admins" valor={String(totalAdmins)} />
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
            placeholder="Buscar por nome, email ou login"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={inputStyle}
          />

          <select
            value={permissaoFiltro}
            onChange={(e) => setPermissaoFiltro(e.target.value)}
            style={inputStyle}
          >
            <option value="todas">Todas as permissões</option>
            <option value="admin_corretora">Admin Corretora</option>
            <option value="gestor">Gestor</option>
            <option value="vendedor">Vendedor</option>
            <option value="tecnico">Técnico</option>
            <option value="financeiro">Financeiro</option>
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
          <div style={emptyBox}>Carregando usuários...</div>
        ) : usuariosFiltrados.length === 0 ? (
          <div style={emptyBox}>Nenhum usuário encontrado.</div>
        ) : (
          <div style={tableWrapper}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Usuário</th>
                  <th style={thStyle}>Corretora</th>
                  <th style={thStyle}>Login</th>
                  <th style={thStyle}>Permissão</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Cadastro</th>
                  <th style={thStyle}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((usuario) => {
                  const corretora = corretoras.find((c) => c.id === usuario.corretora_id);

                  return (
                    <tr key={usuario.id}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700, color: "#111827" }}>
                          {usuario.nome || "-"}
                        </div>
                        <div style={subInfoStyle}>{usuario.email || "-"}</div>
                      </td>

                      <td style={tdStyle}>
                        <div style={subInfoStrong}>
                          {corretora?.nome_fantasia || "-"}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <div style={subInfoStrong}>{usuario.login || "-"}</div>
                      </td>

                      <td style={tdStyle}>
                        <span style={{ ...badgeStyle, ...permissaoBadge(usuario.permissao) }}>
                          {labelPermissao(usuario.permissao)}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <span style={{ ...badgeStyle, ...statusBadge(usuario.ativo) }}>
                          {usuario.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>

                      <td style={tdStyle}>{formatarData(usuario.created_at)}</td>

                      <td style={tdStyle}>
                        <div style={actionsWrap}>
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/clientes?corretora_id=${usuario.corretora_id || ""}`)
                            }
                            style={secondaryButton}
                          >
                            Clientes
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/cotacoes?corretora_id=${usuario.corretora_id || ""}`)
                            }
                            style={secondaryButton}
                          >
                            Cotações
                          </button>

                          <button
                            type="button"
                            onClick={() => alterarStatus(usuario.id, !usuario.ativo)}
                            style={usuario.ativo ? warningButton : successButton}
                          >
                            {usuario.ativo ? "Inativar" : "Ativar"}
                          </button>

                          <button
                            type="button"
                            onClick={() => excluirUsuario(usuario.id)}
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

function permissaoBadge(permissao: string): React.CSSProperties {
  if (permissao === "admin_corretora") {
    return {
      background: "#dbeafe",
      color: "#1d4ed8",
      border: "1px solid #93c5fd",
    };
  }

  if (permissao === "gestor") {
    return {
      background: "#ede9fe",
      color: "#6d28d9",
      border: "1px solid #c4b5fd",
    };
  }

  if (permissao === "vendedor") {
    return {
      background: "#ecfeff",
      color: "#0f766e",
      border: "1px solid #99f6e4",
    };
  }

  if (permissao === "tecnico") {
    return {
      background: "#fef3c7",
      color: "#92400e",
      border: "1px solid #fcd34d",
    };
  }

  if (permissao === "financeiro") {
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
  gridTemplateColumns: "1.2fr 1.4fr 1fr 1fr",
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
  minWidth: 1100,
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