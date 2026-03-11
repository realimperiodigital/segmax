"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type AnaliseCTR = {
  id: string;
  cotacao_id: string;
  score: number;
  status: "cobertura_total" | "cobertura_parcial" | "em_risco";
  total_itens: number;
  itens_ok: number;
  itens_falhos: number;
  itens_criticos_falhos: number;
  resumo: string | null;
  parecer: string | null;
  recomendacoes: string | null;
  gaps: string | null;
};

type ItemCTR = {
  codigo: string;
  titulo: string;
  descricao: string | null;
  peso: number;
  critica: boolean;
  ordem: number;
  resposta: boolean | null;
  observacao: string | null;
};

export default function PaginaCTR() {
  const params = useParams();
  const router = useRouter();
  const cotacaoId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [analise, setAnalise] = useState<AnaliseCTR | null>(null);
  const [itens, setItens] = useState<ItemCTR[]>([]);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function carregarTudo() {
    try {
      setLoading(true);
      setErro("");
      setSucesso("");

      await supabase.rpc("ctr_inicializar_respostas", {
        p_cotacao_id: cotacaoId,
      });

      await supabase.rpc("ctr_recalcular_analise", {
        p_cotacao_id: cotacaoId,
      });

      const { data: analiseData, error: analiseError } = await supabase
        .from("ctr_analises")
        .select("*")
        .eq("cotacao_id", cotacaoId)
        .single();

      if (analiseError) {
        throw analiseError;
      }

      const { data: itensData, error: itensError } = await supabase
        .from("vw_ctr_analise_detalhada")
        .select("*")
        .eq("cotacao_id", cotacaoId)
        .order("ordem", { ascending: true });

      if (itensError) {
        throw itensError;
      }

      const itensFormatados: ItemCTR[] = (itensData || []).map((item: any) => ({
        codigo: item.codigo,
        titulo: item.titulo,
        descricao: item.descricao,
        peso: item.peso,
        critica: item.critica,
        ordem: item.ordem,
        resposta: item.resposta,
        observacao: item.observacao || "",
      }));

      setAnalise(analiseData as AnaliseCTR);
      setItens(itensFormatados);
    } catch (error: any) {
      setErro(error?.message || "Erro ao carregar análise CTR.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (cotacaoId) {
      carregarTudo();
    }
  }, [cotacaoId]);

  async function atualizarResposta(index: number, resposta: boolean) {
    const copia = [...itens];
    copia[index].resposta = resposta;
    setItens(copia);
  }

  async function atualizarObservacao(index: number, observacao: string) {
    const copia = [...itens];
    copia[index].observacao = observacao;
    setItens(copia);
  }

  async function salvarAnalise() {
    try {
      setSalvando(true);
      setErro("");
      setSucesso("");

      for (const item of itens) {
        const { error } = await supabase.rpc("ctr_responder_item", {
          p_cotacao_id: cotacaoId,
          p_codigo_pergunta: item.codigo,
          p_resposta: !!item.resposta,
          p_observacao: item.observacao || null,
        });

        if (error) {
          throw error;
        }
      }

      await carregarTudo();
      setSucesso("Análise CTR salva com sucesso.");
    } catch (error: any) {
      setErro(error?.message || "Erro ao salvar análise CTR.");
    } finally {
      setSalvando(false);
    }
  }

  const statusLabel = useMemo(() => {
    if (!analise) return "";
    if (analise.status === "cobertura_total") return "Cobertura Total";
    if (analise.status === "cobertura_parcial") return "Cobertura Parcial";
    return "Em Risco";
  }, [analise]);

  const statusClasse = useMemo(() => {
    if (!analise) return "bg-gray-100 text-gray-700 border-gray-200";
    if (analise.status === "cobertura_total") {
      return "bg-green-100 text-green-700 border-green-200";
    }
    if (analise.status === "cobertura_parcial") {
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
    return "bg-red-100 text-red-700 border-red-200";
  }, [analise]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-7xl rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Carregando análise CTR...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Análise Técnica CTR
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Cotação: {cotacaoId}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push(`/cotacoes/${cotacaoId}/resultado`)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Ver Resultado
              </button>

              <button
                onClick={salvarAnalise}
                disabled={salvando}
                className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {salvando ? "Salvando..." : "Salvar Análise"}
              </button>
            </div>
          </div>
        </div>

        {erro && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {sucesso}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Score</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {analise?.score ?? 0}%
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Itens totais</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {analise?.total_itens ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Itens OK</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {analise?.itens_ok ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Falhos</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {analise?.itens_falhos ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Status</p>
            <div
              className={`mt-3 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${statusClasse}`}
            >
              {statusLabel}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              Checklist técnico
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Marque os itens presentes na proposta e adicione observações.
            </p>

            <div className="mt-6 space-y-4">
              {itens.map((item, index) => (
                <div
                  key={item.codigo}
                  className="rounded-2xl border border-gray-200 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {item.titulo}
                        </h3>

                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                          Peso {item.peso}
                        </span>

                        {item.critica && (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                            Crítico
                          </span>
                        )}
                      </div>

                      {item.descricao && (
                        <p className="text-sm text-gray-500">{item.descricao}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => atualizarResposta(index, true)}
                        className={`rounded-xl px-4 py-2 text-sm font-medium ${
                          item.resposta === true
                            ? "bg-green-600 text-white"
                            : "border border-gray-300 bg-white text-gray-700"
                        }`}
                      >
                        Sim
                      </button>

                      <button
                        type="button"
                        onClick={() => atualizarResposta(index, false)}
                        className={`rounded-xl px-4 py-2 text-sm font-medium ${
                          item.resposta === false
                            ? "bg-red-600 text-white"
                            : "border border-gray-300 bg-white text-gray-700"
                        }`}
                      >
                        Não
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Observação
                    </label>
                    <textarea
                      value={item.observacao || ""}
                      onChange={(e) =>
                        atualizarObservacao(index, e.target.value)
                      }
                      rows={3}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                      placeholder="Descreva detalhes técnicos deste item..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Resumo</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700">
                {analise?.resumo || "Sem resumo no momento."}
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Parecer técnico</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700">
                {analise?.parecer || "Sem parecer no momento."}
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Gaps</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700">
                {analise?.gaps || "Nenhum gap encontrado."}
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Recomendações</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700">
                {analise?.recomendacoes || "Nenhuma recomendação no momento."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}