"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

type RiskAnalysis = {
  id: string;
  titulo: string | null;
  tipo_analise: string | null;
  status: string | null;
  score_total: number | null;
  score_percentual: number | null;
  classificacao: string | null;
  nivel_risco: string | null;
  parecer_automatico: string | null;
  recomendacoes: any;
  fatores_criticos: any;
  criado_em: string | null;
};

export default function ResultadoAnalisePage() {
  const params = useParams();
  const id = params.id as string;

  const [dados, setDados] = useState<RiskAnalysis | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (id) {
      carregarResultado();
    }
  }, [id]);

  async function carregarResultado() {
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

  function corClassificacao(classificacao?: string | null) {
    const valor = (classificacao || "").toLowerCase();

    if (valor === "baixo") return "#22c55e";
    if (valor === "medio") return "#f59e0b";
    if (valor === "alto") return "#f97316";
    if (valor === "critico") return "#ef4444";

    return "#d4af37";
  }

  function renderRecomendacoes() {
    if (!dados?.recomendacoes) {
      return <p style={{ color: "rgba(255,255,255,0.72)" }}>Nenhuma recomendação encontrada.</p>;
    }

    let lista = dados.recomendacoes;

    if (typeof lista === "string") {
      try {
        lista = JSON.parse(lista);
      } catch {
        lista = [];
      }
    }

    if (!Array.isArray(lista) || lista.length === 0) {
      return <p style={{ color: "rgba(255,255,255,0.72)" }}>Nenhuma recomendação encontrada.</p>;
    }

    return (
      <div style={{ display: "grid", gap: 12 }}>
        {lista.map((item, index) => (
          <div
            key={index}
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              color: "#ffffff",
              lineHeight: 1.6,
            }}
          >
            {typeof item === "string" ? item : JSON.stringify(item)}
          </div>
        ))}
      </div>
    );
  }

  function renderFatoresCriticos() {
    if (!dados?.fatores_criticos) {
      return <p style={{ color: "rgba(255,255,255,0.72)" }}>Nenhum fator crítico encontrado.</p>;
    }

    let lista = dados.fatores_criticos;

    if (typeof lista === "string") {
      try {
        lista = JSON.parse(lista);
      } catch {
        lista = [];
      }
    }

    if (!Array.isArray(lista) || lista.length === 0) {
      return <p style={{ color: "rgba(255,255,255,0.72)" }}>Nenhum fator crítico encontrado.</p>;
    }

    return (
      <div style={{ display: "grid", gap: 14 }}>
        {lista.map((item: any, index: number) => (
          <div
            key={index}
            style={{
              padding: 18,
              borderRadius: 16,
              border: "1px solid rgba(239,68,68,0.24)",
              background: "rgba(239,68,68,0.06)",
            }}
          >
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ color: "#ffffff", fontWeight: 700 }}>
                {item?.pergunta || "Fator crítico"}
              </div>

              <div style={{ color: "rgba(255,255,255,0.78)", fontSize: 14 }}>
                <strong style={{ color: "#d4af37" }}>Categoria:</strong>{" "}
                {item?.categoria || "-"}
              </div>

              <div style={{ color: "rgba(255,255,255,0.78)", fontSize: 14 }}>
                <strong style={{ color: "#d4af37" }}>Resposta:</strong>{" "}
                {item?.resposta_label || "-"}
              </div>

              <div style={{ color: "rgba(255,255,255,0.78)", fontSize: 14 }}>
                <strong style={{ color: "#d4af37" }}>Peso:</strong> {item?.peso ?? "-"}
              </div>

              <div style={{ color: "rgba(255,255,255,0.78)", fontSize: 14 }}>
                <strong style={{ color: "#d4af37" }}>Pontos:</strong> {item?.pontos ?? "-"}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (carregando) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, rgba(180,140,40,0.12) 0%, rgba(0,0,0,1) 28%)",
          color: "#ffffff",
          padding: "40px 20px",
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div
            style={{
              border: "1px solid rgba(212,175,55,0.18)",
              background: "rgba(8,8,8,0.94)",
              borderRadius: 24,
              padding: 32,
            }}
          >
            Carregando resultado da análise...
          </div>
        </div>
      </div>
    );
  }

  if (!dados) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, rgba(180,140,40,0.12) 0%, rgba(0,0,0,1) 28%)",
          color: "#ffffff",
          padding: "40px 20px",
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div
            style={{
              border: "1px solid rgba(212,175,55,0.18)",
              background: "rgba(8,8,8,0.94)",
              borderRadius: 24,
              padding: 32,
            }}
          >
            Resultado não encontrado.
          </div>
        </div>
      </div>
    );
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
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div
          style={{
            border: "1px solid rgba(212,175,55,0.22)",
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
              SegMax • Resultado da Análise
            </div>

            <h1
              style={{
                marginTop: 18,
                marginBottom: 10,
                fontSize: 34,
                lineHeight: 1.1,
                fontWeight: 800,
                color: "#ffffff",
              }}
            >
              Resultado do Risco Patrimonial
            </h1>

            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.72)",
                fontSize: 16,
                lineHeight: 1.6,
                maxWidth: 760,
              }}
            >
              Visualize o score, a classificação, o parecer técnico automático,
              as recomendações e os fatores críticos identificados pelo motor
              do SegMax.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
              gap: 16,
              marginBottom: 26,
            }}
          >
            <CardResumo
              titulo="Título da análise"
              valor={dados.titulo || "Análise patrimonial"}
              destaque="#ffffff"
            />

            <CardResumo
              titulo="Score percentual"
              valor={`${dados.score_percentual ?? 0}%`}
              destaque="#d4af37"
            />

            <CardResumo
              titulo="Classificação"
              valor={dados.classificacao || "-"}
              destaque={corClassificacao(dados.classificacao)}
            />

            <CardResumo
              titulo="Status"
              valor={dados.status || "-"}
              destaque="#ffffff"
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: 24,
            }}
          >
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: 24,
                background: "linear-gradient(180deg, #101010 0%, #080808 100%)",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: 16,
                  fontSize: 22,
                  color: "#ffffff",
                }}
              >
                Parecer técnico automático
              </h2>

              <div
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(212,175,55,0.18)",
                  background: "rgba(212,175,55,0.06)",
                  padding: 18,
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: 1.8,
                  fontSize: 15,
                }}
              >
                {dados.parecer_automatico || "Sem parecer disponível."}
              </div>

              <div style={{ marginTop: 24 }}>
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: 14,
                    fontSize: 18,
                    color: "#ffffff",
                  }}
                >
                  Recomendações automáticas
                </h3>

                {renderRecomendacoes()}
              </div>
            </div>

            <div
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: 24,
                background:
                  "linear-gradient(180deg, rgba(212,175,55,0.12) 0%, rgba(10,10,10,1) 100%)",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: 16,
                  fontSize: 22,
                  color: "#ffffff",
                }}
              >
                Resumo técnico
              </h2>

              <div style={{ display: "grid", gap: 12 }}>
                <ResumoLinha
                  label="ID da análise"
                  valor={dados.id}
                />
                <ResumoLinha
                  label="Tipo de análise"
                  valor={dados.tipo_analise || "-"}
                />
                <ResumoLinha
                  label="Nível de risco"
                  valor={dados.nivel_risco || dados.classificacao || "-"}
                />
                <ResumoLinha
                  label="Score total"
                  valor={String(dados.score_total ?? 0)}
                />
                <ResumoLinha
                  label="Criado em"
                  valor={
                    dados.criado_em
                      ? new Date(dados.criado_em).toLocaleString("pt-BR")
                      : "-"
                  }
                />
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 26,
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: 24,
              background: "linear-gradient(180deg, #0f0f0f 0%, #070707 100%)",
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
              Fatores críticos identificados
            </h2>

            {renderFatoresCriticos()}
          </div>

          <div
            style={{
              marginTop: 24,
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <a
              href="/cotacoes/analise"
              style={{
                padding: "14px 18px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "#111111",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Nova análise
            </a>

            <button
              onClick={() => window.print()}
              style={{
                padding: "14px 18px",
                borderRadius: 14,
                border: "1px solid #d4af37",
                background: "#d4af37",
                color: "#000000",
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Imprimir resultado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardResumo({
  titulo,
  valor,
  destaque,
}: {
  titulo: string;
  valor: string;
  destaque: string;
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

      <div
        style={{
          color: destaque,
          fontSize: 22,
          fontWeight: 800,
          lineHeight: 1.2,
          wordBreak: "break-word",
        }}
      >
        {valor}
      </div>
    </div>
  );
}

function ResumoLinha({ label, valor }: { label: string; valor: string }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.56)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 6,
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#ffffff",
          fontSize: 14,
          lineHeight: 1.5,
          wordBreak: "break-word",
        }}
      >
        {valor}
      </div>
    </div>
  );
}