"use client";

import { useState } from "react";
import { gerarPdfProposta } from "@/lib/proposta-pdf";

type PropostaAcoesProps = {
  proposta: {
    id: string;
    numero_proposta?: string | null;
    titulo_documento?: string | null;
    subtitulo_documento?: string | null;
    status?: string | null;

    cliente_nome?: string | null;
    cliente_email?: string | null;
    cliente_telefone?: string | null;
    cliente_empresa?: string | null;

    corretora_nome?: string | null;
    corretora_responsavel?: string | null;
    corretora_email?: string | null;
    corretora_telefone?: string | null;

    seguradora_nome?: string | null;
    ramo_seguro?: string | null;
    objeto_segurado?: string | null;
    importancia_segurada?: string | number | null;

    observacoes_cliente?: string | null;
    motivo_recusa?: string | null;

    created_at?: string | null;
    updated_at?: string | null;
  };
};

export default function PropostaAcoes({ proposta }: PropostaAcoesProps) {
  const [loading, setLoading] = useState<"" | "pdf" | "whatsapp" | "email">("");

  async function registrar(tipo: "pdf" | "whatsapp" | "email") {
    try {
      await fetch(`/api/propostas/${proposta.id}/registrar-acao`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tipo }),
      });
    } catch {
      // silencioso de propósito
    }
  }

  async function gerarPdf() {
    setLoading("pdf");
    gerarPdfProposta(proposta);
    await registrar("pdf");
    setLoading("");
  }

  async function abrirWhatsapp() {
    setLoading("whatsapp");

    const mensagem =
      `Olá${proposta.cliente_nome ? ` ${proposta.cliente_nome}` : ""}, tudo bem?\n\n` +
      `Segue sua proposta ${proposta.numero_proposta || ""} da SegMax.\n` +
      `Título: ${proposta.titulo_documento || "Proposta Executiva"}\n` +
      `Seguradora: ${proposta.seguradora_nome || "Não informada"}\n` +
      `Ramo: ${proposta.ramo_seguro || "Não informado"}\n\n` +
      `Fico à disposição para qualquer ajuste.`;

    const telefone = String(proposta.cliente_telefone || "").replace(/\D/g, "");
    const url = telefone
      ? `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`
      : `https://wa.me/?text=${encodeURIComponent(mensagem)}`;

    await registrar("whatsapp");
    window.open(url, "_blank");
    setLoading("");
  }

  async function abrirEmail() {
    setLoading("email");

    const assunto = `Proposta ${proposta.numero_proposta || ""} - SegMax`;
    const corpo =
      `Olá${proposta.cliente_nome ? ` ${proposta.cliente_nome}` : ""},\n\n` +
      `Segue sua proposta executiva.\n\n` +
      `Título: ${proposta.titulo_documento || "Proposta Executiva"}\n` +
      `Seguradora: ${proposta.seguradora_nome || "Não informada"}\n` +
      `Ramo: ${proposta.ramo_seguro || "Não informado"}\n\n` +
      `Permanecemos à disposição.\n\n` +
      `${proposta.corretora_nome || "SegMax Consultoria"}`;

    const url =
      `mailto:${proposta.cliente_email || ""}` +
      `?subject=${encodeURIComponent(assunto)}` +
      `&body=${encodeURIComponent(corpo)}`;

    await registrar("email");
    window.location.href = url;
    setLoading("");
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-xl font-semibold text-white">Ações da proposta</h2>
      <p className="mt-2 text-sm text-white/65">
        Gere o PDF profissional ou abra os canais de envio com a mensagem pronta.
      </p>

      <div className="mt-5 grid gap-3">
        <button
          onClick={gerarPdf}
          disabled={loading !== ""}
          className="rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading === "pdf" ? "Gerando PDF..." : "Gerar PDF profissional"}
        </button>

        <button
          onClick={abrirWhatsapp}
          disabled={loading !== ""}
          className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 font-semibold text-emerald-100 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading === "whatsapp" ? "Abrindo WhatsApp..." : "Enviar por WhatsApp"}
        </button>

        <button
          onClick={abrirEmail}
          disabled={loading !== ""}
          className="rounded-2xl border border-blue-500/40 bg-blue-500/10 px-4 py-3 font-semibold text-blue-100 transition hover:bg-blue-500/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading === "email" ? "Abrindo e-mail..." : "Enviar por e-mail"}
        </button>
      </div>
    </div>
  );
}