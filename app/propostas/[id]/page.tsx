"use client";

import { useEffect, useState } from "react";
import PropostaLinkPublico from "@/components/propostas/proposta-link-publico";
import PropostaAcoes from "@/components/propostas/proposta-acoes";
import type { PropostaExecutivaRegistro } from "@/types/proposta-executiva";

type ApiResponse = {
  proposta: PropostaExecutivaRegistro;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatMoney(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "—";

  const numero =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[^\d,.-]/g, "").replace(",", "."));

  if (Number.isNaN(numero)) return String(value);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numero);
}

function statusLabel(status?: string | null) {
  switch (status) {
    case "rascunho":
      return "Rascunho";
    case "pronta":
      return "Pronta";
    case "enviada":
      return "Enviada";
    case "visualizada":
      return "Visualizada";
    case "aprovada":
      return "Aprovada";
    case "recusada":
      return "Recusada";
    case "cancelada":
      return "Cancelada";
    default:
      return "Sem status";
  }
}

export default function PropostaInternaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [proposta, setProposta] = useState<PropostaExecutivaRegistro | null>(null);

  useEffect(() => {
    params.then((value) => setId(value.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;

    async function carregar() {
      try {
        setLoading(true);
        setErro("");

        const response = await fetch(`/api/propostas/${id}`, {
          cache: "no-store",
        });

        const json = await response.json();

        if (!response.ok) {
          setErro(json?.error || "Não foi possível carregar a proposta.");
          return;
        }

        const data = json as ApiResponse;
        setProposta(data.proposta);
      } catch {
        setErro("Erro ao carregar a proposta.");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07111f] text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-2xl font-semibold">Carregando proposta...</div>
          <p className="mt-3 text-white/60">Aguarde alguns segundos.</p>
        </div>
      </main>
    );
  }

  if (erro || !proposta) {
    return (
      <main className="min-h-screen bg-[#07111f] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-2xl font-bold">Proposta não encontrada</h1>
          <p className="mt-3 text-white/70">{erro || "Registro indisponível."}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1728] to-[#08101c] p-6 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/80">
                SegMax Consultoria
              </p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                {proposta.titulo_documento || "Proposta Executiva"}
              </h1>
              <p className="mt-2 text-white/70">
                {proposta.subtitulo_documento || "Documento comercial gerado pela plataforma."}
              </p>
            </div>

            <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100">
              {statusLabel(proposta.status)}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Resumo da proposta</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Info label="Número da proposta" value={proposta.numero_proposta || "—"} />
                <Info label="Status" value={statusLabel(proposta.status)} />
                <Info label="Cliente" value={proposta.cliente_nome || "—"} />
                <Info label="Empresa" value={proposta.cliente_empresa || "—"} />
                <Info label="Contato" value={proposta.cliente_contato || "—"} />
                <Info label="E-mail" value={proposta.cliente_email || "—"} />
                <Info label="Telefone" value={proposta.cliente_telefone || "—"} />
                <Info label="Corretora" value={proposta.corretora_nome || "—"} />
                <Info label="Responsável" value={proposta.corretora_responsavel || "—"} />
                <Info label="Seguradora" value={proposta.seguradora_nome || "—"} />
                <Info label="Ramo" value={proposta.ramo_seguro || "—"} />
                <Info label="Objeto segurado" value={proposta.objeto_segurado || "—"} />
                <Info
                  label="Importância segurada"
                  value={formatMoney(proposta.importancia_segurada)}
                />
              </div>
            </div>

            <PropostaLinkPublico token={proposta.token_publico} />
          </section>

          <aside className="space-y-6">
            <PropostaAcoes proposta={proposta} />

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Rastreamento</h2>

              <div className="mt-5 space-y-3">
                <MiniInfo label="Criada em" value={formatDate(proposta.created_at)} />
                <MiniInfo label="Atualizada em" value={formatDate(proposta.updated_at)} />
                <MiniInfo label="Visualizada em" value={formatDate(proposta.visualizada_em)} />
                <MiniInfo label="Aprovada em" value={formatDate(proposta.aprovada_em)} />
                <MiniInfo label="Recusada em" value={formatDate(proposta.recusada_em)} />
                <MiniInfo label="Encerrada em" value={formatDate(proposta.encerrada_em)} />
                <MiniInfo label="PDF gerado em" value={formatDate(proposta.pdf_gerado_em)} />
                <MiniInfo
                  label="WhatsApp enviado em"
                  value={formatDate(proposta.enviado_whatsapp_em)}
                />
                <MiniInfo
                  label="E-mail enviado em"
                  value={formatDate(proposta.enviado_email_em)}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-sm text-white/55">{label}</p>
      <p className="mt-1 font-medium text-white">{value}</p>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <span className="text-sm text-white/55">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}