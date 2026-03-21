"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Proposta = Record<string, any>;

function formatarData(valor?: string | null) {
  if (!valor) return "-";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return "-";

  return data.toLocaleString("pt-BR");
}

function formatarDataCurta(valor?: string | null) {
  if (!valor) return "-";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return "-";

  return data.toLocaleDateString("pt-BR");
}

function formatarMoeda(valor: any) {
  const numero =
    typeof valor === "number"
      ? valor
      : typeof valor === "string"
        ? Number(valor)
        : NaN;

  if (Number.isNaN(numero)) return "-";

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function primeiroValor(obj: Record<string, any>, chaves: string[]) {
  for (const chave of chaves) {
    const valor = obj?.[chave];
    if (valor !== undefined && valor !== null && valor !== "") {
      return valor;
    }
  }
  return null;
}

export default function PropostaImpressaoPage() {
  const params = useParams();
  const id = String(params?.id || "");

  const [proposta, setProposta] = useState<Proposta | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  async function carregar() {
    try {
      setLoading(true);
      setErro("");

      const response = await fetch(`/api/propostas/${id}`, {
        cache: "no-store"
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || "Erro ao carregar proposta");
      }

      setProposta(json.proposta || null);
    } catch (error: any) {
      setErro(error.message || "Erro ao carregar proposta");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    carregar();
  }, [id]);

  const dados = useMemo(() => {
    const p = proposta || {};

    return {
      numero: primeiroValor(p, ["numero", "numero_proposta", "codigo", "id"]),
      cliente: primeiroValor(p, [
        "cliente_nome",
        "nome_cliente",
        "segurado_nome",
        "nome"
      ]),
      documento: primeiroValor(p, [
        "cliente_documento",
        "cpf_cnpj",
        "documento"
      ]),
      corretora: primeiroValor(p, ["corretora_nome", "corretora"]),
      seguradora: primeiroValor(p, ["seguradora_nome", "seguradora"]),
      produto: primeiroValor(p, ["produto_nome", "produto", "ramo"]),
      premio: primeiroValor(p, ["premio_total", "valor_total", "valor"]),
      vigenciaInicio: primeiroValor(p, [
        "vigencia_inicio",
        "inicio_vigencia",
        "data_inicio"
      ]),
      vigenciaFim: primeiroValor(p, [
        "vigencia_fim",
        "fim_vigencia",
        "data_fim"
      ]),
      formaPagamento: primeiroValor(p, [
        "forma_pagamento",
        "pagamento",
        "condicao_pagamento"
      ]),
      observacoes: primeiroValor(p, [
        "observacoes",
        "observacao",
        "descricao",
        "detalhes"
      ]),
      status: primeiroValor(p, ["status"]),
      criadoEm: primeiroValor(p, ["criado_em", "created_at"]),
      atualizadoEm: primeiroValor(p, ["atualizado_em", "updated_at"])
    };
  }, [proposta]);

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-100 p-6 text-neutral-900">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-10 shadow-sm">
          Carregando proposta...
        </div>
      </main>
    );
  }

  if (erro) {
    return (
      <main className="min-h-screen bg-neutral-100 p-6 text-neutral-900">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-10 shadow-sm">
          <p className="text-red-600">{erro}</p>
        </div>
      </main>
    );
  }

  if (!proposta) {
    return (
      <main className="min-h-screen bg-neutral-100 p-6 text-neutral-900">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-10 shadow-sm">
          Proposta não encontrada.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 p-4 text-neutral-900 print:bg-white print:p-0">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white shadow-sm print:max-w-none print:rounded-none print:shadow-none">
        <div className="border-b border-neutral-200 px-6 py-5 print:hidden">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => window.print()}
              className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Imprimir / Salvar em PDF
            </button>

            <button
              onClick={() => window.history.back()}
              className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
            >
              Voltar
            </button>
          </div>
        </div>

        <div className="px-8 py-10 print:px-8 print:py-8">
          <header className="border-b border-neutral-200 pb-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
                  SegMax
                </p>
                <h1 className="mt-2 text-3xl font-bold text-neutral-950">
                  Proposta Executiva
                </h1>
                <p className="mt-2 text-sm text-neutral-600">
                  Documento gerado para apresentação comercial e validação operacional.
                </p>
              </div>

              <div className="min-w-[220px] rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm">
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  Número da proposta
                </p>
                <p className="mt-1 font-semibold text-neutral-900">
                  {dados.numero || "-"}
                </p>

                <p className="mt-4 text-xs uppercase tracking-wide text-neutral-500">
                  Emissão
                </p>
                <p className="mt-1 font-medium text-neutral-900">
                  {formatarDataCurta(String(dados.criadoEm || ""))}
                </p>
              </div>
            </div>
          </header>

          <section className="grid gap-6 border-b border-neutral-200 py-8 md:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 p-5">
              <h2 className="text-base font-bold text-neutral-950">
                Dados do cliente
              </h2>

              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <p className="text-neutral-500">Cliente</p>
                  <p className="font-medium text-neutral-900">{dados.cliente || "-"}</p>
                </div>

                <div>
                  <p className="text-neutral-500">Documento</p>
                  <p className="font-medium text-neutral-900">{dados.documento || "-"}</p>
                </div>

                <div>
                  <p className="text-neutral-500">Corretora</p>
                  <p className="font-medium text-neutral-900">{dados.corretora || "-"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 p-5">
              <h2 className="text-base font-bold text-neutral-950">
                Dados do seguro
              </h2>

              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <p className="text-neutral-500">Seguradora</p>
                  <p className="font-medium text-neutral-900">{dados.seguradora || "-"}</p>
                </div>

                <div>
                  <p className="text-neutral-500">Produto / Ramo</p>
                  <p className="font-medium text-neutral-900">{dados.produto || "-"}</p>
                </div>

                <div>
                  <p className="text-neutral-500">Status atual</p>
                  <p className="font-medium text-neutral-900">{dados.status || "-"}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 border-b border-neutral-200 py-8 md:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 p-5">
              <p className="text-sm text-neutral-500">Valor total</p>
              <p className="mt-2 text-2xl font-bold text-neutral-950">
                {formatarMoeda(dados.premio)}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 p-5">
              <p className="text-sm text-neutral-500">Início da vigência</p>
              <p className="mt-2 text-lg font-semibold text-neutral-950">
                {formatarDataCurta(String(dados.vigenciaInicio || ""))}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 p-5">
              <p className="text-sm text-neutral-500">Fim da vigência</p>
              <p className="mt-2 text-lg font-semibold text-neutral-950">
                {formatarDataCurta(String(dados.vigenciaFim || ""))}
              </p>
            </div>
          </section>

          <section className="border-b border-neutral-200 py-8">
            <h2 className="text-base font-bold text-neutral-950">
              Condições comerciais
            </h2>

            <div className="mt-4 rounded-2xl border border-neutral-200 p-5 text-sm">
              <div>
                <p className="text-neutral-500">Forma de pagamento</p>
                <p className="mt-1 font-medium text-neutral-900">
                  {dados.formaPagamento || "-"}
                </p>
              </div>
            </div>
          </section>

          <section className="border-b border-neutral-200 py-8">
            <h2 className="text-base font-bold text-neutral-950">
              Observações
            </h2>

            <div className="mt-4 min-h-[140px] rounded-2xl border border-neutral-200 p-5 text-sm leading-6 text-neutral-800">
              {dados.observacoes || "Sem observações adicionais registradas até o momento."}
            </div>
          </section>

          <section className="py-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="text-sm text-neutral-500">Atualizado em</p>
                <p className="mt-2 font-medium text-neutral-900">
                  {formatarData(String(dados.atualizadoEm || ""))}
                </p>
              </div>

              <div>
                <p className="text-sm text-neutral-500">Assinatura / validação</p>
                <div className="mt-8 border-t border-neutral-400 pt-2 text-sm text-neutral-700">
                  Responsável pela análise
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}