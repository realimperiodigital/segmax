"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

type Seguradora = {
  id: string;
  nome: string | null;
};

type Plano = {
  id: string;
  seguradora_id: string;
  nome_plano: string;
  produto: string;
  taxa_min: number | null;
  taxa_max: number | null;
  comissao: number | null;
  ativo: boolean;
  excluido: boolean;
  created_at: string;
};

export default function PlanosSeguradoraPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const seguradoraId = searchParams.get("seguradora_id") || "";

  const [seguradora, setSeguradora] = useState<Seguradora | null>(null);
  const [planos, setPlanos] = useState<Plano[]>([]);
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

    const { data: planosData, error } = await supabase
      .from("seguradora_planos")
      .select("*")
      .eq("seguradora_id", seguradoraId)
      .eq("excluido", false)
      .order("created_at", { ascending: false });

    if (error) {
      alert("Erro ao carregar planos.");
      return;
    }

    setSeguradora(seguradoraData || null);
    setPlanos(planosData || []);
    setLoading(false);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const planosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase();

    return planos.filter((p) => {
      return (
        p.nome_plano.toLowerCase().includes(termo) ||
        p.produto.toLowerCase().includes(termo)
      );
    });
  }, [planos, busca]);

  async function excluirPlano(id: string) {
    const confirmar = window.confirm("Deseja excluir este plano?");

    if (!confirmar) return;

    const { error } = await supabase
      .from("seguradora_planos")
      .update({
        excluido: true,
        ativo: false,
      })
      .eq("id", id);

    if (error) {
      alert("Erro ao excluir plano.");
      return;
    }

    await carregarDados();
  }

  return (
    <div style={pageStyle}>
      <div style={header}>
        <div>
          <h1 style={title}>Planos da Seguradora</h1>
          <p style={subtitle}>
            {seguradora?.nome || "Seguradora"} — planos que alimentam o cálculo
            automático.
          </p>
        </div>

        <button
          style={primaryButton}
          onClick={() =>
            router.push(`/seguradoras/planos/novo?seguradora_id=${seguradoraId}`)
          }
        >
          + Novo Plano
        </button>
      </div>

      <div style={filterBox}>
        <input
          placeholder="Buscar plano ou produto"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={input}
        />
      </div>

      <div style={tableBox}>
        {loading ? (
          <div style={empty}>Carregando planos...</div>
        ) : planosFiltrados.length === 0 ? (
          <div style={empty}>Nenhum plano encontrado.</div>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Plano</th>
                <th style={th}>Produto</th>
                <th style={th}>Taxa mínima</th>
                <th style={th}>Taxa máxima</th>
                <th style={th}>Comissão</th>
                <th style={th}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {planosFiltrados.map((plano) => (
                <tr key={plano.id}>
                  <td style={td}>{plano.nome_plano}</td>
                  <td style={td}>{plano.produto}</td>
                  <td style={td}>{plano.taxa_min || "-"}</td>
                  <td style={td}>{plano.taxa_max || "-"}</td>
                  <td style={td}>{plano.comissao || "-"}</td>

                  <td style={td}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        style={secondaryButton}
                        onClick={() =>
                          router.push(
                            `/seguradoras/planos/editar?id=${plano.id}`
                          )
                        }
                      >
                        Editar
                      </button>

                      <button
                        style={dangerButton}
                        onClick={() => excluirPlano(plano.id)}
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