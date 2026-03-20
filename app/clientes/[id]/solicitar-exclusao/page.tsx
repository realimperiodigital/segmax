"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileText,
  Send,
  ShieldAlert,
  UserRound,
} from "lucide-react";

import SegmaxShell, { SegmaxMenuItem } from "@/components/segmaxshell";

const menuItems: SegmaxMenuItem[] = [
  { label: "Centro de Controle", href: "/dashboard" },
  { label: "Corretoras", href: "/corretoras" },
  { label: "Usuários", href: "/usuarios" },
  { label: "Clientes", href: "/clientes" },
  { label: "Seguradoras", href: "/seguradoras" },
  { label: "Cotações", href: "/cotacoes" },
  { label: "Análise Técnica", href: "/analise-tecnica" },
  { label: "Financeiro", href: "/financeiro" },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
        "rounded-[28px]",
        "border border-[#d4af37]/14",
        "bg-black/45",
        "p-6",
        "shadow-[0_0_30px_rgba(0,0,0,0.28)]",
        "backdrop-blur-sm",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}

function ActionButton({
  href,
  label,
  primary = false,
  icon,
}: {
  href: string;
  label: string;
  primary?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-200",
        primary
          ? "border-[#d4af37] bg-[#d4af37] text-black hover:brightness-110"
          : "border-[#d4af37]/25 bg-black/30 text-white hover:border-[#d4af37]/40 hover:bg-[#d4af37]/8",
      ].join(" ")}
    >
      {icon}
      {label}
    </Link>
  );
}

export default function SolicitarExclusaoClientePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [motivo, setMotivo] = useState("");
  const [tipoExclusao, setTipoExclusao] = useState<"logica" | "definitiva">("logica");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  const clienteId = params?.id ?? "";
  const clienteNome = searchParams.get("cliente") ?? "Cliente selecionado";
  const corretoraNome = searchParams.get("corretora") ?? "Corretora vinculada";

  const motivoValido = useMemo(() => motivo.trim().length >= 10, [motivo]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!motivoValido) {
      setErro("Descreva o motivo com pelo menos 10 caracteres.");
      return;
    }

    try {
      setEnviando(true);
      setErro("");
      setSucesso(false);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Sessão não encontrada. Faça login novamente.");
      }

      const response = await fetch("/api/clientes/solicitar-exclusao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          cliente_id: clienteId,
          cliente_nome: clienteNome,
          corretora_nome: corretoraNome,
          motivo: motivo.trim(),
          tipo_exclusao: tipoExclusao,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Não foi possível registrar a solicitação.");
      }

      setSucesso(true);
      setMotivo("");
      setTipoExclusao("logica");

      setTimeout(() => {
        router.push("/clientes");
      }, 1800);
    } catch (error) {
      console.error(error);
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar a solicitação agora."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SegmaxShell
      title="Solicitação de exclusão"
      subtitle="Envie o pedido para aprovação do master da corretora ou do super master. Nenhuma exclusão acontece de forma imediata."
      badge="Fluxo controlado SegMax"
      username="Renato"
      userrole="Super Master"
      menuitems={menuItems}
      actions={
        <>
          <ActionButton
            href="/clientes"
            label="Voltar para clientes"
            icon={<ArrowLeft size={18} />}
          />
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <SectionCard className="xl:col-span-2">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">
                Confirmar abertura da solicitação
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Esse processo não exclui o cliente imediatamente. Ele apenas registra um pedido
                formal para análise e aprovação.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Cliente</p>
                <div className="mt-3 flex items-center gap-3">
                  <UserRound size={18} className="text-[#d4af37]" />
                  <p className="text-sm font-semibold text-white">{clienteNome}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Corretora</p>
                <div className="mt-3 flex items-center gap-3">
                  <Building2 size={18} className="text-[#d4af37]" />
                  <p className="text-sm font-semibold text-white">{corretoraNome}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">ID do cliente</p>
                <div className="mt-3 flex items-center gap-3">
                  <FileText size={18} className="text-[#d4af37]" />
                  <p className="text-sm font-semibold text-white">{clienteId}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Fluxo</p>
                <div className="mt-3 flex items-center gap-3">
                  <ShieldAlert size={18} className="text-[#d4af37]" />
                  <p className="text-sm font-semibold text-white">Aguardando aprovação</p>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Tipo de exclusão
              </label>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setTipoExclusao("logica")}
                  className={[
                    "rounded-2xl border px-4 py-4 text-left transition",
                    tipoExclusao === "logica"
                      ? "border-[#d4af37] bg-[#d4af37]/10"
                      : "border-white/10 bg-black/25 hover:border-[#d4af37]/30",
                  ].join(" ")}
                >
                  <p className="text-sm font-semibold text-white">Exclusão lógica</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    Mais segura. O cliente sai da operação ativa, mas o histórico continua salvo.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoExclusao("definitiva")}
                  className={[
                    "rounded-2xl border px-4 py-4 text-left transition",
                    tipoExclusao === "definitiva"
                      ? "border-red-500 bg-red-500/10"
                      : "border-white/10 bg-black/25 hover:border-red-500/30",
                  ].join(" ")}
                >
                  <p className="text-sm font-semibold text-white">Exclusão definitiva</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    Mais sensível. Só use quando houver validação real da operação.
                  </p>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="motivo" className="mb-2 block text-sm font-medium text-white">
                Motivo da solicitação
              </label>
              <textarea
                id="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={6}
                placeholder="Descreva claramente o motivo da exclusão deste cliente..."
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#d4af37]/40"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Informe contexto suficiente para o master da corretora analisar com segurança.
              </p>
            </div>

            {erro ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {erro}
              </div>
            ) : null}

            {sucesso ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-300" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-300">
                      Solicitação registrada com sucesso
                    </p>
                    <p className="mt-1 text-xs text-emerald-200/80">
                      Agora o pedido seguirá para aprovação.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={enviando}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d4af37] bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={16} />
                {enviando ? "Enviando solicitação..." : "Enviar solicitação"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/clientes")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#d4af37]/30 hover:bg-[#d4af37]/8"
              >
                Cancelar
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard>
          <h3 className="text-lg font-semibold text-white">Como esse fluxo funciona</h3>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
              <p className="text-sm font-semibold text-white">1. Usuário solicita</p>
              <p className="mt-1 text-xs leading-5 text-zinc-400">
                A solicitação é aberta com motivo e tipo de exclusão.
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
              <p className="text-sm font-semibold text-white">2. Sistema registra</p>
              <p className="mt-1 text-xs leading-5 text-zinc-400">
                O pedido entra como pendente para rastreabilidade total.
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
              <p className="text-sm font-semibold text-white">3. Master aprova ou reprova</p>
              <p className="mt-1 text-xs leading-5 text-zinc-400">
                Apenas o responsável autorizado pode decidir.
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
              <p className="text-sm font-semibold text-white">4. Histórico preservado</p>
              <p className="mt-1 text-xs leading-5 text-zinc-400">
                Toda ação fica registrada para auditoria e governança.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </SegmaxShell>
  );
}