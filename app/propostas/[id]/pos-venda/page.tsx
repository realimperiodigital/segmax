"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type PosVendaStatus =
  | "implantacao"
  | "em_acompanhamento"
  | "pendente"
  | "concluido"
  | "renovacao"
  | "cancelado";

type PosVendaRegistro = {
  id: string;
  proposta_id: string;
  status: PosVendaStatus;
  responsavel_nome: string | null;
  data_implantacao: string | null;
  data_primeiro_contato: string | null;
  data_renovacao_prevista: string | null;
  pendencias: string | null;
  observacoes: string | null;
  retorno_cliente: string | null;
  proxima_acao: string | null;
  criado_em: string;
  atualizado_em: string;
};

const STATUS_OPTIONS: { value: PosVendaStatus; label: string }[] = [
  { value: "implantacao", label: "Implantação" },
  { value: "em_acompanhamento", label: "Em acompanhamento" },
  { value: "pendente", label: "Pendente" },
  { value: "concluido", label: "Concluído" },
  { value: "renovacao", label: "Renovação" },
  { value: "cancelado", label: "Cancelado" },
];

function toInputDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export default function PosVendaPage() {
  const params = useParams<{ id: string }>();
  const propostaId = String(params?.id || "");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [form, setForm] = useState<PosVendaRegistro>({
    id: "",
    proposta_id: propostaId,
    status: "implantacao",
    responsavel_nome: "",
    data_implantacao: "",
    data_primeiro_contato: "",
    data_renovacao_prevista: "",
    pendencias: "",
    observacoes: "",
    retorno_cliente: "",
    proxima_acao: "",
    criado_em: "",
    atualizado_em: "",
  });

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        setErro("");

        const response = await fetch(`/api/propostas/${propostaId}/pos-venda`, {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Erro ao carregar pós-venda.");
        }

        const data = result.data as PosVendaRegistro;

        setForm({
          ...data,
          data_implantacao: toInputDate(data.data_implantacao),
          data_primeiro_contato: toInputDate(data.data_primeiro_contato),
          data_renovacao_prevista: toInputDate(data.data_renovacao_prevista),
          responsavel_nome: data.responsavel_nome || "",
          pendencias: data.pendencias || "",
          observacoes: data.observacoes || "",
          retorno_cliente: data.retorno_cliente || "",
          proxima_acao: data.proxima_acao || "",
        });
      } catch (error) {
        setErro(error instanceof Error ? error.message : "Erro inesperado.");
      } finally {
        setLoading(false);
      }
    }

    if (propostaId) carregar();
  }, [propostaId]);

  function updateField(field: keyof PosVendaRegistro, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setErro("");
      setSucesso("");

      const response = await fetch(`/api/propostas/${propostaId}/pos-venda`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: form.status,
          responsavel_nome: form.responsavel_nome || null,
          data_implantacao: form.data_implantacao || null,
          data_primeiro_contato: form.data_primeiro_contato || null,
          data_renovacao_prevista: form.data_renovacao_prevista || null,
          pendencias: form.pendencias || null,
          observacoes: form.observacoes || null,
          retorno_cliente: form.retorno_cliente || null,
          proxima_acao: form.proxima_acao || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Erro ao salvar pós-venda.");
      }

      setSucesso("Pós-venda atualizado com sucesso.");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060816] text-white">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            Carregando pós-venda...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060816] text-white">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
                SegMax CRM
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight">
                Pós-venda da proposta
              </h1>
              <p className="mt-2 text-sm text-zinc-400">
                Controle operacional após aprovação, emissão e implantação.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/propostas/${propostaId}`}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
              >
                Voltar para proposta
              </Link>

              <Link
                href="/propostas"
                className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/20"
              >
                Central de Propostas
              </Link>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {erro ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {erro}
            </div>
          ) : null}

          {sucesso ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              {sucesso}
            </div>
          ) : null}

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Controle operacional</h2>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-zinc-300">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-slate-900">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">Responsável</label>
                <input
                  value={form.responsavel_nome || ""}
                  onChange={(e) => updateField("responsavel_nome", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none"
                  placeholder="Responsável pelo pós-venda"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">Data implantação</label>
                <input
                  type="date"
                  value={form.data_implantacao || ""}
                  onChange={(e) => updateField("data_implantacao", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">Primeiro contato</label>
                <input
                  type="date"
                  value={form.data_primeiro_contato || ""}
                  onChange={(e) => updateField("data_primeiro_contato", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-zinc-300">Renovação prevista</label>
                <input
                  type="date"
                  value={form.data_renovacao_prevista || ""}
                  onChange={(e) => updateField("data_renovacao_prevista", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Gestão do relacionamento</h2>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <div>
                <label className="mb-2 block text-sm text-zinc-300">Pendências</label>
                <textarea
                  rows={4}
                  value={form.pendencias || ""}
                  onChange={(e) => updateField("pendencias", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none"
                  placeholder="Pendências atuais"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">Observações</label>
                <textarea
                  rows={4}
                  value={form.observacoes || ""}
                  onChange={(e) => updateField("observacoes", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none"
                  placeholder="Observações operacionais"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">Retorno do cliente</label>
                <textarea
                  rows={4}
                  value={form.retorno_cliente || ""}
                  onChange={(e) => updateField("retorno_cliente", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none"
                  placeholder="Feedback do cliente"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">Próxima ação</label>
                <textarea
                  rows={4}
                  value={form.proxima_acao || ""}
                  onChange={(e) => updateField("proxima_acao", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none"
                  placeholder="Qual é o próximo passo"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">Controle do registro</h2>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 text-sm">
              <div>
                <p className="text-zinc-500">Criado em</p>
                <p className="mt-1 font-medium text-white">{formatDate(form.criado_em)}</p>
              </div>
              <div>
                <p className="text-zinc-500">Atualizado em</p>
                <p className="mt-1 font-medium text-white">{formatDate(form.atualizado_em)}</p>
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-70"
            >
              {saving ? "Salvando..." : "Salvar pós-venda"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}