"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Cliente = {
  id: string;
  nome: string | null;
};

type FormState = {
  incendio: string;
  acesso: string;
  sinistro: string;
  continuidade: string;
};

export default function NovaAnalisePage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [analysisId, setAnalysisId] = useState("");
  const [carregandoClientes, setCarregandoClientes] = useState(true);
  const [criandoAnalise, setCriandoAnalise] = useState(false);
  const [salvandoRespostas, setSalvandoRespostas] = useState(false);
  const [calculandoRisco, setCalculandoRisco] = useState(false);

  const [form, setForm] = useState<FormState>({
    incendio: "sim",
    acesso: "sim",
    sinistro: "não",
    continuidade: "sim",
  });

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    setCarregandoClientes(true);

    const { data, error } = await supabase
      .from("clientes")
      .select("id, nome")
      .eq("excluido", false)
      .order("nome", { ascending: true });

    if (error) {
      alert("Erro ao carregar clientes: " + error.message);
      setCarregandoClientes(false);
      return;
    }

    setClientes(data || []);
    setCarregandoClientes(false);
  }

  async function criarAnalise() {
    if (!clienteSelecionado) {
      alert("Selecione um cliente antes de criar a análise.");
      return;
    }

    setCriandoAnalise(true);

    const { data, error } = await supabase
      .from("risk_analyses")
      .insert({
        cliente_id: clienteSelecionado,
        titulo: "Análise patrimonial",
        tipo_analise: "patrimonial",
        status: "em_analise",
      })
      .select()
      .single();

    setCriandoAnalise(false);

    if (error) {
      alert("Erro ao criar análise: " + error.message);
      return;
    }

    setAnalysisId(data.id);
    alert("Análise criada com sucesso.");
  }

  function montarRespostas() {
    return [
      {
        codigo_pergunta: "incendio",
        pergunta: "Existe sistema de prevenção contra incêndio?",
        resposta_valor: form.incendio.toLowerCase(),
        resposta_label: form.incendio,
        pontos: form.incendio === "não" ? 9 : 2,
        peso: 3,
        categoria: "protecao",
      },
      {
        codigo_pergunta: "acesso",
        pergunta: "Existe controle de acesso?",
        resposta_valor: form.acesso.toLowerCase(),
        resposta_label: form.acesso,
        pontos: form.acesso === "não" ? 7 : 2,
        peso: 2,
        categoria: "seguranca",
      },
      {
        codigo_pergunta: "sinistro",
        pergunta: "Houve sinistro recente?",
        resposta_valor: form.sinistro.toLowerCase(),
        resposta_label: form.sinistro,
        pontos: form.sinistro === "sim" ? 10 : 1,
        peso: 4,
        categoria: "historico",
      },
      {
        codigo_pergunta: "continuidade",
        pergunta: "Existe plano de continuidade?",
        resposta_valor: form.continuidade.toLowerCase(),
        resposta_label: form.continuidade,
        pontos: form.continuidade === "não" ? 8 : 1,
        peso: 3,
        categoria: "continuidade",
      },
    ];
  }

  async function salvarRespostas() {
    if (!analysisId) {
      alert("Crie a análise primeiro.");
      return;
    }

    setSalvandoRespostas(true);

    const { error: deleteError } = await supabase
      .from("risk_analysis_answers")
      .delete()
      .eq("analysis_id", analysisId);

    if (deleteError) {
      setSalvandoRespostas(false);
      alert("Erro ao limpar respostas anteriores: " + deleteError.message);
      return;
    }

    const respostas = montarRespostas();

    const { error } = await supabase.from("risk_analysis_answers").insert(
      respostas.map((r) => ({
        analysis_id: analysisId,
        ...r,
      }))
    );

    setSalvandoRespostas(false);

    if (error) {
      alert("Erro ao salvar respostas: " + error.message);
      return;
    }

    alert("Respostas salvas com sucesso.");
  }

  async function calcularRisco() {
    if (!analysisId) {
      alert("Crie a análise primeiro.");
      return;
    }

    setCalculandoRisco(true);

    const res = await fetch("/api/risk-engine/analisar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ analysisId }),
    });

    const json = await res.json();

    setCalculandoRisco(false);

    if (!json.ok) {
      alert("Erro ao calcular risco: " + (json.error || "Erro desconhecido"));
      return;
    }

    window.location.href = `/analise/resultado?id=${analysisId}`;
  }

  return (
    <div style={{ padding: 32 }}>
      <h1>Nova Análise de Risco Patrimonial</h1>

      <div style={{ marginTop: 24, maxWidth: 700 }}>
        <label style={{ display: "block", marginBottom: 8 }}>Cliente</label>

        <select
          value={clienteSelecionado}
          onChange={(e) => setClienteSelecionado(e.target.value)}
          style={{ width: "100%", padding: 12, marginBottom: 20 }}
        >
          <option value="">
            {carregandoClientes ? "Carregando clientes..." : "Selecione um cliente"}
          </option>

          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nome || "Sem nome"}
            </option>
          ))}
        </select>

        <button
          onClick={criarAnalise}
          disabled={criandoAnalise}
          style={{ padding: "12px 18px", cursor: "pointer" }}
        >
          {criandoAnalise ? "Criando análise..." : "Criar análise"}
        </button>

        {analysisId ? (
          <p style={{ marginTop: 12 }}>
            <strong>ID da análise:</strong> {analysisId}
          </p>
        ) : null}

        <hr style={{ margin: "32px 0" }} />

        <h2>Questionário</h2>

        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", marginBottom: 8 }}>
            Existe sistema de prevenção contra incêndio?
          </label>
          <select
            value={form.incendio}
            onChange={(e) => setForm({ ...form, incendio: e.target.value })}
            style={{ width: "100%", padding: 12, marginBottom: 16 }}
          >
            <option value="sim">sim</option>
            <option value="não">não</option>
          </select>

          <label style={{ display: "block", marginBottom: 8 }}>
            Existe controle de acesso?
          </label>
          <select
            value={form.acesso}
            onChange={(e) => setForm({ ...form, acesso: e.target.value })}
            style={{ width: "100%", padding: 12, marginBottom: 16 }}
          >
            <option value="sim">sim</option>
            <option value="não">não</option>
          </select>

          <label style={{ display: "block", marginBottom: 8 }}>
            Houve sinistro recente?
          </label>
          <select
            value={form.sinistro}
            onChange={(e) => setForm({ ...form, sinistro: e.target.value })}
            style={{ width: "100%", padding: 12, marginBottom: 16 }}
          >
            <option value="não">não</option>
            <option value="sim">sim</option>
          </select>

          <label style={{ display: "block", marginBottom: 8 }}>
            Existe plano de continuidade?
          </label>
          <select
            value={form.continuidade}
            onChange={(e) => setForm({ ...form, continuidade: e.target.value })}
            style={{ width: "100%", padding: 12, marginBottom: 24 }}
          >
            <option value="sim">sim</option>
            <option value="não">não</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={salvarRespostas}
            disabled={salvandoRespostas}
            style={{ padding: "12px 18px", cursor: "pointer" }}
          >
            {salvandoRespostas ? "Salvando..." : "Salvar respostas"}
          </button>

          <button
            onClick={calcularRisco}
            disabled={calculandoRisco}
            style={{ padding: "12px 18px", cursor: "pointer" }}
          >
            {calculandoRisco ? "Calculando..." : "Calcular risco"}
          </button>
        </div>
      </div>
    </div>
  );
}