"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

export default function ResultadoAnalise() {
  const params = useParams();
  const id = params.id as string;

  const [dados, setDados] = useState<any>(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data, error } = await supabase
      .from("risk_analyses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setDados(data);
  }

  if (!dados) return <div style={{ padding: 40 }}>Carregando...</div>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Resultado da Análise</h1>

      <p>
        <strong>Score:</strong> {dados.score_percentual}%
      </p>

      <p>
        <strong>Classificação:</strong> {dados.classificacao}
      </p>

      <p>
        <strong>Parecer:</strong>
      </p>

      <div style={{ marginBottom: 20 }}>
        {dados.parecer_automatico}
      </div>

      <h3>Fatores críticos</h3>

      <pre style={{ background: "#111", padding: 20 }}>
        {JSON.stringify(dados.fatores_criticos, null, 2)}
      </pre>
    </div>
  );
}