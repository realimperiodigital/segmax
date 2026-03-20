"use client";

import { useEffect, useState } from "react";

type LinhaCobertura = {
  id: string;
  cobertura: string;
  descricao: string;
  limite: string;
  franquia: string;
  observacoes: string;
};

type PropostaPublica = {
  id: string;
  numero_proposta: string;
  titulo_documento: string;
  subtitulo_documento: string | null;
  status: string;
  etapa_atual: string | null;

  cliente_nome: string | null;
  cliente_documento: string | null;
  cliente_empresa: string | null;
  cliente_contato: string | null;
  cliente_email: string | null;
  cliente_telefone: string | null;
  cliente_endereco: string | null;

  corretora_nome: string | null;
  corretora_responsavel: string | null;
  corretora_email: string | null;
  corretora_telefone: string | null;

  seguradora_nome: string | null;
  ramo_seguro: string | null;
  objeto_segurado: string | null;
  importancia_segurada: string | null;
  premio_liquido: string | null;
  premio_total: string | null;
  forma_pagamento: string | null;
  vigencia_inicio: string | null;
  vigencia_fim: string | null;

  data_emissao: string | null;
  validade: string | null;

  resumo_executivo: string | null;
  analise_risco: string | null;
  parecer_tecnico: string | null;
  consideracoes_gerais: string | null;
  clausulas_importantes: string | null;
  proximos_passos: string | null;

  coberturas: LinhaCobertura[] | null;
};

export default function PropostaPublicaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [token, setToken] = useState("");
  const [proposta, setProposta] = useState<PropostaPublica | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [observacao, setObservacao] = useState("");
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    async function resolver() {
      const p = await params;
      setToken(p.token);
    }
    resolver();
  }, [params]);

  useEffect(() => {
    if (!token) return;
    carregar();
  }, [token]);

  async function carregar() {
    setCarregando(true);
    setMensagem("");

    const res = await fetch(`/api/proposta-publica/${token}`, {
      method: "GET",
      cache: "no-store",
    });

    const json = await res.json();

    if (!res.ok) {
      setMensagem(json?.error || "Não foi possível carregar a proposta.");
      setCarregando(false);
      return;
    }

    setProposta(json.proposta);
    setCarregando(false);
  }

  async function acaoPublica(acao: "aceitar" | "recusar") {
    setProcessando(true);
    setMensagem("");

    const res = await fetch(`/api/proposta-publica/${token}/acao`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ acao, observacao }),
    });

    const json = await res.json();

    if (!res.ok) {
      setMensagem(json?.error || "Não foi possível concluir a ação.");
      setProcessando(false);
      return;
    }

    setMensagem(json?.mensagem || "Ação concluída com sucesso.");
    await carregar();
    setProcessando(false);
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-zinc-100 px-4 py-10">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-10 shadow-sm">
          <p className="text-sm text-zinc-500">Carregando proposta...</p>
        </div>
      </main>
    );
  }

  if (!proposta) {
    return (
      <main className="min-h-screen bg-zinc-100 px-4 py-10">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-10 shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-900">Proposta não encontrada</h1>
          <p className="mt-3 text-sm text-zinc-600">{mensagem || "Link inválido ou inativo."}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[32px] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-600">
                {proposta.corretora_nome || "SegMax Consultoria"}
              </p>
              <h1 className="mt-3 text-3xl font-bold">{proposta.titulo_documento}</h1>
              <p className="mt-2 text-sm text-zinc-600">
                {proposta.subtitulo_documento || "-"}
              </p>
            </div>

            <div className="min-w-[240px] rounded-3xl border border-zinc-200 bg-zinc-50 p-4 text-sm">
              <p><span className="font-semibold">Proposta:</span> {proposta.numero_proposta}</p>
              <p className="mt-2"><span className="font-semibold">Emissão:</span> {proposta.data_emissao || "-"}</p>
              <p className="mt-2"><span className="font-semibold">Validade:</span> {proposta.validade || "-"}</p>
              <p className="mt-2"><span className="font-semibold">Status:</span> {proposta.status || "-"}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="text-lg font-bold">1. Identificação</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-zinc-200 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Cliente</p>
              <div className="mt-3 space-y-2 text-sm">
                <p><span className="font-semibold">Nome:</span> {proposta.cliente_nome || "-"}</p>
                <p><span className="font-semibold">Documento:</span> {proposta.cliente_documento || "-"}</p>
                <p><span className="font-semibold">Empresa:</span> {proposta.cliente_empresa || "-"}</p>
                <p><span className="font-semibold">Contato:</span> {proposta.cliente_contato || "-"}</p>
                <p><span className="font-semibold">E-mail:</span> {proposta.cliente_email || "-"}</p>
                <p><span className="font-semibold">Telefone:</span> {proposta.cliente_telefone || "-"}</p>
                <p><span className="font-semibold">Endereço:</span> {proposta.cliente_endereco || "-"}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Intermediação</p>
              <div className="mt-3 space-y-2 text-sm">
                <p><span className="font-semibold">Corretora:</span> {proposta.corretora_nome || "-"}</p>
                <p><span className="font-semibold">Responsável:</span> {proposta.corretora_responsavel || "-"}</p>
                <p><span className="font-semibold">E-mail:</span> {proposta.corretora_email || "-"}</p>
                <p><span className="font-semibold">Telefone:</span> {proposta.corretora_telefone || "-"}</p>
                <p><span className="font-semibold">Seguradora:</span> {proposta.seguradora_nome || "-"}</p>
                <p><span className="font-semibold">Ramo:</span> {proposta.ramo_seguro || "-"}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="text-lg font-bold">2. Resumo Executivo</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-700">
            {proposta.resumo_executivo || "-"}
          </p>
        </section>

        <section className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="text-lg font-bold">3. Enquadramento da Operação</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-zinc-200 p-5 text-sm">
              <p><span className="font-semibold">Objeto segurado:</span> {proposta.objeto_segurado || "-"}</p>
              <p className="mt-3"><span className="font-semibold">Importância segurada:</span> {proposta.importancia_segurada || "-"}</p>
              <p className="mt-3"><span className="font-semibold">Vigência:</span> {proposta.vigencia_inicio || "-"} até {proposta.vigencia_fim || "-"}</p>
            </div>

            <div className="rounded-3xl border border-zinc-200 p-5 text-sm">
              <p><span className="font-semibold">Prêmio líquido:</span> {proposta.premio_liquido || "-"}</p>
              <p className="mt-3"><span className="font-semibold">Prêmio total:</span> {proposta.premio_total || "-"}</p>
              <p className="mt-3"><span className="font-semibold">Pagamento:</span> {proposta.forma_pagamento || "-"}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="text-lg font-bold">4. Análise de Risco</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-700">
            {proposta.analise_risco || "-"}
          </p>
        </section>

        <section className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="text-lg font-bold">5. Coberturas Sugeridas</h2>

          <div className="mt-4 overflow-hidden rounded-3xl border border-zinc-200">
            <div className="grid grid-cols-12 border-b border-zinc-200 bg-zinc-50 text-xs font-bold uppercase tracking-[0.12em] text-zinc-600">
              <div className="col-span-3 px-4 py-3">Cobertura</div>
              <div className="col-span-4 px-4 py-3">Descrição</div>
              <div className="col-span-2 px-4 py-3">Limite</div>
              <div className="col-span-1 px-4 py-3">Franquia</div>
              <div className="col-span-2 px-4 py-3">Observações</div>
            </div>

            {(proposta.coberturas || []).map((item, idx, arr) => (
              <div
                key={item.id}
                className={`grid grid-cols-12 text-sm ${idx !== arr.length - 1 ? "border-b border-zinc-200" : ""}`}
              >
                <div className="col-span-3 px-4 py-4 font-semibold">{item.cobertura || "-"}</div>
                <div className="col-span-4 px-4 py-4 text-zinc-700">{item.descricao || "-"}</div>
                <div className="col-span-2 px-4 py-4">{item.limite || "-"}</div>
                <div className="col-span-1 px-4 py-4">{item.franquia || "-"}</div>
                <div className="col-span-2 px-4 py-4 text-zinc-700">{item.observacoes || "-"}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="text-lg font-bold">6. Parecer Técnico</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-700">
            {proposta.parecer_tecnico || "-"}
          </p>
        </section>

        <section className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="text-lg font-bold">7. Considerações Gerais</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-700">
            {proposta.consideracoes_gerais || "-"}
          </p>
        </section>

        <section className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="text-lg font-bold">8. Cláusulas Importantes</h2>
          <div className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-700">
            {proposta.clausulas_importantes || "-"}
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="text-lg font-bold">9. Próximos Passos</h2>
          <div className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-700">
            {proposta.proximos_passos || "-"}
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="text-lg font-bold">10. Decisão</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Caso deseje, você pode registrar a decisão por aqui. Isso atualiza o CRM automaticamente.
          </p>

          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            rows={4}
            placeholder="Observação opcional"
            className="mt-4 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => acaoPublica("aceitar")}
              disabled={processando}
              className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
            >
              {processando ? "Processando..." : "Aprovar proposta"}
            </button>

            <button
              onClick={() => acaoPublica("recusar")}
              disabled={processando}
              className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white"
            >
              {processando ? "Processando..." : "Recusar proposta"}
            </button>
          </div>

          {mensagem ? (
            <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
              {mensagem}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}