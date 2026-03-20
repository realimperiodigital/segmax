"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Lock,
  RefreshCcw,
  SendHorizonal,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import SegmaxShell, { SegmaxMenuItem } from "@/components/segmaxshell";

type Solicitacao = {
  id: string;
  cliente_id: string;
  corretora_id: string | null;
  solicitado_por: string | null;
  cliente_nome: string | null;
  corretora_nome: string | null;
  solicitado_por_nome: string | null;
  motivo: string;
  tipo_exclusao: "logica" | "definitiva";
  status: "pendente" | "aprovado" | "reprovado" | "cancelado";
  solicitado_em: string;
};

type UsuarioAtual = {
  id: string;
  nome: string;
  email: string | null;
  role: string;
  corretora_id: string | null;
};

type ObservacoesState = Record<string, string>;
type ProcessandoState = Record<string, "aprovar" | "reprovar" | null>;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function montarMenu(role: string): SegmaxMenuItem[] {
  const itens: SegmaxMenuItem[] = [
    { label: "Centro de Controle", href: "/dashboard" },
    { label: "Corretoras", href: "/corretoras" },
    { label: "Usuários", href: "/usuarios" },
    { label: "Clientes", href: "/clientes" },
    { label: "Seguradoras", href: "/seguradoras" },
    { label: "Cotações", href: "/cotacoes" },
    { label: "Análise Técnica", href: "/analise-tecnica" },
    { label: "Financeiro", href: "/financeiro" },
  ];

  if (role === "super_master" || role === "master") {
    itens.push({ label: "Aprovações de Exclusão", href: "/aprovacoes-exclusao" });
  }

  return itens;
}

function formatarCargo(role: string) {
  if (role === "super_master") return "Super Master";
  if (role === "master") return "Master";
  if (role === "financeiro") return "Financeiro";
  if (role === "analista") return "Analista";
  return "Usuário";
}

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

function formatarData(data: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(data));
  } catch {
    return data;
  }
}

export default function AprovacoesExclusaoPage() {
  const [usuarioAtual, setUsuarioAtual] = useState<UsuarioAtual | null>(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [observacoes, setObservacoes] = useState<ObservacoesState>({});
  const [processando, setProcessando] = useState<ProcessandoState>({});

  const totalPendentes = useMemo(
    () => solicitacoes.filter((item) => item.status === "pendente").length,
    [solicitacoes]
  );

  async function carregarPerfil() {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      throw new Error("Sessão não encontrada. Faça login novamente.");
    }

    const response = await fetch("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const result = await response.json();

    if (!response.ok || !result?.success) {
      throw new Error(result?.message || "Não foi possível carregar o perfil.");
    }

    return {
      sessionToken: session.access_token,
      user: result.user as UsuarioAtual,
    };
  }

  async function carregarSolicitacoes() {
    try {
      setCarregando(true);
      setErro("");
      setSucesso("");

      const { sessionToken, user } = await carregarPerfil();
      setUsuarioAtual(user);

      if (user.role !== "super_master" && user.role !== "master") {
        setSolicitacoes([]);
        setObservacoes({});
        return;
      }

      const response = await fetch("/api/clientes/exclusoes-pendentes", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Não foi possível carregar as solicitações.");
      }

      const lista: Solicitacao[] = Array.isArray(result?.solicitacoes)
        ? result.solicitacoes
        : [];

      setSolicitacoes(lista);

      const mapaObservacoes: ObservacoesState = {};
      lista.forEach((item) => {
        mapaObservacoes[item.id] = "";
      });
      setObservacoes(mapaObservacoes);
    } catch (error) {
      console.error(error);
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as solicitações."
      );
    } finally {
      setCarregando(false);
      setCarregandoPerfil(false);
    }
  }

  useEffect(() => {
    carregarSolicitacoes();
  }, []);

  async function decidirSolicitacao(
    solicitacaoId: string,
    acao: "aprovar" | "reprovar"
  ) {
    try {
      setErro("");
      setSucesso("");
      setProcessando((anterior) => ({
        ...anterior,
        [solicitacaoId]: acao,
      }));

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Sessão não encontrada. Faça login novamente.");
      }

      const response = await fetch("/api/clientes/decidir-exclusao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          solicitacao_id: solicitacaoId,
          acao,
          observacao: (observacoes[solicitacaoId] ?? "").trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Não foi possível concluir a ação.");
      }

      setSucesso(result?.message || "Ação concluída com sucesso.");

      setSolicitacoes((anterior) =>
        anterior.filter((item) => item.id !== solicitacaoId)
      );

      setObservacoes((anterior) => {
        const copia = { ...anterior };
        delete copia[solicitacaoId];
        return copia;
      });
    } catch (error) {
      console.error(error);
      setErro(
        error instanceof Error ? error.message : "Não foi possível concluir a ação."
      );
    } finally {
      setProcessando((anterior) => ({
        ...anterior,
        [solicitacaoId]: null,
      }));
    }
  }

  const roleAtual = usuarioAtual?.role || "usuario";
  const nomeUsuario = usuarioAtual?.nome || "Usuário";
  const cargoUsuario = formatarCargo(roleAtual);
  const menuItems = montarMenu(roleAtual);
  const acessoLiberado = roleAtual === "super_master" || roleAtual === "master";

  return (
    <SegmaxShell
      title="Aprovações de exclusão"
      subtitle="Analise solicitações pendentes de exclusão de clientes e decida com rastreabilidade total."
      badge="Governança SegMax"
      username={nomeUsuario}
      userrole={cargoUsuario}
      menuitems={menuItems}
      actions={
        <>
          <ActionButton
            href="/clientes"
            label="Voltar para clientes"
            icon={<ArrowRight size={18} />}
          />
          {acessoLiberado ? (
            <button
              type="button"
              onClick={carregarSolicitacoes}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d4af37]/25 bg-black/30 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:border-[#d4af37]/40 hover:bg-[#d4af37]/8"
            >
              <RefreshCcw size={18} />
              Atualizar
            </button>
          ) : null}
        </>
      }
    >
      {carregandoPerfil ? (
        <SectionCard>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-10 text-center">
            <p className="text-base font-medium text-white">Carregando permissões...</p>
            <p className="mt-2 text-sm text-zinc-500">Aguarde alguns segundos.</p>
          </div>
        </SectionCard>
      ) : !acessoLiberado ? (
        <SectionCard className="border-red-500/20 bg-red-500/10">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300">
              <Lock size={24} />
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">Acesso restrito</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Essa tela é exclusiva para master da corretora e super master.
                Usuários comuns não podem aprovar nem reprovar exclusões.
              </p>
            </div>
          </div>
        </SectionCard>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
            <SectionCard>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-300">Pendentes</p>
                  <h3 className="mt-4 text-5xl font-semibold leading-none text-white">
                    {totalPendentes}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-zinc-400">
                    Solicitações aguardando decisão.
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
                  <Clock3 size={24} />
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-300">Fluxo protegido</p>
                  <h3 className="mt-4 text-2xl font-semibold leading-none text-white">
                    Ativo
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-zinc-400">
                    Exclusão só acontece após aprovação.
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                  <ShieldCheck size={24} />
                </div>
              </div>
            </SectionCard>

            <SectionCard className="xl:col-span-2">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/8 text-[#d4af37]">
                  <AlertTriangle size={24} />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Decisão centralizada
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    O master da corretora ou o super master analisa o motivo, registra
                    observação e aprova ou reprova com histórico.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>

          {erro ? (
            <SectionCard className="border-red-500/20 bg-red-500/10">
              <p className="text-sm font-semibold text-red-300">{erro}</p>
            </SectionCard>
          ) : null}

          {sucesso ? (
            <SectionCard className="border-emerald-500/20 bg-emerald-500/10">
              <p className="text-sm font-semibold text-emerald-300">{sucesso}</p>
            </SectionCard>
          ) : null}

          <SectionCard>
            <div className="flex flex-col gap-3 border-b border-white/8 pb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  Solicitações pendentes
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Analise com calma antes de decidir. Toda decisão fica registrada.
                </p>
              </div>
            </div>

            <div className="mt-6">
              {carregando ? (
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-10 text-center">
                  <p className="text-base font-medium text-white">
                    Carregando solicitações...
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    Aguarde alguns segundos.
                  </p>
                </div>
              ) : solicitacoes.length === 0 ? (
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-10 text-center">
                  <p className="text-base font-medium text-white">
                    Nenhuma solicitação pendente
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    Quando um usuário abrir um pedido de exclusão, ele aparecerá aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {solicitacoes.map((item) => {
                    const processandoAtual = processando[item.id];

                    return (
                      <div
                        key={item.id}
                        className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5"
                      >
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr_1fr]">
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300">
                                <AlertTriangle size={20} />
                              </div>

                              <div>
                                <p className="text-lg font-semibold text-white">
                                  {item.cliente_nome || "Cliente não identificado"}
                                </p>
                                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-zinc-500">
                                  Solicitação pendente
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center gap-3 text-sm text-zinc-300">
                                <Building2 size={16} className="text-[#d4af37]" />
                                <span>
                                  Corretora: {item.corretora_nome || "Não informada"}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-sm text-zinc-300">
                                <SendHorizonal size={16} className="text-[#d4af37]" />
                                <span>
                                  Solicitado por:{" "}
                                  {item.solicitado_por_nome || "Usuário não identificado"}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-sm text-zinc-300">
                                <Clock3 size={16} className="text-[#d4af37]" />
                                <span>Data: {formatarData(item.solicitado_em)}</span>
                              </div>

                              <div className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                                {item.tipo_exclusao === "definitiva"
                                  ? "Exclusão definitiva"
                                  : "Exclusão lógica"}
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                              Motivo informado
                            </p>
                            <p className="mt-3 text-sm leading-6 text-zinc-300">
                              {item.motivo}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
                            <label
                              htmlFor={`observacao-${item.id}`}
                              className="text-xs uppercase tracking-[0.22em] text-zinc-500"
                            >
                              Observação da decisão
                            </label>

                            <textarea
                              id={`observacao-${item.id}`}
                              value={observacoes[item.id] ?? ""}
                              onChange={(e) =>
                                setObservacoes((anterior) => ({
                                  ...anterior,
                                  [item.id]: e.target.value,
                                }))
                              }
                              rows={5}
                              placeholder="Escreva uma observação para a aprovação ou reprovação..."
                              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#d4af37]/40"
                            />

                            <div className="mt-4 flex flex-col gap-3">
                              <button
                                type="button"
                                onClick={() => decidirSolicitacao(item.id, "aprovar")}
                                disabled={processandoAtual !== null}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500 bg-emerald-500 px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <CheckCircle2 size={16} />
                                {processandoAtual === "aprovar"
                                  ? "Aprovando..."
                                  : "Aprovar solicitação"}
                              </button>

                              <button
                                type="button"
                                onClick={() => decidirSolicitacao(item.id, "reprovar")}
                                disabled={processandoAtual !== null}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition hover:border-red-500/50 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <XCircle size={16} />
                                {processandoAtual === "reprovar"
                                  ? "Reprovando..."
                                  : "Reprovar solicitação"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </SectionCard>
        </>
      )}
    </SegmaxShell>
  );
}