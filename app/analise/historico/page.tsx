"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Analise = {
  id: string;
  titulo: string | null;
  score_percentual: number | null;
  classificacao: string | null;
  status: string | null;
  criado_em: string | null;
};

export default function HistoricoAnalisesPage() {
  const [analises, setAnalises] = useState<Analise[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("risk_analyses")
      .select("id, titulo, score_percentual, classificacao, status, criado_em")
      .order("criado_em", { ascending: false });

    setCarregando(false);

    if (error) {
      alert("Erro ao carregar histórico: " + error.message);
      return;
    }

    setAnalises(data || []);
  }

  return (
    <div style={{ padding: 32 }}>
      <h1>Histórico de Análises</h1>

      {carregando ? (
        <p style={{ marginTop: 20 }}>Carregando histórico...</p>
      ) : analises.length === 0 ? (
        <p style={{ marginTop: 20 }}>Nenhuma análise encontrada.</p>
      ) : (
        <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
          {analises.map((analise) => (
            <div
              key={analise.id}
              style={{
                border: "1px solid #333",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <p>
                <strong>Título:</strong> {analise.titulo || "-"}
              </p>
              <p>
                <strong>Score:</strong> {analise.score_percentual ?? 0}%
              </p>
              <p>
                <strong>Classificação:</strong> {analise.classificacao || "-"}
              </p>
              <p>
                <strong>Status:</strong> {analise.status || "-"}
              </p>
              <p>
                <strong>Criado em:</strong>{" "}
                {analise.criado_em
                  ? new Date(analise.criado_em).toLocaleString("pt-BR")
                  : "-"}
              </p>

              <div style={{ marginTop: 12 }}>
                <a href={`/analise/resultado?id=${analise.id}`}>Ver análise</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}