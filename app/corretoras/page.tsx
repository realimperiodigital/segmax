"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Corretora = {
  id: string;
  nome_fantasia: string | null;
  razao_social: string | null;
  cnpj: string | null;
  email: string | null;
  login: string | null;
  telefone: string | null;
  responsavel_nome: string | null;
  status: "ativa" | "inativa" | "suspensa" | "cancelada" | string;
  ativo: boolean;
  excluido: boolean;
  created_at: string;
};

export default function CorretorasPage() {
  const router = useRouter();

  const [corretoras, setCorretoras] = useState<Corretora[]>([]);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todas");
  const [loading, setLoading] = useState(true);

  async function carregarCorretoras() {
    setLoading(true);

    const { data, error } = await supabase
      .from("corretoras")
      .select(
        "id, nome_fantasia, razao_social, cnpj, email, login, telefone, responsavel_nome, status, ativo, excluido, created_at"
      )
      .eq("excluido", false)
      .order("created_at", { ascending: false });

    if (error) {
      alert(`Erro ao carregar corretoras: ${error.message}`);
      setCorretoras([]);
      setLoading(false);
      return;
    }

    setCorretoras(data || []);
    setLoading(false);
  }

  useEffect(() => {
    carregarCorretoras();
  }, []);

  const corretorasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return corretoras.filter((corretora) => {
      const matchBusca =
        termo === "" ||
        (corretora.nome_fantasia || "").toLowerCase().includes(termo) ||
        (corretora.razao_social || "").toLowerCase().includes(termo) ||
        (corretora.email || "").toLowerCase().includes(termo) ||
        (corretora.login || "").toLowerCase().includes(termo) ||
        (corretora.cnpj || "").toLowerCase().includes(termo) ||
        (corretora.responsavel_nome || "").toLowerCase().includes(termo);

      const matchStatus =
        statusFiltro === "todas" || corretora.status === statusFiltro;

      return matchBusca && matchStatus;
    });
  }, [corretoras, busca, statusFiltro]);

  const totalCorretoras = corretoras.length;
  const totalAtivas = corretoras.filter((c) => c.status === "ativa").length;
  const totalSuspensas = corretoras.filter((c) => c.status === "suspensa").length;
  const totalCanceladas = corretoras.filter((c) => c.status === "cancelada").length;

  async function alterarStatus(
    id: string,
    novoStatus: "ativa" | "inativa" | "suspensa" | "cancelada"
  ) {
    const confirmar = window.confirm(
      `Deseja realmente alterar o status da corretora para "${novoStatus}"?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("corretoras")
      .update({
        status: novoStatus,
        ativo: novoStatus === "ativa",
      })
      .eq("id", id);

    if (error) {
      alert(`Erro ao atualizar status: ${error.message}`);
      return;
    }

    await carregarCorretoras();
  }

  async function excluirCorretora(id: string) {
    const confirmar = window.confirm(
      "Deseja realmente excluir esta corretora? Essa ação será apenas exclusão lógica."
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("corretoras")
      .update({
        excluido: true,
        ativo: false,
        status: "cancelada",
      })
      .eq("id", id);

    if (error) {
      alert(`Erro ao excluir corretora: ${error.message}`);
      return;
    }

    await carregarCorretoras();
  }

  function formatarData(data: string | null) {
    if (!data) return "-";

    try {
      return new Date(data).toLocaleDateString("pt-BR");
    } catch {
      return "-";
    }
  }

  function formatarCNPJ(cnpj: string | null) {
    if (!cnpj) return "-";

    const numeros = cnpj.replace(/\D/g, "");

    if (numeros.length !== 14) return cnpj;

    return numeros.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    );
  }

  function corStatus(status: string) {
    if (status === "ativa") {
      return {
        background: "#dcfce7",
        color: "#166534",
        border: "1px solid #86efac",
      };
    }

    if (status === "inativa") {
      return {
        background: "#f3f4f6",
        color: "#374151",
        border: "1px solid #d1d5db",
      };
    }

    if (status === "suspensa") {
      return {
        background: "#fef3c7",
        color: "#92400e",
        border: "1px solid #fcd34d",
      };
    }

    if (status === "cancelada") {
      return {
        background: "#fee2e2",
        color: "#991b1b",
        border: "1px solid #fca5a5",
      };
    }

    return {
      background: "#e5e7eb",
      color: "#111827",
      border: "1px solid #d1d5db",
    };
  }

  return (
    <div style={pageStyle}>
      <div style={headerRow}>
        <div>
          <h1 style={titleStyle}>Corretoras</h1>
          <p style={subtitleStyle}>
            Cadastre, acompanhe e organize as corretoras do SEGMAX CRM.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/corretoras/nova")}
          style={primaryButton}
        >
          + Nova Corretora
        </button>
      </div>

      <div style={cardsGrid}>
        <ResumoCard titulo="Total" valor={String(totalCorretoras)} />
        <ResumoCard titulo="Ativas" valor={String(totalAtivas)} />
        <ResumoCard titulo="Suspensas" valor={String(totalSuspensas)} />
        <ResumoCard titulo="Canceladas" valor={String(totalCanceladas)} />
      </div>

      <div style={filterCard}>
        <div style={filterGrid}>
          <input
            type="text"
            placeholder="Buscar por nome, razão social, email, login, CNPJ ou responsável"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={inputStyle}
          />

          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            style={inputStyle}
          >
            <option value="todas">Todas</option>
            <option value="ativa">Ativas</option>
            <option value="inativa">Inativas</option>
            <option value="suspensa">Suspensas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>
      </div>

      <div style={tableCard}>
        {loading ? (
          <div style={emptyBox}>Carregando corretoras...</div>
        ) : corretorasFiltradas.length === 0 ? (
          <div style={emptyBox}>Nenhuma corretora encontrada.</div>
        ) : (
          <div style={tableWrapper}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Corretora</th>
                  <th style={thStyle}>Contato</th>
                  <th style={thStyle}>Responsável</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Cadastro</th>
                  <th style={thStyle}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {corretorasFiltradas.map((corretora) => (
                  <tr key={corretora.id}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700, color: "#111827" }}>
                        {corretora.nome_fantasia || "-"}
                      </div>
                      <div style={subInfoStyle}>
                        Razão social: {corretora.razao_social || "-"}
                      </div>
                      <div style={subInfoStyle}>
                        CNPJ: {formatarCNPJ(corretora.cnpj)}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <div style={subInfoStrong}>{corretora.email || "-"}</div>
                      <div style={subInfoStyle}>Login: {corretora.login || "-"}</div>
                      <div style={subInfoStyle}>
                        Telefone: {corretora.telefone || "-"}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <div style={subInfoStrong}>
                        {corretora.responsavel_nome || "-"}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <span style={{ ...statusBadge, ...corStatus(corretora.status) }}>
                        {corretora.status}
                      </span>
                    </td>

                    <td style={tdStyle}>{formatarData(corretora.created_at)}</td>

                    <td style={tdStyle}>
                      <div style={actionsWrap}>
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/usuarios?corretora_id=${corretora.id}`)
                          }
                          style={secondaryButton}
                        >
                          Usuários
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/clientes?corretora_id=${corretora.id}`)
                          }
                          style={secondaryButton}
                        >
                          Clientes
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/cotacoes?corretora_id=${corretora.id}`)
                          }
                          style={secondaryButton}
                        >
                          Cotações
                        </button>

                        <select
                          value={corretora.status}
                          onChange={(e) =>
                            alterarStatus(
                              corretora.id,
                              e.target.value as
                                | "ativa"
                                | "inativa"
                                | "suspensa"
                                | "cancelada"
                            )
                          }
                          style={statusSelect}
                        >
                          <option value="ativa">Ativa</option>
                          <option value="inativa">Inativa</option>
                          <option value="suspensa">Suspensa</option>
                          <option value="cancelada">Cancelada</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => excluirCorretora(corretora.id)}
                          style={dangerButton}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
  gridTemplateColumns: "2fr 220px",
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

const statusBadge: React.CSSProperties = {
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
  minWidth: 130,
};