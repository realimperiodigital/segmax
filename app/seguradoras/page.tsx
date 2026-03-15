"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Seguradora = {
  id: string;
  nome: string;
  nome_fantasia: string | null;
  site: string | null;
  status: "ativa" | "inativa" | "suspensa" | "bloqueada";
  observacoes_internas: string | null;
  email_principal: string | null;
  telefone_principal: string | null;
  whatsapp_principal: string | null;
  prazo_medio_retorno_horas: number | null;
  excluido: boolean;
};

const EMAILS_MASTER = [
  "segmaxconsultoria10@gmail.com",
  "tecmastersegmax@gmail.com",
  "alessandra.myryam26@gmail.com",
];

export default function SeguradorasPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [emailLogado, setEmailLogado] = useState("");
  const [seguradoras, setSeguradoras] = useState<Seguradora[]>([]);
  const [busca, setBusca] = useState("");

  const isMaster = useMemo(() => {
    return EMAILS_MASTER.includes(emailLogado.toLowerCase());
  }, [emailLogado]);

  async function carregarTudo() {
    setLoading(true);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      router.push("/login");
      return;
    }

    const email = (session.user.email || "").toLowerCase();
    setEmailLogado(email);

    const { data, error } = await supabase
      .from("seguradoras")
      .select(
        `
        id,
        nome,
        nome_fantasia,
        site,
        status,
        observacoes_internas,
        email_principal,
        telefone_principal,
        whatsapp_principal,
        prazo_medio_retorno_horas,
        excluido
      `
      )
      .eq("excluido", false)
      .order("nome", { ascending: true });

    if (!error && data) {
      setSeguradoras(data as Seguradora[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  async function alterarStatus(
    id: string,
    status: "ativa" | "inativa" | "suspensa" | "bloqueada"
  ) {
    if (!isMaster) {
      alert("Apenas os masters podem alterar seguradoras.");
      return;
    }

    const { error } = await supabase
      .from("seguradoras")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert("Não foi possível alterar o status.");
      return;
    }

    await carregarTudo();
  }

  async function excluirLogicamente(id: string) {
    if (!isMaster) {
      alert("Apenas os masters podem excluir seguradoras.");
      return;
    }

    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta seguradora?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("seguradoras")
      .update({ excluido: true })
      .eq("id", id);

    if (error) {
      alert("Não foi possível excluir a seguradora.");
      return;
    }

    await carregarTudo();
  }

  const seguradorasFiltradas = seguradoras.filter((seg) => {
    const texto = busca.trim().toLowerCase();
    if (!texto) return true;

    return (
      seg.nome?.toLowerCase().includes(texto) ||
      seg.nome_fantasia?.toLowerCase().includes(texto) ||
      seg.site?.toLowerCase().includes(texto) ||
      seg.email_principal?.toLowerCase().includes(texto) ||
      seg.telefone_principal?.toLowerCase().includes(texto) ||
      seg.whatsapp_principal?.toLowerCase().includes(texto) ||
      seg.status?.toLowerCase().includes(texto)
    );
  });

  function classeStatus(status: Seguradora["status"]) {
    if (status === "ativa") {
      return "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    }

    if (status === "suspensa") {
      return "border border-amber-500/30 bg-amber-500/10 text-amber-300";
    }

    if (status === "bloqueada") {
      return "border border-red-500/30 bg-red-500/10 text-red-300";
    }

    return "border border-zinc-600/30 bg-zinc-700/20 text-zinc-300";
  }

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/80">
              SegMax CRM
            </p>
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              Seguradoras
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Base estratégica das seguradoras focadas no nicho patrimonial.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:min-w-[360px]">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, site, email, telefone ou status..."
              className="w-full rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/60"
            />

            {isMaster ? (
              <div className="flex justify-end">
                <Link
                  href="/seguradoras/nova"
                  className="inline-flex items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20"
                >
                  + Nova Seguradora
                </Link>
              </div>
            ) : (
              <p className="text-right text-xs text-zinc-500">
                Apenas masters podem cadastrar novas seguradoras.
              </p>
            )}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Total
            </p>
            <p className="mt-2 text-3xl font-bold">{seguradoras.length}</p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Ativas
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-300">
              {seguradoras.filter((s) => s.status === "ativa").length}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Perfil logado
            </p>
            <p className="mt-2 text-lg font-semibold text-amber-300">
              {isMaster ? "Master autorizado" : "Acesso comum"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-8 text-center text-zinc-400">
            Carregando seguradoras...
          </div>
        ) : seguradorasFiltradas.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-8 text-center text-zinc-400">
            Nenhuma seguradora encontrada.
          </div>
        ) : (
          <div className="grid gap-5">
            {seguradorasFiltradas.map((seg) => (
              <div
                key={seg.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl shadow-black/20"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold text-white">
                        {seg.nome || "Sem nome"}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${classeStatus(
                          seg.status
                        )}`}
                      >
                        {seg.status}
                      </span>
                    </div>

                    {seg.nome_fantasia && (
                      <p className="mb-2 text-sm text-zinc-400">
                        Nome fantasia: {seg.nome_fantasia}
                      </p>
                    )}

                    {seg.site && (
                      <p className="mb-2 text-sm text-zinc-400">
                        Site: {seg.site}
                      </p>
                    )}

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
                        <p className="mb-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                          Email principal
                        </p>
                        <p className="text-sm text-zinc-200">
                          {seg.email_principal || "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
                        <p className="mb-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                          Telefone
                        </p>
                        <p className="text-sm text-zinc-200">
                          {seg.telefone_principal || "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
                        <p className="mb-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                          WhatsApp
                        </p>
                        <p className="text-sm text-zinc-200">
                          {seg.whatsapp_principal || "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
                        <p className="mb-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                          Prazo médio
                        </p>
                        <p className="text-sm text-zinc-200">
                          {seg.prazo_medio_retorno_horas
                            ? `${seg.prazo_medio_retorno_horas}h`
                            : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-zinc-800 bg-black/30 p-4">
                      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Observações internas
                      </p>
                      <p className="text-sm leading-6 text-zinc-300">
                        {seg.observacoes_internas || "Sem observações."}
                      </p>
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-3 xl:w-[240px]">
                    {isMaster ? (
                      <>
                        <Link
                          href={`/seguradoras/editar/${seg.id}`}
                          className="inline-flex items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
                        >
                          Editar
                        </Link>

                        <button
                          onClick={() => alterarStatus(seg.id, "ativa")}
                          className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                        >
                          Ativar
                        </button>

                        <button
                          onClick={() => alterarStatus(seg.id, "suspensa")}
                          className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20"
                        >
                          Suspender
                        </button>

                        <button
                          onClick={() => alterarStatus(seg.id, "bloqueada")}
                          className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                        >
                          Bloquear
                        </button>

                        <button
                          onClick={() => excluirLogicamente(seg.id)}
                          className="rounded-2xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-700/50"
                        >
                          Excluir lógico
                        </button>
                      </>
                    ) : (
                      <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4 text-sm text-zinc-500">
                        Você pode visualizar as seguradoras, mas apenas os
                        masters podem criar, editar ou alterar status.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}