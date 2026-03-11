"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

type Seguradora = {
  id: string;
  nome: string | null;
};

type Regra = {
  id: string;
  seguradora_id: string;
  produto: string;
  tipo_regra: string;
  campo: string;
  operador: string;
  valor_texto: string | null;
  valor_numero: number | null;
  resultado: string;
  prioridade: number;
  ativo: boolean;
  excluido: boolean;
  created_at: string;
};

export default function RegrasSeguradoraPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const seguradoraId = searchParams.get("seguradora_id") || "";

  const [seguradora, setSeguradora] = useState<Seguradora | null>(null);
  const [regras, setRegras] = useState<Regra[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  async function carregarDados() {
    setLoading(true);

    if (!seguradoraId) {
      alert("Seguradora não informada.");
      return;
    }

    const { data: seguradoraData } = await supabase
      .from("seguradoras")
      .select("id, nome")
      .eq("id", seguradoraId)
      .maybeSingle();

    const { data: regrasData, error } = await supabase
      .from("seguradora_regras")
      .select("*")
      .eq("seguradora_id", seguradoraId)
      .eq("excluido", false)
      .order("prioridade");

    if (error) {
      alert("Erro ao carregar regras.");
      return;
    }

    setSeguradora(seguradoraData || null);
    setRegras(regrasData || []);
    setLoading(false);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const regrasFiltradas = useMemo(() => {
    const termo = busca.toLowerCase();

    return regras.filter((r) => {
      return (
        r.produto.toLowerCase().includes(termo) ||
        r.campo.toLowerCase().includes(termo) ||
        r.tipo_regra.toLowerCase().includes(termo)
      );
    });
  }, [regras, busca]);

  async function excluirRegra(id: string) {
    const confirmar = window.confirm("Deseja excluir esta regra?");

    if (!confirmar) return;

    const { error } = await supabase
      .from("seguradora_regras")
      .update({
        excluido: true,
        ativo: false,
      })
      .eq("id", id);

    if (error) {
      alert("Erro ao excluir regra.");
      return;
    }

    await carregarDados();
  }

  function mostrarValor(regra: Regra) {
    if (regra.valor_texto) return regra.valor_texto;
    if (regra.valor_numero !== null) return regra.valor_numero;
    return "-";
  }

  return (
    <div style={pageStyle}>
      <div style={header}>
        <div>
          <h1 style={title}>Regras da Seguradora</h1>
          <p style={subtitle}>
            {seguradora?.nome || "Seguradora"} — regras utilizadas no motor de
            decisão da cotação.
          </p>
        </div>

        <button
          style={primaryButton}
          onClick={() =>
            router.push(`/seguradoras/regras/nova?seguradora_id=${seguradoraId}`)
          }
        >
          + Nova Regra
        </button>
      </div>

      <div style={filterBox}>
        <input
          placeholder="Buscar por produto, campo ou tipo de regra"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={input}
        />
      </div>

      <div style={tableBox}>
        {loading ? (
          <div style={empty}>Carregando regras...</div>
        ) : regrasFiltradas.length === 0 ? (
          <div style={empty}>Nenhuma regra encontrada.</div>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Produto</th>
                <th style={th}>Tipo</th>
                <th style={th}>Campo</th>
                <th style={th}>Operador</th>
                <th style={th}>Valor</th>
                <th style={th}>Resultado</th>
                <th style={th}>Prioridade</th>
                <th style={th}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {regrasFiltradas.map((regra) => (
                <tr key={regra.id}>
                  <td style={td}>{regra.produto}</td>
                  <td style={td}>{regra.tipo_regra}</td>
                  <td style={td}>{regra.campo}</td>
                  <td style={td}>{regra.operador}</td>
                  <td style={td}>{mostrarValor(regra)}</td>
                  <td style={td}>{regra.resultado}</td>
                  <td style={td}>{regra.prioridade}</td>

                  <td style={td}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        style={secondaryButton}
                        onClick={() =>
                          router.push(
                            `/seguradoras/regras/editar?id=${regra.id}`
                          )
                        }
                      >
                        Editar
                      </button>

                      <button
                        style={dangerButton}
                        onClick={() => excluirRegra(regra.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const title: React.CSSProperties = {
  fontSize: 30,
  margin: 0,
};

const subtitle: React.CSSProperties = {
  color: "#6b7280",
  marginTop: 4,
};

const filterBox: React.CSSProperties = {
  background: "#fff",
  padding: 16,
  borderRadius: 10,
};

const tableBox: React.CSSProperties = {
  background: "#fff",
  padding: 16,
  borderRadius: 10,
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: 12,
  borderBottom: "1px solid #e5e7eb",
};

const td: React.CSSProperties = {
  padding: 12,
  borderBottom: "1px solid #f3f4f6",
};

const empty: React.CSSProperties = {
  padding: 20,
  textAlign: "center",
};

const input: React.CSSProperties = {
  padding: 10,
  width: "100%",
  borderRadius: 8,
  border: "1px solid #d1d5db",
};

const primaryButton: React.CSSProperties = {
  padding: "10px 14px",
  background: "#07163a",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const secondaryButton: React.CSSProperties = {
  padding: "8px 12px",
  background: "#e5e7eb",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const dangerButton: React.CSSProperties = {
  padding: "8px 12px",
  background: "#fee2e2",
  color: "#991b1b",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};