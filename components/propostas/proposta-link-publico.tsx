"use client";

import { useMemo, useState } from "react";

type PropostaLinkPublicoProps = {
  token: string | null;
  fallbackBaseUrl?: string;
};

export default function PropostaLinkPublico({
  token,
  fallbackBaseUrl,
}: PropostaLinkPublicoProps) {
  const [copiado, setCopiado] = useState(false);

  const link = useMemo(() => {
    if (!token) return "";

    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : fallbackBaseUrl || process.env.NEXT_PUBLIC_APP_URL || "";

    return `${base}/proposta/${token}`;
  }, [token, fallbackBaseUrl]);

  async function copiar() {
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);

      setTimeout(() => {
        setCopiado(false);
      }, 2000);
    } catch {
      setCopiado(false);
    }
  }

  if (!token) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
        Esta proposta ainda não possui token público.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-xl font-semibold text-white">Link público</h2>
      <p className="mt-2 text-sm text-white/65">
        Copie o link abaixo para enviar ao cliente acompanhar a proposta.
      </p>

      <div className="mt-5 flex flex-col gap-3 md:flex-row">
        <input
          readOnly
          value={link}
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
        />

        <button
          onClick={copiar}
          className="rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:opacity-90"
        >
          {copiado ? "Copiado" : "Copiar link"}
        </button>
      </div>
    </div>
  );
}