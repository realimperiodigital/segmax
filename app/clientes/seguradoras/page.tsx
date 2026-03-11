"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Seguradora = {
  id: string;
  nome: string | null;
  codigo: string | null;
  email: string | null;
  telefone: string | null;
  site: string | null;
  status: "ativa" | "inativa" | "suspensa" | string;
  ativo: boolean;
  excluido: boolean;
  created_at: string | null;
};

export default function SeguradorasPage() {
  const router = useRouter();

  const [seguradoras, setSeguradoras] = useState<Seguradora[]>([]);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todas");
  const [loading, setLoading] = useState(true);

  async function carregarSeguradoras() {
    setLoading(true);

    const { data, error } = await supabase
      .from("seguradoras")
      .select("id, nome, codigo, email, telefone, site, status, ativo, excluido, created_at")
      .eq("excluido", false)
      .order("created_at", { ascending: false });

    if (error) {
      alert(`Erro ao carregar seguradoras: ${error.message}`);
      setSeguradoras([]);
      setLoading(false);
      return;
    }

    setSeguradoras(data || []);
    setLoading(false);
  }

  useEffect(() => {
    carregarSeguradoras();
  }, []);

  const seguradorasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return seguradoras.filter((seguradora) => {
      const matchBusca =
        termo === "" ||
        (seguradora.nome || "").toLowerCase().includes(termo) ||
        (seguradora.codigo || "").toLowerCase().includes(termo) ||
        (seguradora.email || "").toLowerCase().includes(termo) ||
        (seguradora.telefone || "").toLowerCase().includes(termo) ||
        (seguradora.site || "").toLowerCase().includes(termo);

      const matchStatus =
        statusFiltro === "todas" || seguradora.status === statusFiltro;

      return matchBusca && matchStatus;
    });
  }, [seguradoras, busca, statusFiltro]);

  const totalSeguradoras = seguradoras.length;
  const totalAtivas = seguradoras.filter((s) => s.status === "ativa").length;
  const totalInativas = seguradoras.filter((s) => s.status === "inativa").length;
  const totalSuspensas = seguradoras.filter((s) => s.status === "suspensa").length;

  function formatarData(data: string | null) {
    if (!data) return "-";

    try {
      return new Date(data).toLocaleDateString("pt-BR");
    } catch {
      return "-";
    }
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

    return {
      background: "#e5e7eb",
      color: "#111827",
      border: "1px solid #d1d5db",
    };
  }

  async function alterarStatus(
    id: string,
    novoStatus: "ativa" | "inativa" | "suspensa"
  ) {
    const confirmar = window.confirm(
      `Deseja realmente alterar o status da seguradora para "${novoStatus}"?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("seguradoras")
      .update({
        status: novoStatus,
        ativo: novoStatus === "ativa",
      })
      .eq("id", id);

    if (error) {
      alert(`Erro ao atualizar status: ${error.message}`);
      return;
    }

    await carregarSeguradoras();
  }

  async function excluirSeguradora(id: string) {
    const confirmar = window.confirm(
      "Deseja realmente excluir esta seguradora? Essa ação será apenas exclusão lógica."
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("seguradoras")
      .update({
        excluido: true,
        ativo: false,
        status: "inativa",
      })
      .eq("id", id);

    if (error) {
      alert(`Erro ao excluir seguradora: ${error.message}`);
      return;
    }

    await carregarSeguradoras();
  }

  return (
    <div style={pageStyle}>
      <div style={headerRow}>
        <div>
          <h1 style={titleStyle}>Seguradoras</h1>
          <p style={subtitleStyle}>
            Gerencie as seguradoras que vão alimentar o motor de cálculo do SEGMAX.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/seguradoras/nova")}
          style={primaryButton}
        >
          + Nova Seguradora
        </button>
      </div>

      <div style={cardsGrid}>
        <ResumoCard titulo="Total" valor={String(totalSeguradoras)} />
        <ResumoCard titulo="Ativas" valor={String(totalAtivas)} />
        <ResumoCard titulo="Inativas" valor={String(totalInativas)} />
        <ResumoCard titulo="Suspensas" valor={String(totalSuspensas)} />
      </div>

      <div style={filterCard}>
        <div style={filterGrid}>
          <input
            type="text"
            placeholder="Buscar por nome, código, email, telefone ou site"
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
          </select>
        </div>
      </div>

      <div style={tableCard}>
        {loading ? (
          <div style={emptyBox}>Carregando seguradoras...</div>
        ) : seguradorasFiltradas.length === 0 ? (
          <div style={emptyBox}>Nenhuma seguradora encontrada.</div>
        ) : (
          <div style={tableWrapper}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Seguradora</th>
                  <th style={thStyle}>Contato</th>
                  <th style={thStyle}>Site</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Cadastro</th>
                  <th style={thStyle}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {seguradorasFiltradas.map((seguradora) => (
                  <tr key={seguradora.id}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700, color: "#111827" }}>
                        {seguradora.nome || "-"}
                      </div>
                      <div style={subInfoStyle}>
                        Código: {seguradora.codigo || "-"}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <div style={subInfoStrong}>{seguradora.email || "-"}</div>
                      <div style={subInfoStyle}>{seguradora.telefone || "-"}</div>
                    </td>

                    <td style={tdStyle}>
                      <div style={subInfoStrong}>{seguradora.site || "-"}</div>
                    </td>

                    <td style={tdStyle}>
                      <span style={{ ...statusBadge, ...corStatus(seguradora.status) }}>
                        {seguradora.status}
                      </span>
                    </td>

                    <td style={tdStyle}>{formatarData(seguradora.created_at)}</td>

                    <td style={tdStyle}>
                      <div style={actionsWrap}>
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/seguradoras/planos?seguradora_id=${seguradora.id}`)
                          }
                          style={secondaryButton}
                        >
                          Planos
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/seguradoras/regras?seguradora_id=${seguradora.id}`)
                          }
                          style={secondaryButton}
                        >
                          Regras
                        </button>

                        <select
                          value={seguradora.status}
                          onChange={(e) =>
                            alterarStatus(
                              seguradora.id,
                              e.target.value as "ativa" | "inativa" | "suspensa"
                            )
                          }
                          style={statusSelect}
                        >
                          <option value="ativa">Ativa</option>
                          <option value="inativa">Inativa</option>
                          <option value="suspensa">Suspensa</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => excluirSeguradora(seguradora.id)}
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