"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type RiskAnalysis = {
  id: string;
  titulo: string | null;
  score_total: number | null;
  score_percentual: number | null;
  classificacao: string | null;
  parecer_automatico: string | null;
  recomendacoes: any;
  fatores_criticos: any;
  status: string | null;
};

export default function ResultadoAnalisePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [dados, setDados] = useState<RiskAnalysis | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (id) {
      carregar();
    } else {
      setCarregando(false);
    }
  }, [id]);

  async function carregar() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("risk_analyses")
      .select("*")
      .eq("id", id)
      .single();

    setCarregando(false);

    if (error) {
      alert("Erro ao carregar resultado: " + error.message);
      return;
    }

    setDados(data);
  }

  if (carregando) {
    return <div style={{ padding: 32 }}>Carregando resultado...</div>;
  }

  if (!id) {
    return <div style={{ padding: 32 }}>ID da análise não informado.</div>;
  }

  if (!dados) {
    return <div style={{ padding: 32 }}>Resultado não encontrado.</div>;
  }

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <h1>Resultado da Análise</h1>

      <div style={{ marginTop: 24 }}>
        <p>
          <strong>Título:</strong> {dados.titulo || "-"}
        </p>
        <p>
          <strong>Status:</strong> {dados.status || "-"}
        </p>
        <p>
          <strong>Score total:</strong> {dados.score_total ?? 0}
        </p>
        <p>
          <strong>Score percentual:</strong> {dados.score_percentual ?? 0}%
        </p>
        <p>
          <strong>Classificação:</strong> {dados.classificacao || "-"}
        </p>

        <div style={{ marginTop: 24 }}>
          <h3>Parecer técnico automático</h3>
          <div
            style={{
              border: "1px solid #333",
              borderRadius: 12,
              padding: 16,
              whiteSpace: "pre-wrap",
            }}
          >
            {dados.parecer_automatico || "Sem parecer disponível."}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <h3>Recomendações</h3>
          <pre
            style={{
              border: "1px solid #333",
              borderRadius: 12,
              padding: 16,
              overflowX: "auto",
            }}
          >
            {JSON.stringify(dados.recomendacoes ?? [], null, 2)}
          </pre>
        </div>

        <div style={{ marginTop: 24 }}>
          <h3>Fatores críticos</h3>
          <pre
            style={{
              border: "1px solid #333",
              borderRadius: 12,
              padding: 16,
              overflowX: "auto",
            }}
          >
            {JSON.stringify(dados.fatores_criticos ?? [], null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}