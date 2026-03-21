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
      email: primeiroValor(p, ["cliente_email", "email"]),
      telefone: primeiroValor(p, ["cliente_telefone", "telefone", "celular"]),
      corretora: primeiroValor(p, ["corretora_nome", "corretora"]),
      corretoraCnpj: primeiroValor(p, ["corretora_cnpj", "cnpj_corretora"]),
      corretoraEmail: primeiroValor(p, [
        "corretora_email",
        "email_corretora"
      ]),
      corretoraTelefone: primeiroValor(p, [
        "corretora_telefone",
        "telefone_corretora"
      ]),
      corretoraLogoUrl: primeiroValor(p, [
        "corretora_logo_url",
        "logo_url",
        "logo"
      ]),
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
      parcelas: primeiroValor(p, ["parcelas", "qtd_parcelas"]),
      franquia: primeiroValor(p, ["franquia"]),
      cobertura: primeiroValor(p, [
        "cobertura",
        "coberturas",
        "tipo_cobertura"
      ]),
      observacoes: primeiroValor(p, [
        "observacoes",
        "observacao",
        "descricao",
        "detalhes"
      ]),
      parecerTecnico: primeiroValor(p, [
        "parecer_tecnico",
        "analise_tecnica",
        "observacao_tecnica"
      ]),
      responsavelAnalise: primeiroValor(p, [
        "responsavel_analise",
        "analista_nome",
        "usuario_nome"
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
          <header className="border-b border-neutral-200 pb-8">
            <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="flex items-center gap-4">
                  {dados.corretoraLogoUrl ? (
                    <img
                      src={String(dados.corretoraLogoUrl)}
                      alt="Logo da corretora"
                      className="h-16 w-auto max-w-[180px] object-contain"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 text-sm font-bold text-white">
                      SG
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">
                      SegMax
                    </p>
                    <h1 className="mt-1 text-3xl font-bold text-neutral-950">
                      Proposta Executiva
                    </h1>
                    <p className="mt-2 text-sm text-neutral-600">
                      Documento comercial para apresentação, análise e validação operacional.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-500">
                    Número da proposta
                  </p>
                  <p className="mt-1 font-semibold text-neutral-900">
                    {dados.numero || "-"}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wide text-neutral-500">
                    Data de emissão
                  </p>
                  <p className="mt-1 font-medium text-neutral-900">
                    {formatarDataCurta(String(dados.criadoEm || ""))}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wide text-neutral-500">
                    Status atual
                  </p>
                  <p className="mt-1 font-medium text-neutral-900">
                    {dados.status || "-"}
                  </p>
                </div>
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
                  <p className="font-medium text-neutral-900">
                    {dados.cliente || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-neutral-500">Documento</p>
                  <p className="font-medium text-neutral-900">
                    {dados.documento || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-neutral-500">E-mail</p>
                  <p className="font-medium text-neutral-900">
                    {dados.email || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-neutral-500">Telefone</p>
                  <p className="font-medium text-neutral-900">
                    {dados.telefone || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 p-5">
              <h2 className="text-base font-bold text-neutral-950">
                Dados da corretora
              </h2>

              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <p className="text-neutral-500">Corretora</p>
                  <p className="font-medium text-neutral-900">
                    {dados.corretora || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-neutral-500">CNPJ</p>
                  <p className="font-medium text-neutral-900">
                    {dados.corretoraCnpj || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-neutral-500">E-mail</p>
                  <p className="font-medium text-neutral-900">
                    {dados.corretoraEmail || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-neutral-500">Telefone</p>
                  <p className="font-medium text-neutral-900">
                    {dados.corretoraTelefone || "-"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 border-b border-neutral-200 py-8 md:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 p-5">
              <h2 className="text-base font-bold text-neutral-950">
                Dados do seguro
              </h2>

              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <p className="text-neutral-500">Seguradora</p>
                  <p className="font-medium text-neutral-900">
                    {dados.seguradora || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-neutral-500">Produto / ramo</p>
                  <p className="font-medium text-neutral-900">
                    {dados.produto || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-neutral-500">Cobertura</p>
                  <p className="font-medium text-neutral-900">
                    {dados.cobertura || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-neutral-500">Franquia</p>
                  <p className="font-medium text-neutral-900">
                    {dados.franquia || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 p-5">
              <h2 className="text-base font-bold text-neutral-950">
                Condições comerciais
              </h2>

              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <p className="text-neutral-500">Valor total</p>
                  <p className="text-xl font-bold text-neutral-950">
                    {formatarMoeda(dados.premio)}
                  </p>
                </div>

                <div>
                  <p className="text-neutral-500">Forma de pagamento</p>
                  <p className="font-medium text-neutral-900">
                    {dados.formaPagamento || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-neutral-500">Parcelamento</p>
                  <p className="font-medium text-neutral-900">
                    {dados.parcelas || "-"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-neutral-500">Início da vigência</p>
                    <p className="font-medium text-neutral-900">
                      {formatarDataCurta(String(dados.vigenciaInicio || ""))}
                    </p>
                  </div>

                  <div>
                    <p className="text-neutral-500">Fim da vigência</p>
                    <p className="font-medium text-neutral-900">
                      {formatarDataCurta(String(dados.vigenciaFim || ""))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-neutral-200 py-8">
            <h2 className="text-base font-bold text-neutral-950">
              Resumo executivo
            </h2>

            <div className="mt-4 rounded-2xl border border-neutral-200 p-5 text-sm leading-7 text-neutral-800">
              Esta proposta foi estruturada para apresentação comercial com base
              nas informações disponíveis no sistema, contemplando dados do
              cliente, corretora, seguradora, condições comerciais e apoio à
              decisão operacional.
            </div>
          </section>

          <section className="border-b border-neutral-200 py-8">
            <h2 className="text-base font-bold text-neutral-950">
              Observações gerais
            </h2>

            <div className="mt-4 min-h-[140px] rounded-2xl border border-neutral-200 p-5 text-sm leading-7 text-neutral-800">
              {dados.observacoes || "Sem observações adicionais registradas até o momento."}
            </div>
          </section>

          <section className="border-b border-neutral-200 py-8">
            <h2 className="text-base font-bold text-neutral-950">
              Parecer técnico
            </h2>

            <div className="mt-4 min-h-[180px] rounded-2xl border border-neutral-200 p-5 text-sm leading-7 text-neutral-800">
              {dados.parecerTecnico || "Parecer técnico ainda não preenchido no sistema."}
            </div>
          </section>

          <section className="py-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-2xl border border-neutral-200 p-5">
                <p className="text-sm text-neutral-500">Atualizado em</p>
                <p className="mt-2 font-medium text-neutral-900">
                  {formatarData(String(dados.atualizadoEm || ""))}
                </p>

                <div className="mt-6">
                  <p className="text-sm text-neutral-500">Responsável pela análise</p>
                  <p className="mt-2 font-medium text-neutral-900">
                    {dados.responsavelAnalise || "Ana Paula"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 p-5">
                <p className="text-sm text-neutral-500">Validação</p>

                <div className="mt-12 border-t border-neutral-400 pt-2 text-sm text-neutral-700">
                  Assinatura do responsável técnico
                </div>

                <div className="mt-8 border-t border-neutral-300 pt-2 text-sm text-neutral-600">
                  SegMax Consultoria
                </div>
              </div>
            </div>
          </section>

          <footer className="border-t border-neutral-200 pt-6 text-xs leading-6 text-neutral-500">
            Documento gerado pelo sistema SegMax CRM. Esta proposta deve ser
            validada operacionalmente antes do envio final ao corretor ou cliente.
          </footer>
        </div>
      </div>
    </main>
  );
}