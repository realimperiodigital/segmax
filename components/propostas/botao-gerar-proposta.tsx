"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PropostaExecutivaPayload } from "@/types/proposta-executiva";

type BotaoGerarPropostaProps = {
  payload: PropostaExecutivaPayload;
  className?: string;
};

export default function BotaoGerarProposta({
  payload,
  className,
}: BotaoGerarPropostaProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function gerarProposta() {
    try {
      setLoading(true);
      setErro("");

      const response = await fetch("/api/propostas/criar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok) {
        setErro(json?.error || "Não foi possível gerar a proposta.");
        return;
      }

      router.push(json.redirect_url || "/propostas");
      router.refresh();
    } catch {
      setErro("Erro ao gerar proposta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={gerarProposta}
        disabled={loading}
        className={
          className ||
          "rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {loading ? "Gerando proposta..." : "Gerar Proposta Executiva"}
      </button>

      {erro ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {erro}
        </div>
      ) : null}
    </div>
  );
}