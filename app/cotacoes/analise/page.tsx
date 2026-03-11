"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { calcularCotacao } from "@/lib/motorcotacao";

type Cotacao = {
  id: string;
  corretora_id: string | null;
  usuario_id: string | null;
  cliente_id: string | null;
  produto: string | null;
  numero_proposta: string | null;
  renovacao: boolean;
  inicio_vigencia: string | null;
  fim_vigencia: string | null;
  moeda: string | null;
  taxa_cambio: number | null;
  atividade_principal: string | null;
  endereco_risco: string | null;
  cidade_risco: string | null;
  estado_risco: string | null;
  classe_construtiva: string | null;
  combustibilidade: string | null;
  hazard_grade: string | null;
  damageability: string | null;
  bottleneck: string | null;
  quality_grade: string | null;
  periodo_indenitario: string | null;
  historico_sinistro: string | null;
  medidas_prevencao: string | null;
  documentos_recebidos: string | null;
  declaracao_risco: string | null;
  observacoes_tecnicas: string | null;
  observacoes_comerciais: string | null;
  status: string | null;
  created_at: string | null;
};

type Corretora = {
  id: string;
  nome_fantasia: string | null;
};

type Usuario = {
  id: string;
  nome: string | null;
};

type Cliente = {
  id: string;
  nome: string | null;
};

type ResultadoPlano = {
  seguradora_id: string;
  plano_id: string;
  nome_plano: string;
  taxa: number;
  comissao: number | null;
  status: string;
};

type AnaliseRisco = {
  score: number;
  nivel: "baixo" | "moderado" | "alto" | "critico";
  fatores: string[];
  recomendacao: string;
};

export default function AnaliseCotacaoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const cotacaoId = searchParams.get("cotacao_id") || "";

  const [cotacao, setCotacao] = useState<Cotacao | null>(null);
  const [corretora, setCorretora] = useState<Corretora | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [resultados, setResultados] = useState<ResultadoPlano[]>([]);
  const [loading, setLoading] = useState(true);

  function textoContem(texto: string | null | undefined, palavras: string[]) {
    if (!texto) return false;
    const base = texto.toLowerCase();
    return palavras.some((p) => base.includes(p.toLowerCase()));
  }

  function extrairNumero(texto: string | null | undefined): number | null {
    if (!texto) return null;
    const match = String(texto).match(/\d+/);
    if (!match) return null;
    const numero = Number(match[0]);
    return Number.isNaN(numero) ? null : numero;
  }

  function calcularScoreRisco(dados: Cotacao): AnaliseRisco {
    let score = 0;
    const fatores: string[] = [];

    const estado = (dados.estado_risco || "").toUpperCase();
    const classe = (dados.classe_construtiva || "").toLowerCase();
    const combust = (dados.combustibilidade || "").toLowerCase();
    const hazard = (dados.hazard_grade || "").toLowerCase();
    const damage = (dados.damageability || "").toLowerCase();
    const bottleneck = (dados.bottleneck || "").toLowerCase();
    const quality = (dados.quality_grade || "").toLowerCase();
    const sinistrosNumero = extrairNumero(dados.historico_sinistro);

    if (dados.renovacao) {
      score += 5;
      fatores.push("Cotação de renovação.");
    } else {
      score += 10;
      fatores.push("Negócio novo.");
    }

    if (textoContem(classe, ["madeira", "mista", "combustível"])) {
      score += 25;
      fatores.push("Classe construtiva com maior exposição.");
    } else if (classe) {
      score += 8;
      fatores.push("Classe construtiva informada.");
    }

    if (textoContem(combust, ["alta", "elevada", "inflam", "combust"])) {
      score += 25;
      fatores.push("Combustibilidade elevada.");
    } else if (combust) {
      score += 8;
      fatores.push("Combustibilidade informada.");
    }

    if (textoContem(hazard, ["alto", "high", "severo"])) {
      score += 25;
      fatores.push("Hazard grade alto.");
    } else if (hazard) {
      score += 8;
      fatores.push("Hazard grade informado.");
    }

    if (textoContem(damage, ["alto", "high", "severo"])) {
      score += 18;
      fatores.push("Damageability elevado.");
    } else if (damage) {
      score += 6;
      fatores.push("Damageability informado.");
    }

    if (textoContem(bottleneck, ["alto", "high", "crítico", "critico"])) {
      score += 15;
      fatores.push("Dependência operacional elevada.");
    } else if (bottleneck) {
      score += 5;
      fatores.push("Bottleneck informado.");
    }

    if (textoContem(quality, ["baixo", "low", "ruim"])) {
      score += 15;
      fatores.push("Quality grade desfavorável.");
    } else if (quality) {
      score += 5;
      fatores.push("Quality grade informado.");
    }

    if (sinistrosNumero !== null) {
      if (sinistrosNumero >= 3) {
        score += 30;
        fatores.push("Histórico de sinistros elevado.");
      } else if (sinistrosNumero >= 1) {
        score += 15;
        fatores.push("Há histórico de sinistros.");
      } else {
        score += 3;
        fatores.push("Sem sinistros relevantes informados.");
      }
    }

    if (!dados.documentos_recebidos || dados.documentos_recebidos.trim() === "") {
      score += 12;
      fatores.push("Documentação não detalhada.");
    } else {
      score += 3;
      fatores.push("Documentação recebida informada.");
    }

    if (!dados.medidas_prevencao || dados.medidas_prevencao.trim() === "") {
      score += 12;
      fatores.push("Medidas de prevenção não detalhadas.");
    } else {
      score += 2;
      fatores.push("Há medidas de prevenção informadas.");
    }

    if (["SP", "RJ", "MG", "PR", "SC", "RS"].includes(estado)) {
      score += 4;
      fatores.push("Praça com mercado segurador ativo.");
    } else if (estado) {
      score += 7;
      fatores.push("Estado informado para análise.");
    }

    if (textoContem(dados.atividade_principal, ["industr", "quimic", "metal", "plast", "têxtil", "textil"])) {
      score += 20;
      fatores.push("Atividade principal com perfil industrial.");
    } else if (textoContem(dados.atividade_principal, ["comércio", "comercio", "escrit", "servi"])) {
      score += 8;
      fatores.push("Atividade principal com risco moderado.");
    } else if (dados.atividade_principal) {
      score += 10;
      fatores.push("Atividade principal informada.");
    }

    if (score < 30) {
      return {
        score,
        nivel: "baixo",
        fatores,
        recomendacao: "Risco favorável. Mercado tende a aceitar com mais competitividade.",
      };
    }

    if (score < 60) {
      return {
        score,
        nivel: "moderado",
        fatores,
        recomendacao: "Risco moderado. Vale comparar seguradoras com regras mais flexíveis.",
      };
    }

    if (score < 90) {
      return {
        score,
        nivel: "alto",
        fatores,
        recomendacao: "Risco alto. Importante reforçar prevenção e documentação.",
      };
    }

    return {
      score,
      nivel: "critico",
      fatores,
      recomendacao: "Risco crítico. Mercado pode restringir aceitação ou majorar bastante a taxa.",
    };
  }

  async function carregarAnalise() {
    if (!cotacaoId) {
      alert("Cotação não informada.");
      return;
    }

    setLoading(true);

    try {
      const { data: cotacaoData, error: cotacaoError } = await supabase
        .from("cotacoes")
        .select("*")
        .eq("id", cotacaoId)
        .maybeSingle();

      if (cotacaoError) {
        alert(`Erro ao carregar cotação: ${cotacaoError.message}`);
        setLoading(false);
        return;
      }

      if (!cotacaoData) {
        alert("Cotação não encontrada.");
        setLoading(false);
        return;
      }

      setCotacao(cotacaoData);

      const [
        { data: corretoraData },
        { data: usuarioData },
        { data: clienteData },
      ] = await Promise.all([
        cotacaoData.corretora_id
          ? supabase
              .from("corretoras")
              .select("id, nome_fantasia")
              .eq("id", cotacaoData.corretora_id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        cotacaoData.usuario_id
          ? supabase
              .from("usuarios")
              .select("id, nome")
              .eq("id", cotacaoData.usuario_id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        cotacaoData.cliente_id
          ? supabase
              .from("clientes")
              .select("id, nome")
              .eq("id", cotacaoData.cliente_id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      setCorretora(corretoraData || null);
      setUsuario(usuarioData || null);
      setCliente(clienteData || null);

      const retornoMotor = await calcularCotacao(cotacaoId);
      setResultados(retornoMotor || []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro inesperado ao carregar análise.";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarAnalise();
  }, []);

  const analise = useMemo(() => {
    if (!cotacao) return null;
    return calcularScoreRisco(cotacao);
  }, [cotacao]);

  const melhorProposta = useMemo(() => {
    if (!resultados.length) return null;
    return resultados[0];
  }, [resultados]);

  function formatarData(data: string | null) {
    if (!data) return "-";

    try {
      return new Date(data).toLocaleDateString("pt-BR");
    } catch {
      return "-";
    }
  }

  function formatarNumero(valor: number | null | undefined) {
    if (valor === null || valor === undefined) return "-";
    return valor.toFixed(2);
  }

  function corNivel(nivel: AnaliseRisco["nivel"] | undefined): React.CSSProperties {
    if (nivel === "baixo") {
      return {
        background: "#dcfce7",
        color: "#166534",
        border: "1px solid #86efac",
      };
    }

    if (nivel === "moderado") {
      return {
        background: "#fef3c7",
        color: "#92400e",
        border: "1px solid #fcd34d",
      };
    }

    if (nivel === "alto") {
      return {
        background: "#fee2e2",
        color: "#b91c1c",
        border: "1px solid #fca5a5",
      };
    }

    return {
      background: "#ede9fe",
      color: "#6d28d9",
      border: "1px solid #c4b5fd",
    };
  }

  return (
    <div style={pageStyle}>
      <div style={headerRow}>
        <div>
          <h1 style={titleStyle}>Análise da Cotação</h1>
          <p style={subtitleStyle}>
            Visão técnica do risco e ranking automático das propostas.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            style={primaryButton}
            onClick={() =>
              cotacaoId
                ? router.push(`/cotacoes/resultado?cotacao_id=${cotacaoId}`)
                : router.push("/cotacoes")
            }
          >
            Ver Resultado
          </button>

          <button
            type="button"
            style={secondaryButton}
            onClick={() => router.push("/cotacoes")}
          >
            Voltar
          </button>
        </div>
      </div>

      {loading ? (
        <div style={emptyBox}>Carregando análise...</div>
      ) : !cotacao ? (
        <div style={emptyBox}>Cotação não encontrada.</div>
      ) : (
        <>
          <div style={cardsGrid}>
            <ResumoCard
              titulo="Score de risco"
              valor={analise ? String(analise.score) : "-"}
            />
            <ResumoCard
              titulo="Nível"
              valor={analise ? analise.nivel.toUpperCase() : "-"}
            />
            <ResumoCard
              titulo="Propostas elegíveis"
              valor={String(resultados.length)}
            />
            <ResumoCard
              titulo="Melhor taxa"
              valor={melhorProposta ? formatarNumero(melhorProposta.taxa) : "-"}
            />
          </div>

          <div style={gridMain}>
            <div style={cardStyle}>
              <h2 style={sectionTitle}>Dados principais</h2>

              <div style={infoGrid}>
                <InfoItem label="Corretora" value={corretora?.nome_fantasia || "-"} />
                <InfoItem label="Usuário" value={usuario?.nome || "-"} />
                <InfoItem label="Cliente" value={cliente?.nome || "-"} />
                <InfoItem label="Produto" value={cotacao.produto || "-"} />
                <InfoItem label="Proposta" value={cotacao.numero_proposta || "-"} />
                <InfoItem label="Cadastro" value={formatarData(cotacao.created_at)} />
                <InfoItem label="Início vigência" value={formatarData(cotacao.inicio_vigencia)} />
                <InfoItem label="Fim vigência" value={formatarData(cotacao.fim_vigencia)} />
                <InfoItem label="Cidade risco" value={cotacao.cidade_risco || "-"} />
                <InfoItem label="Estado risco" value={cotacao.estado_risco || "-"} />
                <InfoItem label="Classe construtiva" value={cotacao.classe_construtiva || "-"} />
                <InfoItem label="Combustibilidade" value={cotacao.combustibilidade || "-"} />
              </div>
            </div>

            <div style={cardStyle}>
              <h2 style={sectionTitle}>Análise de risco</h2>

              <div style={{ marginBottom: 14 }}>
                <span style={{ ...badgeStyle, ...corNivel(analise?.nivel) }}>
                  {analise?.nivel || "-"}
                </span>
              </div>

              <div style={riskScoreBox}>
                <div style={riskScoreLabel}>Score</div>
                <div style={riskScoreValue}>{analise?.score ?? "-"}</div>
              </div>

              <div style={recommendationBox}>
                {analise?.recomendacao || "-"}
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={miniTitle}>Fatores encontrados</div>

                {!analise?.fatores.length ? (
                  <div style={subtleText}>Nenhum fator relevante identificado.</div>
                ) : (
                  <div style={factorList}>
                    {analise.fatores.map((fator, index) => (
                      <div key={`${fator}-${index}`} style={factorItem}>
                        {fator}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={sectionTitle}>Melhor proposta sugerida</h2>

            {!melhorProposta ? (
              <div style={emptyInline}>Nenhuma proposta elegível encontrada.</div>
            ) : (
              <div style={bestProposalBox}>
                <div>
                  <div style={bestProposalTitle}>{melhorProposta.nome_plano}</div>
                  <div style={bestProposalSub}>
                    Plano com menor taxa entre as propostas aceitas.
                  </div>
                </div>

                <div style={bestProposalMetrics}>
                  <MetricBox titulo="Taxa" valor={formatarNumero(melhorProposta.taxa)} />
                  <MetricBox
                    titulo="Comissão"
                    valor={formatarNumero(melhorProposta.comissao)}
                  />
                  <MetricBox titulo="Status" valor={melhorProposta.status} />
                </div>
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <h2 style={sectionTitle}>Ranking das propostas</h2>

            {!resultados.length ? (
              <div style={emptyInline}>Nenhuma seguradora aceitou o risco.</div>
            ) : (
              <div style={tableWrapper}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Ranking</th>
                      <th style={thStyle}>Plano</th>
                      <th style={thStyle}>Taxa</th>
                      <th style={thStyle}>Comissão</th>
                      <th style={thStyle}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultados.map((item, index) => (
                      <tr key={item.plano_id}>
                        <td style={tdStyle}>#{index + 1}</td>
                        <td style={tdStyle}>{item.nome_plano}</td>
                        <td style={tdStyle}>{formatarNumero(item.taxa)}</td>
                        <td style={tdStyle}>{formatarNumero(item.comissao)}</td>
                        <td style={tdStyle}>{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
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

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoItem}>
      <div style={infoLabel}>{label}</div>
      <div style={infoValue}>{value}</div>
    </div>
  );
}

function MetricBox({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div style={metricBox}>
      <div style={metricTitle}>{titulo}</div>
      <div style={metricValue}>{valor}</div>
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

const gridMain: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr",
  gap: 16,
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  border: "1px solid #eef2f7",
};

const sectionTitle: React.CSSProperties = {
  margin: "0 0 16px 0",
  fontSize: 20,
  color: "#111827",
};

const infoGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const infoItem: React.CSSProperties = {
  background: "#f9fafb",
  borderRadius: 12,
  padding: 12,
  border: "1px solid #eef2f7",
};

const infoLabel: React.CSSProperties = {
  fontSize: 12,
  color: "#6b7280",
  marginBottom: 4,
};

const infoValue: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#111827",
};

const riskScoreBox: React.CSSProperties = {
  background: "#f9fafb",
  border: "1px solid #eef2f7",
  borderRadius: 14,
  padding: 16,
  marginBottom: 14,
};

const riskScoreLabel: React.CSSProperties = {
  fontSize: 13,
  color: "#6b7280",
};

const riskScoreValue: React.CSSProperties = {
  fontSize: 36,
  fontWeight: 800,
  color: "#111827",
  marginTop: 4,
};

const recommendationBox: React.CSSProperties = {
  background: "#eff6ff",
  color: "#1e3a8a",
  border: "1px solid #bfdbfe",
  borderRadius: 12,
  padding: 14,
  fontSize: 14,
  lineHeight: 1.5,
};

const miniTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#111827",
  marginBottom: 10,
};

const subtleText: React.CSSProperties = {
  color: "#6b7280",
  fontSize: 14,
};

const factorList: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const factorItem: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  background: "#f9fafb",
  border: "1px solid #eef2f7",
  color: "#111827",
  fontSize: 14,
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  textTransform: "capitalize",
};

const bestProposalBox: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
  background: "#f9fafb",
  borderRadius: 14,
  border: "1px solid #eef2f7",
  padding: 16,
};

const bestProposalTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  color: "#111827",
};

const bestProposalSub: React.CSSProperties = {
  marginTop: 4,
  fontSize: 14,
  color: "#6b7280",
};

const bestProposalMetrics: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(120px, 1fr))",
  gap: 10,
};

const metricBox: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 12,
};

const metricTitle: React.CSSProperties = {
  fontSize: 12,
  color: "#6b7280",
  marginBottom: 4,
};

const metricValue: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  color: "#111827",
};

const tableWrapper: React.CSSProperties = {
  width: "100%",
  overflowX: "auto",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 700,
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
  color: "#111827",
  fontSize: 14,
};

const emptyBox: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 16,
  padding: 30,
  textAlign: "center",
  color: "#6b7280",
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  border: "1px solid #eef2f7",
};

const emptyInline: React.CSSProperties = {
  color: "#6b7280",
  fontSize: 14,
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
  padding: "12px 16px",
  background: "#e5e7eb",
  color: "#111827",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
};