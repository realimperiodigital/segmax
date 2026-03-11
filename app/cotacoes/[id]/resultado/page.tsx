"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Cotacao = {
  id: string;
  created_at?: string | null;
  cliente_id?: string | null;
  seguradora_id?: string | null;
  valor_veiculo?: number | null;
  premio_total?: number | null;
  plano_escolhido?: string | null;
  status?: string | null;
  [key: string]: any;
};

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

function isUUID(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function formatarMoeda(valor?: number | null) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) {
    return "R$ 0,00";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor));
}

function formatarData(data?: string | null) {
  if (!data) return "-";

  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleString("pt-BR");
}

export default function PaginaResultadoCotacao() {
  const params = useParams();
  const router = useRouter();
  const cotacaoId = String(params?.id || "");

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [cotacao, setCotacao] = useState<Cotacao | null>(null);
  const [analise, setAnalise] = useState<AnaliseCTR | null>(null);

  async function carregarDados() {
    try {
      setLoading(true);
      setErro("");

      const { data: cotacaoData, error: cotacaoError } = await supabase
        .from("cotacoes")
        .select("*")
        .eq("id", cotacaoId)
        .single();

      if (cotacaoError) {
        throw cotacaoError;
      }

      const { data: analiseData } = await supabase
        .from("ctr_analises")
        .select("*")
        .eq("cotacao_id", cotacaoId)
        .maybeSingle();

      setCotacao(cotacaoData as Cotacao);
      setAnalise((analiseData as AnaliseCTR | null) || null);
    } catch (error: any) {
      setErro(error?.message || "Erro ao carregar o resultado da cotação.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!cotacaoId) return;

    if (!isUUID(cotacaoId)) {
      setErro("ID da cotação inválido.");
      setLoading(false);
      return;
    }

    carregarDados();
  }, [cotacaoId]);

  const statusCTR = useMemo(() => {
    if (!analise) {
      return {
        label: "Sem análise",
        classe: "bg-gray-100 text-gray-700 border-gray-200",
      };
    }

    if (analise.status === "cobertura_total") {
      return {
        label: "Cobertura Total",
        classe: "bg-green-100 text-green-700 border-green-200",
      };
    }

    if (analise.status === "cobertura_parcial") {
      return {
        label: "Cobertura Parcial",
        classe: "bg-yellow-100 text-yellow-700 border-yellow-200",
      };
    }

    return {
      label: "Em Risco",
      classe: "bg-red-100 text-red-700 border-red-200",
    };
  }, [analise]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Carregando resultado da cotação...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">Resultado da Cotação</h1>
            <p className="mt-1 text-sm text-gray-500">Cotação: {cotacaoId}</p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </div>

          <button
            onClick={() => router.push(`/cotacoes/${cotacaoId}/ctr`)}
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Voltar para CTR
          </button>
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
              <h1 className="text-2xl font-bold text-gray-900">Resultado da Cotação</h1>
              <p className="mt-1 text-sm text-gray-500">Cotação: {cotacaoId}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push(`/cotacoes/${cotacaoId}/ctr`)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Ver CTR
              </button>

              <button
                onClick={() => router.push("/cotacoes")}
                className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Voltar para Cotações
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Status CTR</p>
            <div
              className={`mt-3 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${statusCTR.classe}`}
            >
              {statusCTR.label}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Score CTR</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {analise?.score ?? 0}%
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
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-6">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Resumo da Cotação</h2>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">ID da cotação</p>
                  <p className="mt-2 break-all font-semibold text-gray-900">
                    {cotacao?.id || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Criada em</p>
                  <p className="mt-2 font-semibold text-gray-900">
                    {formatarData(cotacao?.created_at)}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Valor do veículo</p>
                  <p className="mt-2 font-semibold text-gray-900">
                    {formatarMoeda(cotacao?.valor_veiculo)}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Prêmio total</p>
                  <p className="mt-2 font-semibold text-gray-900">
                    {formatarMoeda(cotacao?.premio_total)}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Plano escolhido</p>
                  <p className="mt-2 font-semibold text-gray-900">
                    {cotacao?.plano_escolhido || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Status da cotação</p>
                  <p className="mt-2 font-semibold text-gray-900">
                    {cotacao?.status || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Leitura técnica do CTR</h2>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Resumo</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-800">
                    {analise?.resumo || "Sem resumo disponível."}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Parecer técnico</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-800">
                    {analise?.parecer || "Sem parecer técnico disponível."}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4 md:col-span-2">
                  <p className="text-sm text-gray-500">Gaps identificados</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-800">
                    {analise?.gaps || "Nenhum gap identificado."}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4 md:col-span-2">
                  <p className="text-sm text-gray-500">Recomendações</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-800">
                    {analise?.recomendacoes || "Nenhuma recomendação disponível."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Painel rápido</h2>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Itens totais</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {analise?.total_itens ?? 0}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Críticos falhos</p>
                  <p className="mt-2 text-2xl font-bold text-red-600">
                    {analise?.itens_criticos_falhos ?? 0}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Cliente protegido?</p>
                  <p className="mt-2 text-base font-semibold text-gray-900">
                    {analise?.status === "cobertura_total"
                      ? "Sim, com boa aderência técnica."
                      : analise?.status === "cobertura_parcial"
                      ? "Parcialmente. Ainda precisa ajuste."
                      : "Não. Exige revisão antes da apresentação."}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Próxima ação</h2>
              <p className="mt-3 text-sm leading-6 text-gray-700">
                Revise o CTR antes de apresentar a proposta ao cliente. Esse painel
                foi criado para ajudar o corretor a vender com mais segurança e
                justificar tecnicamente a recomendação.
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <button
                  onClick={() => router.push(`/cotacoes/${cotacaoId}/ctr`)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Revisar análise CTR
                </button>

                <button
                  onClick={() => window.print()}
                  className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  Imprimir resultado
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}