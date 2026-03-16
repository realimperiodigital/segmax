"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  getQuestionnaireSections,
  QuestionnaireType,
  RiskQuestion,
} from "@/lib/risk-questionnaires";

type Cliente = {
  id: string;
  nome: string | null;
};

type FormState = Record<string, string>;

export default function AnalisePage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [analysisId, setAnalysisId] = useState("");
  const [tipoQuestionario, setTipoQuestionario] =
    useState<QuestionnaireType>("middle");

  const [carregandoClientes, setCarregandoClientes] = useState(true);
  const [criandoAnalise, setCriandoAnalise] = useState(false);
  const [salvandoRespostas, setSalvandoRespostas] = useState(false);
  const [calculandoRisco, setCalculandoRisco] = useState(false);

  const secoes = useMemo(
    () => getQuestionnaireSections(tipoQuestionario),
    [tipoQuestionario]
  );

  const perguntas = useMemo(
    () => secoes.flatMap((secao) => secao.perguntas),
    [secoes]
  );

  const [form, setForm] = useState<FormState>({});

  useEffect(() => {
    carregarClientes();
  }, []);

  useEffect(() => {
    const inicial: FormState = {};
    perguntas.forEach((p) => {
      if (p.tipo === "select" && p.opcoes?.length) {
        inicial[p.codigo] = p.opcoes[0].value;
      } else {
        inicial[p.codigo] = "";
      }
    });
    setForm(inicial);
  }, [tipoQuestionario, perguntas]);

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

  function atualizarCampo(codigo: string, valor: string) {
    setForm((prev) => ({
      ...prev,
      [codigo]: valor,
    }));
  }

  function calcularPontos(pergunta: RiskQuestion, valor: string) {
    if (pergunta.tipo === "select") {
      const opcao = pergunta.opcoes?.find((o) => o.value === valor);
      return opcao?.pontos ?? 0;
    }

    if (pergunta.tipo === "number") {
      const numero = Number(valor || 0);

      if (pergunta.codigo.includes("distancia_bombeiros")) {
        if (numero <= 5) return 1;
        if (numero <= 15) return 3;
        if (numero <= 30) return 6;
        return 9;
      }

      return numero > 0 ? 2 : 0;
    }

    if (pergunta.tipo === "multiselect") {
      const itens = valor ? valor.split("|").filter(Boolean) : [];
      const totalOpcoes = pergunta.opcoes?.length || 1;
      const faltantes = totalOpcoes - itens.length;

      if (faltantes <= 0) return 1;
      if (faltantes === 1) return 3;
      if (faltantes === 2) return 5;
      return 8;
    }

    if (pergunta.tipo === "text" || pergunta.tipo === "textarea" || pergunta.tipo === "date") {
      return valor?.trim() ? 1 : 4;
    }

    return 0;
  }

  function validarObrigatorias() {
    const faltando = perguntas.filter(
      (p) => p.obrigatoria && !String(form[p.codigo] || "").trim()
    );

    if (faltando.length > 0) {
      alert(`Preencha os campos obrigatórios. Primeiro pendente: ${faltando[0].titulo}`);
      return false;
    }

    return true;
  }

  async function criarAnalise() {
    if (!clienteSelecionado) {
      alert("Selecione um cliente antes de criar a análise.");
      return;
    }

    setCriandoAnalise(true);

    const titulo =
      tipoQuestionario === "middle"
        ? "Análise patrimonial - Middle"
        : "Análise patrimonial - Grandes Riscos";

    const { data, error } = await supabase
      .from("risk_analyses")
      .insert({
        cliente_id: clienteSelecionado,
        titulo,
        tipo_analise: tipoQuestionario,
        status: "em_analise",
        observacoes: `Questionário técnico ${tipoQuestionario}`,
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

  async function salvarRespostas() {
    if (!analysisId) {
      alert("Crie a análise primeiro.");
      return;
    }

    if (!validarObrigatorias()) {
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

    const respostas = perguntas.map((pergunta) => {
      const valor = form[pergunta.codigo] || "";
      const pontos = calcularPontos(pergunta, valor);

      return {
        analysis_id: analysisId,
        codigo_pergunta: pergunta.codigo,
        pergunta: pergunta.titulo,
        resposta_valor: valor,
        resposta_label: valor,
        resposta_numero:
          pergunta.tipo === "number" ? Number(valor || 0) : null,
        peso: pergunta.peso,
        pontos,
        categoria: pergunta.categoria,
      };
    });

    const { error } = await supabase
      .from("risk_analysis_answers")
      .insert(respostas);

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

    try {
      const res = await fetch("/api/risk-engine/analisar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ analysisId }),
      });

      const json = await res.json();

      if (!json.ok) {
        alert("Erro ao calcular risco: " + (json.error || "Erro desconhecido"));
        setCalculandoRisco(false);
        return;
      }

      window.location.href = `/cotacoes/resultado/${analysisId}`;
    } catch {
      alert("Erro ao calcular risco.");
      setCalculandoRisco(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(180,140,40,0.12) 0%, rgba(0,0,0,1) 28%)",
        color: "#ffffff",
        padding: "32px 20px 60px",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div
          style={{
            border: "1px solid rgba(212, 175, 55, 0.22)",
            background: "rgba(8, 8, 8, 0.94)",
            borderRadius: 24,
            padding: 32,
            boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
          }}
        >
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                display: "inline-block",
                padding: "8px 14px",
                borderRadius: 999,
                border: "1px solid rgba(212,175,55,0.35)",
                background: "rgba(212,175,55,0.08)",
                color: "#d4af37",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              SegMax • Questionário Técnico Patrimonial
            </div>

            <h1
              style={{
                marginTop: 18,
                marginBottom: 10,
                fontSize: 34,
                lineHeight: 1.1,
                fontWeight: 800,
              }}
            >
              Nova Análise de Risco
            </h1>

            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.72)",
                fontSize: 16,
                lineHeight: 1.6,
                maxWidth: 820,
              }}
            >
              O questionário agora está embutido no SegMax, com base técnica patrimonial
              para Middle e Grandes Riscos.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 1fr 1fr",
              gap: 20,
              marginBottom: 26,
            }}
          >
            <Painel titulo="Cliente">
              <select
                value={clienteSelecionado}
                onChange={(e) => setClienteSelecionado(e.target.value)}
                style={selectStyle}
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
            </Painel>

            <Painel titulo="Tipo de questionário">
              <select
                value={tipoQuestionario}
                onChange={(e) =>
                  setTipoQuestionario(e.target.value as QuestionnaireType)
                }
                style={selectStyle}
              >
                <option value="middle">Middle</option>
                <option value="grandes_riscos">Grandes Riscos</option>
              </select>
            </Painel>

            <Painel titulo="Status da análise">
              <div
                style={{
                  color: analysisId ? "#ffffff" : "rgba(255,255,255,0.58)",
                  fontSize: 14,
                  lineHeight: 1.6,
                  wordBreak: "break-word",
                }}
              >
                {analysisId
                  ? `ID gerado: ${analysisId}`
                  : "Crie a análise para liberar o salvamento das respostas e o cálculo do risco."}
              </div>
            </Painel>
          </div>

          <div style={{ marginBottom: 26 }}>
            <button onClick={criarAnalise} disabled={criandoAnalise} style={primaryButton}>
              {criandoAnalise ? "Criando análise..." : "Criar análise"}
            </button>
          </div>

          {secoes.map((secao) => (
            <div
              key={secao.secao}
              style={{
                marginBottom: 22,
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: 24,
                background: "linear-gradient(180deg, #101010 0%, #080808 100%)",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: 18,
                  fontSize: 22,
                  color: "#ffffff",
                }}
              >
                {secao.secao}
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 18,
                }}
              >
                {secao.perguntas.map((pergunta) => (
                  <CampoPergunta
                    key={pergunta.codigo}
                    pergunta={pergunta}
                    valor={form[pergunta.codigo] || ""}
                    onChange={(valor) => atualizarCampo(pergunta.codigo, valor)}
                  />
                ))}
              </div>
            </div>
          ))}

          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={salvarRespostas}
              disabled={salvandoRespostas}
              style={secondaryButton}
            >
              {salvandoRespostas ? "Salvando..." : "Salvar respostas"}
            </button>

            <button
              onClick={calcularRisco}
              disabled={calculandoRisco}
              style={primaryButton}
            >
              {calculandoRisco ? "Calculando..." : "Calcular risco"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CampoPergunta({
  pergunta,
  valor,
  onChange,
}: {
  pergunta: RiskQuestion;
  valor: string;
  onChange: (valor: string) => void;
}) {
  const label = (
    <label
      style={{
        display: "block",
        marginBottom: 10,
        color: "#d4af37",
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      {pergunta.titulo}
      {pergunta.obrigatoria ? " *" : ""}
    </label>
  );

  if (pergunta.tipo === "textarea") {
    return (
      <div style={fieldCard}>
        {label}
        <textarea
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={pergunta.placeholder || ""}
          style={textareaStyle}
        />
      </div>
    );
  }

  if (pergunta.tipo === "select") {
    return (
      <div style={fieldCard}>
        {label}
        <select value={valor} onChange={(e) => onChange(e.target.value)} style={selectStyle}>
          {pergunta.opcoes?.map((opcao) => (
            <option key={opcao.value} value={opcao.value}>
              {opcao.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (pergunta.tipo === "multiselect") {
    const selecionados = valor ? valor.split("|") : [];

    function toggleItem(item: string) {
      const existe = selecionados.includes(item);
      const novo = existe
        ? selecionados.filter((i) => i !== item)
        : [...selecionados, item];

      onChange(novo.join("|"));
    }

    return (
      <div style={fieldCard}>
        {label}
        <div style={{ display: "grid", gap: 10 }}>
          {pergunta.opcoes?.map((opcao) => {
            const checked = selecionados.includes(opcao.value);
            return (
              <label
                key={opcao.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "#ffffff",
                  fontSize: 14,
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleItem(opcao.value)}
                />
                {opcao.label}
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={fieldCard}>
      {label}
      <input
        type={pergunta.tipo === "number" ? "number" : pergunta.tipo === "date" ? "date" : "text"}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={pergunta.placeholder || ""}
        style={inputStyle}
      />
    </div>
  );
}

function Painel({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: 18,
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.6)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 10,
        }}
      >
        {titulo}
      </div>
      {children}
    </div>
  );
}

const fieldCard: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  padding: 18,
  background: "rgba(255,255,255,0.02)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid rgba(212,175,55,0.22)",
  background: "#050505",
  color: "#ffffff",
  outline: "none",
  fontSize: 15,
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 120,
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid rgba(212,175,55,0.22)",
  background: "#050505",
  color: "#ffffff",
  outline: "none",
  fontSize: 15,
  resize: "vertical",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid rgba(212,175,55,0.22)",
  background: "#050505",
  color: "#ffffff",
  outline: "none",
  fontSize: 15,
};

const primaryButton: React.CSSProperties = {
  padding: "14px 18px",
  borderRadius: 14,
  border: "1px solid #d4af37",
  background: "#d4af37",
  color: "#000000",
  fontWeight: 800,
  fontSize: 15,
  cursor: "pointer",
};

const secondaryButton: React.CSSProperties = {
  padding: "14px 18px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#111111",
  color: "#ffffff",
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
};