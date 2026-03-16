"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Save,
  ShieldCheck,
} from "lucide-react";

import SegmaxShell, { SegmaxMenuItem } from "@/components/segmaxshell";

const menuItems: SegmaxMenuItem[] = [
  { label: "Centro de Controle", href: "/dashboard", exact: true },
  { label: "Corretoras", href: "/corretoras" },
  { label: "Usuários", href: "/usuarios" },
  { label: "Clientes", href: "/clientes" },
  { label: "Seguradoras", href: "/seguradoras" },
  { label: "Cotações", href: "/cotacoes" },
  { label: "Análise Técnica", href: "/analise-tecnica" },
  { label: "Financeiro", href: "/financeiro" },
];

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "rounded-[28px] border border-[#d4af37]/14 bg-black/45 p-6 shadow-[0_0_30px_rgba(0,0,0,0.28)] backdrop-blur-sm",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;

  return (
    <input
      {...rest}
      className={[
        "w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition",
        "placeholder:text-zinc-500 focus:border-[#d4af37]/35 focus:bg-black/45",
        className,
      ].join(" ")}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;

  return (
    <textarea
      {...rest}
      className={[
        "w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition",
        "placeholder:text-zinc-500 focus:border-[#d4af37]/35 focus:bg-black/45",
        className,
      ].join(" ")}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", children, ...rest } = props;

  return (
    <select
      {...rest}
      className={[
        "w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition",
        "focus:border-[#d4af37]/35 focus:bg-black/45",
        className,
      ].join(" ")}
    >
      {children}
    </select>
  );
}

function ActionButton({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-2xl border border-[#d4af37]/25 bg-black/30 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#d4af37]/40 hover:bg-[#d4af37]/8"
    >
      {icon}
      {label}
    </Link>
  );
}

type FormState = {
  clienteId: string;
  corretoraId: string;
  tipoSeguro: string;
  seguradora: string;
  premioEstimado: string;
  coberturaOferecida: string;
  atividadePrincipal: string;
  observacoes: string;
};

const initialForm: FormState = {
  clienteId: "",
  corretoraId: "",
  tipoSeguro: "",
  seguradora: "",
  premioEstimado: "",
  coberturaOferecida: "",
  atividadePrincipal: "",
  observacoes: "",
};

export default function NovaCotacaoPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (
      !form.clienteId.trim() ||
      !form.corretoraId.trim() ||
      !form.tipoSeguro.trim() ||
      !form.seguradora.trim()
    ) {
      setErro("Preencha os campos obrigatórios para salvar a cotação.");
      return;
    }

    setSalvando(true);

    try {
      const response = await fetch("/api/cotacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cliente_id: form.clienteId.trim(),
          corretora_id: form.corretoraId.trim(),
          tipo_seguro: form.tipoSeguro.trim(),
          seguradora: form.seguradora.trim(),
          premio_estimado: form.premioEstimado ? Number(form.premioEstimado) : null,
          cobertura_oferecida: form.coberturaOferecida.trim() || null,
          observacoes: form.observacoes.trim() || null,
          atividade_principal: form.atividadePrincipal.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data?.error || "Não foi possível salvar a cotação.");
        return;
      }

      setSucesso("Cotação salva com sucesso no banco.");
      setForm(initialForm);
    } catch {
      setErro("Erro de conexão ao salvar a cotação.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SegmaxShell
      title="Nova cotação"
      subtitle="Registre a demanda comercial já no formato correto do banco para transformar a operação visual em fluxo real."
      badge="Fluxo comercial SegMax"
      username="Renato"
      userrole="Super Master"
      menuitems={menuItems}
      actions={
        <ActionButton
          href="/cotacoes"
          label="Voltar para cotações"
          icon={<ArrowLeft size={18} />}
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.9fr]">
          <SectionCard>
            <div className="flex items-center gap-3 border-b border-white/8 pb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/8 text-[#d4af37]">
                <FileText size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  Dados reais da cotação
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Esta versão já grava diretamente na tabela <span className="text-white">cotacoes</span>.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <FieldLabel>Cliente ID</FieldLabel>
                <Input
                  value={form.clienteId}
                  onChange={(e) => updateField("clienteId", e.target.value)}
                  placeholder="UUID do cliente"
                />
              </div>

              <div>
                <FieldLabel>Corretora ID</FieldLabel>
                <Input
                  value={form.corretoraId}
                  onChange={(e) => updateField("corretoraId", e.target.value)}
                  placeholder="UUID da corretora"
                />
              </div>

              <div>
                <FieldLabel>Tipo de seguro</FieldLabel>
                <Select
                  value={form.tipoSeguro}
                  onChange={(e) => updateField("tipoSeguro", e.target.value)}
                >
                  <option value="" className="bg-black text-white">
                    Selecione
                  </option>
                  <option value="Patrimonial Empresarial" className="bg-black text-white">
                    Patrimonial Empresarial
                  </option>
                  <option value="Patrimonial Industrial" className="bg-black text-white">
                    Patrimonial Industrial
                  </option>
                  <option value="Patrimonial Comercial" className="bg-black text-white">
                    Patrimonial Comercial
                  </option>
                  <option value="Condomínio" className="bg-black text-white">
                    Condomínio
                  </option>
                  <option value="Responsabilidade Civil" className="bg-black text-white">
                    Responsabilidade Civil
                  </option>
                </Select>
              </div>

              <div>
                <FieldLabel>Seguradora</FieldLabel>
                <Input
                  value={form.seguradora}
                  onChange={(e) => updateField("seguradora", e.target.value)}
                  placeholder="Ex.: Porto Seguro"
                />
              </div>

              <div>
                <FieldLabel>Prêmio estimado</FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  value={form.premioEstimado}
                  onChange={(e) => updateField("premioEstimado", e.target.value)}
                  placeholder="Ex.: 48000"
                />
              </div>

              <div>
                <FieldLabel>Atividade principal</FieldLabel>
                <Input
                  value={form.atividadePrincipal}
                  onChange={(e) => updateField("atividadePrincipal", e.target.value)}
                  placeholder="Ex.: Logística"
                />
              </div>

              <div className="md:col-span-2">
                <FieldLabel>Cobertura oferecida</FieldLabel>
                <Input
                  value={form.coberturaOferecida}
                  onChange={(e) => updateField("coberturaOferecida", e.target.value)}
                  placeholder="Ex.: incêndio, danos elétricos, vendaval, RC"
                />
              </div>
            </div>
          </SectionCard>

          <div className="space-y-6">
            <SectionCard>
              <div className="flex items-center gap-3 border-b border-white/8 pb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10 text-sky-300">
                  <CheckCircle2 size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-white">
                    Resumo do envio
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Conferência rápida antes de gravar.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    Cliente ID
                  </p>
                  <p className="mt-2 break-all text-sm font-medium text-white">
                    {form.clienteId || "Não definido"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    Corretora ID
                  </p>
                  <p className="mt-2 break-all text-sm font-medium text-white">
                    {form.corretoraId || "Não definido"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    Tipo
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {form.tipoSeguro || "Não definido"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    Seguradora
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {form.seguradora || "Não definida"}
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="flex items-center gap-3 border-b border-white/8 pb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
                  <AlertCircle size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-white">
                    Observação importante
                  </h2>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-zinc-400">
                Nesta etapa, os campos <span className="text-white">Cliente ID</span> e{" "}
                <span className="text-white">Corretora ID</span> precisam receber os UUIDs reais
                do banco. No próximo bloco eu amarro isso com seleção automática de cliente e
                corretora para você não digitar UUID manualmente.
              </p>
            </SectionCard>
          </div>
        </div>

        <SectionCard>
          <div className="flex items-center gap-3 border-b border-white/8 pb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Observações
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Registre pontos técnicos e comerciais relevantes.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <FieldLabel>Observações gerais</FieldLabel>
            <TextArea
              rows={7}
              value={form.observacoes}
              onChange={(e) => updateField("observacoes", e.target.value)}
              placeholder="Descreva risco, contexto comercial, urgência, proteções existentes e informações importantes para a análise."
            />
          </div>

          {erro ? (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {erro}
            </div>
          ) : null}

          {sucesso ? (
            <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {sucesso}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={salvando}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#d4af37] bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save size={18} />
              {salvando ? "Salvando..." : "Salvar cotação no banco"}
            </button>

            <Link
              href="/cotacoes"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              Cancelar
            </Link>
          </div>
        </SectionCard>
      </form>
    </SegmaxShell>
  );
}