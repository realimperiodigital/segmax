"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type AnalysisRow = {
  id: string;
  quotation_id: string;
  severity: string;
  rule_code: string;
  title: string;
  message: string;
  recommendation: string | null;
  created_at: string;
};

function severityLabel(severity: string) {
  if (severity === "alta") return "Alta";
  if (severity === "media") return "Média";
  if (severity === "baixa") return "Baixa";
  return severity || "N/D";
}

function severityClasses(severity: string) {
  if (severity === "alta") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (severity === "media") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (severity === "baixa") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

export default function CotacaoAnalisePage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [items, setItems] = useState<AnalysisRow[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadAnalysis() {
    if (!quoteId) return;

    const { data, error } = await supabase.rpc("get_technical_analysis", {
      p_quotation_id: quoteId,
    });

    if (error) {
      throw error;
    }

    setItems((data || []) as AnalysisRow[]);
  }

  async function runAnalysis() {
    if (!quoteId) return;

    setRunning(true);
    setError("");
    setSuccess("");

    try {
      const { error } = await supabase.rpc("generate_technical_analysis", {
        p_quotation_id: quoteId,
      });

      if (error) throw error;

      await loadAnalysis();
      setSuccess("Análise técnica atualizada com sucesso.");
    } catch (err: any) {
      setError(err?.message || "Erro ao gerar análise técnica.");
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        await loadAnalysis();
      } catch (err: any) {
        setError(err?.message || "Erro ao carregar análise.");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [quoteId]);

  const resumo = useMemo(() => {
    let altas = 0;
    let medias = 0;
    let baixas = 0;

    for (const item of items) {
      if (item.severity === "alta") altas += 1;
      else if (item.severity === "media") medias += 1;
      else if (item.severity === "baixa") baixas += 1;
    }

    return {
      total: items.length,
      altas,
      medias,
      baixas,
    };
  }, [items]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-500">Carregando análise técnica...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                SegMax • Técnico especialista
              </p>
              <h1 className="mt-1 text-2xl font-bold text-zinc-900">
                Análise técnica da cotação
              </h1>
              <p className="mt-2 text-sm text-zinc-600">
                Cotação: <span className="font-medium">{quoteId}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={runAnalysis}
                disabled={running}
                className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {running ? "Analisando..." : "Gerar análise técnica"}
              </button>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Alertas totais</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900">{resumo.total}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Severidade alta</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{resumo.altas}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Severidade média</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">{resumo.medias}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Severidade baixa</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{resumo.baixas}</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <p className="text-sm text-zinc-600">
              Nenhuma análise encontrada ainda. Clique em{" "}
              <strong>Gerar análise técnica</strong>.
            </p>
          </div>
        ) : null}

        {items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${severityClasses(
                          item.severity
                        )}`}
                      >
                        {severityLabel(item.severity)}
                      </span>

                      <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                        {item.rule_code}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-zinc-900">{item.title}</h2>

                    <p className="text-sm text-zinc-700">{item.message}</p>

                    {item.recommendation ? (
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Recomendação do técnico especialista
                        </p>
                        <p className="mt-2 text-sm text-zinc-700">{item.recommendation}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}