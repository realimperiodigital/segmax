"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type {
  PropostaEtapa,
  PropostaExecutiva,
  PropostaStatus,
} from "@/types/proposta-executiva";

type FormState = {
  titulo: string;
  cliente_nome: string;
  cliente_documento: string;
  corretora_nome: string;
  seguradora_nome: string;
  responsavel_nome: string;
  tipo_seguro: string;
  categoria: string;
  status: PropostaStatus;
  etapa: PropostaEtapa;
  valor_premio: string;
  valor_franquia: string;
  valor_importancia_segurada: string;
  valor_comissao: string;
  vigencia_inicio: string;
  vigencia_fim: string;
  resumo_executivo: string;
  parecer_tecnico: string;
  observacoes_internas: string;
  observacoes_cliente: string;
  motivo_rejeicao: string;
};

const STATUS_OPTIONS: { value: PropostaStatus; label: string }[] = [
  { value: "rascunho", label: "Rascunho" },
  { value: "em_analise", label: "Em análise" },
  { value: "aguardando_aprovacao", label: "Aguardando aprovação" },
  { value: "aprovada", label: "Aprovada" },
  { value: "rejeitada", label: "Rejeitada" },
  { value: "cancelada", label: "Cancelada" },
  { value: "emitida", label: "Emitida" },
  { value: "pos_venda", label: "Pós-venda" },
];

const ETAPA_OPTIONS: { value: PropostaEtapa; label: string }[] = [
  { value: "criacao", label: "Criação" },
  { value: "analise", label: "Análise" },
  { value: "aprovacao", label: "Aprovação" },
  { value: "emissao", label: "Emissão" },
  { value: "implantacao", label: "Implantação" },
  { value: "pos_venda", label: "Pós-venda" },
];

function toInputDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function toInputNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function initialForm(): FormState {
  return {
    titulo: "",
    cliente_nome: "",
    cliente_documento: "",
    corretora_nome: "",
    seguradora_nome: "",
    responsavel_nome: "",
    tipo_seguro: "",
    categoria: "",
    status: "rascunho",
    etapa: "criacao",
    valor_premio: "",
    valor_franquia: "",
    valor_importancia_segurada: "",
    valor_comissao: "",
    vigencia_inicio: "",
    vigencia_fim: "",
    resumo_executivo: "",
    parecer_tecnico: "",
    observacoes_internas: "",
    observacoes_cliente: "",
    motivo_rejeicao: "",
  };
}

export default function EditarPropostaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const propostaId = String(params?.id || "");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [form, setForm] = useState<FormState>(initialForm());

  useEffect(() => {
    async function carregarProposta() {
      try {
        setLoading(true);
        setErro("");

        const response = await fetch(`/api/propostas/${propostaId}`, {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Erro ao carregar proposta.");
        }

        const proposta = result.data as PropostaExecutiva;

        setForm({
          titulo: proposta.titulo || "",
          cliente_nome: proposta.cliente_nome || "",
          cliente_documento: proposta.cliente_documento || "",
          corretora_nome: proposta.corretora_nome || "",
          seguradora_nome: proposta.seguradora_nome || "",
          responsavel_nome: proposta.responsavel_nome || "",
          tipo_seguro: proposta.tipo_seguro || "",
          categoria: proposta.categoria || "",
          status: proposta.status || "rascunho",
          etapa: proposta.etapa || "criacao",
          valor_premio: toInputNumber(proposta.valor_premio),
          valor_franquia: toInputNumber(proposta.valor_franquia),
          valor_importancia_segurada: toInputNumber(
            proposta.valor_importancia_segurada
          ),
          valor_comissao: toInputNumber(proposta.valor_comissao),
          vigencia_inicio: toInputDate(proposta.vigencia_inicio),
          vigencia_fim: toInputDate(proposta.vigencia_fim),
          resumo_executivo: proposta.resumo_executivo || "",
          parecer_tecnico: proposta.parecer_tecnico || "",
          observacoes_internas: proposta.observacoes_internas || "",
          observacoes_cliente: proposta.observacoes_cliente || "",
          motivo_rejeicao: proposta.motivo_rejeicao || "",
        });
      } catch (error) {
        setErro(error instanceof Error ? error.message : "Erro inesperado.");
      } finally {
        setLoading(false);
      }
    }

    if (propostaId) {
      carregarProposta();
    }
  }, [propostaId]);

  const rejeitada = useMemo(() => form.status === "rejeitada", [form.status]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setErro("");
      setSucesso("");

      const response = await fetch(`/api/propostas/${propostaId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo: form.titulo,
          cliente_nome: form.cliente_nome,
          cliente_documento: form.cliente_documento || null,
          corretora_nome: form.corretora_nome || null,
          seguradora_nome: form.seguradora_nome || null,
          responsavel_nome: form.responsavel_nome || null,
          tipo_seguro: form.tipo_seguro || null,
          categoria: form.categoria || null,
          status: form.status,
          etapa: form.etapa,
          valor_premio: form.valor_premio || 0,
          valor_franquia: form.valor_franquia || 0,
          valor_importancia_segurada: form.valor_importancia_segurada || 0,
          valor_comissao: form.valor_comissao || 0,
          vigencia_inicio: form.vigencia_inicio || null,
          vigencia_fim: form.vigencia_fim || null,
          resumo_executivo: form.resumo_executivo || null,
          parecer_tecnico: form.parecer_tecnico || null,
          observacoes_internas: form.observacoes_internas || null,
          observacoes_cliente: form.observacoes_cliente || null,
          motivo_rejeicao: rejeitada ? form.motivo_rejeicao || null : null,
          atualizado_por_nome: "Sistema",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Erro ao salvar proposta.");
      }

      setSucesso("Proposta atualizada com sucesso.");

      setTimeout(() => {
        router.push(`/propostas/${propostaId}`);
        router.refresh();
      }, 700);
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
            Carregando proposta...
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
                Editar proposta
              </h1>
              <p className="mt-2 text-sm text-zinc-400">
                Ajuste os dados comerciais, técnicos e operacionais da proposta.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/propostas/${propostaId}`}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
              >
                Voltar para a proposta
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
            <h2 className="text-xl font-semibold">Dados principais</h2>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-zinc-300">Título</label>
                <input
                  value={form.titulo}
                  onChange={(e) => updateField("titulo", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                  placeholder="Digite o título da proposta"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">Cliente</label>
                <input
                  value={form.cliente_nome}
                  onChange={(e) => updateField("cliente_nome", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                  placeholder="Nome do cliente"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Documento
                </label>
                <input
                  value={form.cliente_documento}
                  onChange={(e) =>
                    updateField("cliente_documento", e.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                  placeholder="CPF ou CNPJ"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Corretora
                </label>
                <input
                  value={form.corretora_nome}
                  onChange={(e) => updateField("corretora_nome", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                  placeholder="Nome da corretora"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Seguradora
                </label>
                <input
                  value={form.seguradora_nome}
                  onChange={(e) =>
                    updateField("seguradora_nome", e.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                  placeholder="Nome da seguradora"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Responsável
                </label>
                <input
                  value={form.responsavel_nome}
                  onChange={(e) =>
                    updateField("responsavel_nome", e.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                  placeholder="Responsável pela proposta"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Tipo de seguro
                </label>
                <input
                  value={form.tipo_seguro}
                  onChange={(e) => updateField("tipo_seguro", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                  placeholder="Ex: Patrimonial"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Categoria
                </label>
                <input
                  value={form.categoria}
                  onChange={(e) => updateField("categoria", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                  placeholder="Ex: Empresarial"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Status e etapa</h2>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-zinc-300">Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    updateField("status", e.target.value as PropostaStatus)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-slate-900"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">Etapa</label>
                <select
                  value={form.etapa}
                  onChange={(e) =>
                    updateField("etapa", e.target.value as PropostaEtapa)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                >
                  {ETAPA_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-slate-900"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {rejeitada ? (
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-zinc-300">
                    Motivo da rejeição
                  </label>
                  <textarea
                    value={form.motivo_rejeicao}
                    onChange={(e) =>
                      updateField("motivo_rejeicao", e.target.value)
                    }
                    rows={4}
                    className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                    placeholder="Explique o motivo da rejeição"
                  />
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Valores e vigência</h2>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Valor do prêmio
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.valor_premio}
                  onChange={(e) => updateField("valor_premio", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Valor da franquia
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.valor_franquia}
                  onChange={(e) =>
                    updateField("valor_franquia", e.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Importância segurada
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.valor_importancia_segurada}
                  onChange={(e) =>
                    updateField("valor_importancia_segurada", e.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Comissão
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.valor_comissao}
                  onChange={(e) => updateField("valor_comissao", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Vigência inicial
                </label>
                <input
                  type="date"
                  value={form.vigencia_inicio}
                  onChange={(e) =>
                    updateField("vigencia_inicio", e.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Vigência final
                </label>
                <input
                  type="date"
                  value={form.vigencia_fim}
                  onChange={(e) => updateField("vigencia_fim", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Conteúdo executivo</h2>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Resumo executivo
                </label>
                <textarea
                  value={form.resumo_executivo}
                  onChange={(e) =>
                    updateField("resumo_executivo", e.target.value)
                  }
                  rows={5}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                  placeholder="Resumo executivo da proposta"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Parecer técnico
                </label>
                <textarea
                  value={form.parecer_tecnico}
                  onChange={(e) =>
                    updateField("parecer_tecnico", e.target.value)
                  }
                  rows={5}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                  placeholder="Parecer técnico"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Observações internas
                </label>
                <textarea
                  value={form.observacoes_internas}
                  onChange={(e) =>
                    updateField("observacoes_internas", e.target.value)
                  }
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                  placeholder="Observações internas"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Observações para o cliente
                </label>
                <textarea
                  value={form.observacoes_cliente}
                  onChange={(e) =>
                    updateField("observacoes_cliente", e.target.value)
                  }
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                  placeholder="Observações para o cliente"
                />
              </div>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link
              href={`/propostas/${propostaId}`}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}