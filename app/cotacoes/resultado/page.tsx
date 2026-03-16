"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

export default function ResultadoAnalise() {
  const params = useSearchParams();
  const id = params.get("id");

  const [dados, setDados] = useState<any>(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data } = await supabase
      .from("risk_analyses")
      .select("*")
      .eq("id", id)
      .single();

    setDados(data);
  }

  if (!dados) return <div>Carregando...</div>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Resultado da Análise</h1>

      <p>Score: {dados.score_percentual}%</p>

      <p>Classificação: {dados.classificacao}</p>

      <p>Parecer:</p>

      <div>{dados.parecer_automatico}</div>

      <br />

      <h3>Fatores críticos</h3>

      <pre>{JSON.stringify(dados.fatores_criticos, null, 2)}</pre>
    </div>
  );
}